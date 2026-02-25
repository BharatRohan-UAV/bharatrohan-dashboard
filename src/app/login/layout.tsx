export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            top: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(145deg, #1B4332 0%, #0F2B21 50%, #1A3C2F 100%)',
            padding: '24px',
            overflow: 'hidden',
            zIndex: 10,
        }}>
            {/* Subtle decorative circles */}
            <div style={{
                position: 'absolute',
                top: '-15%',
                right: '-10%',
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(212,160,23,0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-20%',
                left: '-10%',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(45,106,79,0.15) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
                {children}
            </div>
        </div>
    );
}
