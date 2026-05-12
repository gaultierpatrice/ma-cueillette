-- Allow removing a picking without manual cleanup of related rows
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS fk_review_picking;
ALTER TABLE reviews ADD CONSTRAINT fk_review_picking
    FOREIGN KEY (picking_id) REFERENCES pickings(id) ON DELETE CASCADE;

ALTER TABLE favorites DROP CONSTRAINT IF EXISTS fk_favorite_picking;
ALTER TABLE favorites ADD CONSTRAINT fk_favorite_picking
    FOREIGN KEY (picking_id) REFERENCES pickings(id) ON DELETE CASCADE;

ALTER TABLE reports DROP CONSTRAINT IF EXISTS fk_report_picking;
ALTER TABLE reports ADD CONSTRAINT fk_report_picking
    FOREIGN KEY (picking_id) REFERENCES pickings(id) ON DELETE CASCADE;

ALTER TABLE picking_days DROP CONSTRAINT IF EXISTS fk_picking_days;
ALTER TABLE picking_days ADD CONSTRAINT fk_picking_days
    FOREIGN KEY (picking_id) REFERENCES pickings(id) ON DELETE CASCADE;

ALTER TABLE picking_labels DROP CONSTRAINT IF EXISTS fk_picking_labels;
ALTER TABLE picking_labels ADD CONSTRAINT fk_picking_labels
    FOREIGN KEY (picking_id) REFERENCES pickings(id) ON DELETE CASCADE;

ALTER TABLE picking_products DROP CONSTRAINT IF EXISTS fk_pp_picking;
ALTER TABLE picking_products ADD CONSTRAINT fk_pp_picking
    FOREIGN KEY (picking_id) REFERENCES pickings(id) ON DELETE CASCADE;

-- Admin account (login: admin@ma-cueillette.local / admin1234 — change after first deploy)
INSERT INTO users (name, email, password, subscription_date, role)
VALUES (
    'Administrator',
    'admin@ma-cueillette.local',
    '$2a$10$euh9IjKxAHaDKIQfIW2Ou.eCD6qxjw.HpMnNRubCexEBKtcEAprm6',
    NOW(),
    'ADMIN'
)
ON CONFLICT (email) DO NOTHING;
