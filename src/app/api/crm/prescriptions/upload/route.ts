import { NextResponse } from 'next/server';
import { getCrmSession } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { repositories } from '@/lib/repositories';
import type { PrescriptionFileType } from '@/types/database.types';

const ALLOWED_MIMES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

type AllowedMime = (typeof ALLOWED_MIMES)[number];

export async function POST(request: Request) {
  try {
    const session = await getCrmSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const consultationId = String(formData.get('consultationId') || '');
    const patientId = String(formData.get('patientId') || '');
    const clinicId = String(formData.get('clinicId') || '');
    const description = String(formData.get('description') || '');

    if (!file || !consultationId || !patientId || !clinicId) {
      return NextResponse.json(
        { error: 'File, consultationId, patientId, and clinicId are required.' },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIMES.includes(file.type as AllowedMime)) {
      return NextResponse.json(
        {
          error:
            'Unsupported file format. Only PDF (application/pdf) and Images (JPEG, PNG, WEBP) are allowed.',
        },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File exceeds the 10 MB maximum size limit.' },
        { status: 400 }
      );
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${patientId}/${consultationId}/${Date.now()}_${sanitizedName}`;
    const fileType: PrescriptionFileType = file.type === 'application/pdf' ? 'pdf' : 'image';

    const supabase = createSupabaseAdminClient();
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from('prescriptions')
      .upload(storagePath, Buffer.from(arrayBuffer), {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const record = await repositories.consultations.attachPrescription({
      consultationId,
      patientId,
      clinicId,
      uploadedBy: session.profileId,
      fileName: file.name,
      storagePath,
      fileType,
      mimeType: file.type as AllowedMime,
      fileSizeBytes: file.size,
      description: description || `${fileType.toUpperCase()} Prescription uploaded by ${session.fullName}`,
    });

    const { data: signed } = await supabase.storage
      .from('prescriptions')
      .createSignedUrl(storagePath, 60 * 15);

    return NextResponse.json({
      success: true,
      prescription: {
        ...record,
        signed_url: signed?.signedUrl ?? null,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to upload prescription';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
