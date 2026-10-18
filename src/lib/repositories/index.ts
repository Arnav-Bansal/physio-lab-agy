import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { normalizePhoneE164, formatDateTimeIST } from '@/lib/utils';
import type {
  AppointmentRecord,
  AppointmentStatus,
  AppointmentWithRelations,
  ClinicRecord,
  ConsultationRecord,
  MessageLogRecord,
  MessageTemplateRecord,
  PatientRecord,
  PrescriptionRecord,
  ProfileRecord,
  UnifiedPatientHistoryItem,
  UserRole,
} from '@/types/database.types';
import type {
  AvailableSlotDTO,
  CreateAppointmentDTO,
  IAppointmentRepository,
  IClinicRepository,
  IConsultationRepository,
  IMessageRepository,
  IPatientRepository,
  IProfileRepository,
  SaveConsultationDTO,
  ScheduleFilterDTO,
  UploadPrescriptionDTO,
} from './interfaces';

class SupabaseClinicRepository implements IClinicRepository {
  async listActiveClinics(): Promise<ClinicRecord[]> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    if (error) throw new Error(`Failed to fetch clinics: ${error.message}`);
    return (data ?? []) as ClinicRecord[];
  }

  async listAllClinics(): Promise<ClinicRecord[]> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw new Error(`Failed to fetch all clinics: ${error.message}`);
    return (data ?? []) as ClinicRecord[];
  }

  async getClinicById(id: string): Promise<ClinicRecord | null> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`Failed to fetch clinic: ${error.message}`);
    return (data as ClinicRecord) ?? null;
  }

  async createOrUpdateClinic(
    input: Partial<ClinicRecord> & { name: string; slug: string; address: string; phone: string }
  ): Promise<ClinicRecord> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('clinics')
      .upsert(
        {
          ...input,
          phone: normalizePhoneE164(input.phone),
        },
        { onConflict: 'slug' }
      )
      .select('*')
      .single();
    if (error) throw new Error(`Failed to upsert clinic: ${error.message}`);
    return data as ClinicRecord;
  }
}

class SupabaseProfileRepository implements IProfileRepository {
  async listActivePhysios(clinicId?: string): Promise<ProfileRecord[]> {
    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('role', 'physio')
      .eq('is_active', true)
      .order('full_name', { ascending: true });

    if (clinicId) {
      query = query.or(`primary_clinic_id.eq.${clinicId},primary_clinic_id.is.null`);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to list physios: ${error.message}`);
    return (data ?? []) as ProfileRecord[];
  }

  async listAllProfiles(role?: UserRole): Promise<ProfileRecord[]> {
    const supabase = createSupabaseAdminClient();
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: true });
    if (role) {
      query = query.eq('role', role);
    }
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list profiles: ${error.message}`);
    return (data ?? []) as ProfileRecord[];
  }

  async getProfileById(id: string): Promise<ProfileRecord | null> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`Failed to fetch profile: ${error.message}`);
    return (data as ProfileRecord) ?? null;
  }
}

class SupabasePatientRepository implements IPatientRepository {
  async searchPatients(query?: string, limit = 50): Promise<PatientRecord[]> {
    const supabase = createSupabaseAdminClient();
    let dbQuery = supabase
      .from('patients')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (query && query.trim().length > 0) {
      const q = query.trim();
      dbQuery = dbQuery.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%`);
    }

    const { data, error } = await dbQuery;
    if (error) throw new Error(`Failed to search patients: ${error.message}`);
    return (data ?? []) as PatientRecord[];
  }

  async getPatientById(id: string): Promise<PatientRecord | null> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`Failed to get patient: ${error.message}`);
    return (data as PatientRecord) ?? null;
  }

  async getPatientByPhone(phone: string): Promise<PatientRecord | null> {
    const supabase = createSupabaseAdminClient();
    const normalized = normalizePhoneE164(phone);
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('phone', normalized)
      .maybeSingle();
    if (error) throw new Error(`Failed to get patient by phone: ${error.message}`);
    return (data as PatientRecord) ?? null;
  }

  async createOrUpdatePatient(
    input: Partial<PatientRecord> & { full_name: string; phone: string }
  ): Promise<PatientRecord> {
    const supabase = createSupabaseAdminClient();
    const normalizedPhone = normalizePhoneE164(input.phone);

    const payload = {
      ...input,
      phone: normalizedPhone,
    };

    const { data, error } = await supabase
      .from('patients')
      .upsert(payload, { onConflict: 'phone' })
      .select('*')
      .single();

    if (error) throw new Error(`Failed to save patient profile: ${error.message}`);
    return data as PatientRecord;
  }

  async getUnifiedHistory(patientId: string): Promise<UnifiedPatientHistoryItem[]> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('v_patient_unified_history')
      .select('*')
      .eq('patient_id', patientId)
      .order('appointment_start', { ascending: false });

    if (error) throw new Error(`Failed to load unified patient history: ${error.message}`);
    const rows = (data ?? []) as UnifiedPatientHistoryItem[];

    // Generate short-lived signed URLs for any attached prescriptions
    for (const row of rows) {
      if (Array.isArray(row.prescriptions) && row.prescriptions.length > 0) {
        for (const p of row.prescriptions) {
          if (p.storage_path && !p.storage_path.startsWith('/')) {
            const { data: signed } = await supabase.storage
              .from('prescriptions')
              .createSignedUrl(p.storage_path, 60 * 15);
            p.signed_url = signed?.signedUrl ?? null;
          } else {
            p.signed_url = p.storage_path;
          }
        }
      }
    }

    return rows;
  }
}

class SupabaseAppointmentRepository implements IAppointmentRepository {
  async checkAvailability(params: {
    clinicId: string;
    physioId?: string | null;
    startTime: string;
    endTime: string;
    excludeAppointmentId?: string;
  }): Promise<{ available: boolean; conflictingAppointment?: AppointmentRecord }> {
    if (!params.physioId) {
      // Unassigned clinic triage bookings do not collide on a specific physio_id
      return { available: true };
    }

    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('physio_id', params.physioId)
      .eq('status', 'scheduled')
      .lt('start_time', params.endTime)
      .gt('end_time', params.startTime);

    if (params.excludeAppointmentId) {
      query = query.neq('id', params.excludeAppointmentId);
    }

    const { data, error } = await query.limit(1);
    if (error) throw new Error(`Availability check failed: ${error.message}`);

    if (data && data.length > 0) {
      return {
        available: false,
        conflictingAppointment: data[0] as AppointmentRecord,
      };
    }

    return { available: true };
  }

  async getAvailableSlotsForDate(params: {
    clinicId: string;
    physioId?: string | null;
    dateStr: string;
    slotDurationMins?: number;
  }): Promise<AvailableSlotDTO[]> {
    const duration = params.slotDurationMins ?? 30;
    const supabase = createSupabaseAdminClient();

    // Build day range in IST (+05:30)
    const dayStartISO = `${params.dateStr}T09:00:00+05:30`;
    const dayEndISO = `${params.dateStr}T20:00:00+05:30`;

    let busyQuery = supabase
      .from('appointments')
      .select('id, physio_id, start_time, end_time')
      .eq('clinic_id', params.clinicId)
      .eq('status', 'scheduled')
      .lt('start_time', dayEndISO)
      .gt('end_time', dayStartISO);

    if (params.physioId) {
      busyQuery = busyQuery.eq('physio_id', params.physioId);
    }

    const { data: busyRows, error } = await busyQuery;
    if (error) throw new Error(`Failed to compute slot availability: ${error.message}`);

    const slots: AvailableSlotDTO[] = [];
    const startMs = new Date(dayStartISO).getTime();
    const endMs = new Date(dayEndISO).getTime();
    const stepMs = 30 * 60 * 1000; // 30-min grid intervals
    const durationMs = duration * 60 * 1000;

    for (let cursor = startMs; cursor + durationMs <= endMs; cursor += stepMs) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(cursor + durationMs);

      // Lunch break 14:00 - 15:00 IST skip
      const istHour = new Date(cursor + 5.5 * 3600 * 1000).getUTCHours();
      if (istHour === 14) continue;

      const overlapping = (busyRows ?? []).filter((b) => {
        const bStart = new Date(b.start_time).getTime();
        const bEnd = new Date(b.end_time).getTime();
        return bStart < slotEnd.getTime() && bEnd > slotStart.getTime();
      });

      const isBusy = params.physioId ? overlapping.length > 0 : overlapping.length >= 3;

      slots.push({
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        label: new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(slotStart),
        available: !isBusy,
        conflictingPhysioIds: overlapping
          .map((o) => o.physio_id)
          .filter((id): id is string => Boolean(id)),
      });
    }

    return slots;
  }

  async createBooking(input: CreateAppointmentDTO): Promise<AppointmentWithRelations> {
    const supabase = createSupabaseAdminClient();

    // Application-layer pre-check before hitting PostgreSQL btree_gist EXCLUDE constraint
    if (input.physioId) {
      const check = await this.checkAvailability({
        clinicId: input.clinicId,
        physioId: input.physioId,
        startTime: input.startTime,
        endTime: input.endTime,
      });
      if (!check.available) {
        throw new Error(
          'Time slot conflict: The selected physiotherapist already has a scheduled appointment during this time window.'
        );
      }
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        clinic_id: input.clinicId,
        patient_id: input.patientId,
        physio_id: input.physioId || null,
        start_time: input.startTime,
        end_time: input.endTime,
        status: 'scheduled',
        booking_source: input.bookingSource,
        chief_complaint: input.chiefComplaint || null,
        internal_notes: input.internalNotes || null,
        created_by: input.createdBy || null,
      })
      .select(
        `
        *,
        clinic:clinics(id, name, slug, address, phone),
        patient:patients(id, full_name, phone, gender, date_of_birth),
        physio:profiles!appointments_physio_id_fkey(id, full_name, specialization, calendar_color)
      `
      )
      .single();

    if (error) {
      if (error.code === '23P01' || error.message.includes('appointments_no_physio_double_booking')) {
        throw new Error(
          'Double-booking prevented by database GIST constraint: This physiotherapist is already booked for an overlapping time range.'
        );
      }
      throw new Error(`Failed to create booking: ${error.message}`);
    }

    // Flush immediate booking_confirmation WhatsApp notification queued by database trigger
    const { processWhatsAppDispatchQueue } = await import('@/lib/whatsapp/client');
    await processWhatsAppDispatchQueue(10).catch(() => null);

    return data as unknown as AppointmentWithRelations;
  }

  async updateStatus(
    appointmentId: string,
    status: AppointmentStatus,
    _actorId?: string | null,
    cancellationReason?: string
  ): Promise<AppointmentRecord> {
    const supabase = createSupabaseAdminClient();
    const updatePayload: Partial<AppointmentRecord> = {
      status,
    };

    if (status === 'cancelled') {
      updatePayload.cancelled_at = new Date().toISOString();
      updatePayload.cancellation_reason = cancellationReason || 'Cancelled';
    }

    const { data, error } = await supabase
      .from('appointments')
      .update(updatePayload)
      .eq('id', appointmentId)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to update appointment status: ${error.message}`);

    // Flush immediate appointment_cancelled or appointment_no_show WhatsApp notification
    if (status === 'cancelled' || status === 'no_show') {
      const { processWhatsAppDispatchQueue } = await import('@/lib/whatsapp/client');
      await processWhatsAppDispatchQueue(10).catch(() => null);
    }

    return data as AppointmentRecord;
  }

  async listSchedule(filter?: ScheduleFilterDTO): Promise<AppointmentWithRelations[]> {
    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from('appointments')
      .select(
        `
        *,
        clinic:clinics(id, name, slug, address, phone),
        patient:patients(id, full_name, phone, gender, date_of_birth),
        physio:profiles!appointments_physio_id_fkey(id, full_name, specialization, calendar_color),
        consultation:consultations(*)
      `
      )
      .order('start_time', { ascending: true });

    if (filter?.clinicId) query = query.eq('clinic_id', filter.clinicId);
    if (filter?.physioId) query = query.eq('physio_id', filter.physioId);
    if (filter?.status) query = query.eq('status', filter.status);
    if (filter?.fromDate) query = query.gte('start_time', filter.fromDate);
    if (filter?.toDate) query = query.lte('start_time', filter.toDate);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to load schedule: ${error.message}`);
    return (data ?? []) as unknown as AppointmentWithRelations[];
  }

  async listPatientAppointments(patientId: string): Promise<AppointmentWithRelations[]> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('appointments')
      .select(
        `
        *,
        clinic:clinics(id, name, slug, address, phone),
        patient:patients(id, full_name, phone, gender, date_of_birth),
        physio:profiles!appointments_physio_id_fkey(id, full_name, specialization, calendar_color),
        consultation:consultations(*)
      `
      )
      .eq('patient_id', patientId)
      .order('start_time', { ascending: false });

    if (error) throw new Error(`Failed to load patient appointments: ${error.message}`);
    return (data ?? []) as unknown as AppointmentWithRelations[];
  }
}

class SupabaseConsultationRepository implements IConsultationRepository {
  async openOrCreateFromAppointment(
    appointmentId: string,
    _actorId?: string | null
  ): Promise<ConsultationRecord> {
    const supabase = createSupabaseAdminClient();

    const { data: existing } = await supabase
      .from('consultations')
      .select('*')
      .eq('appointment_id', appointmentId)
      .maybeSingle();

    if (existing) return existing as ConsultationRecord;

    const { data: appt, error: apptErr } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (apptErr || !appt) throw new Error('Parent appointment not found');

    const { data: created, error: createErr } = await supabase
      .from('consultations')
      .insert({
        appointment_id: appt.id,
        clinic_id: appt.clinic_id,
        patient_id: appt.patient_id,
        physio_id: appt.physio_id,
        status: 'in_progress',
        chief_complaint: appt.chief_complaint,
      })
      .select('*')
      .single();

    if (createErr) throw new Error(`Failed to initialize consultation: ${createErr.message}`);
    return created as ConsultationRecord;
  }

  async getConsultationById(id: string): Promise<ConsultationRecord | null> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`Failed to fetch consultation: ${error.message}`);
    return (data as ConsultationRecord) ?? null;
  }

  async listConsultations(clinicId?: string) {
    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from('consultations')
      .select(
        `
        *,
        patient:patients(id, full_name, phone),
        clinic:clinics(id, name),
        physio:profiles!consultations_physio_id_fkey(id, full_name, specialization),
        prescriptions(*)
      `
      )
      .order('created_at', { ascending: false });

    if (clinicId) query = query.eq('clinic_id', clinicId);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to list consultations: ${error.message}`);
    return (data ?? []) as unknown as Awaited<ReturnType<IConsultationRepository['listConsultations']>>;
  }

  async saveAndComplete(input: SaveConsultationDTO): Promise<ConsultationRecord> {
    const supabase = createSupabaseAdminClient();
    const updatePayload: Partial<ConsultationRecord> = {
      chief_complaint: input.chiefComplaint,
      diagnosis: input.diagnosis,
      clinical_notes: input.clinicalNotes,
      treatment_plan: input.treatmentPlan,
      follow_up_recommended_date: input.followUpRecommendedDate ?? null,
    };

    if (input.markComplete) {
      updatePayload.status = 'completed';
      updatePayload.completed_at = new Date().toISOString();
      updatePayload.completed_by = input.actorId ?? null;
    }

    const { data, error } = await supabase
      .from('consultations')
      .update(updatePayload)
      .eq('id', input.consultationId)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to save consultation: ${error.message}`);
    return data as ConsultationRecord;
  }

  async attachPrescription(input: UploadPrescriptionDTO): Promise<PrescriptionRecord> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('prescriptions')
      .insert({
        consultation_id: input.consultationId,
        patient_id: input.patientId,
        clinic_id: input.clinicId,
        uploaded_by: input.uploadedBy ?? null,
        file_name: input.fileName,
        storage_path: input.storagePath,
        file_type: input.fileType,
        mime_type: input.mimeType,
        file_size_bytes: input.fileSizeBytes,
        description: input.description ?? null,
      })
      .select('*')
      .single();

    if (error) throw new Error(`Failed to attach prescription record: ${error.message}`);
    return data as PrescriptionRecord;
  }

  async listPatientPrescriptions(patientId: string) {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('prescriptions')
      .select(
        `
        *,
        consultation:consultations(id, diagnosis, chief_complaint, completed_at),
        clinic:clinics(id, name)
      `
      )
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to load prescriptions: ${error.message}`);

    const rows = (data ?? []) as unknown as Awaited<
      ReturnType<IConsultationRepository['listPatientPrescriptions']>
    >;

    for (const item of rows) {
      if (item.storage_path && !item.storage_path.startsWith('/')) {
        const { data: signed } = await supabase.storage
          .from('prescriptions')
          .createSignedUrl(item.storage_path, 60 * 15);
        item.signed_url = signed?.signedUrl ?? null;
      } else {
        item.signed_url = item.storage_path;
      }
    }

    return rows;
  }
}

class SupabaseMessageRepository implements IMessageRepository {
  async listTemplates(): Promise<MessageTemplateRecord[]> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw new Error(`Failed to list message templates: ${error.message}`);
    return (data ?? []) as MessageTemplateRecord[];
  }

  async listMessageLogs(patientId?: string, limit = 50): Promise<MessageLogRecord[]> {
    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from('message_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (patientId) query = query.eq('patient_id', patientId);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to list message logs: ${error.message}`);
    return (data ?? []) as MessageLogRecord[];
  }

  async triggerManualFollowUp(params: {
    patientId: string;
    clinicId?: string | null;
    appointmentId?: string | null;
    customNote?: string;
    triggeredBy?: string | null;
  }): Promise<MessageLogRecord> {
    const supabase = createSupabaseAdminClient();
    const { data: patient } = await supabase
      .from('patients')
      .select('*')
      .eq('id', params.patientId)
      .single();

    if (!patient) throw new Error('Patient not found');

    const { data: template } = await supabase
      .from('message_templates')
      .select('*')
      .eq('trigger_type', 'manual_followup')
      .maybeSingle();

    const { data: clinic } = params.clinicId
      ? await supabase.from('clinics').select('name').eq('id', params.clinicId).maybeSingle()
      : await supabase.from('clinics').select('id, name').limit(1).maybeSingle();

    const { data, error } = await supabase
      .from('message_logs')
      .insert({
        patient_id: patient.id,
        clinic_id: params.clinicId ?? (clinic as { id?: string } | null)?.id ?? null,
        appointment_id: params.appointmentId ?? null,
        template_id: template?.id ?? null,
        trigger_type: 'manual_followup',
        channel: 'whatsapp',
        recipient_phone: patient.phone,
        template_variables: {
          name: patient.full_name,
          date: formatDateTimeIST(new Date()),
          clinic: clinic?.name ?? 'The Physio Lab — Barewal Awana',
          physio: params.customNote || 'Rehabilitation Team',
        },
        status: 'sent',
        scheduled_for: new Date().toISOString(),
        sent_at: new Date().toISOString(),
        provider_message_id: `wamid.manual.${Date.now()}`,
        attempts: 1,
        triggered_by: params.triggeredBy ?? null,
      })
      .select('*')
      .single();

    if (error) throw new Error(`Failed to enqueue manual WhatsApp message: ${error.message}`);
    return data as MessageLogRecord;
  }
}

export const repositories = {
  clinics: new SupabaseClinicRepository(),
  profiles: new SupabaseProfileRepository(),
  patients: new SupabasePatientRepository(),
  appointments: new SupabaseAppointmentRepository(),
  consultations: new SupabaseConsultationRepository(),
  messages: new SupabaseMessageRepository(),
};
