# Jesser Shop Backend

Node.js + Express + MongoDB API for the Jesser Shop project.

## Setup

1. Install dependencies

```bash
npm install
```

2. Create a `.env` file in the project root

```env
DB_URL=your_mongodb_connection_string
PORT=3000
JWT_SECRET=your_secret_key
```

3. Start the server

```bash
npm start
```

For development:

```bash
npm run dev
```

## Base URL

```text
http://127.0.0.1:3000
```

## API Overview

### Auth

- `POST /auth/signup`
- `POST /auth/login`

### Products

- `GET /products`
- `GET /products/:id`
- `POST /products` admin only, multipart form-data
- `PUT /products/:id` admin only, multipart form-data
- `DELETE /products/:id` admin only

### Feedbacks

- `POST /feedbacks` authenticated users
- `GET /feedbacks/product/:productId`
- `GET /feedbacks/stats/global` admin only
- `GET /feedbacks/stats/product/:productId` admin only

### Orders

- `POST /orders` authenticated users
- `GET /orders` admin only
- `GET /orders/history/:userId` authenticated user or admin
- `PATCH /orders/:orderId/status` admin only
- `GET /orders/stats/global` admin only

### Profiles

- `GET /profiles/:userId` authenticated user or admin
- `PATCH /profiles/:userId` authenticated user or admin

## Uploads

Uploaded product images are stored under `uploads/products` and served publicly from:

```text
/uploads/products/<filename>
```

## Postman

Import the collection file `Jesser-Shop.postman_collection.json` into Postman, then set:

- `baseUrl` to `http://127.0.0.1:3000`
- `token` after logging in
- `userId`, `productId`, and `orderId` as needed for the sample requests