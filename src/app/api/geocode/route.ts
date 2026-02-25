import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    // Verify authenticated session
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const lat = req.nextUrl.searchParams.get('lat');
    const lon = req.nextUrl.searchParams.get('lon');
    const droneId = req.nextUrl.searchParams.get('droneId');

    if (!lat || !lon) {
        return NextResponse.json({ error: 'lat and lon required' }, { status: 400 });
    }

    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;

    const response = await fetch(nominatimUrl, {
        headers: {
            'User-Agent': 'BharatRohan-FleetDashboard/1.0',
        },
    });

    if (!response.ok) {
        return NextResponse.json({ error: 'Geocoding failed' }, { status: 502 });
    }

    const data = await response.json();
    const addr = data.address || {};
    const village = addr.village || addr.town || addr.city || addr.suburb || '';
    const district = addr.county || addr.state_district || '';
    const state = addr.state || '';
    const parts = [village, district, state].filter(Boolean);
    const placeName = parts.slice(0, 2).join(', ')
        || data.display_name?.split(',').slice(0, 2).join(',').trim()
        || 'Unknown location';

    // Cache in drones table
    if (droneId) {
        try {
            const db = createServiceClient();
            await db
                .from('drones')
                .update({ last_location_name: placeName })
                .eq('id', droneId);
        } catch {
            // Caching failure is non-critical
        }
    }

    return NextResponse.json({ placeName });
}
