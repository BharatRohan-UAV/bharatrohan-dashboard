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

    return (
        <>
            {/* Flight Logs */}
            <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E8E0D4',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                marginBottom: '20px',
            }}>
                <h2 style={{ margin: '0 0 16px', color: '#1B4332', fontSize: '18px' }}>
                    Flight Logs
                </h2>

                {logs.length === 0 ? (
                    <p style={{ color: '#999' }}>No logs uploaded yet.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #E8E0D4' }}>
                                <th style={thStyle}>File</th>
                                <th style={thStyle}>Size</th>
                                <th style={thStyle}>Log Date</th>
                                <th style={thStyle}>Uploaded</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => {
                                const isSelected = selectedLog?.id === log.id;
                                const hasGps = log.last_lat != null && log.last_lon != null;
                                return (
                                    <tr
                                        key={log.id}
                                        style={{
                                            borderBottom: '1px solid #E8E0D4',
                                            backgroundColor: isSelected ? '#F0FAF4' : 'transparent',
                                        }}
                                    >
                                        <td style={tdStyle}>
                                            <span style={{ fontWeight: 500 }}>{log.file_name}</span>
                                        </td>
                                        <td style={tdStyle}>{formatFileSize(log.file_size_bytes)}</td>
                                        <td style={tdStyle}>
                                            {log.log_date
                                                ? new Date(log.log_date).toLocaleDateString()
                                                : '\u2014'}
                                        </td>
                                        <td style={tdStyle}>
                                            {new Date(log.uploaded_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ ...tdStyle, display: 'flex', gap: '6px' }}>
                                            <button
                                                onClick={() => handleDownload(log.storage_path, log.file_name)}
                                                style={btnStyle}
                                            >
                                                Download
                                            </button>
                                            {hasGps && (
                                                <button
                                                    onClick={() => setSelectedLog(isSelected ? null : log)}
                                                    style={{
                                                        ...btnStyle,
                                                        backgroundColor: isSelected ? '#D4A017' : '#1B4332',
                                                    }}
                                                >
                                                    {isSelected ? 'Hide Map' : 'View Map'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                {/* Map display */}
                {selectedLog && selectedLog.last_lat != null && selectedLog.last_lon != null && (
                    <FlightMap lat={selectedLog.last_lat} lon={selectedLog.last_lon} />
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
