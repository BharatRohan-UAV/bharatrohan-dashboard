'use client';

import { useState, useEffect } from 'react';

interface LocationCellProps {
    lat: number | null;
    lon: number | null;
    droneId: string;
    cachedName: string | null;
}

export default function LocationCell({ lat, lon, droneId, cachedName }: LocationCellProps) {
    const [placeName, setPlaceName] = useState<string | null>(cachedName);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (placeName || !lat || !lon) return;

        setLoading(true);
        fetch(`/api/geocode?lat=${lat}&lon=${lon}&droneId=${droneId}`)
            .then(res => res.json())
            .then(data => setPlaceName(data.placeName))
            .catch(() => setPlaceName(`${lat.toFixed(4)}, ${lon.toFixed(4)}`))
            .finally(() => setLoading(false));
    }, [lat, lon, droneId, placeName]);

    if (!lat || !lon) return <span style={{ color: '#999' }}>No GPS data</span>;

    if (loading) return <span style={{ color: '#6B6B6B', fontSize: '13px' }}>Loading...</span>;

    return (
        <span
            style={{ fontSize: '13px', color: '#2C2C2C' }}
            title={`${lat.toFixed(6)}, ${lon.toFixed(6)}`}
        >
            {placeName || `${lat.toFixed(4)}, ${lon.toFixed(4)}`}
        </span>
    );
}
