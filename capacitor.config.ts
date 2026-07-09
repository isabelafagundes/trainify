import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.trainify.app',
  appName: 'Pezzo',
  webDir: 'dist',
  backgroundColor: '#f5f1ea',
  server: {
    androidScheme: 'https',
    // Live reload: defina CAP_SERVER_URL com o endereço do Vite (ex.: http://192.168.15.10:5173)
    // para o app carregar da sua máquina com hot reload. Deixe vazio para builds normais.
    url: process.env.CAP_SERVER_URL,
    cleartext: !!process.env.CAP_SERVER_URL,
  },
  plugins: {
    // Expõe os insets reais da status bar / navigation bar ao WebView
    // (env(safe-area-inset-*)), corrigindo o corte do cabeçalho e da barra inferior.
    // No Android 15 (targetSdk 35) o app é edge-to-edge e o WebView só reporta
    // o display cutout; este plugin reporta também as barras do sistema.
    SafeArea: {
      // Ícones escuros, visíveis sobre o fundo creme claro do app.
      statusBarStyle: 'LIGHT',
      navigationBarStyle: 'LIGHT',
    },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1200,
      backgroundColor: '#f5f1ea',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    Keyboard: {
      resize: KeyboardResize.Native,
      style: KeyboardStyle.Light,
      // O plugin SafeArea ja trata o teclado em edge-to-edge. Esta opcao
      // interfere no calculo dos insets quando habilitada.
      resizeOnFullScreen: false,
    },
  },
};

export default config;
