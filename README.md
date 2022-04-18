# Storefront Backend Project

## Setup and connect to the database

### 1. Dev Database

#### In a terminal tab, create and run the database:

- switch to the postgres user: su postgres
- start psql: psql postgres
- in psql run the following:

  - CREATE USER storefront_user WITH PASSWORD 'password123'; CREATE DATABASE storefront;
  - \c storefront
  - GRANT ALL PRIVILEGES ON DATABASE storefront TO storefront_user;

- to test that it is working run \dt and it should output "No relations found."
- Note: The database is running on port

### 2. Test Database

#### In a terminal tab, create and run the database:

- in psql run the following:

  - CREATE DATABASE storefront_test;
  - \c storefront_test
  - GRANT ALL PRIVILEGES ON DATABASE storefront_test TO storefront_user;

## Environment Variables

- POSTGRES_HOST=localhost
- POSTGRES_DB=storefront
- POSTGRES_DB_TEST=storefront_test
- POSTGRES_USER=storefront_user
- POSTGRES_PASSWORD=password123
- ENV=dev
- BCRYPT_PASSWORD=speak-friend-and-enter
- SALT_ROUNDS=10
- TOKEN_SECRET=password123
