-- Log Analysis: Add graph time-series columns to flight_logs
-- and location name cache to drones.
-- Run this in Supabase SQL Editor BEFORE deploying updated QGC.

ALTER TABLE flight_logs
  ADD COLUMN IF NOT EXISTS battery_data jsonb,
  ADD COLUMN IF NOT EXISTS altitude_data jsonb,
  ADD COLUMN IF NOT EXISTS attitude_data jsonb,
  ADD COLUMN IF NOT EXISTS vibration_data jsonb;

ALTER TABLE drones
  ADD COLUMN IF NOT EXISTS last_location_name text;

-- Verify columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'flight_logs'
  AND column_name IN ('battery_data', 'altitude_data', 'attitude_data', 'vibration_data')
ORDER BY column_name;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'drones'
  AND column_name = 'last_location_name';
