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
