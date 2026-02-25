'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError('');
        if (!email.endsWith('@bharatrohan.in')) {
            setError('Only @bharatrohan.in email addresses are allowed.');
            return;
        }

        setLoading(true);
        try {
            // Get OTP token from server (no email sent)
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Login failed.');
                setLoading(false);
                return;
            }

            // Verify token client-side to create session cookies
            const supabase = createBrowserSupabaseClient();
            const { error: verifyError } = await supabase.auth.verifyOtp({
                email,
                token: data.token,
                type: 'email',
            });

            if (verifyError) {
                setError(verifyError.message);
                setLoading(false);
                return;
            }

            router.push('/');
            router.refresh();
        } catch {
            setError('Login failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div style={{ width: '100%', maxWidth: '380px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{
                    color: '#1B4332',
                    fontSize: '26px',
                    fontWeight: 700,
                    margin: '0 0 6px',
                }}>
                    Fleet Management
                </h1>
                <p style={{
                    color: '#6B6B6B',
                    fontSize: '14px',
                    margin: 0,
                }}>
                    Sign in with your BharatRohan email
                </p>
            </div>

            <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E8E0D4',
                padding: '32px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
                <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#1B4332',
                    marginBottom: '8px',
                }}>
                    Email Address
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@bharatrohan.in"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    style={{
                        width: '100%',
                        padding: '12px 14px',
                        border: '1px solid #E8E0D4',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                    }}
                />
                <button
                    onClick={handleLogin}
                    disabled={loading || !email}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: loading ? '#ccc' : '#2D6A4F',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: loading ? 'default' : 'pointer',
                        marginTop: '16px',
                    }}
                >
                    {loading ? 'Signing in...' : 'Login'}
                </button>

                {error && (
                    <div style={{
                        marginTop: '12px',
                        padding: '10px 14px',
                        backgroundColor: '#FEF2F2',
                        color: '#991B1B',
                        borderRadius: '8px',
                        fontSize: '13px',
                        border: '1px solid #FECACA',
                    }}>
                        {error}
                    </div>
                )}
            </div>

            <p style={{
                textAlign: 'center',
                color: '#999',
                fontSize: '12px',
                marginTop: '24px',
            }}>
                BharatRohan Airborne Innovations Limited. All rights reserved.
            </p>
        </div>
    );
}
