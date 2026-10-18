import { NextResponse } from 'next/server';
import { getCrmSession } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { repositories } from '@/lib/repositories';
import { normalizePhoneE164 } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const session = await getCrmSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only Admin role can modify clinics, staff/physio roles, and templates.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const supabase = createSupabaseAdminClient();

    // 1. Create or Update Clinic Branch
    if (body.entity === 'clinic') {
      const slug =
        body.slug ||
        String(body.name || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

      const clinic = await repositories.clinics.createOrUpdateClinic({
        name: String(body.name),
        slug,
        address: String(body.address),
        city: String(body.city || 'Ludhiana'),
        state: String(body.state || 'Punjab'),
        pincode: body.pincode || '141012',
        phone: String(body.phone),
        default_slot_duration_mins: Number(body.default_slot_duration_mins || 30),
        is_active: body.is_active !== false,
      });

      return NextResponse.json({ success: true, clinic });
    }

    // 2. Create or Update Physio / Staff User Profile
    if (body.entity === 'profile') {
      const email = String(body.email || '').trim().toLowerCase();
      const fullName = String(body.full_name || '').trim();
      const role = body.role || 'physio';

      if (!email || !fullName) {
        return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
      }

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      let userId = existingProfile?.id;

      if (!userId) {
        const { data: createdAuth, error: authErr } = await supabase.auth.admin.createUser({
          email,
          password: 'PhysioLab@2026',
          email_confirm: true,
          user_metadata: { full_name: fullName },
        });
        if (authErr && !authErr.message.includes('already been registered')) {
          throw new Error(`Auth user creation error: ${authErr.message}`);
        }
        userId = createdAuth?.user?.id;
      }

      if (!userId) {
        return NextResponse.json({ error: 'Could not resolve user ID' }, { status: 400 });
      }

      const { data: savedProfile, error: profErr } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          role,
          full_name: fullName,
          email,
          phone: body.phone ? normalizePhoneE164(String(body.phone)) : null,
          primary_clinic_id: body.primary_clinic_id || session.primaryClinicId,
          specialization: body.specialization || null,
          bio: body.bio || null,
          calendar_color: body.calendar_color || '#00858E',
          is_active: true,
        })
        .select('*')
        .single();

      if (profErr) throw new Error(profErr.message);
      return NextResponse.json({ success: true, profile: savedProfile });
    }

    // 3. Update WhatsApp Message Template
    if (body.entity === 'template') {
      const { data: updatedTemplate, error: tplErr } = await supabase
        .from('message_templates')
        .update({
          meta_template_name: String(body.meta_template_name),
          body_preview: String(body.body_preview),
          is_active: Boolean(body.is_active),
          updated_by: session.profileId,
        })
        .eq('id', String(body.id))
        .select('*')
        .single();

      if (tplErr) throw new Error(tplErr.message);
      return NextResponse.json({ success: true, template: updatedTemplate });
    }

    return NextResponse.json({ error: 'Unknown admin entity action' }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Admin action failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
