'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

interface FlightMapInnerProps {
    lat: number;
    lon: number;
    gpsPath?: number[][] | null;
}

// Fix default marker icon path issue with webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression }) {
    const map = useMap();
    useEffect(() => {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 18 });
    }, [map, bounds]);
    return null;
}

export default function FlightMapInner({ lat, lon, gpsPath }: FlightMapInnerProps) {
    const hasPath = gpsPath && gpsPath.length > 1;

    const pathPositions = useMemo(() => {
        if (!hasPath) return [];
        return gpsPath.map(([pLat, pLon]) => [pLat, pLon] as [number, number]);
    }, [gpsPath, hasPath]);

    const bounds = useMemo(() => {
        if (!hasPath || pathPositions.length === 0) return null;
        return L.latLngBounds(pathPositions);
    }, [pathPositions, hasPath]);

    const center: [number, number] = hasPath
        ? [pathPositions[0][0], pathPositions[0][1]]
        : [lat, lon];

    return (
        <MapContainer
            center={center}
            zoom={hasPath ? 13 : 15}
            style={{ height: '400px', width: '100%' }}
            scrollWheelZoom={true}
        >
            <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri"
                maxZoom={19}
            />

            {hasPath && bounds && (
                <>
                    <FitBounds bounds={bounds} />
                    <Polyline
                        positions={pathPositions}
                        pathOptions={{
                            color: '#FFD700',
                            weight: 3,
                            opacity: 0.9,
                        }}
                    />
                    {/* Start marker */}
                    <CircleMarker
                        center={pathPositions[0]}
                        pathOptions={{
                            fillColor: '#52B788',
                            color: 'white',
                            weight: 2,
                            fillOpacity: 1,
                        }}
                        radius={7}
                    >
                        <Tooltip direction="top" offset={[0, -8]}>Start</Tooltip>
                    </CircleMarker>
                    {/* End marker */}
                    <CircleMarker
                        center={pathPositions[pathPositions.length - 1]}
                        pathOptions={{
                            fillColor: '#D62828',
                            color: 'white',
                            weight: 2,
                            fillOpacity: 1,
                        }}
                        radius={7}
                    >
                        <Tooltip direction="top" offset={[0, -8]}>End</Tooltip>
                    </CircleMarker>
                </>
            )}

            {!hasPath && (
                <Marker position={[lat, lon]}>
                    <Tooltip direction="top" offset={[0, -20]} permanent>
                        {lat.toFixed(6)}, {lon.toFixed(6)}
                    </Tooltip>
                </Marker>
            )}
        </MapContainer>
    );
}
