import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#141E1E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://thephysiolabs.com'),
  title: 'The Physio Lab — Research & Rehabilitation | Ludhiana',
  description:
    'Evidence-based Physiotherapy, Research & Rehabilitation, Desmotec Sports Injury Centre, and Lifestyle Clinic in Barewal Awana, Ludhiana. Book appointments and access digital prescriptions online.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PhysioLab CRM',
  },
  icons: {
    icon: [
      { url: '/icons/crm-icon.svg', type: 'image/svg+xml' },
      { url: '/icons/crm-icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
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
