import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { normalizePhoneE164 } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawPhone = String(body.phone || '').trim();
    const digitsOnly = rawPhone.replace(/\D/g, '');

    if (digitsOnly.length < 10) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    const phone = normalizePhoneE164(rawPhone);
    const supabase = createSupabaseAdminClient();

    // Generate 6-digit OTP (or use sandbox fallback 123456 when in local/sandbox mode)
    const sandboxOtp = process.env.WHATSAPP_SANDBOX_OTP || '123456';
    const isLiveWhatsApp =
      process.env.WHATSAPP_ACCESS_TOKEN &&
      process.env.WHATSAPP_ACCESS_TOKEN !== 'sandbox_token' &&
      process.env.WHATSAPP_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_PHONE_NUMBER_ID !== 'sandbox_phone_id';

    const otpCode = isLiveWhatsApp
      ? String(Math.floor(100000 + Math.random() * 900000))
      : sandboxOtp;

    const otpHash = crypto.createHash('sha256').update(otpCode).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Store hashed OTP in public.otp_verifications
    await supabase.from('otp_verifications').insert({
      phone,
      otp_hash: otpHash,
      expires_at: expiresAt,
      attempts: 0,
    });

    // Check if patient already exists
    const { data: existingPatient } = await supabase
      .from('patients')
      .select('id, full_name, phone')
      .eq('phone', phone)
      .maybeSingle();

    // Log OTP dispatch in central message_logs
    await supabase.from('message_logs').insert({
      patient_id: existingPatient?.id ?? null,
      trigger_type: 'otp_verification',
      channel: 'whatsapp',
      recipient_phone: phone,
      template_variables: {
        name: existingPatient?.full_name || 'Patient',
        otp: isLiveWhatsApp ? '******' : otpCode,
        clinic: 'The Physio Lab — Research & Rehabilitation',
      },
      status: 'sent',
      scheduled_for: new Date().toISOString(),
      sent_at: new Date().toISOString(),
      provider_message_id: `wamid.otp.${Date.now()}`,
      attempts: 1,
    });

    // If live Meta WhatsApp Cloud API credentials are provided, dispatch via Graph API
    if (isLiveWhatsApp) {
      await fetch(
        `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: phone.replace('+', ''),
            type: 'template',
            template: {
              name: 'physiolab_otp_auth',
              language: { code: 'en' },
              components: [
                {
                  type: 'body',
                  parameters: [{ type: 'text', text: otpCode }],
                },
              ],
            },
          }),
        }
      ).catch(() => null);
    }

    return NextResponse.json({
      success: true,
      phone,
      existingPatientName: existingPatient?.full_name ?? null,
      sandboxMode: !isLiveWhatsApp,
      sandboxHint: !isLiveWhatsApp ? `Sandbox mode active — use OTP ${sandboxOtp}` : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send WhatsApp OTP';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
