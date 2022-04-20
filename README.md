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
- Note: The database is running on default port 5432

### 2. Test Database

#### In a terminal tab, create and run the database:

- in psql run the following:

  - CREATE DATABASE storefront_test;
  - \c storefront_test
  - GRANT ALL PRIVILEGES ON DATABASE storefront_test TO storefront_user;

## Package installation instructions

- To install the package you need nodejs and npm. Follow the bellow steps:
  1. Use command 'npm install' to install
  2. Use 'npm run test' To run tests
  3. Use 'npm run db:up' to migrate the DB
  4. Use 'npm run data:up' to seed the DB with necessary data
  5. Use 'npm run start' to start dev/ts-node server with nodemon
  6. Use 'npm run build', then 'node dist/' to build and start built server
- Note: The server is running on port 3000
- Note: The database is running on default port 5432

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

## Admin Credentials

- username: admin
- password: password123
