import { supabase, getModelFromSerial } from '@/lib/supabase';
import Link from 'next/link';

export const revalidate = 60;

interface ModelStats {
    model: string;
    serialRange: string;
    droneCount: number;
    totalFlightHours: number;
    logCount: number;
}

export default async function HomePage() {
    const { data: drones } = await supabase
        .from('drones')
        .select('*');

    const { data: logCounts } = await supabase
        .from('flight_logs')
        .select('drone_id');

    const countMap: Record<string, number> = {};
    if (logCounts) {
        for (const log of logCounts) {
            countMap[log.drone_id] = (countMap[log.drone_id] || 0) + 1;
        }
    }

    const models: ModelStats[] = [
        {
            model: 'ALOKA',
            serialRange: '2000 - 2099',
            droneCount: 0,
            totalFlightHours: 0,
            logCount: 0,
        },
        {
            model: 'PRAVIR-X4',
            serialRange: '1000 - 1999',
            droneCount: 0,
            totalFlightHours: 0,
            logCount: 0,
        },
    ];

    if (drones) {
        for (const drone of drones) {
            const model = getModelFromSerial(drone.serial_num);
            const entry = models.find((m) => m.model === model);
            if (entry) {
                entry.droneCount += 1;
                entry.totalFlightHours += drone.total_flight_hours || 0;
                entry.logCount += countMap[drone.id] || 0;
            }
        }
    }

    return (
        <div>
            <h1 style={{ marginTop: 0, color: '#1B4332', fontSize: '28px', fontWeight: 700 }}>
                Fleet Overview
            </h1>
            <p style={{ color: '#6B6B6B', marginTop: '-8px', marginBottom: '32px' }}>
                Select a drone model to view fleet details
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '24px',
            }}>
                {models.map((m) => (
                    <Link
                        key={m.model}
                        href={`/models/${encodeURIComponent(m.model)}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <div style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '12px',
                            border: '1px solid #E8E0D4',
                            padding: '28px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            transition: 'box-shadow 0.2s, border-color 0.2s',
                            cursor: 'pointer',
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '16px',
                            }}>
                                <div>
                                    <h2 style={{
                                        margin: 0,
                                        fontSize: '24px',
                                        fontWeight: 700,
                                        color: '#1B4332',
                                    }}>
                                        {m.model}
                                    </h2>
                                </div>
                                <span style={{
                                    backgroundColor: '#1B4332',
                                    color: '#E8C547',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                }}>
                                    {m.serialRange}
                                </span>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1fr',
                                gap: '16px',
                                padding: '16px 0 0',
                                borderTop: '1px solid #E8E0D4',
                            }}>
                                <div>
                                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#2D6A4F' }}>
                                        {m.droneCount}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#6B6B6B', fontWeight: 500 }}>
                                        DRONES
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#2D6A4F' }}>
                                        {m.totalFlightHours.toFixed(1)}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#6B6B6B', fontWeight: 500 }}>
                                        FLIGHT HOURS
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#2D6A4F' }}>
                                        {m.logCount}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#6B6B6B', fontWeight: 500 }}>
                                        LOGS
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                marginTop: '16px',
                                textAlign: 'right',
                                color: '#D4A017',
                                fontSize: '14px',
                                fontWeight: 600,
                            }}>
                                View Fleet &rarr;
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
