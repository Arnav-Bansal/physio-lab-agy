export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'admin' | 'staff' | 'physio' | 'patient';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';
export type BookingSource = 'staff_crm' | 'patient_portal';
export type ConsultationStatus = 'in_progress' | 'completed';
export type PrescriptionFileType = 'pdf' | 'image';
export type MessageTriggerType =
  | 'booking_confirmation'
  | 'reminder_24h'
  | 'reminder_2h'
  | 'appointment_cancelled'
  | 'appointment_no_show'
  | 'manual_followup'
  | 'otp_verification';
export type MessageStatus =
  | 'queued'
  | 'processing'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'cancelled';

export interface OperatingHoursDay {
  open: string;
  close: string;
  closed: boolean;
}

export interface OperatingHoursMap {
  mon: OperatingHoursDay;
  tue: OperatingHoursDay;
  wed: OperatingHoursDay;
  thu: OperatingHoursDay;
  fri: OperatingHoursDay;
  sat: OperatingHoursDay;
  sun: OperatingHoursDay;
}

export interface ClinicRecord {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  pincode: string | null;
  phone: string;
  email: string | null;
  timezone: string;
  default_slot_duration_mins: number;
  operating_hours: OperatingHoursMap;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileRecord {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  email: string | null;
  primary_clinic_id: string | null;
  specialization: string | null;
  bio: string | null;
  calendar_color: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientRecord {
  id: string;
  user_id: string | null;
  full_name: string;
  phone: string;
  secondary_phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  address: string | null;
  preferred_clinic_id: string | null;
  medical_history_notes: string | null;
  general_notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentRecord {
  id: string;
  clinic_id: string;
  patient_id: string;
  physio_id: string | null;
  start_time: string;
  end_time: string;
  manual_duration_mins: number;
  status: AppointmentStatus;
  booking_source: BookingSource;
  chief_complaint: string | null;
  internal_notes: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentWithRelations extends AppointmentRecord {
  clinic?: Pick<ClinicRecord, 'id' | 'name' | 'slug' | 'address' | 'phone'> | null;
  patient?: Pick<PatientRecord, 'id' | 'full_name' | 'phone' | 'gender' | 'date_of_birth'> | null;
  physio?: Pick<ProfileRecord, 'id' | 'full_name' | 'specialization' | 'calendar_color'> | null;
  consultation?: ConsultationRecord | null;
}

export interface ConsultationRecord {
  id: string;
  appointment_id: string;
  clinic_id: string;
  patient_id: string;
  physio_id: string | null;
  status: ConsultationStatus;
  chief_complaint: string | null;
  clinical_notes: string | null;
  diagnosis: string | null;
  treatment_plan: string | null;
  follow_up_recommended_date: string | null;
  completed_by: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PrescriptionRecord {
  id: string;
  consultation_id: string;
  patient_id: string;
  clinic_id: string;
  uploaded_by: string | null;
  file_name: string;
  storage_path: string;
  file_type: PrescriptionFileType;
  mime_type: 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp';
  file_size_bytes: number;
  description: string | null;
  created_at: string;
  signed_url?: string | null;
}

export interface MessageTemplateRecord {
  id: string;
  name: string;
  trigger_type: MessageTriggerType;
  meta_template_name: string;
  language_code: string;
  body_preview: string;
  variables_order: string[];
  is_active: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageLogRecord {
  id: string;
  patient_id: string | null;
  appointment_id: string | null;
  clinic_id: string | null;
  template_id: string | null;
  trigger_type: MessageTriggerType;
  channel: 'whatsapp' | 'sms';
  recipient_phone: string;
  template_variables: {
    name?: string;
    date?: string;
    clinic?: string;
    physio?: string;
    otp?: string;
    [key: string]: string | undefined;
  };
  status: MessageStatus;
  scheduled_for: string;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  provider_message_id: string | null;
  attempts: number;
  max_attempts: number;
  next_retry_at: string | null;
  last_error: string | null;
  triggered_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface UnifiedPatientHistoryItem {
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  appointment_id: string;
  appointment_start: string;
  appointment_end: string;
  manual_duration_mins: number;
  appointment_status: AppointmentStatus;
  booking_source: BookingSource;
  clinic_id: string;
  clinic_name: string;
  physio_id: string | null;
  physio_name: string;
  consultation_id: string | null;
  consultation_status: ConsultationStatus | null;
  chief_complaint: string | null;
  clinical_notes: string | null;
  diagnosis: string | null;
  treatment_plan: string | null;
  consultation_completed_at: string | null;
  prescriptions: Array<{
    id: string;
    file_name: string;
    storage_path: string;
    file_type: PrescriptionFileType;
    mime_type: string;
    file_size_bytes: number;
    created_at: string;
    signed_url?: string | null;
  }>;
}

export interface Database {
  public: {
    Tables: {
      clinics: {
        Row: ClinicRecord;
        Insert: Partial<ClinicRecord> & Pick<ClinicRecord, 'name' | 'slug' | 'address' | 'phone'>;
        Update: Partial<ClinicRecord>;
      };
      profiles: {
        Row: ProfileRecord;
        Insert: Partial<ProfileRecord> & Pick<ProfileRecord, 'id' | 'full_name'>;
        Update: Partial<ProfileRecord>;
      };
      patients: {
        Row: PatientRecord;
        Insert: Partial<PatientRecord> & Pick<PatientRecord, 'full_name' | 'phone'>;
        Update: Partial<PatientRecord>;
      };
      appointments: {
        Row: AppointmentRecord;
        Insert: Partial<AppointmentRecord> &
          Pick<AppointmentRecord, 'clinic_id' | 'patient_id' | 'start_time' | 'end_time'>;
        Update: Partial<AppointmentRecord>;
      };
      consultations: {
        Row: ConsultationRecord;
        Insert: Partial<ConsultationRecord> &
          Pick<ConsultationRecord, 'appointment_id' | 'clinic_id' | 'patient_id'>;
        Update: Partial<ConsultationRecord>;
      };
      prescriptions: {
        Row: PrescriptionRecord;
        Insert: Partial<PrescriptionRecord> &
          Pick<
            PrescriptionRecord,
            | 'consultation_id'
            | 'patient_id'
            | 'clinic_id'
            | 'file_name'
            | 'storage_path'
            | 'file_type'
            | 'mime_type'
            | 'file_size_bytes'
          >;
        Update: Partial<PrescriptionRecord>;
      };
      message_templates: {
        Row: MessageTemplateRecord;
        Insert: Partial<MessageTemplateRecord> &
          Pick<MessageTemplateRecord, 'name' | 'trigger_type' | 'meta_template_name' | 'body_preview'>;
        Update: Partial<MessageTemplateRecord>;
      };
      message_logs: {
        Row: MessageLogRecord;
        Insert: Partial<MessageLogRecord> &
          Pick<MessageLogRecord, 'trigger_type' | 'recipient_phone'>;
        Update: Partial<MessageLogRecord>;
      };
    };
    Views: {
      v_patient_unified_history: {
        Row: UnifiedPatientHistoryItem;
      };
    };
  };
}
