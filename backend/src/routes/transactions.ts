import { FastifyInstance } from 'fastify';
import db from '../services/database';
import { PaginationQuery } from '../types/common';
import { CreateTransaction, UpdateTransaction } from '../types/transactions';

export default async function transactionRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/transactions',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', default: 1 },
            limit: { type: 'integer', default: 10 },
            search: { type: 'string', nullable: true },
          },
        },
      },
    },
    async (req, res) => {
      try {
        const {
          page = 1,
          limit = 10,
          search = '',
        } = req.query as PaginationQuery;
        const offset = (page - 1) * limit;

        const searchCondition = search
          ? `WHERE t.sku ILIKE '%' || $3 || '%' or p.title ILIKE '%' || $3 || '%'`
          : '';

        const values = search ? [limit, offset, search] : [limit, offset];

        const transactions = await db.any(
          `
          SELECT t.id, t.sku, t.qty, t.amount, t.created_at, p.title
          FROM transactions t join products p on t.sku = p.sku
          ${searchCondition}
          ORDER BY t.created_at DESC
          LIMIT $1 OFFSET $2
          `,
          values,
        );

        const totalRecords = await db.one(
          `
          SELECT COUNT(t.*) AS count
          FROM transactions t join products p on t.sku = p.sku
          ${searchCondition}
          `,
          values,
        );

        const totalPages = Math.ceil(totalRecords.count / limit);
        return { data: transactions, totalPages };
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .send({ error: 'An error occurred while fetching transactions' });
      }
    },
  );

  fastify.get('/transactions/id/:id', async (req, res) => {
    try {
      const { id } = req.params as { id: string };

      const transaction = await db.oneOrNone(
        `
          SELECT t.id, t.sku, t.qty, t.amount, t.created_at, p.title
          FROM transactions t join products p on t.sku = p.sku
          WHERE id = $1
          ORDER BY t.created_at DESC
          `,
        [id],
      );

      if (!transaction)
        return res.status(404).send({ error: 'Transaction not found' });
      return transaction;
    } catch (error) {
      console.error(error);

      res.status(500).send({
        error: 'An error occurred while fetching the transaction details',
      });
    }
  });

  fastify.get('/transactions/sku/:sku', async (req, res) => {
    try {
      const { sku } = req.params as { sku: string };

      const transaction = await db.manyOrNone(
        `
          SELECT id, sku, qty, amount, created_at
          FROM transactions 
          WHERE sku = $1
          `,
        [sku],
      );

      if (!transaction)
        return res.status(404).send({ error: 'Transaction not found' });
      return transaction;
    } catch (error) {
      console.error(error);

      res.status(500).send({
        error: 'An error occurred while fetching the transaction details',
      });
    }
  });

  fastify.post(
    '/transactions',
    {
      schema: {
        body: {
          type: 'object',
          required: ['sku', 'qty'],
          properties: {
            sku: { type: 'string' },
            qty: { type: 'integer' },
          },
        },
      },
    },
    async (req, res) => {
      try {
        const { sku, qty } = req.body as CreateTransaction;

        const stock = await db.oneOrNone(
          `
          SELECT COALESCE(SUM(qty), 0) AS stock 
          FROM transactions WHERE sku = $1
          `,
          [sku],
        );

        if (!stock || stock.stock + qty < 0) {
          return res.status(400).send({ error: 'Insufficient stock' });
        }

        const product = await db.oneOrNone(
          'SELECT price FROM products WHERE sku = $1',
          [sku],
        );

        if (!product)
          return res.status(404).send({ error: 'Product not found' });

        const transaction = await db.one(
          `
          INSERT INTO transactions (sku, qty, amount) 
          VALUES ($1, $2, $3 * $2)
          RETURNING *;
          `,
          [sku, qty, +product.price],
        );

        return transaction;
      } catch (error) {
        console.error(error);

        res
          .status(500)
          .send({ error: 'An error occurred while creating the transaction' });
      }
    },
  );

  fastify.put(
    '/transactions/:id',
    {
      schema: {
        body: {
          type: 'object',
          required: ['sku', 'qty'],
          properties: {
            sku: { type: 'string' },
            qty: { type: 'integer' },
          },
        },
      },
    },
    async (req, res) => {
      try {
        const { id } = req.params as { id: string };
        const { sku, qty } = req.body as UpdateTransaction;

        const isProduct = await db.oneOrNone(
          `
            SELECT * FROM products WHERE sku = $1
          `,
          [sku],
        );

        if (!isProduct?.id) {
          return res
            .status(400)
            .send({ error: `There is no product with sku ${sku}` });
          // throw new Error(`There is no product with sku ${sku}`);
        }

        const stock = await db.oneOrNone(
          `
          SELECT COALESCE(SUM(qty), 0) AS stock 
          FROM transactions WHERE sku = $1 AND id <> $2
          `,
          [sku, id],
        );

        if (!stock || parseInt(stock.stock) + qty < 0) {
          return res.status(404).send({ error: 'Insufficient stock' });
        }

        const product = await db.oneOrNone(
          'SELECT price FROM products WHERE sku = $1',
          [sku],
        );

        if (!product)
          return res.status(404).send({ error: 'Product not found' });

        const transaction = await db.one(
          `
          UPDATE transactions 
          SET sku = $1, qty = $2, amount = $3 * $2
          WHERE id = $4
          RETURNING *;
          `,
          [sku, qty, +product.price, id],
        );

        return transaction;
      } catch (error) {
        console.error(error);

        res
          .status(500)
          .send({ error: 'An error occurred while updating the transaction' });
      }
    },
  );

  fastify.delete('/transactions/:id', async (req, res) => {
    try {
      const { id } = req.params as { id: string };

      const result = await db.result('DELETE FROM transactions WHERE id = $1', [
        id,
      ]);

      if (result.rowCount === 0) {
        return res.status(404).send({ error: 'Transaction not found' });
      }

      return { message: 'Transaction deleted' };
    } catch (error) {
      console.error(error);

      res
        .status(500)
        .send({ error: 'An error occurred while deleting the transaction' });
    }
  });
}
