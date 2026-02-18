'use client';

import { useState } from 'react';
import { FlightLog, MaintenanceNote, supabase } from '@/lib/supabase';
import FlightMap from '@/components/FlightMap';
import MaintenanceNotes from '@/components/MaintenanceNotes';

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatFlightTime(seconds: number | null): string {
    if (!seconds || seconds <= 0) return '\u2014';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
}

function formatDistance(meters: number | null): string {
    if (!meters || meters <= 0) return '\u2014';
    if (meters >= 1000) return (meters / 1000).toFixed(2) + ' km';
    return Math.round(meters) + ' m';
}

export default function SerialDetailClient({
    droneId,
    logs,
    notes,
}: {
    droneId: string;
    logs: FlightLog[];
    notes: MaintenanceNote[];
}) {
    const [selectedLog, setSelectedLog] = useState<FlightLog | null>(null);

    const handleDownload = async (storagePath: string, fileName: string) => {
        const { data, error } = await supabase.storage
            .from('flight-logs')
            .createSignedUrl(storagePath, 3600);

        if (error) {
            alert('Failed to generate download link: ' + error.message);
            return;
        }

        if (data?.signedUrl) {
            const link = document.createElement('a');
            link.href = data.signedUrl;
            link.download = fileName;
            link.click();
        }
    };

    const hasGpsPath = (log: FlightLog) => log.gps_path && log.gps_path.length > 1;
    const hasGpsPoint = (log: FlightLog) => log.last_lat != null && log.last_lon != null;

    return (
        <>
            {/* Flight Logs + Detail Panel Layout */}
            <div style={{
                display: 'flex',
                gap: '20px',
                marginBottom: '20px',
                alignItems: 'flex-start',
            }}>
                {/* Flight Logs Table */}
                <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E8E0D4',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    flex: selectedLog ? '1 1 55%' : '1 1 100%',
                    minWidth: 0,
                    transition: 'flex 0.3s ease',
                }}>
                    <h2 style={{ margin: '0 0 16px', color: '#1B4332', fontSize: '18px' }}>
                        Flight Logs
                    </h2>

                    {logs.length === 0 ? (
                        <p style={{ color: '#999' }}>No logs uploaded yet.</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #E8E0D4' }}>
                                        <th style={thStyle}>File</th>
                                        <th style={thStyle}>Flight Time</th>
                                        <th style={thStyle}>Distance</th>
                                        <th style={thStyle}>Firmware</th>
                                        <th style={thStyle}>Size</th>
                                        <th style={thStyle}>Log Date</th>
                                        <th style={thStyle}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => {
                                        const isSelected = selectedLog?.id === log.id;
                                        const canViewPath = hasGpsPath(log) || hasGpsPoint(log);
                                        return (
                                            <tr
                                                key={log.id}
                                                onClick={() => canViewPath && setSelectedLog(isSelected ? null : log)}
                                                style={{
                                                    borderBottom: '1px solid #E8E0D4',
                                                    backgroundColor: isSelected ? '#F0FAF4' : 'transparent',
                                                    cursor: canViewPath ? 'pointer' : 'default',
                                                }}
                                            >
                                                <td style={tdStyle}>
                                                    <span style={{ fontWeight: 500 }}>{log.file_name}</span>
                                                </td>
                                                <td style={tdStyle}>
                                                    {formatFlightTime(log.flight_time_seconds)}
                                                </td>
                                                <td style={tdStyle}>
                                                    {formatDistance(log.flight_distance_meters)}
                                                </td>
                                                <td style={tdStyle}>
                                                    {log.firmware_version ? (
                                                        <span style={{
                                                            fontSize: '12px',
                                                            backgroundColor: '#F0F0F0',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            fontFamily: 'monospace',
                                                        }}>
                                                            {log.firmware_version}
                                                        </span>
                                                    ) : '\u2014'}
                                                </td>
                                                <td style={tdStyle}>{formatFileSize(log.file_size_bytes)}</td>
                                                <td style={tdStyle}>
                                                    {log.log_date
                                                        ? new Date(log.log_date).toLocaleDateString()
                                                        : '\u2014'}
                                                </td>
                                                <td style={{ ...tdStyle, display: 'flex', gap: '6px' }}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDownload(log.storage_path, log.file_name);
                                                        }}
                                                        style={btnStyle}
                                                    >
                                                        Download
                                                    </button>
                                                    {canViewPath && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedLog(isSelected ? null : log);
                                                            }}
                                                            style={{
                                                                ...btnStyle,
                                                                backgroundColor: isSelected ? '#D4A017' : '#1B4332',
                                                            }}
                                                        >
                                                            {isSelected ? 'Hide' : 'View Path'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Right-side Flight Detail Panel */}
                {selectedLog && (
                    <div style={{
                        flex: '0 0 45%',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E8E0D4',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        overflow: 'hidden',
                        position: 'sticky',
                        top: '20px',
                    }}>
                        {/* Panel Header */}
                        <div style={{
                            padding: '16px 20px',
                            backgroundColor: '#1B4332',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: 600 }}>
                                    {selectedLog.file_name}
                                </div>
                                <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>
                                    {selectedLog.log_date
                                        ? new Date(selectedLog.log_date).toLocaleDateString()
                                        : 'Date unknown'}
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    lineHeight: 1,
                                }}
                            >
                                &times;
                            </button>
                        </div>

                        {/* Flight Stats */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1px',
                            backgroundColor: '#E8E0D4',
                        }}>
                            <div style={statCellStyle}>
                                <div style={statLabelStyle}>Flight Time</div>
                                <div style={statValueStyle}>
                                    {formatFlightTime(selectedLog.flight_time_seconds)}
                                </div>
                            </div>
                            <div style={statCellStyle}>
                                <div style={statLabelStyle}>Distance</div>
                                <div style={statValueStyle}>
                                    {formatDistance(selectedLog.flight_distance_meters)}
                                </div>
                            </div>
                            <div style={statCellStyle}>
                                <div style={statLabelStyle}>Firmware</div>
                                <div style={{ ...statValueStyle, fontSize: '13px', fontFamily: 'monospace' }}>
                                    {selectedLog.firmware_version || '\u2014'}
                                </div>
                            </div>
                            <div style={statCellStyle}>
                                <div style={statLabelStyle}>File Size</div>
                                <div style={statValueStyle}>
                                    {formatFileSize(selectedLog.file_size_bytes)}
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        {selectedLog.last_lat != null && selectedLog.last_lon != null && (
                            <div style={{ padding: '12px 20px', borderBottom: '1px solid #E8E0D4' }}>
                                <div style={{ fontSize: '11px', color: '#6B6B6B', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                    Last Position
                                </div>
                                <div style={{ fontSize: '14px', color: '#2C2C2C', fontFamily: 'monospace' }}>
                                    {selectedLog.last_lat.toFixed(6)}, {selectedLog.last_lon.toFixed(6)}
                                </div>
                            </div>
                        )}

                        {/* Flight Path Map */}
                        <div style={{ padding: '12px' }}>
                            {hasGpsPath(selectedLog) ? (
                                <FlightMap
                                    lat={selectedLog.last_lat!}
                                    lon={selectedLog.last_lon!}
                                    gpsPath={selectedLog.gps_path}
                                />
                            ) : selectedLog.last_lat != null && selectedLog.last_lon != null ? (
                                <FlightMap
                                    lat={selectedLog.last_lat}
                                    lon={selectedLog.last_lon}
                                />
                            ) : (
                                <div style={{
                                    padding: '40px',
                                    textAlign: 'center',
                                    color: '#999',
                                    backgroundColor: '#F8F6F1',
                                    borderRadius: '8px',
                                }}>
                                    No GPS data available
                                </div>
                            )}
                        </div>

                        {/* Download Button */}
                        <div style={{ padding: '12px 20px 20px' }}>
                            <button
                                onClick={() => handleDownload(selectedLog.storage_path, selectedLog.file_name)}
                                style={{
                                    ...btnStyle,
                                    width: '100%',
                                    padding: '10px',
                                    fontSize: '14px',
                                }}
                            >
                                Download Log File
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Maintenance Notes */}
            <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E8E0D4',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
                <h2 style={{ margin: '0 0 16px', color: '#1B4332', fontSize: '18px' }}>
                    Maintenance Notes
                </h2>
                <MaintenanceNotes droneId={droneId} initialNotes={notes} />
            </div>
        </>
    );
}

const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#1B4332',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
    padding: '10px 12px',
    fontSize: '14px',
};

const btnStyle: React.CSSProperties = {
    padding: '6px 12px',
    backgroundColor: '#2D6A4F',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500,
};

const statCellStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    padding: '14px 20px',
};

const statLabelStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#6B6B6B',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
};

const statValueStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 700,
    color: '#2D6A4F',
};
