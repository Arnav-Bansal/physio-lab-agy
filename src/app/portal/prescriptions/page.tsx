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
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary bg-secondary px-2.5 py-0.5 rounded-md">
          <FileText className="h-3.5 w-3.5" />
          <span>Secure Clinical Storage</span>
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground pt-1">
          My Digital Prescriptions &amp; Exercise Charts
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Preview and download both PDF rehabilitation protocols and image exercise charts uploaded
          by your physiotherapist.
        </p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-border shadow-sm">
          <FileText className="h-10 w-10 text-primary mx-auto mb-3" />
          <h2 className="text-lg font-bold text-foreground">No Prescriptions Available</h2>
          <p className="text-xs text-muted-foreground mt-1">
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
