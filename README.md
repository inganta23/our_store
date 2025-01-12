# Our Store

A full-stack e-commerce application built with Next.js and Fastify.

## Overview

This project consists of two main components:
- frontend built with Next.js, TypeScript, and TailwindCSS
- backend API built with Fastify and PostgreSQL

## Prerequisites

- Node.js (Latest LTS version recommended)
- PostgreSQL database server
- npm or yarn package manager

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   ```

2. **Set up the Backend**
   ```bash
   cd backend
   npminstall
   ``` 
   Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL=postgresql://username:password@host:port/database
   PORT=3000
   ```
   Run database migrations:
   ```bash
   npm run migrate
   ```
   If the above command throws an error, you can check the migrations_1.sql file in the backend/src/migrations directory  
   and copy its contents to your PostgreSQL editor to execute manually.

   Start the backend:
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:3000` (default)

3. **Set up the Frontend**
   ```bash
   cd frontend
   npm install
   ```
   Create a `.env` file in the frontend directory:
   ```env
   API_URL=http://localhost:3000
   ```
   Start the frontend:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5000` (default)  
   Hit "Import Products" button in the UI to get all the products from dummy.json

## Frontend Details

### Tech Stack
- Next.js with TypeScript
- TailwindCSS for styling
- Zustand for state management
- React Table (@tanstack/react-table) for data grids
- Lucide React for icons
- React Slick for carousels

### Available Scripts
- `npm run dev` - Start development server with TurboPack (Port 5000)
- `npm run build` - Create production build
- `npm start` - Run production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Backend Details

### Tech Stack
- Fastify server framework
- TypeScript
- PostgreSQL with pg-promise
- Swagger for API documentation

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier

### Database Migrations
Migration files are located in `src/migrations`. Ensure your PostgreSQL instance is properly configured before running migrations.

## Development Workflow

1. Start the backend server first
2. Once the backend is running, start the frontend development server
3. Make sure all environment variables are properly configured

## Available Endpoints

- Frontend: `http://localhost:5000`
- Backend API: `http://localhost:3000`
- API Documentation: `http://localhost:3000/documentation`

## Additional Documentation

- Backend API documentation is available at `/documentation` when the server is running (Swagger)
