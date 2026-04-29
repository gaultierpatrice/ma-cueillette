CREATE TABLE favorites (
                           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           added_at TIMESTAMP,
                           user_id UUID NOT NULL,
                           picking_id UUID NOT NULL,
                           CONSTRAINT fk_favorite_user FOREIGN KEY (user_id) REFERENCES users(id),
                           CONSTRAINT fk_favorite_picking FOREIGN KEY (picking_id) REFERENCES pickings(id)
);