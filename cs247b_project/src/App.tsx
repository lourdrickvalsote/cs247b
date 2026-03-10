import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SessionHistoryProvider } from './contexts/SessionHistoryContext';
import { SessionProvider } from './contexts/SessionContext';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/ui/Toast';
import { ThemeProvider } from './contexts/ThemeContext';
import AppLayout from './components/AppLayout';
import { Loader2 } from 'lucide-react';

const WelcomePage = lazy(() => import('./pages/WelcomePage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const TimerPage = lazy(() => import('./pages/TimerPage'));
const ActivitiesPage = lazy(() => import('./pages/ActivitiesPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

const PageFallback = () => (
  <div className="min-h-screen bg-alice dark:bg-jet-950 flex items-center justify-center">
    <Loader2 className="w-6 h-6 text-forest animate-spin" />
  </div>
);

function AppRoutes() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-alice dark:bg-jet-950 flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 bg-forest rounded-2xl flex items-center justify-center animate-pulse">
          <Loader2 className="w-7 h-7 text-white animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="*" element={<WelcomePage />} />
        </Routes>
      </Suspense>
    );
  }

  if (profile?.has_onboarded === false) {
    return (
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="*" element={<OnboardingPage />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <SessionHistoryProvider>
      <SessionProvider>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/timer" element={<TimerPage />} />
              <Route path="/activities" element={<ActivitiesPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/timer" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </SessionProvider>
    </SessionHistoryProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
