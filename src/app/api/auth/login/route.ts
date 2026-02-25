import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    const { email } = await req.json();

    if (!email || !email.endsWith('@bharatrohan.in')) {
        return NextResponse.json({ error: 'Only @bharatrohan.in emails allowed.' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Create user if doesn't exist (auto-confirm, no email sent)
    await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
    });

    // Generate magic link server-side — gives us the raw OTP token
    const { data, error } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return the raw OTP token — client will verify it locally
    return NextResponse.json({ token: data.properties.email_otp });
}
