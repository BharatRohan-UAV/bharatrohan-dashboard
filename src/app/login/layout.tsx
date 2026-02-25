export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FAF8F4',
            padding: '24px',
        }}>
            {children}
        </div>
    );
}
