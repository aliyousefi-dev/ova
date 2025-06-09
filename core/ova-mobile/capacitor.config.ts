import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ova.mobile',
  appName: 'ova-mobile',
  webDir: 'www',
  android: {
    buildOptions: {
      keystorePath: 'h:sign\new.jks',
      keystoreAlias: 'key0',
    },
    allowMixedContent: true,
  },
  server: {
    androidScheme: 'http',
    cleartext: true,
  },
};

export default config;
