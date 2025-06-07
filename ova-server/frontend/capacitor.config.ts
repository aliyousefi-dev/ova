import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ovaplayer',
  appName: 'ovaplayer',
  webDir: 'dist/frontend/browser',
  server: {
    androidScheme: 'http',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
