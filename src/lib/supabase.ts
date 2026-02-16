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
}

export interface MaintenanceNote {
    id: string;
    drone_id: string;
    note: string;
    created_at: string;
}
