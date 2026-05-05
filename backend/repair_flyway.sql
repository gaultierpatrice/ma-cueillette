-- Script to repair Flyway after failed V13 migration
-- Run this in your PostgreSQL database

-- 1. Check current Flyway status
SELECT version, description, success FROM flyway_schema_history WHERE version = '13';

-- 2. If migration failed, remove it from history
DELETE FROM flyway_schema_history WHERE version = '13' AND success = false;

-- 3. Check if any temporary tables were created
SELECT tablename FROM pg_tables WHERE tablename LIKE '%temp_%' OR tablename LIKE '%_new';

-- 4. Clean up any temporary tables if they exist (run only if found in step 3)
DROP TABLE IF EXISTS temp_picking_mapping CASCADE;
DROP TABLE IF EXISTS temp_product_mapping CASCADE;
DROP TABLE IF EXISTS temp_review_mapping CASCADE;
DROP TABLE IF EXISTS temp_report_mapping CASCADE;
DROP TABLE IF EXISTS temp_favorite_mapping CASCADE;
DROP TABLE IF EXISTS pickings_new CASCADE;
DROP TABLE IF EXISTS products_new CASCADE;
DROP TABLE IF EXISTS reviews_new CASCADE;
DROP TABLE IF EXISTS reports_new CASCADE;
DROP TABLE IF EXISTS favorites_new CASCADE;
DROP TABLE IF EXISTS picking_days_new CASCADE;
DROP TABLE IF EXISTS picking_labels_new CASCADE;
DROP TABLE IF EXISTS picking_products_new CASCADE;

-- 5. Verify your original tables are intact
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
