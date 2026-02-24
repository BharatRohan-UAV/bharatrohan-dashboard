'use client';

import dynamic from 'next/dynamic';

const FlightMapInner = dynamic(() => import('./FlightMapInner'), {
    ssr: false,
    loading: () => (
        <div style={{
            height: '400px',
            backgroundColor: '#F8F6F1',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6B6B6B',
            border: '1px solid #E8E0D4',
        }}>
            Loading map...
        </div>
    ),
});

interface FlightMapProps {
    lat: number;
    lon: number;
    gpsPath?: number[][] | null;
}

export default function FlightMap({ lat, lon, gpsPath }: FlightMapProps) {
    const hasPath = gpsPath && gpsPath.length > 1;

    return (
        <div style={{
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #E8E0D4',
            marginTop: '12px',
        }}>
            <div style={{
                padding: '10px 16px',
                backgroundColor: '#F8F6F1',
                borderBottom: '1px solid #E8E0D4',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
            }}>
                <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: hasPath ? '#FFD700' : '#52B788',
                    display: 'inline-block',
                }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1B4332' }}>
                    {hasPath ? 'Flight Path' : 'Last Known Position'}
                </span>
                <span style={{ fontSize: '12px', color: '#6B6B6B', marginLeft: 'auto' }}>
                    {hasPath ? `${gpsPath!.length} points` : `${lat.toFixed(6)}, ${lon.toFixed(6)}`}
                </span>
            </div>
            <FlightMapInner lat={lat} lon={lon} gpsPath={gpsPath} />
        </div>
    );
}
