import { NextResponse } from 'next/server';
import { getCrmSession } from '@/lib/auth/session';
import { repositories } from '@/lib/repositories';

export async function POST(request: Request) {
  try {
    const session = await getCrmSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Action 1: Convert a scheduled appointment into a consultation
    if (body.action === 'open' && body.appointmentId) {
      const consultation = await repositories.consultations.openOrCreateFromAppointment(
        String(body.appointmentId),
        session.profileId
      );
      return NextResponse.json({ success: true, consultation });
    }

    // Action 2: Save clinical notes & optionally mark complete (syncs appointment status -> 'completed')
    if (body.consultationId) {
      const updated = await repositories.consultations.saveAndComplete({
        consultationId: String(body.consultationId),
        chiefComplaint: body.chiefComplaint,
        diagnosis: body.diagnosis,
        clinicalNotes: body.clinicalNotes,
        treatmentPlan: body.treatmentPlan,
        followUpRecommendedDate: body.followUpRecommendedDate || null,
        markComplete: Boolean(body.markComplete),
        actorId: session.profileId,
      });

      return NextResponse.json({ success: true, consultation: updated });
    }

    return NextResponse.json({ error: 'Invalid consultation request payload' }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Consultation operation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
