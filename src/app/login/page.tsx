'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';

export default function LoginPage() {
    const router = useRouter();
    const supabase = createBrowserSupabaseClient();

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendOtp = async () => {
        setError('');
        if (!email.endsWith('@bharatrohan.in')) {
            setError('Only @bharatrohan.in email addresses are allowed.');
            return;
        }

        setLoading(true);
        const { error: authError } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        setLoading(false);

        if (authError) {
            setError(authError.message);
            return;
        }

        setStep('otp');
    };

    const handleVerifyOtp = async () => {
        setError('');
        setLoading(true);

        const { error: authError } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'email',
        });
        setLoading(false);

        if (authError) {
            setError(authError.message);
            return;
        }

        router.push('/');
        router.refresh();
    };

    return (
        <div style={{
            width: '100%',
            maxWidth: '380px',
        }}>
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

            {/* Card */}
            <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '32px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}>
                {step === 'email' ? (
                    <>
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
                            onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
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
                            onClick={handleSendOtp}
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
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </>
                ) : (
                    <>
                        <p style={{
                            fontSize: '14px',
                            color: '#6B6B6B',
                            margin: '0 0 16px',
                        }}>
                            A 6-digit code has been sent to <strong style={{ color: '#2C2C2C' }}>{email}</strong>
                        </p>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#1B4332',
                            marginBottom: '8px',
                        }}>
                            Verification Code
                        </label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            maxLength={6}
                            onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                border: '1px solid #E8E0D4',
                                borderRadius: '8px',
                                fontSize: '20px',
                                fontWeight: 600,
                                textAlign: 'center',
                                letterSpacing: '8px',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                        <button
                            onClick={handleVerifyOtp}
                            disabled={loading || otp.length !== 6}
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
                            {loading ? 'Verifying...' : 'Verify & Sign In'}
                        </button>
                        <button
                            onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                            style={{
                                width: '100%',
                                padding: '10px',
                                backgroundColor: 'transparent',
                                color: '#6B6B6B',
                                border: 'none',
                                fontSize: '13px',
                                cursor: 'pointer',
                                marginTop: '8px',
                            }}
                        >
                            Use a different email
                        </button>
                    </>
                )}

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
