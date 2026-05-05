CREATE TABLE reviews (
                         id BIGSERIAL PRIMARY KEY,
                         rating INT NOT NULL,
                         comment TEXT,
                         published_at TIMESTAMP,
                         user_id UUID NOT NULL,
                         picking_id BIGINT NOT NULL,
                         CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(id),
                         CONSTRAINT fk_review_picking FOREIGN KEY (picking_id) REFERENCES pickings(id)
);