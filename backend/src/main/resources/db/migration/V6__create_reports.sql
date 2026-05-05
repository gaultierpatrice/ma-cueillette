CREATE TABLE reports (
                         id BIGSERIAL PRIMARY KEY,
                         description TEXT NOT NULL,
                         reported_at TIMESTAMP,
                         status VARCHAR(50) NOT NULL,
                         user_id UUID NOT NULL,
                         picking_id BIGINT NOT NULL,
                         CONSTRAINT fk_report_user FOREIGN KEY (user_id) REFERENCES users(id),
                         CONSTRAINT fk_report_picking FOREIGN KEY (picking_id) REFERENCES pickings(id)
);