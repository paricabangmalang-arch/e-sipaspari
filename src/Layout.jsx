import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import Sidebar from '@/components/ui/Sidebar';
import { Loader2 } from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
  const { user, isLoadingAuth } = useAuth();
  const location = useLocation();

  if (isLoadingAuth) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" /><p className="text-slate-600">Memuat aplikasi...</p></div>
    </div>
  );

  // Redirect first-time users (not registered) to MemberManagement to fill profile
  if (user && user.role !== 'admin') {
    if (!user.is_registered && location.pathname !== '/MemberManagement') {
      return <Navigate to="/MemberManagement" replace />;
    }
    // Only rejected users still go to PendingApproval
    if (user.status === 'rejected' && location.pathname !== '/PendingApproval') {
      return <Navigate to="/PendingApproval" replace />;
    }
  }

  const noSidebarPages = ['/Registration', '/PendingApproval'];
  const hideSidebar = noSidebarPages.includes(location.pathname);

  if (hideSidebar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Outlet context={{ user }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto">
        <div className="pt-16 p-4 lg:p-6 min-h-screen w-full lg:pt-4">
          <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  );
}