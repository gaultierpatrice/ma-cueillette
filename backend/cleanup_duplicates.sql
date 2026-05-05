-- Cleanup duplicate pickings and fix Flyway history

-- 1. Remove V13 from Flyway history (since we deleted the migration file)
DELETE FROM flyway_schema_history WHERE version = '13';

-- 2. First, delete favorites referencing duplicate pickings
DELETE FROM favorites WHERE picking_id > 35;

-- 3. Delete reviews referencing duplicate pickings
DELETE FROM reviews WHERE picking_id > 35;

-- 4. Delete reports referencing duplicate pickings
DELETE FROM reports WHERE picking_id > 35;

-- 5. Delete picking relations for duplicate pickings
DELETE FROM picking_days WHERE picking_id > 35;
DELETE FROM picking_labels WHERE picking_id > 35;
DELETE FROM picking_products WHERE picking_id > 35;

-- 6. Now delete the duplicate pickings
DELETE FROM pickings WHERE id > 35;

-- 3. Reset the sequence to continue from 35
SELECT setval('pickings_id_seq', 35);

-- 4. Verify - should return 35
SELECT COUNT(*) as total_pickings FROM pickings;
