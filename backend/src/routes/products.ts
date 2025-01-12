import { FastifyInstance } from 'fastify';
import db from '../services/database';
import axios from 'axios';
import { PaginationQuery } from '../types/common';
import { CreateProduct, Product } from '../types/products';

export default async function productRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/products',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', default: 1 },
            limit: { type: 'integer', default: 10 },
            search: { type: 'string', default: '' },
          },
        },
      },
    },
    async (req, res) => {
      try {
        const {
          page = 1,
          limit = 8,
          search = '',
        } = req.query as PaginationQuery;
        const offset = (page - 1) * limit;

        const searchCondition = search
          ? `WHERE p.sku ILIKE '%' || $3 || '%' or p.title ILIKE '%' || $3 || '%'`
          : '';

        const values = search ? [limit, offset, search] : [limit, offset];

        const products = await db.any(
          `
          SELECT p.title, p.sku, p.image, p.price, p.description, COALESCE(SUM(t.qty), 0) AS stock
              FROM products p
              LEFT JOIN transactions t ON p.sku = t.sku
              ${searchCondition}
              GROUP BY p.id
              ORDER BY p.created_at DESC
              LIMIT $1 OFFSET $2
        `,
          values,
        );

        return { data: products as Product[] };
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .send({ error: 'An error occurred while fetching products' });
      }
    },
  );

  fastify.get('/products/:sku', async (req, res) => {
    try {
      const { sku } = req.params as { sku: string };

      const product = await db.oneOrNone(
        `
            SELECT p.title, p.sku, p.image, p.price, p.description,COALESCE(SUM(t.qty), 0) AS stock
            FROM products p
            LEFT JOIN transactions t ON p.sku = t.sku
            WHERE p.sku = $1
            GROUP BY p.id
          `,
        [sku],
      );

      if (!product) return res.status(404).send({ error: 'Product not found' });
      return product;
    } catch (error) {
      console.error(error);

      res
        .status(500)
        .send({ error: 'An error occurred while fetching product details' });
    }
  });

  fastify.post(
    '/products',

    {
      schema: {
        body: {
          type: 'object',
          required: ['title', 'sku', 'image', 'price'],
          properties: {
            title: { type: 'string' },
            sku: { type: 'string' },
            image: { type: 'string' },
            price: { type: 'number' },
            description: { type: 'string', nullable: true },
          },
        },
      },
    },
    async (req, res) => {
      try {
        const {
          title,
          sku,
          image,
          price,
          description = null,
        } = req.body as CreateProduct;

        const query = `
              INSERT INTO products (title, sku, image, price, description)
              VALUES ($1, $2, $3, $4, $5)
              ON CONFLICT (sku) DO UPDATE
              SET title = $1, image = $3, price = $4, description = $5
              RETURNING *;
          `;
        const product = await db.one(query, [
          title,
          sku,
          image,
          price,
          description,
        ]);

        return product;
      } catch (error) {
        console.error(error);

        res.status(500).send({
          error: 'An error occurred while creating or updating the product',
        });
      }
    },
  );

  fastify.delete('/products/:sku', async (req, res) => {
    try {
      const { sku } = req.params as { sku: string };

      await db.none('DELETE FROM products WHERE sku = $1', [sku]);
      return { message: 'Product deleted' };
    } catch (error) {
      console.error(error);

      res
        .status(500)
        .send({ error: 'An error occurred while deleting the product' });
    }
  });

  fastify.post('/products/import', async (req, res) => {
    try {
      const { data } = await axios.get('https://dummyjson.com/products');

      for (const product of data.products) {
        await db.none(
          `
                INSERT INTO products (title, sku, image, price, description)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (sku) DO NOTHING;
                `,
          [
            product.title,
            product.id,
            product.thumbnail,
            product.price,
            product.description || null,
          ],
        );
      }

      return { message: 'Products imported' };
    } catch (error) {
      console.error(error);

      res.status(500).send({
        error: 'An error occurred while fetching products from external API',
      });
    }
  });
}
