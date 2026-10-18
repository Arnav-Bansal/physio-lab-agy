import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { normalizePhoneE164 } from '@/lib/utils';
import { setPatientSession } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawPhone = String(body.phone || '').trim();
    const rawOtp = String(body.otp || '').trim();
    const fullNameInput = String(body.fullName || '').trim();

    if (!rawPhone || rawOtp.length !== 6) {
      return NextResponse.json(
        { error: 'Please provide your phone number and the 6-digit OTP code.' },
        { status: 400 }
      );
    }

    const phone = normalizePhoneE164(rawPhone);
    const sandboxOtp = process.env.WHATSAPP_SANDBOX_OTP || '123456';
    const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');

    const supabase = createSupabaseAdminClient();

    // Look up latest unverified OTP for this phone
    const { data: otpRow } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('phone', phone)
      .is('verified_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const isSandboxMatch = rawOtp === sandboxOtp;
    const isHashMatch = otpRow && otpRow.otp_hash === otpHash;

    if (!isSandboxMatch && !isHashMatch) {
      if (otpRow) {
        await supabase
          .from('otp_verifications')
          .update({ attempts: (otpRow.attempts || 0) + 1 })
          .eq('id', otpRow.id);
      }
      return NextResponse.json(
        { error: 'Invalid or expired OTP code. Please try again (Sandbox OTP: 123456).' },
        { status: 401 }
      );
    }

    if (otpRow) {
      await supabase
        .from('otp_verifications')
        .update({ verified_at: new Date().toISOString() })
        .eq('id', otpRow.id);
    }

    // Find or provision patient profile
    let { data: patient } = await supabase
      .from('patients')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    if (!patient) {
      const { data: defaultClinic } = await supabase
        .from('clinics')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      const { data: createdPatient, error: createError } = await supabase
        .from('patients')
        .insert({
          full_name: fullNameInput || `Patient (${phone.slice(-4)})`,
          phone,
          preferred_clinic_id: defaultClinic?.id ?? null,
        })
        .select('*')
        .single();

      if (createError) {
        throw new Error(`Could not create patient profile: ${createError.message}`);
      }
      patient = createdPatient;
    } else if (fullNameInput && patient.full_name.startsWith('Patient (')) {
      const { data: updatedPatient } = await supabase
        .from('patients')
        .update({ full_name: fullNameInput })
        .eq('id', patient.id)
        .select('*')
        .single();
      if (updatedPatient) patient = updatedPatient;
    }

    await setPatientSession({
      patientId: patient.id,
      phone: patient.phone,
      fullName: patient.full_name,
      role: 'patient',
    });

    return NextResponse.json({
      success: true,
      patient: {
        id: patient.id,
        full_name: patient.full_name,
        phone: patient.phone,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'OTP verification failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
