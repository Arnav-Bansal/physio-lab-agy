import { NextResponse } from 'next/server';
import { getCrmSession } from '@/lib/auth/session';
import { repositories } from '@/lib/repositories';
import type { AppointmentStatus } from '@/types/database.types';

export async function GET(request: Request) {
  try {
    const session = await getCrmSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId') || undefined;
    const requestedPhysioId = searchParams.get('physioId') || undefined;
    const status = (searchParams.get('status') as AppointmentStatus) || undefined;

    // RBAC: Physio role is strictly restricted to their own appointments
    const effectivePhysioId =
      session.role === 'physio'
        ? session.profileId
        : requestedPhysioId === 'all'
        ? undefined
        : requestedPhysioId;

    const appointments = await repositories.appointments.listSchedule({
      clinicId: clinicId === 'all' ? undefined : clinicId,
      physioId: effectivePhysioId,
      status,
    });

    return NextResponse.json({ appointments });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load appointments';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCrmSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // RBAC: Only Admin and Reception Staff can create new bookings in CRM
    if (session.role === 'physio') {
      return NextResponse.json(
        { error: 'Forbidden: Only Admin and Reception Staff can create new bookings.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      clinicId,
      patientId,
      physioId,
      startTime,
      endTime,
      chiefComplaint,
      internalNotes,
    } = body;

    if (!clinicId || !patientId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Patient, clinic, start time, and manual duration / end time are required.' },
        { status: 400 }
      );
    }

    if (new Date(endTime).getTime() <= new Date(startTime).getTime()) {
      return NextResponse.json(
        { error: 'End time must be after start time.' },
        { status: 400 }
      );
    }

    const created = await repositories.appointments.createBooking({
      clinicId,
      patientId,
      physioId: physioId && physioId !== 'unassigned' ? physioId : null,
      startTime,
      endTime,
      bookingSource: 'staff_crm',
      chiefComplaint,
      internalNotes,
      createdBy: session.profileId,
    });

    return NextResponse.json({ success: true, appointment: created });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Booking creation failed';
    return NextResponse.json({ error: message }, { status: 409 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getCrmSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { appointmentId, status, cancellationReason } = body;

    if (!appointmentId || !status) {
      return NextResponse.json(
        { error: 'appointmentId and status are required.' },
        { status: 400 }
      );
    }

    const updated = await repositories.appointments.updateStatus(
      String(appointmentId),
      status as AppointmentStatus,
      session.profileId,
      cancellationReason
    );

    return NextResponse.json({ success: true, appointment: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Status update failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
