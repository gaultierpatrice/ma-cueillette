ALTER TABLE favorites
ADD CONSTRAINT unique_user_picking UNIQUE (user_id, picking_id);
