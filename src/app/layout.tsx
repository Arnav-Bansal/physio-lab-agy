import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'The Physio Lab — Research & Rehabilitation | Ludhiana, Punjab',
  description:
    '5.0★ Rated Physiotherapy, Research & Rehabilitation, Sports Injury Centre (Desmotec Eccentric Rehab), and Lifestyle Clinic in Barewal Awana, Ludhiana. Book appointments and access prescriptions online.',
  icons: {
    icon: '/images/clinic/logo-mark.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="min-h-screen font-sans bg-[#F5F2EB] text-[#141413] flex flex-col">
        {children}
      </body>
    </html>
  );
}
