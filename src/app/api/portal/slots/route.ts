import { NextResponse } from 'next/server';
import { repositories } from '@/lib/repositories';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');
    const physioId = searchParams.get('physioId') || null;
    const dateStr = searchParams.get('date');
    const durationMins = Number(searchParams.get('duration') || '30');

    if (!clinicId || !dateStr) {
      return NextResponse.json(
        { error: 'clinicId and date (YYYY-MM-DD) are required.' },
        { status: 400 }
      );
    }

    const slots = await repositories.appointments.getAvailableSlotsForDate({
      clinicId,
      physioId: physioId === 'any' ? null : physioId,
      dateStr,
      slotDurationMins: durationMins,
    });

    return NextResponse.json({ slots });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load available slots';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
