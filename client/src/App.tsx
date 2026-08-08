import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

import { HelmetProvider } from 'react-helmet-async';
import { GlobalErrorBoundary } from '@/components/common/GlobalErrorBoundary';
import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

const LandingPage = lazy(() => import('@/features/landing/pages/LandingPage'));
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const AppLayout = lazy(() => import('@/components/layout/AppLayout'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'));
const ResumeAnalyzerPage = lazy(() => import('@/features/resume/pages/ResumeAnalyzerPage'));
const InterviewSetupPage = lazy(() => import('@/features/interview/pages/InterviewSetupPage'));
const InterviewPage = lazy(() => import('@/features/interview/pages/InterviewPage'));
const InterviewResultPage = lazy(() => import('@/features/interview/pages/InterviewResultPage'));
const InterviewHistoryPage = lazy(() => import('@/features/interview/pages/InterviewHistoryPage'));
const VoiceInterviewPage = lazy(() => import('@/features/interview/pages/VoiceInterviewPage'));
const CodingChallengePage = lazy(() => import('@/features/coding/pages/CodingChallengePage'));
const CodingEditorPage = lazy(() => import('@/features/coding/pages/CodingEditorPage'));
const LeaderboardPage = lazy(() => import('@/features/leaderboard/pages/LeaderboardPage'));
const RoadmapPage = lazy(() => import('@/features/roadmap/pages/RoadmapPage'));
const CertificatesPage = lazy(() => import('@/features/certificates/pages/CertificatesPage'));
const CompanyInterviewsPage = lazy(() => import('@/features/companies/pages/CompanyInterviewsPage'));
const HackathonChatPage = lazy(() => import('@/features/hackathon/pages/HackathonChatPage'));
const HackathonHistoryPage = lazy(() => import('@/features/hackathon/pages/HackathonHistoryPage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <GlobalErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
          {/* Public */}
          <Route path="/" element={<GuestRoute><LandingPage /></GuestRoute>} />
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />

          {/* Protected — App Layout */}
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="resume" element={<ResumeAnalyzerPage />} />
            <Route path="interviews" element={<InterviewHistoryPage />} />
            <Route path="interviews/setup" element={<InterviewSetupPage />} />
            <Route path="interviews/:id" element={<InterviewPage />} />
            <Route path="interviews/:id/voice" element={<VoiceInterviewPage />} />
            <Route path="interviews/:id/results" element={<InterviewResultPage />} />
            <Route path="coding" element={<CodingChallengePage />} />
            <Route path="coding/:id" element={<CodingEditorPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="roadmap" element={<RoadmapPage />} />
            <Route path="certificates" element={<CertificatesPage />} />
            <Route path="companies" element={<CompanyInterviewsPage />} />
          </Route>

          {/* Hackathon Route */}
          <Route path="/hackathon" element={<ProtectedRoute><HackathonChatPage /></ProtectedRoute>} />
          <Route path="/hackathon/history" element={<ProtectedRoute><HackathonHistoryPage /></ProtectedRoute>} />

          {/* 404 Catch-all */}
          <Route path="*" element={
            <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
              <h1 className="text-6xl font-extrabold" style={{ color: 'var(--text-primary)' }}>404</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Page not found</p>
              <button onClick={() => window.location.href = '/dashboard'} className="px-6 py-2 rounded-xl gradient-primary text-white font-medium">Go to Dashboard</button>
            </div>
          } />
        </Routes>
      </Suspense>
          </BrowserRouter>
          <Toaster
            position="top-right"
            richColors
            toastOptions={{
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
              },
            }}
          />
        </QueryClientProvider>
      </HelmetProvider>
    </GlobalErrorBoundary>
  );
}
