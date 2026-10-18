import { NextResponse } from 'next/server';

export async function GET() {
  // Generates a valid, clean clinical PDF prescription document for download/preview
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /MediaBox [0 0 612 792] /Contents 6 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
6 0 obj
<< /Length 740 >>
stream
BT
/F1 18 Tf
50 730 Td
(THE PHYSIO LAB - RESEARCH & REHABILITATION) Tj
/F2 10 Tf
0 -18 Td
(Barewal Awana, Ludhiana, Punjab | Phone: +91 93161-96000 / +91 98153-70607) Tj
0 -14 Td
(----------------------------------------------------------------------------------------------------) Tj
/F1 12 Tf
0 -26 Td
(CLINICAL REHABILITATION PRESCRIPTION & HOME EXERCISE PROTOCOL) Tj
/F2 11 Tf
0 -22 Td
(Patient Name: Rohan Verma    |    Phone: +91 98765-43210) Tj
0 -16 Td
(Attending Specialist: Dr. Arjun Malhotra, MPT (Sports Injury Centre)) Tj
0 -16 Td
(Diagnosis: Grade-II Right Knee ACL Sprain & Quadriceps Eccentric Deficit) Tj
/F1 11 Tf
0 -28 Td
(Prescribed Rehabilitation Protocol:) Tj
/F2 10 Tf
0 -18 Td
(1. Desmotec V.Line Eccentric Flywheel Squat: 3 sets x 10 controlled reps (2x/week in clinic)) Tj
0 -16 Td
(2. Terminal Knee Extension (TKE) with Resistance Band: 3 sets x 15 reps daily) Tj
0 -16 Td
(3. Single-Leg Proprioceptive Balance Board: 3 sets x 60 seconds) Tj
0 -16 Td
(4. Cryotherapy (Ice Pack): 12 minutes post-rehab session) Tj
ET
endstream
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000241 00000 n 
0000000309 00000 n 
0000000372 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
1164
%%EOF`;

  return new NextResponse(pdfContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="ThePhysioLab_Rehab_Prescription.pdf"',
    },
  });
}
