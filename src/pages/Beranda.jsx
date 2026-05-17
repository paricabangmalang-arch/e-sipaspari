import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SIPExpiryChecker from '@/components/SIPExpiryChecker';
import { Users, FileText, ArrowRightLeft, Wallet, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import moment from 'moment';

export default function Beranda() {
  const { user } = useOutletContext();
  const { data: members = [], isLoading: membersLoading } = useQuery({ queryKey: ['members'], queryFn: () => base44.entities.Member.list() });
  const { data: currentMember } = useQuery({ queryKey: ['current-member', user?.email], queryFn: async () => { const m = await base44.entities.Member.filter({ user_email: user?.email }); return m[0]; }, enabled: !!user?.email && user?.role !== 'admin' });
  const { data: certificates = [] } = useQuery({ queryKey: ['certificates'], queryFn: () => base44.entities.CertificateLetter.list() });
  const { data: mutations = [] } = useQuery({ queryKey: ['mutations'], queryFn: () => base44.entities.MutationLetter.list() });
  const { data: financials = [] } = useQuery({ queryKey: ['financials'], queryFn: () => base44.entities.FinancialReport.list() });
  const { data: events = [] } = useQuery({ queryKey: ['events'], queryFn: () => base44.entities.Event.list('-event_date', 3) });

  const genderData = [{ name: 'Laki-laki', value: members.filter(m => m.gender === 'Laki-laki').length, color: '#3B82F6' }, { name: 'Perempuan', value: members.filter(m => m.gender === 'Perempuan').length, color: '#EC4899' }];
  const letterStatusData = [{ name: 'Diterima', value: [...certificates, ...mutations].filter(l => l.status === 'Diterima').length, color: '#3B82F6' }, { name: 'Proses', value: [...certificates, ...mutations].filter(l => l.status === 'Proses').length, color: '#F59E0B' }, { name: 'Selesai', value: [...certificates, ...mutations].filter(l => l.status === 'Selesai').length, color: '#10B981' }];

  if (membersLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  const getSIPStatusBlock = () => {
    if (user?.role === 'admin' || !currentMember?.sip_end_date) return null;
    const daysUntilExpiry = moment(currentMember.sip_end_date).diff(moment(), 'days');
    if (daysUntilExpiry < 0) return <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-600 p-4 rounded-lg shadow-sm"><p className="font-semibold text-slate-800">🔴 SIP Telah Kadaluarsa ({moment(currentMember.sip_end_date).format('DD MMMM YYYY')})</p></div>;
    if (daysUntilExpiry <= 90) return <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 p-4 rounded-lg shadow-sm"><p className="font-semibold text-slate-800">⚠️ SIP Akan Berakhir dalam {daysUntilExpiry} hari</p></div>;
    return <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-lg shadow-sm"><p className="font-semibold text-slate-800">✅ SIP Aktif hingga {moment(currentMember.sip_end_date).format('DD MMMM YYYY')}</p></div>;
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-sky-100 to-blue-100 rounded-xl p-4 border border-sky-200 flex items-center gap-3">
        <div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center flex-shrink-0"><Users className="w-6 h-6 text-blue-600" /></div>
        <div><h1 className="text-2xl font-bold text-slate-800">Selamat Datang, {user?.full_name}</h1>
        <p className="text-slate-500 mt-1">Dashboard eSIPAS PARI Kota Malang</p></div>
      </div>
      {getSIPStatusBlock()}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white"><div className="flex items-center justify-between"><div><p className="text-blue-100 text-sm mb-1">Total Anggota</p><h3 className="text-4xl font-bold">{members.length}</h3></div><div className="bg-white/20 p-4 rounded-xl"><Users className="w-8 h-8" /></div></div></div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white"><div className="flex items-center justify-between"><div><p className="text-green-100 text-sm mb-1">Surat Keterangan</p><h3 className="text-4xl font-bold">{certificates.length}</h3></div><div className="bg-white/20 p-4 rounded-xl"><FileText className="w-8 h-8" /></div></div></div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white"><div className="flex items-center justify-between"><div><p className="text-purple-100 text-sm mb-1">Surat Rekomendasi</p><h3 className="text-4xl font-bold">{mutations.length}</h3></div><div className="bg-white/20 p-4 rounded-xl"><ArrowRightLeft className="w-8 h-8" /></div></div></div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white"><div className="flex items-center justify-between"><div><p className="text-orange-100 text-sm mb-1">Laporan Keuangan</p><h3 className="text-4xl font-bold">{financials.length}</h3></div><div className="bg-white/20 p-4 rounded-xl"><Wallet className="w-8 h-8" /></div></div></div>
      </div>
      {user?.role === 'admin' && <SIPExpiryChecker />}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden"><CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b"><CardTitle className="text-sm font-semibold">Distribusi Jenis Kelamin</CardTitle></CardHeader><CardContent className="p-4"><div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={genderData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} outerRadius={80} dataKey="value">{genderData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div></CardContent></Card>
        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden"><CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50 border-b"><CardTitle className="text-sm font-semibold">Status Pengajuan Surat</CardTitle></CardHeader><CardContent className="p-4"><div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={letterStatusData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} outerRadius={80} dataKey="value">{letterStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div></CardContent></Card>
      </div>
      <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b flex flex-row items-center justify-between"><CardTitle className="text-base font-semibold">Event Terbaru</CardTitle><Link to="/EventPage" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">Lihat Semua<ChevronRight className="w-4 h-4" /></Link></CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {events.length === 0 ? <p className="text-slate-500 text-center py-12">Belum ada event</p> : events.map(event => (
              <div key={event.id} className="block p-4 bg-white border border-slate-200 rounded-xl">
                <div className="flex items-start gap-4">
                  {event.flyer_url ? <img src={event.flyer_url} alt={event.title} className="w-60 h-60 rounded-lg object-cover flex-shrink-0" /> : <div className="w-60 h-60 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"><Calendar className="w-32 h-32 text-blue-600" /></div>}
                  <div className="flex-1 min-w-0"><h4 className="font-semibold text-slate-800 truncate">{event.title}</h4><p className="text-sm text-slate-500 mt-1">{moment(event.event_date).format('DD MMMM YYYY')}</p><div className="flex items-center gap-3 mt-2"><Badge variant={event.status === 'Buka Pendaftaran' ? 'default' : 'secondary'} className="text-xs">{event.status}</Badge><span className="text-xs text-slate-600">Kuota: {event.quota} • Sisa: {event.quota - (event.registered_count || 0)}</span></div></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}