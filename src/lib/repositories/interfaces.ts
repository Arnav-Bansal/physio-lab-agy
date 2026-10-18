import type {
  AppointmentRecord,
  AppointmentStatus,
  AppointmentWithRelations,
  BookingSource,
  ClinicRecord,
  ConsultationRecord,
  MessageLogRecord,
  MessageTemplateRecord,
  MessageTriggerType,
  PatientRecord,
  PrescriptionFileType,
  PrescriptionRecord,
  ProfileRecord,
  UnifiedPatientHistoryItem,
  UserRole,
} from '@/types/database.types';

export interface CreateAppointmentDTO {
  clinicId: string;
  patientId: string;
  physioId?: string | null;
  startTime: string;
  endTime: string;
  bookingSource: BookingSource;
  chiefComplaint?: string;
  internalNotes?: string;
  createdBy?: string | null;
}

export interface ScheduleFilterDTO {
  clinicId?: string;
  physioId?: string;
  status?: AppointmentStatus;
  fromDate?: string;
  toDate?: string;
}

export interface AvailableSlotDTO {
  startTime: string;
  endTime: string;
  label: string;
  available: boolean;
  conflictingPhysioIds: string[];
}

export interface SaveConsultationDTO {
  consultationId: string;
  chiefComplaint?: string;
  diagnosis?: string;
  clinicalNotes?: string;
  treatmentPlan?: string;
  followUpRecommendedDate?: string | null;
  markComplete?: boolean;
  actorId?: string | null;
}

export interface UploadPrescriptionDTO {
  consultationId: string;
  patientId: string;
  clinicId: string;
  uploadedBy?: string | null;
  fileName: string;
  storagePath: string;
  fileType: PrescriptionFileType;
  mimeType: 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp';
  fileSizeBytes: number;
  description?: string;
}

export interface IClinicRepository {
  listActiveClinics(): Promise<ClinicRecord[]>;
  listAllClinics(): Promise<ClinicRecord[]>;
  getClinicById(id: string): Promise<ClinicRecord | null>;
  createOrUpdateClinic(input: Partial<ClinicRecord> & { name: string; slug: string; address: string; phone: string }): Promise<ClinicRecord>;
}

export interface IProfileRepository {
  listActivePhysios(clinicId?: string): Promise<ProfileRecord[]>;
  listAllProfiles(role?: UserRole): Promise<ProfileRecord[]>;
  getProfileById(id: string): Promise<ProfileRecord | null>;
}

export interface IPatientRepository {
  searchPatients(query?: string, limit?: number): Promise<PatientRecord[]>;
  getPatientById(id: string): Promise<PatientRecord | null>;
  getPatientByPhone(phone: string): Promise<PatientRecord | null>;
  createOrUpdatePatient(input: Partial<PatientRecord> & { full_name: string; phone: string }): Promise<PatientRecord>;
  getUnifiedHistory(patientId: string): Promise<UnifiedPatientHistoryItem[]>;
}

export interface IAppointmentRepository {
  checkAvailability(params: {
    clinicId: string;
    physioId?: string | null;
    startTime: string;
    endTime: string;
    excludeAppointmentId?: string;
  }): Promise<{ available: boolean; conflictingAppointment?: AppointmentRecord }>;

  getAvailableSlotsForDate(params: {
    clinicId: string;
    physioId?: string | null;
    dateStr: string; // YYYY-MM-DD in IST
    slotDurationMins?: number;
  }): Promise<AvailableSlotDTO[]>;

  createBooking(input: CreateAppointmentDTO): Promise<AppointmentWithRelations>;
  updateStatus(
    appointmentId: string,
    status: AppointmentStatus,
    actorId?: string | null,
    cancellationReason?: string
  ): Promise<AppointmentRecord>;

  listSchedule(filter?: ScheduleFilterDTO): Promise<AppointmentWithRelations[]>;
  listPatientAppointments(patientId: string): Promise<AppointmentWithRelations[]>;
}

export interface IConsultationRepository {
  openOrCreateFromAppointment(appointmentId: string, actorId?: string | null): Promise<ConsultationRecord>;
  getConsultationById(id: string): Promise<ConsultationRecord | null>;
  listConsultations(clinicId?: string): Promise<(ConsultationRecord & {
    patient?: Pick<PatientRecord, 'id' | 'full_name' | 'phone'> | null;
    clinic?: Pick<ClinicRecord, 'id' | 'name'> | null;
    physio?: Pick<ProfileRecord, 'id' | 'full_name' | 'specialization'> | null;
    prescriptions?: PrescriptionRecord[];
  })[]>;
  saveAndComplete(input: SaveConsultationDTO): Promise<ConsultationRecord>;
  attachPrescription(input: UploadPrescriptionDTO): Promise<PrescriptionRecord>;
  listPatientPrescriptions(patientId: string): Promise<(PrescriptionRecord & {
    consultation?: Pick<ConsultationRecord, 'id' | 'diagnosis' | 'chief_complaint' | 'completed_at'> | null;
    clinic?: Pick<ClinicRecord, 'id' | 'name'> | null;
  })[]>;
}

export interface IMessageRepository {
  listTemplates(): Promise<MessageTemplateRecord[]>;
  listMessageLogs(patientId?: string, limit?: number): Promise<MessageLogRecord[]>;
  triggerManualFollowUp(params: {
    patientId: string;
    clinicId?: string | null;
    appointmentId?: string | null;
    customNote?: string;
    triggeredBy?: string | null;
  }): Promise<MessageLogRecord>;
}
