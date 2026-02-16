'use client';

import { supabase, FlightLog } from '@/lib/supabase';

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function LogTable({ logs }: { logs: FlightLog[] }) {
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

    if (logs.length === 0) {
        return <p style={{ color: '#999' }}>No logs uploaded yet.</p>;
    }

    return (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                    <th style={thStyle}>File</th>
                    <th style={thStyle}>Size</th>
                    <th style={thStyle}>Log Date</th>
                    <th style={thStyle}>Uploaded</th>
                    <th style={thStyle}>Action</th>
                </tr>
            </thead>
            <tbody>
                {logs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={tdStyle}>{log.file_name}</td>
                        <td style={tdStyle}>{formatFileSize(log.file_size_bytes)}</td>
                        <td style={tdStyle}>
                            {log.log_date
                                ? new Date(log.log_date).toLocaleDateString()
                                : '\u2014'}
                        </td>
                        <td style={tdStyle}>
                            {new Date(log.uploaded_at).toLocaleDateString()}
                        </td>
                        <td style={tdStyle}>
                            <button
                                onClick={() => handleDownload(log.storage_path, log.file_name)}
                                style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#0066cc',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                }}
                            >
                                Download
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '8px 12px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#495057',
};

const tdStyle: React.CSSProperties = {
    padding: '8px 12px',
    fontSize: '13px',
};
