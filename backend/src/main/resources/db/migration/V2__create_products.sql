CREATE TABLE products (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          name VARCHAR(255) NOT NULL,
                          harvest_season VARCHAR(255),
                          type VARCHAR(255)
);