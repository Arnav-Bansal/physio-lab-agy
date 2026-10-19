import { NextResponse } from 'next/server';
import { getCrmSession } from '@/lib/auth/session';
import { repositories } from '@/lib/repositories';

export async function POST(request: Request) {
  try {
    const session = await getCrmSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role === 'physio') {
      return NextResponse.json(
        { error: 'Forbidden: Only Admin and Reception Staff can dispatch manual WhatsApp messages.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const patientId = String(body.patientId || '');
    const customNote = String(body.customNote || '').trim();

    if (!patientId) {
      return NextResponse.json({ error: 'patientId is required' }, { status: 400 });
    }

    const log = await repositories.messages.triggerManualFollowUp({
      patientId,
      clinicId: body.clinicId || session.primaryClinicId,
      appointmentId: body.appointmentId || null,
      customNote: customNote || `${session.fullName} (The Physio Lab)`,
      triggeredBy: session.profileId,
    });

    return NextResponse.json({ success: true, messageLog: log });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send WhatsApp message';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
