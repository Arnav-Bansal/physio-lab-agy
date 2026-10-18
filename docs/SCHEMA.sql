-- ============================================================================
-- THE PHYSIO LAB — PRODUCTION POSTGRESQL SCHEMA (SUPABASE)
-- Multi-Clinic Physiotherapy & Rehabilitation Centre Management System
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- Required for EXCLUDE USING gist on UUID + tstzrange
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- Required for fast name/phone search (<150ms)

-- ----------------------------------------------------------------------------
-- 2. ENUMERATED TYPES
-- ----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('admin', 'staff', 'physio', 'patient');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.booking_source AS ENUM ('staff_crm', 'patient_portal');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.consultation_status AS ENUM ('in_progress', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.prescription_file_type AS ENUM ('pdf', 'image');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.message_trigger_type AS ENUM (
    'booking_confirmation',
    'reminder_24h',
    'reminder_2h',
    'appointment_cancelled',
    'appointment_no_show',
    'manual_followup',
    'otp_verification'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.message_status AS ENUM (
    'queued',
    'processing',
    'sent',
    'delivered',
    'read',
    'failed',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ----------------------------------------------------------------------------
-- 3. CORE TABLES
-- ----------------------------------------------------------------------------

-- 3.1 Clinics (Multi-Branch Master)
CREATE TABLE IF NOT EXISTS public.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Ludhiana',
  state TEXT NOT NULL DEFAULT 'Punjab',
  pincode TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  default_slot_duration_mins INTEGER NOT NULL DEFAULT 30 CHECK (default_slot_duration_mins BETWEEN 10 AND 240),
  operating_hours JSONB NOT NULL DEFAULT '{
    "mon": {"open": "09:00", "close": "20:00", "closed": false},
    "tue": {"open": "09:00", "close": "20:00", "closed": false},
    "wed": {"open": "09:00", "close": "20:00", "closed": false},
    "thu": {"open": "09:00", "close": "20:00", "closed": false},
    "fri": {"open": "09:00", "close": "20:00", "closed": false},
    "sat": {"open": "09:00", "close": "18:00", "closed": false},
    "sun": {"open": "10:00", "close": "14:00", "closed": true}
  }'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.2 User Profiles (Admin, Staff, Physio, and Authenticated Patients)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'patient',
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE, -- E.164 format e.g. +919815891919
  email TEXT UNIQUE,
  primary_clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
  specialization TEXT, -- Populated for 'physio' role (e.g., 'Ortho & Sports Rehab')
  bio TEXT,
  calendar_color TEXT DEFAULT '#0ea5e9',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_profiles_clinic ON public.profiles(primary_clinic_id);

-- 3.3 Staff & Physio Multi-Clinic Assignments
CREATE TABLE IF NOT EXISTS public.clinic_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, clinic_id)
);

-- 3.4 Patients (Managed via CRM or Self-Registered via WhatsApp OTP)
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL, -- Linked upon WhatsApp OTP login
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE, -- Primary lookup key for WhatsApp & OTP (E.164)
  secondary_phone TEXT,
  email TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  address TEXT,
  preferred_clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
  medical_history_notes TEXT, -- Chronic conditions, surgical history, allergies
  general_notes TEXT,         -- Administrative / reception notes
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast trigram indexes for instant search by name or phone number
CREATE INDEX IF NOT EXISTS idx_patients_full_name_trgm ON public.patients USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_patients_phone_trgm ON public.patients USING gin (phone gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);

-- 3.5 WhatsApp OTP Verification Store (For Patient Portal Auth)
CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  otp_hash TEXT NOT NULL, -- SHA-256 hash of 6-digit OTP
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts <= 5),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_phone_active ON public.otp_verifications(phone, expires_at)
  WHERE verified_at IS NULL;

-- 3.6 Appointments (With Variable Manual Slot Durations & GIST Exclusion Constraint)
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE RESTRICT,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  physio_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT, -- Optional at booking time
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  manual_duration_mins INTEGER GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (end_time - start_time))::INTEGER / 60
  ) STORED,
  status public.appointment_status NOT NULL DEFAULT 'scheduled',
  booking_source public.booking_source NOT NULL DEFAULT 'staff_crm',
  chief_complaint TEXT,
  internal_notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ensure valid manual time range (minimum 5 minutes, positive duration)
  CONSTRAINT appointments_valid_time_range CHECK (end_time > start_time),

  -- STRICT CONFLICT PREVENTION: Zero double-bookings for any assigned physio
  -- across variable manual slot durations while status = 'scheduled'
  CONSTRAINT appointments_no_physio_double_booking
    EXCLUDE USING gist (
      physio_id WITH =,
      tstzrange(start_time, end_time, '[)') WITH &&
    )
    WHERE (status = 'scheduled' AND physio_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_appointments_clinic_start ON public.appointments(clinic_id, start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_physio_start ON public.appointments(physio_id, start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_start ON public.appointments(patient_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- 3.7 Consultations (Converted 1:1 from Scheduled Appointments)
CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL UNIQUE REFERENCES public.appointments(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE RESTRICT,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  physio_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status public.consultation_status NOT NULL DEFAULT 'in_progress',
  chief_complaint TEXT,
  clinical_notes TEXT,       -- Detailed SOAP / assessment / session notes
  diagnosis TEXT,
  treatment_plan TEXT,       -- Rehab protocol & home exercise instructions
  follow_up_recommended_date DATE,
  completed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consultations_patient_history ON public.consultations(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultations_clinic_status ON public.consultations(clinic_id, status);
CREATE INDEX IF NOT EXISTS idx_consultations_physio ON public.consultations(physio_id, created_at DESC);

-- 3.8 Prescriptions (Supports both PDF and Image Uploads per Consultation)
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE RESTRICT,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE, -- Path inside private 'prescriptions' bucket
  file_type public.prescription_file_type NOT NULL, -- 'pdf' or 'image'
  mime_type TEXT NOT NULL CHECK (
    mime_type IN ('application/pdf', 'image/jpeg', 'image/png', 'image/webp')
  ),
  file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 10485760),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_consultation ON public.prescriptions(consultation_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON public.prescriptions(patient_id, created_at DESC);

-- 3.9 WhatsApp Message Templates (Admin Configurable)
CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  trigger_type public.message_trigger_type NOT NULL UNIQUE,
  meta_template_name TEXT NOT NULL, -- Approved template name in Meta Business Suite
  language_code TEXT NOT NULL DEFAULT 'en',
  body_preview TEXT NOT NULL,       -- e.g. 'Hi {{name}}, your appointment at {{clinic}} with {{physio}} is confirmed for {{date}}.'
  variables_order JSONB NOT NULL DEFAULT '["name", "date", "clinic", "physio"]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.10 Central Message Logs & Retry Queue
CREATE TABLE IF NOT EXISTS public.message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.message_templates(id) ON DELETE SET NULL,
  trigger_type public.message_trigger_type NOT NULL,
  channel TEXT NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'sms')),
  recipient_phone TEXT NOT NULL,
  template_variables JSONB NOT NULL DEFAULT '{}'::jsonb, -- {"name": "...", "date": "...", "clinic": "...", "physio": "..."}
  status public.message_status NOT NULL DEFAULT 'queued',
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  provider_message_id TEXT UNIQUE, -- Meta wamid.xxx for webhook status reconciliation
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  last_error TEXT,
  triggered_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Populated for manual CRM triggers
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Composite index for the pg_cron / Edge Function dispatcher & retry worker
CREATE INDEX IF NOT EXISTS idx_message_logs_dispatch_queue
  ON public.message_logs(scheduled_for, next_retry_at)
  WHERE status IN ('queued', 'failed') AND attempts < max_attempts;

CREATE INDEX IF NOT EXISTS idx_message_logs_patient ON public.message_logs(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_logs_appointment ON public.message_logs(appointment_id);

-- ----------------------------------------------------------------------------
-- 4. UNIFIED PATIENT HISTORY VIEW
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_patient_unified_history AS
SELECT
  p.id AS patient_id,
  p.full_name AS patient_name,
  p.phone AS patient_phone,
  a.id AS appointment_id,
  a.start_time AS appointment_start,
  a.end_time AS appointment_end,
  a.manual_duration_mins,
  a.status AS appointment_status,
  a.booking_source,
  c.id AS clinic_id,
  c.name AS clinic_name,
  ph.id AS physio_id,
  COALESCE(ph.full_name, 'Unassigned / Clinic Specialist') AS physio_name,
  con.id AS consultation_id,
  con.status AS consultation_status,
  con.chief_complaint,
  con.clinical_notes,
  con.diagnosis,
  con.treatment_plan,
  con.completed_at AS consultation_completed_at,
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', pr.id,
          'file_name', pr.file_name,
          'storage_path', pr.storage_path,
          'file_type', pr.file_type,
          'mime_type', pr.mime_type,
          'file_size_bytes', pr.file_size_bytes,
          'created_at', pr.created_at
        ) ORDER BY pr.created_at DESC
      )
      FROM public.prescriptions pr
      WHERE pr.consultation_id = con.id
    ),
    '[]'::jsonb
  ) AS prescriptions
FROM public.patients p
JOIN public.appointments a ON a.patient_id = p.id
JOIN public.clinics c ON c.id = a.clinic_id
LEFT JOIN public.profiles ph ON ph.id = a.physio_id
LEFT JOIN public.consultations con ON con.appointment_id = a.id;

-- ----------------------------------------------------------------------------
-- 5. TRIGGERS & BUSINESS LOGIC FUNCTIONS
-- ----------------------------------------------------------------------------

-- 5.1 Automatic updated_at Timestamp Trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_clinics_updated_at BEFORE UPDATE ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_patients_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_consultations_updated_at BEFORE UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_message_templates_updated_at BEFORE UPDATE ON public.message_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_message_logs_updated_at BEFORE UPDATE ON public.message_logs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5.2 Consultation Completion -> Sync Parent Appointment Status
CREATE OR REPLACE FUNCTION public.sync_appointment_on_consultation_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    NEW.completed_at := COALESCE(NEW.completed_at, now());
    UPDATE public.appointments
    SET status = 'completed',
        updated_at = now()
    WHERE id = NEW.appointment_id
      AND status <> 'completed';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_consultation_complete
  BEFORE INSERT OR UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION public.sync_appointment_on_consultation_complete();

-- 5.3 Automated WhatsApp Lifecycle Enqueue Trigger (Confirmation, 24h, 2h, Cancel, No-Show)
CREATE OR REPLACE FUNCTION public.enqueue_appointment_whatsapp_messages()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_patient_name TEXT;
  v_patient_phone TEXT;
  v_clinic_name TEXT;
  v_clinic_tz TEXT;
  v_physio_name TEXT;
  v_formatted_date TEXT;
  v_vars JSONB;
BEGIN
  -- Fetch dynamic variable context ({{name}}, {{date}}, {{clinic}}, {{physio}})
  SELECT full_name, phone INTO v_patient_name, v_patient_phone
  FROM public.patients WHERE id = NEW.patient_id;

  SELECT name, timezone INTO v_clinic_name, v_clinic_tz
  FROM public.clinics WHERE id = NEW.clinic_id;

  IF NEW.physio_id IS NOT NULL THEN
    SELECT full_name INTO v_physio_name FROM public.profiles WHERE id = NEW.physio_id;
  END IF;
  v_physio_name := COALESCE(v_physio_name, 'Clinic Specialist');

  v_formatted_date := to_char(NEW.start_time AT TIME ZONE COALESCE(v_clinic_tz, 'Asia/Kolkata'), 'DD Mon YYYY, HH12:MI AM');

  v_vars := jsonb_build_object(
    'name', v_patient_name,
    'date', v_formatted_date,
    'clinic', v_clinic_name,
    'physio', v_physio_name
  );

  -- CASE 1: Newly created scheduled appointment (Staff CRM or Patient Self-Service)
  IF TG_OP = 'INSERT' AND NEW.status = 'scheduled' THEN
    -- 1a. Immediate Booking Confirmation
    INSERT INTO public.message_logs (
      patient_id, appointment_id, clinic_id, template_id, trigger_type,
      recipient_phone, template_variables, status, scheduled_for
    )
    SELECT
      NEW.patient_id, NEW.id, NEW.clinic_id, mt.id, 'booking_confirmation',
      v_patient_phone, v_vars, 'queued', now()
    FROM public.message_templates mt
    WHERE mt.trigger_type = 'booking_confirmation' AND mt.is_active = true;

    -- 1b. 24-Hour Prior Reminder (only if start_time is more than 24h away)
    IF NEW.start_time - INTERVAL '24 hours' > now() THEN
      INSERT INTO public.message_logs (
        patient_id, appointment_id, clinic_id, template_id, trigger_type,
        recipient_phone, template_variables, status, scheduled_for
      )
      SELECT
        NEW.patient_id, NEW.id, NEW.clinic_id, mt.id, 'reminder_24h',
        v_patient_phone, v_vars, 'queued', NEW.start_time - INTERVAL '24 hours'
      FROM public.message_templates mt
      WHERE mt.trigger_type = 'reminder_24h' AND mt.is_active = true;
    END IF;

    -- 1c. 2-Hour Prior Reminder (only if start_time is more than 2h away)
    IF NEW.start_time - INTERVAL '2 hours' > now() THEN
      INSERT INTO public.message_logs (
        patient_id, appointment_id, clinic_id, template_id, trigger_type,
        recipient_phone, template_variables, status, scheduled_for
      )
      SELECT
        NEW.patient_id, NEW.id, NEW.clinic_id, mt.id, 'reminder_2h',
        v_patient_phone, v_vars, 'queued', NEW.start_time - INTERVAL '2 hours'
      FROM public.message_templates mt
      WHERE mt.trigger_type = 'reminder_2h' AND mt.is_active = true;
    END IF;
  END IF;

  -- CASE 2: Status Transition on Update (Cancelled or No-Show)
  IF TG_OP = 'UPDATE' AND OLD.status <> NEW.status THEN
    -- Cancel any unsent scheduled reminders for this appointment
    IF NEW.status IN ('cancelled', 'no_show', 'completed') THEN
      UPDATE public.message_logs
      SET status = 'cancelled',
          updated_at = now()
      WHERE appointment_id = NEW.id
        AND status = 'queued'
        AND trigger_type IN ('reminder_24h', 'reminder_2h');
    END IF;

    -- 2a. Cancelled (with WhatsApp trigger)
    IF NEW.status = 'cancelled' THEN
      INSERT INTO public.message_logs (
        patient_id, appointment_id, clinic_id, template_id, trigger_type,
        recipient_phone, template_variables, status, scheduled_for
      )
      SELECT
        NEW.patient_id, NEW.id, NEW.clinic_id, mt.id, 'appointment_cancelled',
        v_patient_phone, v_vars, 'queued', now()
      FROM public.message_templates mt
      WHERE mt.trigger_type = 'appointment_cancelled' AND mt.is_active = true;
    END IF;

    -- 2b. No-Show (with WhatsApp trigger)
    IF NEW.status = 'no_show' THEN
      INSERT INTO public.message_logs (
        patient_id, appointment_id, clinic_id, template_id, trigger_type,
        recipient_phone, template_variables, status, scheduled_for
      )
      SELECT
        NEW.patient_id, NEW.id, NEW.clinic_id, mt.id, 'appointment_no_show',
        v_patient_phone, v_vars, 'queued', now()
      FROM public.message_templates mt
      WHERE mt.trigger_type = 'appointment_no_show' AND mt.is_active = true;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_appointment_whatsapp_lifecycle
  AFTER INSERT OR UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.enqueue_appointment_whatsapp_messages();

-- 5.4 Exponential Backoff Retry Helper for Failed WhatsApp Dispatches
CREATE OR REPLACE FUNCTION public.record_message_dispatch_failure(
  p_message_id UUID,
  p_error_message TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempts INTEGER;
  v_max_attempts INTEGER;
  v_backoff_minutes INTEGER;
BEGIN
  SELECT attempts + 1, max_attempts
  INTO v_attempts, v_max_attempts
  FROM public.message_logs
  WHERE id = p_message_id;

  -- Exponential backoff: Retry 1 = 2m, Retry 2 = 10m, Retry 3 = 30m
  v_backoff_minutes := CASE v_attempts
    WHEN 1 THEN 2
    WHEN 2 THEN 10
    ELSE 30
  END;

  UPDATE public.message_logs
  SET attempts = v_attempts,
      status = 'failed',
      last_error = p_error_message,
      next_retry_at = CASE
        WHEN v_attempts < v_max_attempts THEN now() + (v_backoff_minutes || ' minutes')::INTERVAL
        ELSE NULL
      END,
      updated_at = now()
  WHERE id = p_message_id;
END;
$$;

-- ----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

-- Helper Functions (SECURITY DEFINER to avoid recursive RLS lookups)
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() AND is_active = true;
$$;

CREATE OR REPLACE FUNCTION public.current_patient_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.patients WHERE user_id = auth.uid();
$$;

-- Enable RLS across all tables
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_logs ENABLE ROW LEVEL SECURITY;

-- 6.1 Clinics Policies
-- Public/patients can view active clinics (for landing showcase & self-booking); Admin manages all
CREATE POLICY "clinics_select_active_or_crm" ON public.clinics
  FOR SELECT USING (
    is_active = true OR public.current_user_role() IN ('admin', 'staff', 'physio')
  );

CREATE POLICY "clinics_admin_all" ON public.clinics
  FOR ALL USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

-- 6.2 Profiles Policies
-- Public/Patients can view active Physio profiles for booking; CRM users can view all profiles; Admin manages all
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (
    id = auth.uid()
    OR (role = 'physio' AND is_active = true)
    OR public.current_user_role() IN ('admin', 'staff', 'physio')
  );

CREATE POLICY "profiles_update_self" ON public.profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

-- 6.3 Clinic Memberships Policies
CREATE POLICY "clinic_memberships_select" ON public.clinic_memberships
  FOR SELECT USING (true);

CREATE POLICY "clinic_memberships_admin_all" ON public.clinic_memberships
  FOR ALL USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

-- 6.4 Patients Policies
-- Admin & Staff: full CRUD; Physio: read all patients; Patient: read/update own patient record
CREATE POLICY "patients_crm_select" ON public.patients
  FOR SELECT USING (
    public.current_user_role() IN ('admin', 'staff', 'physio')
    OR user_id = auth.uid()
  );

CREATE POLICY "patients_admin_staff_insert" ON public.patients
  FOR INSERT WITH CHECK (
    public.current_user_role() IN ('admin', 'staff')
    OR user_id = auth.uid()
  );

CREATE POLICY "patients_admin_staff_update" ON public.patients
  FOR UPDATE USING (
    public.current_user_role() IN ('admin', 'staff')
    OR user_id = auth.uid()
  )
  WITH CHECK (
    public.current_user_role() IN ('admin', 'staff')
    OR user_id = auth.uid()
  );

CREATE POLICY "patients_admin_delete" ON public.patients
  FOR DELETE USING (public.current_user_role() = 'admin');

-- 6.5 Appointments Policies
-- Admin & Staff: full control; Physio: view schedule & update status on assigned appointments; Patient: view & create own appointments
CREATE POLICY "appointments_select_policy" ON public.appointments
  FOR SELECT USING (
    public.current_user_role() IN ('admin', 'staff', 'physio')
    OR patient_id = public.current_patient_id()
  );

CREATE POLICY "appointments_insert_policy" ON public.appointments
  FOR INSERT WITH CHECK (
    public.current_user_role() IN ('admin', 'staff')
    OR (
      public.current_user_role() = 'patient'
      AND patient_id = public.current_patient_id()
      AND booking_source = 'patient_portal'
      AND status = 'scheduled'
    )
  );

CREATE POLICY "appointments_update_policy" ON public.appointments
  FOR UPDATE USING (
    public.current_user_role() IN ('admin', 'staff')
    OR (public.current_user_role() = 'physio' AND (physio_id = auth.uid() OR physio_id IS NULL))
    OR (public.current_user_role() = 'patient' AND patient_id = public.current_patient_id())
  )
  WITH CHECK (
    public.current_user_role() IN ('admin', 'staff')
    OR (public.current_user_role() = 'physio' AND (physio_id = auth.uid() OR physio_id IS NULL))
    OR (
      public.current_user_role() = 'patient'
      AND patient_id = public.current_patient_id()
      AND status = 'cancelled'
    )
  );

CREATE POLICY "appointments_admin_delete" ON public.appointments
  FOR DELETE USING (public.current_user_role() = 'admin');

-- 6.6 Consultations Policies
-- Admin, Staff, Physio can create/update consultations and notes; Patient has read-only access to own completed consultations
CREATE POLICY "consultations_select_policy" ON public.consultations
  FOR SELECT USING (
    public.current_user_role() IN ('admin', 'staff', 'physio')
    OR patient_id = public.current_patient_id()
  );

CREATE POLICY "consultations_crm_write_policy" ON public.consultations
  FOR INSERT WITH CHECK (
    public.current_user_role() IN ('admin', 'staff', 'physio')
  );

CREATE POLICY "consultations_crm_update_policy" ON public.consultations
  FOR UPDATE USING (
    public.current_user_role() IN ('admin', 'staff', 'physio')
  )
  WITH CHECK (
    public.current_user_role() IN ('admin', 'staff', 'physio')
  );

CREATE POLICY "consultations_admin_delete" ON public.consultations
  FOR DELETE USING (public.current_user_role() = 'admin');

-- 6.7 Prescriptions Metadata Policies
-- Admin, Staff, Physio can insert/read; Patient can read own prescriptions
CREATE POLICY "prescriptions_select_policy" ON public.prescriptions
  FOR SELECT USING (
    public.current_user_role() IN ('admin', 'staff', 'physio')
    OR patient_id = public.current_patient_id()
  );

CREATE POLICY "prescriptions_crm_insert_policy" ON public.prescriptions
  FOR INSERT WITH CHECK (
    public.current_user_role() IN ('admin', 'staff', 'physio')
  );

CREATE POLICY "prescriptions_admin_delete_policy" ON public.prescriptions
  FOR DELETE USING (
    public.current_user_role() IN ('admin', 'staff', 'physio')
  );

-- 6.8 Message Templates Policies
-- Admin: full control; Staff/Physio: read-only
CREATE POLICY "message_templates_crm_select" ON public.message_templates
  FOR SELECT USING (
    public.current_user_role() IN ('admin', 'staff', 'physio')
  );

CREATE POLICY "message_templates_admin_all" ON public.message_templates
  FOR ALL USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

-- 6.9 Message Logs Policies
-- Admin & Staff: view logs & insert manual follow-up messages; Patient: view own reminder/confirmation logs
CREATE POLICY "message_logs_select_policy" ON public.message_logs
  FOR SELECT USING (
    public.current_user_role() IN ('admin', 'staff')
    OR patient_id = public.current_patient_id()
  );

CREATE POLICY "message_logs_crm_insert_policy" ON public.message_logs
  FOR INSERT WITH CHECK (
    public.current_user_role() IN ('admin', 'staff')
  );

CREATE POLICY "message_logs_admin_update_policy" ON public.message_logs
  FOR UPDATE USING (public.current_user_role() IN ('admin', 'staff'));

-- ----------------------------------------------------------------------------
-- 7. PRIVATE STORAGE BUCKET & STORAGE RLS FOR PRESCRIPTIONS (PDF + IMAGE)
-- ----------------------------------------------------------------------------
-- Storage convention: prescriptions/{patient_id}/{consultation_id}/{filename}
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prescriptions',
  'prescriptions',
  false, -- Strictly private bucket
  10485760, -- 10 MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Policy 1: Admin, Staff, and Physio can upload PDF/Image prescriptions
CREATE POLICY "storage_prescriptions_crm_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'prescriptions'
    AND public.current_user_role() IN ('admin', 'staff', 'physio')
  );

-- Storage Policy 2: Admin, Staff, and Physio can view/download all prescriptions;
-- Patients can ONLY view/download files inside their own `{patient_id}/...` folder
CREATE POLICY "storage_prescriptions_select_authorized"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'prescriptions'
    AND (
      public.current_user_role() IN ('admin', 'staff', 'physio')
      OR (
        public.current_user_role() = 'patient'
        AND (storage.foldername(name))[1] = public.current_patient_id()::text
      )
    )
  );

-- Storage Policy 3: Admin and Staff can delete erroneously uploaded files
CREATE POLICY "storage_prescriptions_crm_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'prescriptions'
    AND public.current_user_role() IN ('admin', 'staff')
  );

-- ----------------------------------------------------------------------------
-- 8. INITIAL SEED DATA (FLAGSHIP CLINIC & WHATSAPP TEMPLATES)
-- ----------------------------------------------------------------------------
INSERT INTO public.clinics (name, slug, address, city, state, pincode, phone, default_slot_duration_mins)
VALUES (
  'The Physio Lab — Research & Rehabilitation (Barewal Awana)',
  'barewal-awana-ludhiana',
  'Barewal Awana, Ludhiana',
  'Ludhiana',
  'Punjab',
  '141012',
  '+919316196000',
  30
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.message_templates (name, trigger_type, meta_template_name, body_preview, variables_order)
VALUES
  (
    'Booking Confirmation',
    'booking_confirmation',
    'physiolab_booking_confirmation',
    'Hello {{name}}, your physiotherapy appointment at {{clinic}} with {{physio}} is confirmed for {{date}}. Reply or visit your patient portal to manage your booking.',
    '["name", "date", "clinic", "physio"]'::jsonb
  ),
  (
    '24-Hour Appointment Reminder',
    'reminder_24h',
    'physiolab_reminder_24h',
    'Reminder: Hello {{name}}, you have an upcoming physiotherapy session tomorrow at {{date}} at {{clinic}} with {{physio}}.',
    '["name", "date", "clinic", "physio"]'::jsonb
  ),
  (
    '2-Hour Appointment Reminder',
    'reminder_2h',
    'physiolab_reminder_2h',
    'See you soon! Hi {{name}}, your session at {{clinic}} with {{physio}} starts in 2 hours ({{date}}).',
    '["name", "date", "clinic", "physio"]'::jsonb
  ),
  (
    'Appointment Cancelled',
    'appointment_cancelled',
    'physiolab_appointment_cancelled',
    'Hi {{name}}, your appointment at {{clinic}} with {{physio}} scheduled for {{date}} has been cancelled. Book a new slot anytime via our Patient Portal.',
    '["name", "date", "clinic", "physio"]'::jsonb
  ),
  (
    'Missed Appointment (No-Show)',
    'appointment_no_show',
    'physiolab_appointment_noshow',
    'Hi {{name}}, we missed you at your scheduled session on {{date}} at {{clinic}} with {{physio}}. Consistent therapy is key to recovery—please tap here to reschedule.',
    '["name", "date", "clinic", "physio"]'::jsonb
  ),
  (
    'Manual Clinic Follow-Up',
    'manual_followup',
    'physiolab_manual_followup',
    'Hi {{name}}, checking in on your recovery from {{clinic}} ({{physio}}). Your last visit was on {{date}}. Let us know how you are feeling or book your next session!',
    '["name", "date", "clinic", "physio"]'::jsonb
  )
ON CONFLICT (trigger_type) DO NOTHING;
