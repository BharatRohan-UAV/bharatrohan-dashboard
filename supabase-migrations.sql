-- ============================================================
-- STEP 1: Create drone_alerts table
-- Run this first
-- ============================================================

CREATE TABLE drone_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    drone_id UUID NOT NULL REFERENCES drones(id) ON DELETE CASCADE,
    serial_num TEXT NOT NULL,
    model_name TEXT,
    threshold_multiple INT NOT NULL,
    flight_hours_at_trigger REAL,
    triggered_at TIMESTAMPTZ DEFAULT now(),
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by_note_id UUID REFERENCES maintenance_notes(id) ON DELETE SET NULL,
    UNIQUE (drone_id, threshold_multiple)
);

CREATE INDEX idx_drone_alerts_drone ON drone_alerts(drone_id);

ALTER TABLE drone_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON drone_alerts FOR ALL USING (true) WITH CHECK (true);


-- ============================================================
-- STEP 2: Insert test alert for drone 2015
-- Run this after Step 1 to test the dashboard banner
-- ============================================================

INSERT INTO drone_alerts (drone_id, serial_num, model_name, threshold_multiple, flight_hours_at_trigger)
SELECT id, serial_num, 'ALOKA', 1, 50.5
FROM drones WHERE serial_num = '2015';


-- ============================================================
-- STEP 3: Clean up test alert after verifying the banner
-- Run this once you've confirmed the banner appears
-- ============================================================

-- DELETE FROM drone_alerts WHERE serial_num = '2015';
