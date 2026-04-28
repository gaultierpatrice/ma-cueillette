CREATE TABLE picking_days (
                              picking_id UUID NOT NULL,
                              day VARCHAR(20) NOT NULL,
                              CONSTRAINT fk_picking_days FOREIGN KEY (picking_id) REFERENCES pickings(id)
);

CREATE TABLE picking_labels (
                                picking_id UUID NOT NULL,
                                label VARCHAR(50) NOT NULL,
                                CONSTRAINT fk_picking_labels FOREIGN KEY (picking_id) REFERENCES pickings(id)
);

CREATE TABLE picking_products (
                                  picking_id UUID NOT NULL,
                                  product_id UUID NOT NULL,
                                  PRIMARY KEY (picking_id, product_id),
                                  CONSTRAINT fk_pp_picking FOREIGN KEY (picking_id) REFERENCES pickings(id),
                                  CONSTRAINT fk_pp_product FOREIGN KEY (product_id) REFERENCES products(id)
);