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
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Secure Clinical Storage
        </span>
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mt-1">
          My Digital Prescriptions &amp; Exercise Charts
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Preview and download both PDF rehabilitation protocols and image exercise charts uploaded
          by your physiotherapist.
        </p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border border-border">
          <FileText className="h-10 w-10 text-primary mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-foreground">No Prescriptions Available</h2>
          <p className="text-xs text-foreground/65 mt-1">
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
