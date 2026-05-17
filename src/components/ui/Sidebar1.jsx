import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Users, Database, UserCheck, FileText, Mail, Download, Calendar, Settings, ChevronDown, LogOut, Menu, X, Award, ArrowRightLeft, Building2, ClipboardList } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_6916ac7f41d5b45e7639dac6/ff5b405a8_IMG_2408.png";

export default function Sidebar({ user }) {
  const location = useLocation();
  const [letterMenuOpen, setLetterMenuOpen] = useState(false);
  const [pengurusMenuOpen, setPengurusMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isAdmin = user?.role === 'admin';
  const isPengurus = isAdmin || user?.is_pengurus === true;

  const menuItems = [
    { name: 'Beranda', icon: Home, path: '/Beranda', roles: ['admin', 'user'] },
    { name: 'User', icon: Users, path: '/UserManagement', roles: ['admin'] },
    { name: 'Master Data', icon: Database, path: '/MasterData', roles: ['admin'] },
    { name: 'Manajemen Anggota', icon: UserCheck, path: '/MemberManagement', roles: ['admin', 'user'] },
    { name: 'Laporan Keuangan', icon: FileText, path: '/FinancialReport', roles: ['admin', 'user'] },
    { name: 'Pengajuan Surat', icon: Mail, roles: ['admin', 'user'], submenu: [
      { name: 'Surat Keterangan', path: '/CertificateLetter', icon: Award },
      { name: 'Surat Rekomendasi Mutasi', path: '/MutationLetter', icon: ArrowRightLeft }
    ]},
    ...(isPengurus ? [{ name: 'Ruang Pengurus', icon: Building2, roles: ['admin', 'user'], submenuKey: 'pengurus', submenu: [
      { name: 'Undangan Rapat', path: '/MeetingInvitation', icon: Mail },
      { name: 'Absensi Rapat', path: '/MeetingAttendancePage', icon: ClipboardList }
    ]}] : []),
    { name: 'Download', icon: Download, path: '/DownloadPage', roles: ['admin', 'user'] },
    { name: 'Event', icon: Calendar, path: '/EventPage', roles: ['admin', 'user'] },
    { name: 'Pengaturan', icon: Settings, path: '/SettingsPage', roles: ['admin', 'user'] }
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role || 'user'));
  const isActive = (path) => location.pathname === path;
  const handleLogout = () => { base44.auth.logout(); };

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <button onClick={() => setMobileOpen(!mobileOpen)} className="bg-slate-50 p-2 rounded-lg fixed top-4 left-4 z-50 lg:hidden shadow-lg">
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <div className={cn(
        "h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 flex flex-col z-50",
        "fixed lg:relative",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        collapsed ? "lg:w-20" : "lg:w-64", "w-64"
      )}>
        <div className="p-4 border-b border-slate-700">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <img src={LOGO_URL} alt="eSIPAS Logo" className="w-12 h-12 object-contain" />
            {!collapsed && <div><h1 className="font-bold text-lg leading-tight">eSIPASPARI</h1><p className="text-xs text-slate-400">PARI Kota Malang</p></div>}
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4" style={{ scrollbarWidth: 'none' }}>
          {filteredMenuItems.map((item, index) => {
            const submenuKey = item.submenuKey || 'letter';
            const isOpen = submenuKey === 'pengurus' ? pengurusMenuOpen : letterMenuOpen;
            const toggle = submenuKey === 'pengurus' ? () => setPengurusMenuOpen(!pengurusMenuOpen) : () => setLetterMenuOpen(!letterMenuOpen);
            return (
              <div key={index}>
                {item.submenu ? (
                  <>
                    <button onClick={toggle} className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/50 transition-colors ${collapsed ? 'justify-center' : ''}`}>
                      <item.icon size={20} className="text-slate-400" />
                      {!collapsed && <><span className="flex-1 text-left text-sm">{item.name}</span><ChevronDown size={16} className={cn("transition-transform", isOpen && "rotate-180")} /></>}
                    </button>
                    {isOpen && !collapsed && (
                      <div className="bg-slate-800/50 ml-4">
                        {item.submenu.map((sub, subIndex) => {
                          const SubIcon = sub.icon;
                          return (
                            <Link key={subIndex} to={sub.path} className={cn("flex items-center gap-3 px-4 py-2.5 text-sm transition-colors", isActive(sub.path) ? "bg-blue-600/20 text-blue-400 border-l-2 border-blue-400" : "hover:bg-slate-700/50 text-slate-300")}>
                              {SubIcon && <SubIcon size={16} className="text-slate-400" />}{sub.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link to={item.path} className={cn("flex items-center gap-3 px-4 py-3 transition-colors", isActive(item.path) ? "bg-blue-600/20 text-blue-400 border-l-4 border-blue-400" : "hover:bg-slate-700/50 text-slate-300", collapsed && 'justify-center')}>
                    <item.icon size={20} />{!collapsed && <span className="text-sm">{item.name}</span>}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
        <div className="border-t border-slate-700 p-4">
          {!collapsed && <div className="mb-3"><p className="text-sm font-medium truncate">{user?.full_name || user?.email}</p><p className="text-xs text-slate-400 capitalize">{user?.role}</p></div>}
          <button onClick={handleLogout} className="text-amber-300 text-sm flex items-center gap-2 hover:text-red-300 transition-colors"><LogOut size={18} />{!collapsed && 'Keluar'}</button>
        </div>
      </div>
    </>
  );
}