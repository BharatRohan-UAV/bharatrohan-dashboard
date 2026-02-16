import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'BharatRohan Fleet Management',
    description: 'BharatRohan Drone Fleet Management Dashboard',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body style={{
                margin: 0,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                backgroundColor: '#FAF8F4',
                color: '#2C2C2C',
            }}>
                <nav style={{
                    backgroundColor: '#1B4332',
                    padding: '14px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                        <Image
                            src="/logo2.png"
                            alt="BharatRohan"
                            width={64}
                            height={64}
                            style={{ objectFit: 'contain', marginTop: '-4px' }}
                            priority
                        />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{
                                color: '#FFFFFF',
                                fontSize: '18px',
                                fontWeight: 700,
                                lineHeight: '1.2',
                                letterSpacing: '0.3px',
                            }}>
                                BharatRohan
                            </span>
                            <span style={{
                                color: '#D4A017',
                                fontSize: '11px',
                                fontWeight: 500,
                                lineHeight: '1.2',
                            }}>
                                Fleet Management
                            </span>
                        </div>
                    </Link>
                </nav>
                <div style={{
                    height: '3px',
                    background: 'linear-gradient(90deg, #D4A017, #E8C547, #D4A017)',
                }} />
                <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
                    {children}
                </div>
            </body>
        </html>
    );
}
