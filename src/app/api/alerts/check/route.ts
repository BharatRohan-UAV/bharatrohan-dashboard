import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, getModelFromSerial } from '@/lib/supabase';

const THRESHOLD_HOURS = Number(process.env.ALERT_FLIGHT_HOURS_THRESHOLD ?? 50);
const WEBHOOK_SECRET = process.env.ALERT_WEBHOOK_SECRET ?? '';
// Zoho Cliq Webhook Token API (Bots & Tools → Webhook Tokens)
// Endpoint: https://cliq.zoho.com/api/v2/channelsbyname/{channel}/message?zapikey={token}
const ZOHO_CLIQ_CHANNEL = process.env.ZOHO_CLIQ_CHANNEL ?? '';
const ZOHO_CLIQ_API_KEY = process.env.ZOHO_CLIQ_API_KEY ?? '';

export async function POST(req: NextRequest) {
    // Validate shared secret so only Supabase can call this
    const secret = req.nextUrl.searchParams.get('secret');
    if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload: { type: string; record: Record<string, unknown> };
    try {
        payload = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Only process UPDATE events on the drones table
    if (payload.type !== 'UPDATE') {
        return NextResponse.json({ skipped: true });
    }

    const drone = payload.record;
    const droneId = drone.id as string;
    const serialNum = drone.serial_num as string;

    const db = createServiceClient();

    // Compute total flight hours fresh from flight_logs (source of truth)
    const { data: sumData } = await db
        .from('flight_logs')
        .select('flight_time_seconds')
        .eq('drone_id', droneId);

    const totalSeconds = (sumData ?? []).reduce(
        (acc, row) => acc + (row.flight_time_seconds ?? 0),
        0
    );
    const totalHours = totalSeconds / 3600;
    const currentMultiple = Math.floor(totalHours / THRESHOLD_HOURS);

    if (currentMultiple < 1) {
        return NextResponse.json({ skipped: 'below threshold' });
    }

    // Find the highest threshold_multiple already recorded for this drone
    const { data: existingAlerts } = await db
        .from('drone_alerts')
        .select('threshold_multiple')
        .eq('drone_id', droneId)
        .order('threshold_multiple', { ascending: false })
        .limit(1);

    const highestRecorded = existingAlerts?.[0]?.threshold_multiple ?? 0;

    if (currentMultiple <= highestRecorded) {
        return NextResponse.json({ skipped: 'already alerted for this interval' });
    }

    const modelName = getModelFromSerial(serialNum);

    // Insert a new alert row for each newly crossed multiple
    const newAlerts = [];
    for (let m = highestRecorded + 1; m <= currentMultiple; m++) {
        newAlerts.push({
            drone_id: droneId,
            serial_num: serialNum,
            model_name: modelName,
            threshold_multiple: m,
            flight_hours_at_trigger: totalHours,
        });
    }

    const { error: insertError } = await db.from('drone_alerts').upsert(newAlerts, {
        onConflict: 'drone_id,threshold_multiple',
        ignoreDuplicates: true,
    });

    if (insertError) {
        console.error('Failed to insert drone_alerts:', insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Send Zoho Cliq notification via Webhook Token API
    // Docs: https://www.zoho.com/cliq/help/platform/webhook-tokens.html
    if (ZOHO_CLIQ_CHANNEL && ZOHO_CLIQ_API_KEY) {
        const hoursLabel = (THRESHOLD_HOURS * currentMultiple).toFixed(0);
        const cliqUrl =
            `https://cliq.zoho.in/api/v2/channelsbyname/${encodeURIComponent(ZOHO_CLIQ_CHANNEL)}/message` +
            `?zapikey=${encodeURIComponent(ZOHO_CLIQ_API_KEY)}`;

        const message = {
            text: (
                `⚠️ Maintenance Due — ${modelName} ${serialNum}\n` +
                `Drone has reached ${totalHours.toFixed(1)} flight hours ` +
                `(interval: every ${hoursLabel}h).\n` +
                `Log a maintenance note on the fleet dashboard once serviced: ` +
                `https://bharatrohan-dashboard.vercel.app/models/${encodeURIComponent(modelName)}/${encodeURIComponent(serialNum)}`
            ),
        };

        try {
            const res = await fetch(cliqUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message),
            });
            if (!res.ok) {
                console.error('Zoho Cliq returned', res.status, await res.text());
            }
        } catch (err) {
            // Don't fail the whole request if Cliq is unreachable
            console.error('Zoho Cliq notification failed:', err);
        }
    }

    return NextResponse.json({ alerted: true, multiple: currentMultiple, hours: totalHours });
}
