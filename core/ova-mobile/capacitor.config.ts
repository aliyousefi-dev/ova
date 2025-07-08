import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ova.mobile',
  appName: 'ova-mobile',
  webDir: './builds/ova-mobile-ui',
  "android": {
    "allowMixedContent": true
  },
  "server": {
    "androidScheme": "http",
    "cleartext": true
  }
};

export default config;
