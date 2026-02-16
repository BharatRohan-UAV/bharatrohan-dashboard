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
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                        <Image
                            src="/logo.png"
                            alt="BharatRohan"
                            width={160}
                            height={40}
                            style={{ objectFit: 'contain' }}
                            priority
                        />
                    </Link>
                    <div style={{ flex: 1 }} />
                    <span style={{ color: '#52B788', fontSize: '14px', fontWeight: 500 }}>
                        Fleet Management
                    </span>
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
