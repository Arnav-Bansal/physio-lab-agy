import { NextResponse } from 'next/server';
import { getPatientSession } from '@/lib/auth/session';
import { repositories } from '@/lib/repositories';

export async function POST(request: Request) {
  try {
    const session = await getPatientSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Please log in with WhatsApp OTP to book an appointment.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { clinicId, physioId, startTime, endTime, chiefComplaint } = body;

    if (!clinicId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Clinic and time slot are required to confirm your booking.' },
        { status: 400 }
      );
    }

    const appointment = await repositories.appointments.createBooking({
      clinicId,
      patientId: session.patientId,
      physioId: physioId && physioId !== 'any' ? physioId : null,
      startTime,
      endTime,
      bookingSource: 'patient_portal',
      chiefComplaint: chiefComplaint || 'Patient Self-Booked Physiotherapy Consultation',
    });

    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create appointment';
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
