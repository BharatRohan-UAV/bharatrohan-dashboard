CREATE TABLE drones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    serial_num TEXT NOT NULL UNIQUE,
    vehicle_type TEXT,
    total_flight_hours REAL DEFAULT 0,
    last_seen TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE flight_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    drone_id UUID NOT NULL REFERENCES drones(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT now(),
    log_date TIMESTAMPTZ
);

CREATE INDEX idx_flight_logs_drone ON flight_logs(drone_id);

CREATE TABLE maintenance_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    drone_id UUID NOT NULL REFERENCES drones(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_maint_notes_drone ON maintenance_notes(drone_id);

ALTER TABLE drones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON drones FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE flight_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON flight_logs FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE maintenance_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON maintenance_notes FOR ALL USING (true) WITH CHECK (true);

-- Drone alerts: one row per threshold interval crossed (50h, 100h, 150h, ...)
CREATE TABLE drone_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    drone_id UUID NOT NULL REFERENCES drones(id) ON DELETE CASCADE,
    serial_num TEXT NOT NULL,
    model_name TEXT,
    threshold_multiple INT NOT NULL,          -- 1 = first 50h, 2 = 100h, 3 = 150h, ...
    flight_hours_at_trigger REAL,
    triggered_at TIMESTAMPTZ DEFAULT now(),
    acknowledged_at TIMESTAMPTZ,             -- set when a maintenance note is added
    acknowledged_by_note_id UUID REFERENCES maintenance_notes(id) ON DELETE SET NULL,
    UNIQUE (drone_id, threshold_multiple)    -- one alert row per interval per drone
);

CREATE INDEX idx_drone_alerts_drone ON drone_alerts(drone_id);
CREATE INDEX idx_drone_alerts_unacked ON drone_alerts(acknowledged_at) WHERE acknowledged_at IS NULL;

ALTER TABLE drone_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON drone_alerts FOR ALL USING (true) WITH CHECK (true);
