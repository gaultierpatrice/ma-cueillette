CREATE TABLE pickings (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          address VARCHAR(255) NOT NULL,
                          lat DOUBLE PRECISION,
                          lng DOUBLE PRECISION,
                          website VARCHAR(255),
                          opening_hours VARCHAR(255),
                          description TEXT,
                          producer_id UUID NOT NULL,
                          CONSTRAINT fk_producer FOREIGN KEY (producer_id) REFERENCES users(id)
);