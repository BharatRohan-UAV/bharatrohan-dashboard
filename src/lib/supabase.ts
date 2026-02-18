import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Drone {
    id: string;
    serial_num: string;
    vehicle_type: string | null;
    model_name: string | null;
    total_flight_hours: number;
    last_seen: string | null;
    created_at: string;
}

export interface FlightLog {
    id: string;
    drone_id: string;
    file_name: string;
    storage_path: string;
    file_size_bytes: number;
    uploaded_at: string;
    log_date: string | null;
    last_lat: number | null;
    last_lon: number | null;
    flight_time_seconds: number | null;
    flight_distance_meters: number | null;
    firmware_version: string | null;
    gps_path: number[][] | null;
}

export interface MaintenanceNote {
    id: string;
    drone_id: string;
    note: string;
    created_at: string;
}

export function getModelFromSerial(serialNum: string): string {
    const num = parseInt(serialNum, 10);
    if (!isNaN(num)) {
        if (num >= 1000 && num <= 1999) return 'PRAVIR-X4';
        if (num >= 2000 && num <= 2099) return 'ALOKA';
    }
    return 'Unknown';
}

export function getSerialRange(model: string): [number, number] {
    if (model === 'PRAVIR-X4') return [1000, 1999];
    if (model === 'ALOKA') return [2000, 2099];
    return [0, 0];
}
