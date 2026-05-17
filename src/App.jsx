import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import Layout from '@/components/Layout';
import Beranda from '@/pages/Beranda';
import UserManagement from '@/pages/UserManagement';
import MasterData from '@/pages/MasterData';
import MemberManagement from '@/pages/MemberManagement';
import FinancialReport from '@/pages/FinancialReport';
import CertificateLetter from '@/pages/CertificateLetter';
import MutationLetter from '@/pages/MutationLetter';
import DownloadPage from '@/pages/DownloadPage';
import EventPage from '@/pages/EventPage';
import SettingsPage from '@/pages/SettingsPage';
import PendingApproval from '@/pages/PendingApproval';
import Registration from '@/pages/Registration';
import MeetingInvitation from '@/pages/MeetingInvitation';
import MeetingAttendancePage from '@/pages/MeetingAttendancePage';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/Beranda" replace />} />
        <Route path="/Beranda" element={<Beranda />} />
        <Route path="/UserManagement" element={<UserManagement />} />
        <Route path="/MasterData" element={<MasterData />} />
        <Route path="/MemberManagement" element={<MemberManagement />} />
        <Route path="/FinancialReport" element={<FinancialReport />} />
        <Route path="/CertificateLetter" element={<CertificateLetter />} />
        <Route path="/MutationLetter" element={<MutationLetter />} />
        <Route path="/DownloadPage" element={<DownloadPage />} />
        <Route path="/EventPage" element={<EventPage />} />
        <Route path="/SettingsPage" element={<SettingsPage />} />
        <Route path="/PendingApproval" element={<PendingApproval />} />
        <Route path="/Registration" element={<Registration />} />
        <Route path="/MeetingInvitation" element={<MeetingInvitation />} />
        <Route path="/MeetingAttendancePage" element={<MeetingAttendancePage />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App