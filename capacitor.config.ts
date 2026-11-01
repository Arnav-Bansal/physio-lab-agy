import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl =
  process.env.CAPACITOR_SERVER_URL || 'https://physio-lab-agy.vercel.app/crm';

const config: CapacitorConfig = {
  appId: 'in.thephysiolab.crm',
  appName: 'PhysioLab CRM',
  webDir: 'public/web-shell',
  server: {
    url: serverUrl,
    cleartext: true,
    allowNavigation: [
      'thephysiolabs.com',
      '*.thephysiolabs.com',
      'physio-lab-agy.vercel.app',
      '*.vercel.app',
      'localhost',
      '127.0.0.1',
    ],
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#141E1E',
    preferredContentMode: 'mobile',
  },
  android: {
    backgroundColor: '#141E1E',
    allowMixedContent: true,
  },
};

export default config;
