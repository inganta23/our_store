import fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import db from './services/database';
import productRoutes from './routes/products';
import transactionRoutes from './routes/transactions';
import cors from '@fastify/cors';

const app = fastify({ logger: true });

app.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});

app.register(fastifySwagger, {
  swagger: {
    info: {
      title: 'My API',
      description: 'API documentation',
      version: '1.0.0',
    },
    host: 'localhost:3000',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
  },
});

app.register(fastifySwaggerUi, {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
  uiHooks: {
    onRequest: function (request, reply, next) {
      next();
    },
    preHandler: function (request, reply, next) {
      next();
    },
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject) => {
    return swaggerObject;
  },
  transformSpecificationClone: true,
});

const checkDatabaseConnection = async () => {
  try {
    await db.one('SELECT 1');
    app.log.info('Database connection established successfully.');
  } catch (err) {
    console.log(err);
    app.log.error('Failed to connect to the database. Exiting...');
    app.log.error(err);
    process.exit(1);
  }
};

app.register(productRoutes, { prefix: '/api' });
app.register(transactionRoutes, { prefix: '/api' });

const start = async () => {
  await checkDatabaseConnection();

  try {
    await app.listen({ port: 3000 });
    app.log.info(`Server running at http://localhost:3000`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
