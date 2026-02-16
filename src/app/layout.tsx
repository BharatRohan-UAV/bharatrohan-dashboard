import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Fleet Dashboard',
    description: 'BharatRohan Drone Fleet Management',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f5f5f5' }}>
                <nav style={{
                    backgroundColor: '#1a1a2e',
                    color: 'white',
                    padding: '12px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                }}>
                    <a href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '20px', fontWeight: 'bold' }}>
                        Fleet Dashboard
                    </a>
                    <span style={{ color: '#888', fontSize: '14px' }}>BharatRohan GCS</span>
                </nav>
                <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
                    {children}
                </div>
            </body>
        </html>
    );
}
