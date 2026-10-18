import React from 'react';
import { FileText } from 'lucide-react';
import { getPatientSession } from '@/lib/auth/session';
import { repositories } from '@/lib/repositories';
import { PrescriptionVaultViewer } from '@/components/portal/prescription-viewer';

export const dynamic = 'force-dynamic';

export default async function PatientPrescriptionsPage() {
  const session = await getPatientSession();
  if (!session) return null;

  const prescriptions = await repositories.consultations
    .listPatientPrescriptions(session.patientId)
    .catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#00858E]">
          Secure Clinical Storage
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141413] mt-1">
          My Digital Prescriptions &amp; Exercise Charts
        </h1>
        <p className="text-sm text-[#141413]/70 mt-1">
          Preview and download both PDF rehabilitation protocols and image exercise charts uploaded
          by your physiotherapist.
        </p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#D6CFC2]">
          <FileText className="h-10 w-10 text-[#00858E] mx-auto mb-3" />
          <h2 className="text-lg font-extrabold text-[#141413]">No Prescriptions Available</h2>
          <p className="text-xs text-[#141413]/65 mt-1">
            Any PDF or image prescriptions uploaded during your consultation will be securely
            accessible here.
          </p>
        </div>
      ) : (
        <PrescriptionVaultViewer prescriptions={prescriptions} />
      )}
    </div>
  );
}
