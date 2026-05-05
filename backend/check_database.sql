-- Check what migrations have run
SELECT version, description, installed_on, success 
FROM flyway_schema_history 
ORDER BY installed_rank;

-- Check if pickings table exists and has data
SELECT COUNT(*) as picking_count FROM pickings;

-- Show first 5 pickings if any exist
SELECT id, name, city FROM pickings LIMIT 5;

-- Check table structure
\d pickings
