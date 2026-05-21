CREATE TABLE products (
                          id BIGSERIAL PRIMARY KEY,
                          name VARCHAR(255) NOT NULL,
                          harvest_season VARCHAR(255),
                          type VARCHAR(255)
);