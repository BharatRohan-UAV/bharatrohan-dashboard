import Link from 'next/link';
import { DroneAlert } from '@/lib/supabase';

export default function AlertBanner({ alerts }: { alerts: DroneAlert[] }) {
    // Group by drone so we show one line per drone, not per alert row
    const byDrone: Record<string, { serial: string; model: string; hours: number; count: number }> = {};
    for (const alert of alerts) {
        if (!byDrone[alert.drone_id]) {
            byDrone[alert.drone_id] = {
                serial: alert.serial_num,
                model: alert.model_name ?? 'Unknown',
                hours: alert.flight_hours_at_trigger ?? 0,
                count: 0,
            };
        }
        byDrone[alert.drone_id].count += 1;
    }

    const drones = Object.values(byDrone);

    return (
        <div style={{
            backgroundColor: '#FEF3C7',
            border: '1px solid #F59E0B',
            borderRadius: '10px',
            padding: '14px 20px',
            marginBottom: '24px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
        }}>
            <span style={{ fontSize: '20px', lineHeight: 1.4 }}>⚠️</span>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#92400E', fontSize: '14px', marginBottom: '6px' }}>
                    Maintenance Due — {drones.length} drone{drones.length !== 1 ? 's' : ''} require servicing
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {drones.map((d) => (
                        <Link
                            key={d.serial}
                            href={`/models/${encodeURIComponent(d.model)}/${encodeURIComponent(d.serial)}`}
                            style={{
                                backgroundColor: '#FFFBEB',
                                border: '1px solid #F59E0B',
                                borderRadius: '6px',
                                padding: '4px 10px',
                                fontSize: '13px',
                                color: '#92400E',
                                textDecoration: 'none',
                                fontWeight: 600,
                            }}
                        >
                            {d.model} {d.serial} — {d.hours.toFixed(1)}h
                        </Link>
                    ))}
                </div>
                <div style={{ fontSize: '12px', color: '#78350F', marginTop: '8px' }}>
                    Add a maintenance note on the drone&apos;s detail page to acknowledge and reset this alert.
                </div>
            </div>
        </div>
    );
}
