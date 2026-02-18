'use client';

interface FlightMapProps {
    lat: number;
    lon: number;
    gpsPath?: number[][] | null;
}

export default function FlightMap({ lat, lon, gpsPath }: FlightMapProps) {
    // If we have a GPS path, show the full flight path using Google Maps Embed with polyline
    if (gpsPath && gpsPath.length > 1) {
        // Build a Google Maps Static API URL with the path
        // For the interactive iframe, we use a directions-style embed with waypoints
        // But the simplest approach is encoding path points into a static map URL

        // Calculate bounds for centering
        let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
        for (const [pLat, pLon] of gpsPath) {
            if (pLat < minLat) minLat = pLat;
            if (pLat > maxLat) maxLat = pLat;
            if (pLon < minLon) minLon = pLon;
            if (pLon > maxLon) maxLon = pLon;
        }
        const centerLat = (minLat + maxLat) / 2;
        const centerLon = (minLon + maxLon) / 2;

        // Encode path for Google Maps Static API using simplified polyline encoding
        // We'll use a simpler approach: pipe-separated lat,lng pairs (limited to ~100 for URL length)
        const step = Math.max(1, Math.floor(gpsPath.length / 100));
        const sampledPoints = gpsPath.filter((_, i) => i % step === 0 || i === gpsPath.length - 1);
        const pathStr = sampledPoints.map(([pLat, pLon]) => `${pLat.toFixed(5)},${pLon.toFixed(5)}`).join('|');

        // Google Maps Static API URL with path
        const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=800x400&path=color:0x2D6A4Fff|weight:3|${pathStr}&markers=color:green|${gpsPath[0][0].toFixed(5)},${gpsPath[0][1].toFixed(5)}&markers=color:red|${gpsPath[gpsPath.length - 1][0].toFixed(5)},${gpsPath[gpsPath.length - 1][1].toFixed(5)}`;

        // For interactive map, use Google Maps embed centered on the path center
        // with the last position as the query point
        const embedSrc = `https://maps.google.com/maps?q=${centerLat},${centerLon}&z=15&output=embed`;

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
                        backgroundColor: '#2D6A4F',
                        display: 'inline-block',
                    }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1B4332' }}>
                        Flight Path
                    </span>
                    <span style={{ fontSize: '12px', color: '#6B6B6B', marginLeft: 'auto' }}>
                        {gpsPath.length} points
                    </span>
                </div>

                {/* Flight path SVG overlay on embedded map */}
                <div style={{ position: 'relative' }}>
                    <iframe
                        src={embedSrc}
                        width="100%"
                        height="400"
                        style={{ border: 0, display: 'block' }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                    {/* SVG flight path overlay */}
                    <svg
                        viewBox={`0 0 800 400`}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'none',
                        }}
                    >
                        {(() => {
                            // Project GPS coordinates to SVG viewport
                            const padX = 40, padY = 40;
                            const w = 800 - 2 * padX;
                            const h = 400 - 2 * padY;
                            const latRange = maxLat - minLat || 0.001;
                            const lonRange = maxLon - minLon || 0.001;

                            const points = sampledPoints.map(([pLat, pLon]) => {
                                const x = padX + ((pLon - minLon) / lonRange) * w;
                                const y = padY + ((maxLat - pLat) / latRange) * h;
                                return `${x},${y}`;
                            }).join(' ');

                            const start = sampledPoints[0];
                            const end = sampledPoints[sampledPoints.length - 1];
                            const sx = padX + ((start[1] - minLon) / lonRange) * w;
                            const sy = padY + ((maxLat - start[0]) / latRange) * h;
                            const ex = padX + ((end[1] - minLon) / lonRange) * w;
                            const ey = padY + ((maxLat - end[0]) / latRange) * h;

                            return (
                                <>
                                    <polyline
                                        points={points}
                                        fill="none"
                                        stroke="#2D6A4F"
                                        strokeWidth="3"
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                        opacity="0.8"
                                    />
                                    {/* Start marker */}
                                    <circle cx={sx} cy={sy} r="6" fill="#52B788" stroke="white" strokeWidth="2" />
                                    {/* End marker */}
                                    <circle cx={ex} cy={ey} r="6" fill="#D62828" stroke="white" strokeWidth="2" />
                                </>
                            );
                        })()}
                    </svg>
                </div>
            </div>
        );
    }

    // Fallback: single point map (original behavior)
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
