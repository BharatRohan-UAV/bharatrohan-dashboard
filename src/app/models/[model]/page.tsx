import { supabase, Drone, FlightLog, getModelFromSerial } from '@/lib/supabase';
import Link from 'next/link';

export const revalidate = 60;

interface SerialInfo {
    drone: Drone;
    logCount: number;
    flightHours: number;
    lastLat: number | null;
    lastLon: number | null;
}

export default async function ModelPage({ params }: { params: { model: string } }) {
    const model = decodeURIComponent(params.model);

    const { data: allDrones } = await supabase
        .from('drones')
        .select('*')
        .order('serial_num', { ascending: true });

    const drones = (allDrones || []).filter((d: Drone) => {
        const droneModel = getModelFromSerial(d.serial_num);
        if (model === 'unassigned') return droneModel === 'Unknown';
        return droneModel === model;
    });

    const droneIds = drones.map((d: Drone) => d.id);

    // Get log counts, flight time, and latest GPS per drone
    let logCountMap: Record<string, number> = {};
    let flightTimeMap: Record<string, number> = {};
    let lastGpsMap: Record<string, { lat: number; lon: number }> = {};

    if (droneIds.length > 0) {
        const { data: logs } = await supabase
            .from('flight_logs')
            .select('drone_id, last_lat, last_lon, uploaded_at, flight_time_seconds')
            .in('drone_id', droneIds)
            .order('uploaded_at', { ascending: false });

        if (logs) {
            for (const log of logs) {
                logCountMap[log.drone_id] = (logCountMap[log.drone_id] || 0) + 1;
                flightTimeMap[log.drone_id] = (flightTimeMap[log.drone_id] || 0) + (log.flight_time_seconds || 0);
                if (!lastGpsMap[log.drone_id] && log.last_lat != null && log.last_lon != null) {
                    lastGpsMap[log.drone_id] = { lat: log.last_lat, lon: log.last_lon };
                }
            }
        }
    }

    const serials: SerialInfo[] = drones.map((drone: Drone) => ({
        drone,
        logCount: logCountMap[drone.id] || 0,
        flightHours: (flightTimeMap[drone.id] || 0) / 3600,
        lastLat: lastGpsMap[drone.id]?.lat ?? null,
        lastLon: lastGpsMap[drone.id]?.lon ?? null,
    }));

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <Link href="/" style={{
                    color: '#2D6A4F',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                }}>
                    Home
                </Link>
                <span style={{ color: '#6B6B6B', margin: '0 8px' }}>/</span>
                <span style={{ color: '#1B4332', fontSize: '14px', fontWeight: 600 }}>
                    {model === 'unassigned' ? 'Unassigned' : model}
                </span>
            </div>

            <h1 style={{ marginTop: 0, color: '#1B4332', fontSize: '28px', fontWeight: 700 }}>
                {model === 'unassigned' ? 'Unassigned Logs' : `${model} Fleet`}
            </h1>
            <p style={{ color: '#6B6B6B', marginTop: '-8px', marginBottom: '24px' }}>
                {drones.length} drone{drones.length !== 1 ? 's' : ''} registered
            </p>

            {drones.length === 0 ? (
                <div style={{
                    padding: '48px',
                    textAlign: 'center',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E8E0D4',
                }}>
                    <p style={{ fontSize: '18px', color: '#6B6B6B' }}>
                        No {model} drones registered yet.
                    </p>
                    <p style={{ color: '#999' }}>
                        Upload logs from the GCS to register drones automatically.
                    </p>
                </div>
            ) : (
                <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E8E0D4',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                    }}>
                        <thead>
                            <tr style={{ backgroundColor: '#F8F6F1', borderBottom: '2px solid #E8E0D4' }}>
                                <th style={thStyle}>Serial Number</th>
                                <th style={thStyle}>Flight Hours</th>
                                <th style={thStyle}>Last Location</th>
                                <th style={thStyle}>Logs</th>
                                <th style={thStyle}>Last Seen</th>
                            </tr>
                        </thead>
                        <tbody>
                            {serials.map(({ drone, logCount, flightHours, lastLat, lastLon }) => (
                                <tr key={drone.id} style={{ borderBottom: '1px solid #E8E0D4' }}>
                                    <td style={tdStyle}>
                                        <Link
                                            href={`/models/${encodeURIComponent(model)}/${drone.serial_num}`}
                                            style={{
                                                color: '#2D6A4F',
                                                textDecoration: 'none',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {drone.serial_num}
                                        </Link>
                                    </td>
                                    <td style={tdStyle}>
                                        {flightHours.toFixed(1)} hrs
                                    </td>
                                    <td style={tdStyle}>
                                        {lastLat != null && lastLon != null ? (
                                            <span style={{ fontSize: '13px', color: '#2C2C2C' }}>
                                                {lastLat.toFixed(4)}, {lastLon.toFixed(4)}
                                            </span>
                                        ) : (
                                            <span style={{ color: '#999' }}>No GPS data</span>
                                        )}
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            backgroundColor: logCount > 0 ? '#E8F5E9' : '#F5F5F5',
                                            color: logCount > 0 ? '#2D6A4F' : '#999',
                                            padding: '2px 8px',
                                            borderRadius: '10px',
                                            fontSize: '13px',
                                            fontWeight: 500,
                                        }}>
                                            {logCount}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        {drone.last_seen
                                            ? new Date(drone.last_seen).toLocaleDateString()
                                            : '\u2014'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '14px 16px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#1B4332',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
};

const tdStyle: React.CSSProperties = {
    padding: '14px 16px',
    fontSize: '14px',
};
