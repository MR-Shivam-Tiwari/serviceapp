import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'service_app',
  webDir: 'build',
  bundledWebRuntime: false,
  // @ts-ignore: custom field not in CapacitorConfig
  android: {
    allowMixedContent: true,
    // @ts-ignore: hideLogs is not part of the CapacitorConfig type
    hideLogs: false,
    webContentsDebuggingEnabled: true,
    navigationStyle: 'custom'
  },
  ios: {
    scheme: 'App',
    scrollEnabled: false,
    contentInset: 'always'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    }
  }
};

export default config;