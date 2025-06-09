import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'ova-mobile',
  webDir: 'www'
,
    android: {
       buildOptions: {
          keystorePath: 'h:\sign\new.jks',
          keystoreAlias: 'key0',
       }
    }
  };

export default config;
