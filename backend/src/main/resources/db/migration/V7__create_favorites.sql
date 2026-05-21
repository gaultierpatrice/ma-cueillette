CREATE TABLE favorites (
                           id BIGSERIAL PRIMARY KEY,
                           added_at TIMESTAMP,
                           user_id UUID NOT NULL,
                           picking_id BIGINT NOT NULL,
                           CONSTRAINT fk_favorite_user FOREIGN KEY (user_id) REFERENCES users(id),
                           CONSTRAINT fk_favorite_picking FOREIGN KEY (picking_id) REFERENCES pickings(id)
);