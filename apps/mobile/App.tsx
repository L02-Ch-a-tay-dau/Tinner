import { AppShell } from "./app-native/AppShell";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://e4c8a579287a37dd895bf4a85ebf3e64@o4511351644160000.ingest.us.sentry.io/4511351645798400',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export default Sentry.wrap(function App() {
  return (
    <SafeAreaProvider>
      <AppShell />
    </SafeAreaProvider>
  );
});

