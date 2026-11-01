import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/crm/login',
    name: 'PhysioLab CRM',
    short_name: 'PhysioLab CRM',
    description:
      'Staff, Doctor & Admin Mobile CRM for The Physio Lab — Barewal Awana, Ludhiana. Manage schedules, record SOAP clinical notes, snap & upload prescriptions, and automate WhatsApp care.',
    start_url: '/crm/login',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#141E1E',
    theme_color: '#00858E',
    categories: ['medical', 'health', 'productivity', 'business'],
    icons: [
      {
        src: '/icons/crm-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/crm-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/crm-icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'My Schedule & Calendar',
        short_name: 'Schedule',
        description: 'Open daily multi-physio schedule and slot calendar',
        url: '/crm/schedule',
        icons: [{ src: '/icons/crm-icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Consultations & Prescriptions',
        short_name: 'SOAP & Rx',
        description: 'Record clinical SOAP notes and snap/upload prescriptions',
        url: '/crm/consultations',
        icons: [{ src: '/icons/crm-icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Patient Directory',
        short_name: 'Patients',
        description: 'Search patient records and longitudinal clinical history',
        url: '/crm/patients',
        icons: [{ src: '/icons/crm-icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Book Appointment Slot',
        short_name: 'Book Slot',
        description: 'Create a manual-duration appointment booking',
        url: '/crm/schedule?book=1',
        icons: [{ src: '/icons/crm-icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
    ],
  };
}
