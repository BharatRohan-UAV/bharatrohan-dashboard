import { supabase, Drone } from '@/lib/supabase';
import Link from 'next/link';

export const revalidate = 60;

export default async function DronesPage() {
    const { data: drones, error } = await supabase
        .from('drones')
        .select('*')
        .order('last_seen', { ascending: false });

    // Get log counts per drone
    const { data: logCounts } = await supabase
        .from('flight_logs')
        .select('drone_id');

    const countMap: Record<string, number> = {};
    if (logCounts) {
        for (const log of logCounts) {
            countMap[log.drone_id] = (countMap[log.drone_id] || 0) + 1;
        }
    }

    if (error) {
        return (
            <div>
                <h1>Fleet Dashboard</h1>
                <p style={{ color: 'red' }}>Error loading drones: {error.message}</p>
                <p>Make sure your Supabase environment variables are configured.</p>
            </div>
        );
    }

    return (
        <div>
            <h1 style={{ marginTop: 0 }}>Drones</h1>

            {(!drones || drones.length === 0) ? (
                <div style={{
                    padding: '48px',
                    textAlign: 'center',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                }}>
                    <p style={{ fontSize: '18px', color: '#666' }}>No drones registered yet.</p>
                    <p style={{ color: '#999' }}>Upload logs from QGroundControl to see your fleet here.</p>
                </div>
            ) : (
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                            <th style={thStyle}>Serial Number</th>
                            <th style={thStyle}>Model</th>
                            <th style={thStyle}>Flight Hours</th>
                            <th style={thStyle}>Logs</th>
                            <th style={thStyle}>Last Seen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {drones.map((drone: Drone) => (
                            <tr key={drone.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={tdStyle}>
                                    <Link href={`/drones/${drone.id}`} style={{
                                        color: '#0066cc',
                                        textDecoration: 'none',
                                        fontWeight: 500,
                                    }}>
                                        {drone.serial_num}
                                    </Link>
                                </td>
                                <td style={tdStyle}>{drone.vehicle_type || '\u2014'}</td>
                                <td style={tdStyle}>{drone.total_flight_hours?.toFixed(1) || '0.0'}</td>
                                <td style={tdStyle}>{countMap[drone.id] || 0}</td>
                                <td style={tdStyle}>
                                    {drone.last_seen
                                        ? new Date(drone.last_seen).toLocaleDateString()
                                        : '\u2014'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#495057',
};

const tdStyle: React.CSSProperties = {
    padding: '12px 16px',
    fontSize: '14px',
};
