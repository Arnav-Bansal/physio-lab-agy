import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Physio Lab — Research & Rehabilitation',
  description:
    'Physiotherapy, Research & Rehabilitation, Sports Injury Centre, and Lifestyle Clinic in Barewal Awana, Ludhiana. Book appointments and access prescriptions online.',
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
    <html lang="en">
      <body className="min-h-screen font-sans bg-background text-foreground flex flex-col">
        {children}
      </body>
    </html>
  );
}
