'use client';

import React, { useState } from 'react';
import {
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  X,
  Calendar,
  MapPin,
} from 'lucide-react';
import { formatDateIST, formatFileSize } from '@/lib/utils';

interface PrescriptionItem {
  id: string;
  file_name: string;
  storage_path: string;
  file_type: 'pdf' | 'image';
  mime_type: string;
  file_size_bytes: number;
  description: string | null;
  created_at: string;
  signed_url?: string | null;
  consultation?: {
    id: string;
    diagnosis: string | null;
    chief_complaint: string | null;
    completed_at: string | null;
  } | null;
  clinic?: {
    id: string;
    name: string;
  } | null;
}

export function PrescriptionVaultViewer({
  prescriptions,
}: {
  prescriptions: PrescriptionItem[];
}) {
  const [previewItem, setPreviewItem] = useState<PrescriptionItem | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {prescriptions.map((item) => {
          const fileUrl = item.signed_url || item.storage_path;
          const isPdf = item.file_type === 'pdf';

          return (
            <div
              key={item.id}
              className="bg-white rounded-lg p-6 border border-border shadow-sm flex flex-col justify-between gap-5"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-secondary text-primary flex items-center justify-center shrink-0">
                      {isPdf ? (
                        <FileText className="h-6 w-6" />
                      ) : (
                        <ImageIcon className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-muted/50 text-primary border border-border">
                        {isPdf ? 'PDF Prescription Document' : 'Image Exercise Chart'}
                      </span>
                      <h3 className="text-base font-semibold text-foreground mt-1 break-all">
                        {item.file_name}
                      </h3>
                    </div>
                  </div>
                </div>

                {!isPdf && (
                  <div className="rounded-lg overflow-hidden border border-border h-44 bg-[#141413]">
                    <img
                      src={fileUrl}
                      alt={item.file_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <p className="text-xs text-foreground/75 leading-relaxed">
                  {item.description ||
                    item.consultation?.diagnosis ||
                    'Clinical prescription and exercise protocol.'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground pt-2 border-t border-[#F5F2EB]">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {formatDateIST(item.created_at)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {item.clinic?.name || 'The Physio Lab — Barewal Awana'}
                  </span>
                  <span>• {formatFileSize(item.file_size_bytes)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPreviewItem(item)}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-muted/50 hover:bg-secondary text-foreground font-bold text-xs border border-border transition-colors"
                >
                  <Eye className="h-4 w-4 text-primary" />
                  <span>Preview {isPdf ? 'PDF' : 'Image'}</span>
                </button>

                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={item.file_name}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-sm transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inline Preview Modal for PDF & Image Prescriptions */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-border">
            <div className="px-6 py-4 border-b border-[#E8E2D7] flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {previewItem.file_type.toUpperCase()} Prescription Preview
                </span>
                <h3 className="text-base font-semibold text-foreground">
                  {previewItem.file_name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewItem.signed_url || previewItem.storage_path}
                  download={previewItem.file_name}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="p-2 rounded-xl bg-muted/50 hover:bg-muted text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-[#141413] overflow-auto flex items-center justify-center min-h-[460px]">
              {previewItem.file_type === 'pdf' ? (
                <iframe
                  src={previewItem.signed_url || previewItem.storage_path}
                  title={previewItem.file_name}
                  className="w-full h-[540px] bg-white"
                />
              ) : (
                <img
                  src={previewItem.signed_url || previewItem.storage_path}
                  alt={previewItem.file_name}
                  className="max-h-[540px] w-auto object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
