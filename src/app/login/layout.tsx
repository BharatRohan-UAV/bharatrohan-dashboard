export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <style>{`body { overflow: hidden; }`}</style>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'calc(100vh - 120px)',
            }}>
                {children}
            </div>
        </>
    );
}
