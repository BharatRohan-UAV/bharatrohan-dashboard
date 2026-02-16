import { supabase, Drone, FlightLog, MaintenanceNote } from '@/lib/supabase';
import Link from 'next/link';
import LogTable from '@/components/LogTable';
import MaintenanceNotes from '@/components/MaintenanceNotes';

export const revalidate = 60;

export default async function DroneDetailPage({ params }: { params: { id: string } }) {
    const { data: drone } = await supabase
        .from('drones')
        .select('*')
        .eq('id', params.id)
        .single();

    if (!drone) {
        return (
            <div>
                <Link href="/" style={{ color: '#0066cc' }}>&larr; Back to fleet</Link>
                <h1>Drone not found</h1>
            </div>
        );
    }

    const { data: logs } = await supabase
        .from('flight_logs')
        .select('*')
        .eq('drone_id', params.id)
        .order('uploaded_at', { ascending: false });

    const { data: notes } = await supabase
        .from('maintenance_notes')
        .select('*')
        .eq('drone_id', params.id)
        .order('created_at', { ascending: false });

    return (
        <div>
            <Link href="/" style={{ color: '#0066cc', textDecoration: 'none', fontSize: '14px' }}>
                &larr; Back to fleet
            </Link>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '24px',
                marginTop: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
                <h1 style={{ marginTop: 0 }}>Drone: {drone.serial_num}</h1>
                <div style={{ display: 'flex', gap: '32px', color: '#555' }}>
                    <div>
                        <strong>Type:</strong> {drone.vehicle_type || 'Unknown'}
                    </div>
                    <div>
                        <strong>Flight Hours:</strong> {drone.total_flight_hours?.toFixed(1) || '0.0'}
                    </div>
                    <div>
                        <strong>Last Seen:</strong>{' '}
                        {drone.last_seen ? new Date(drone.last_seen).toLocaleString() : '\u2014'}
                    </div>
                </div>
            </div>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '24px',
                marginTop: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
                <h2 style={{ marginTop: 0 }}>Flight Logs</h2>
                <LogTable logs={logs || []} />
            </div>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '24px',
                marginTop: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
                <h2 style={{ marginTop: 0 }}>Maintenance Notes</h2>
                <MaintenanceNotes droneId={params.id} initialNotes={notes || []} />
            </div>
        </div>
    );
}
