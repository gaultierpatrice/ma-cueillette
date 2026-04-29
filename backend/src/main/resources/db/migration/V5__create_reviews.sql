CREATE TABLE reviews (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         rating INT NOT NULL,
                         comment TEXT,
                         published_at TIMESTAMP,
                         user_id UUID NOT NULL,
                         picking_id UUID NOT NULL,
                         CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(id),
                         CONSTRAINT fk_review_picking FOREIGN KEY (picking_id) REFERENCES pickings(id)
);