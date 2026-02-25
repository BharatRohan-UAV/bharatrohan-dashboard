'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';

export default function AuthStatus() {
    const router = useRouter();
    const [email, setEmail] = useState<string | null>(null);

    useEffect(() => {
        const supabase = createBrowserSupabaseClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            setEmail(user?.email ?? null);
        });
    }, []);

    if (!email) return null;

    const handleLogout = async () => {
        const supabase = createBrowserSupabaseClient();
        await supabase.auth.signOut();
        setEmail(null);
        router.push('/login');
        router.refresh();
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginLeft: 'auto',
        }}>
            <span style={{
                color: '#D4A017',
                fontSize: '13px',
                fontWeight: 500,
            }}>
                {email}
            </span>
            <button
                onClick={handleLogout}
                style={{
                    padding: '5px 12px',
                    backgroundColor: 'transparent',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 500,
                }}
            >
                Logout
            </button>
        </div>
    );
}
