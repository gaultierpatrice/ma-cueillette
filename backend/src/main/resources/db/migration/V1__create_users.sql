CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       name VARCHAR(255) NOT NULL,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       subscription_date TIMESTAMP,
                       role VARCHAR(50) NOT NULL,
                       farm_name VARCHAR(255)
);