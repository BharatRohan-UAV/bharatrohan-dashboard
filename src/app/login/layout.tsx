export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 120px)',
        }}>
            {children}
        </div>
    );
}
