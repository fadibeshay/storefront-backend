# API Requirements

The company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be able to browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart page. You have been tasked with building the API that will support this application, and your coworker is building the frontend.

These are the notes from a meeting with the frontend developer that describe what endpoints the API needs to supply, as well as data shapes the frontend and backend have agreed meet the requirements of the application.

## API Endpoints

- Note: The token should be sent in an Authorization header. Format: 'Bearer {token}'
- Note: postman collection file is included for testing the endpoints.

#### Products

- Index

  - GET /products

- Show

  - GET /products/:id

- Create [token required]

  - POST /products
  - body {
    "name": "name",
    "price": 1.99,
    "category": "category"
    }
  - Note: Only admin users can create products. username: admin, password: password123

- [OPTIONAL] Top 5 most popular products N/A
- [OPTIONAL] Products by category (args: product category) N/A

#### Users

- Index [token required]

  - GET /users

- Show [token required]

  - GET /users/:id

- Create N[token required]

  - POST /users
  - body:
    {"username": "username", "firstName": "firstName", "lastName": "lastName", "password": "password"}

#### Orders

- Create [token required]

  - POST /orders

- Add product to order

  - POST /orders/:orderId/products
  - body : { "productId": 3, "quantity": 1}
  - Note: only the owner of the order can add products to it. User the order's owner token.

- Current Order by user [token required]

  - GET /current_order
  - Note: only the owner of the order can access his order.

- [OPTIONAL] Completed Orders by user (args: user id)[token required] N/A

## Data Shapes

#### products

- id SERIAL PRIMARY KEY,
- name VARCHAR NOT NULL,
- price NUMERIC(12,2) NOT NULL,
- category VARCHAR

#### users

- id SERIAL PRIMARY KEY,
- username VARCHAR(100) NOT NULL UNIQUE,
- first_name VARCHAR(100) NOT NULL,
- last_name VARCHAR(100) NOT NULL,
- role user_role DEFAULT 'user',
- password VARCHAR(100) NOT NULL

#### orders

- id SERIAL PRIMARY KEY,
- user_id BIGINT REFERENCES users(id),
- status order_status DEFAULT 'active'

#### order_products

- id SERIAL PRIMARY KEY,
- order_id BIGINT REFERENCES orders(id),
- product_id BIGINT REFERENCES products(id),
- quantity INTEGER
