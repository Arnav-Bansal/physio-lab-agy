import { cookies } from 'next/headers';
import type { UserRole } from '@/types/database.types';

export const PATIENT_SESSION_COOKIE = 'physiolab_patient_session';
export const CRM_SESSION_COOKIE = 'physiolab_crm_session';

export interface PatientSession {
  patientId: string;
  phone: string;
  fullName: string;
  role: 'patient';
  issuedAt: string;
}

export interface CrmSession {
  profileId: string;
  email: string;
  fullName: string;
  role: Extract<UserRole, 'admin' | 'staff' | 'physio'>;
  primaryClinicId: string | null;
  specialization?: string | null;
  issuedAt: string;
}

export async function getPatientSession(): Promise<PatientSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(PATIENT_SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf-8')) as PatientSession;
    if (parsed && parsed.patientId && parsed.role === 'patient') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setPatientSession(session: Omit<PatientSession, 'issuedAt'>) {
  const cookieStore = await cookies();
  const payload: PatientSession = {
    ...session,
    issuedAt: new Date().toISOString(),
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  cookieStore.set(PATIENT_SESSION_COOKIE, encoded, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function getCrmSession(): Promise<CrmSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CRM_SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf-8')) as CrmSession;
    if (parsed && parsed.profileId && ['admin', 'staff', 'physio'].includes(parsed.role)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setCrmSession(session: Omit<CrmSession, 'issuedAt'>) {
  const cookieStore = await cookies();
  const payload: CrmSession = {
    ...session,
    issuedAt: new Date().toISOString(),
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  cookieStore.set(CRM_SESSION_COOKIE, encoded, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 14, // 14 days
  });
}

export async function clearAllSessions() {
  const cookieStore = await cookies();
  cookieStore.delete(PATIENT_SESSION_COOKIE);
  cookieStore.delete(CRM_SESSION_COOKIE);
}
