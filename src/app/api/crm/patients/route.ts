import { NextResponse } from 'next/server';
import { getCrmSession } from '@/lib/auth/session';
import { repositories } from '@/lib/repositories';

export async function GET(request: Request) {
  try {
    const session = await getCrmSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized CRM session' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const patients = await repositories.patients.searchPatients(query, 50);

    return NextResponse.json({ patients });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to search patients';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCrmSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized CRM session' }, { status: 401 });
    }

    const body = await request.json();
    const fullName = String(body.full_name || '').trim();
    const phone = String(body.phone || '').trim();

    if (!fullName || !phone) {
      return NextResponse.json(
        { error: 'Patient full name and phone number are required.' },
        { status: 400 }
      );
    }

    const saved = await repositories.patients.createOrUpdatePatient({
      id: body.id || undefined,
      full_name: fullName,
      phone,
      email: body.email || null,
      date_of_birth: body.date_of_birth || null,
      gender: body.gender || null,
      address: body.address || null,
      preferred_clinic_id: body.preferred_clinic_id || session.primaryClinicId || null,
      medical_history_notes: body.medical_history_notes || null,
      general_notes: body.general_notes || null,
      created_by: session.profileId,
    });

    return NextResponse.json({ success: true, patient: saved });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save patient profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
