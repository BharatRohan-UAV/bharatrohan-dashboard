import { supabase, Drone, FlightLog, getModelFromSerial } from '@/lib/supabase';
import Link from 'next/link';
import SerialDetailClient from './SerialDetailClient';

export const revalidate = 60;

export default async function SerialDetailPage({
    params,
}: {
    params: { model: string; serial: string };
}) {
    const model = decodeURIComponent(params.model);
    const serial = decodeURIComponent(params.serial);

    const { data: drone } = await supabase
        .from('drones')
        .select('*')
        .eq('serial_num', serial)
        .single();

    if (!drone) {
        return (
            <div>
                <Link href={`/models/${encodeURIComponent(model)}`} style={{ color: '#2D6A4F' }}>
                    &larr; Back to {model}
                </Link>
                <h1 style={{ color: '#1B4332' }}>Drone not found</h1>
                <p style={{ color: '#6B6B6B' }}>No drone with serial number {serial} exists.</p>
            </div>
        );
    }

    const { data: logs } = await supabase
        .from('flight_logs')
        .select('*')
        .eq('drone_id', drone.id)
        .order('uploaded_at', { ascending: false });

    const { data: notes } = await supabase
        .from('maintenance_notes')
        .select('*')
        .eq('drone_id', drone.id)
        .order('created_at', { ascending: false });

    // Compute flight hours from individual log flight_time_seconds
    const totalFlightSeconds = (logs || []).reduce(
        (sum: number, log: FlightLog) => sum + (log.flight_time_seconds || 0), 0
    );
    const totalFlightHours = totalFlightSeconds / 3600;

    // Compute total distance
    const totalDistanceKm = (logs || []).reduce(
        (sum: number, log: FlightLog) => sum + ((log.flight_distance_meters || 0) / 1000), 0
    );

    return (
        <div>
            {/* Breadcrumb */}
            <div style={{ marginBottom: '24px' }}>
                <Link href="/" style={{ color: '#2D6A4F', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
                    Home
                </Link>
                <span style={{ color: '#6B6B6B', margin: '0 8px' }}>/</span>
                <Link href={`/models/${encodeURIComponent(model)}`} style={{ color: '#2D6A4F', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
                    {model}
                </Link>
                <span style={{ color: '#6B6B6B', margin: '0 8px' }}>/</span>
                <span style={{ color: '#1B4332', fontSize: '14px', fontWeight: 600 }}>{serial}</span>
            </div>

            {/* Drone Info Card */}
            <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E8E0D4',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                marginBottom: '20px',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ margin: 0, color: '#1B4332', fontSize: '24px' }}>
                            {serial}
                        </h1>
                        <p style={{ margin: '4px 0 0', color: '#6B6B6B', fontSize: '14px' }}>
                            {model}
                        </p>
                    </div>
                    <span style={{
                        backgroundColor: '#E8F5E9',
                        color: '#2D6A4F',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                    }}>
                        {drone.vehicle_type || model}
                    </span>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '20px',
                    marginTop: '20px',
                    padding: '16px 0 0',
                    borderTop: '1px solid #E8E0D4',
                }}>
                    <div>
                        <div style={{ fontSize: '12px', color: '#6B6B6B', fontWeight: 500, marginBottom: '4px' }}>
                            FLIGHT HOURS
                        </div>
                        <div style={{ fontSize: '22px', fontWeight: 700, color: '#2D6A4F' }}>
                            {totalFlightHours.toFixed(1)}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#6B6B6B', fontWeight: 500, marginBottom: '4px' }}>
                            TOTAL DISTANCE
                        </div>
                        <div style={{ fontSize: '22px', fontWeight: 700, color: '#2D6A4F' }}>
                            {totalDistanceKm.toFixed(1)} km
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#6B6B6B', fontWeight: 500, marginBottom: '4px' }}>
                            TOTAL LOGS
                        </div>
                        <div style={{ fontSize: '22px', fontWeight: 700, color: '#2D6A4F' }}>
                            {logs?.length || 0}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#6B6B6B', fontWeight: 500, marginBottom: '4px' }}>
                            LAST SEEN
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#2C2C2C' }}>
                            {drone.last_seen
                                ? new Date(drone.last_seen).toLocaleDateString()
                                : '\u2014'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Client section: logs with map + maintenance notes */}
            <SerialDetailClient
                droneId={drone.id}
                logs={logs || []}
                notes={notes || []}
            />
        </div>
    );
}
