CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    category VARCHAR
);