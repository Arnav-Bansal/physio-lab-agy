import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { setCrmSession } from '@/lib/auth/session';
import type { UserRole } from '@/types/database.types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const profileId = body.profileId ? String(body.profileId) : undefined;

    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'staff', 'physio'])
      .eq('is_active', true);

    if (profileId) {
      query = query.eq('id', profileId);
    } else if (email) {
      query = query.eq('email', email);
    } else {
      return NextResponse.json({ error: 'Please select a CRM account or enter your email.' }, { status: 400 });
    }

    const { data: profile, error } = await query.maybeSingle();

    if (error || !profile) {
      return NextResponse.json(
        { error: 'No active CRM profile found for the provided credentials.' },
        { status: 401 }
      );
    }

    await setCrmSession({
      profileId: profile.id,
      email: profile.email || '',
      fullName: profile.full_name,
      role: profile.role as Extract<UserRole, 'admin' | 'staff' | 'physio'>,
      primaryClinicId: profile.primary_clinic_id,
      specialization: profile.specialization,
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        full_name: profile.full_name,
        role: profile.role,
        specialization: profile.specialization,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'CRM login failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
