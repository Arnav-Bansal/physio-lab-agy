import { NextResponse } from 'next/server';
import { getPatientSession } from '@/lib/auth/session';
import { repositories } from '@/lib/repositories';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const session = await getPatientSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const appointmentId = String(body.appointmentId || '');
    const reason = String(body.reason || 'Cancelled by patient via Patient Portal');

    if (!appointmentId) {
      return NextResponse.json({ error: 'appointmentId is required' }, { status: 400 });
    }

    // Verify ownership
    const supabase = createSupabaseAdminClient();
    const { data: existing } = await supabase
      .from('appointments')
      .select('id, patient_id, status')
      .eq('id', appointmentId)
      .maybeSingle();

    if (!existing || existing.patient_id !== session.patientId) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const updated = await repositories.appointments.updateStatus(
      appointmentId,
      'cancelled',
      null,
      reason
    );

    return NextResponse.json({
      success: true,
      appointment: updated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to cancel appointment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
