import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'service_app',
  webDir: 'build',
  bundledWebRuntime: false,
  // ⚡ Custom Android options (not officially in CapacitorConfig)
  // @ts-ignore
  android: {
    allowMixedContent: true,
    // @ts-ignore
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
  },

  // 👇 Add this block for Live Reload
  // server: {
  //   url: "http://192.168.100.71:3000", // replace with your PC’s local IP
  //   cleartext: true // allow HTTP (needed for dev)
  // }
};

export default config;
