-- Add ON DELETE CASCADE to reviews table
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS fk_review_user;
ALTER TABLE reviews ADD CONSTRAINT fk_review_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add ON DELETE CASCADE to reports table
ALTER TABLE reports DROP CONSTRAINT IF EXISTS fk_report_user;
ALTER TABLE reports ADD CONSTRAINT fk_report_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add ON DELETE CASCADE to favorites table
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS fk_favorite_user;
ALTER TABLE favorites ADD CONSTRAINT fk_favorite_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- For pickings, use ON DELETE SET NULL to keep pickings even if producer is deleted
ALTER TABLE pickings ALTER COLUMN producer_id DROP NOT NULL;
ALTER TABLE pickings DROP CONSTRAINT IF EXISTS fk_producer;
ALTER TABLE pickings ADD CONSTRAINT fk_producer
    FOREIGN KEY (producer_id) REFERENCES users(id) ON DELETE SET NULL;
