'use client';

export default function FlightMap({ lat, lon }: { lat: number; lon: number }) {
    const mapSrc = `https://maps.google.com/maps?q=${lat},${lon}&z=15&output=embed`;

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
                    backgroundColor: '#52B788',
                    display: 'inline-block',
                }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1B4332' }}>
                    Last Known Position
                </span>
                <span style={{ fontSize: '12px', color: '#6B6B6B', marginLeft: 'auto' }}>
                    {lat.toFixed(6)}, {lon.toFixed(6)}
                </span>
            </div>
            <iframe
                src={mapSrc}
                width="100%"
                height="400"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            />
        </div>
    );
}
