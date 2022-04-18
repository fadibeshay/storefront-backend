DROP TYPE IF EXISTS user_role;
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'user',
    password VARCHAR(100) NOT NULL
);