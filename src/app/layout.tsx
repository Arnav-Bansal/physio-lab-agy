import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Physio Lab — Research & Rehabilitation | Ludhiana',
  description:
    'Evidence-based Physiotherapy, Research & Rehabilitation, Desmotec Sports Injury Centre, and Lifestyle Clinic in Barewal Awana, Ludhiana. Book appointments and access digital prescriptions online.',
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-sans bg-background text-foreground flex flex-col">
        {children}
      </body>
    </html>
  );
}
