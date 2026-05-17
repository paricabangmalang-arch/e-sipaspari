import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CalendarDays, Clock, MapPin, Video, FileText, CheckCircle2, Users, Loader2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Navigate, useOutletContext } from 'react-router-dom';

export default function MeetingAttendancePage() {
  const { user } = useOutletContext();
  const isAdmin = user?.role === 'admin';
  const qc = useQueryClient();
  const [showAttendees, setShowAttendees] = useState(null);

  const { data: meetings = [], isLoading } = useQuery({ queryKey: ['meetings'], queryFn: () => base44.entities.Meeting.list('-day_date') });
  const { data: allAttendances = [] } = useQuery({ queryKey: ['meetingAttendances'], queryFn: () => base44.entities.MeetingAttendance.list('-created_date') });
  const { data: member } = useQuery({ queryKey: ['myMember', user?.email], queryFn: () => base44.entities.Member.filter({ user_email: user?.email }), enabled: !!user?.email && !isAdmin, select: d => d[0] });

  const toggleMut = useMutation({ mutationFn: ({ id: mid, val }) => base44.entities.Meeting.update(mid, { attendance_active: val }), onSuccess: () => qc.invalidateQueries(['meetings']) });
  const attendMut = useMutation({ mutationFn: (d) => base44.entities.MeetingAttendance.create(d), onSuccess: () => qc.invalidateQueries(['meetingAttendances']) });
  const verifyMut = useMutation({ mutationFn: ({ id: aid, val }) => base44.entities.MeetingAttendance.update(aid, { is_verified: val }), onSuccess: () => qc.invalidateQueries(['meetingAttendances']) });

  const alreadyAttended = (mid) => allAttendances.some(a => a.meeting_id === mid && a.member_email === user?.email);
  const getAttendees = (mid) => allAttendances.filter(a => a.meeting_id === mid);

  if (!isAdmin && !user?.is_pengurus) return <Navigate to="/Beranda" />;

  const handleAttend = (m) => attendMut.mutate({ meeting_id: m.id, meeting_name: m.name, member_email: user?.email, member_name: member?.full_name || user?.full_name || user?.email, nir: member?.nir || '-', institution: member?.work_institution || '-', is_verified: false });

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-sky-100 to-blue-100 rounded-xl p-4 border border-sky-200"><h1 className="text-2xl font-bold text-slate-800">Absensi Rapat</h1><p className="text-slate-500 mt-1">Daftar hadir rapat pengurus</p></div>
      {isLoading ? <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div> : meetings.length === 0 ? <div className="text-center py-16 text-slate-400">Belum ada rapat</div> : (
        <div className="grid gap-4">{meetings.map(m => { const attendees = getAttendees(m.id); const attended = alreadyAttended(m.id); return (
          <Card key={m.id} className="border border-slate-200 shadow-sm"><CardContent className="p-5"><div className="flex justify-between items-start flex-wrap gap-3"><div className="flex-1 min-w-0"><h2 className="text-lg font-semibold text-slate-800 mb-1">{m.name}</h2><p className="text-slate-600 text-sm mb-3 whitespace-pre-line line-clamp-3">{m.content}</p><div className="flex flex-wrap gap-3 text-sm text-slate-500 mb-3"><span className="flex items-center gap-1"><CalendarDays className="w-4 h-4 text-blue-500" />{m.day_date ? format(new Date(m.day_date), 'EEEE, dd MMMM yyyy', { locale: id }) : '-'}</span><span className="flex items-center gap-1"><Clock className="w-4 h-4 text-blue-500" />{m.time} WIB</span><span className="flex items-center gap-1">{m.location_type === 'Online' ? <><Video className="w-4 h-4 text-green-500" /><Badge className="bg-green-100 text-green-700 border-0 text-xs">Online</Badge></> : <><MapPin className="w-4 h-4 text-red-500" />{m.location_address || 'Offline'}</>}</span>{m.invitation_file_url && <a href={m.invitation_file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline"><FileText className="w-4 h-4" />Surat Undangan</a>}</div><div className="flex flex-wrap items-center gap-2">{!isAdmin && (m.attendance_active ? (attended ? <Badge className="bg-green-100 text-green-700 border-0 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Sudah Absen</Badge> : <Button size="sm" onClick={() => handleAttend(m)} disabled={attendMut.isPending}>{attendMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Absen Sekarang'}</Button>) : <Badge variant="secondary" className="text-xs">Absensi Belum Aktif</Badge>)}<button onClick={() => isAdmin ? setShowAttendees(m) : null} className={`flex items-center gap-1 text-sm text-slate-500 ${isAdmin ? 'hover:text-blue-600 cursor-pointer' : ''}`}><Users className="w-4 h-4" />{attendees.length} hadir</button></div></div>{isAdmin && <div className="flex flex-col items-end gap-3"><div className="flex items-center gap-2"><Label className="text-xs text-slate-500">Aktifkan Absensi</Label><Switch checked={!!m.attendance_active} onCheckedChange={v => toggleMut.mutate({ id: m.id, val: v })} /></div><Button size="sm" variant="outline" onClick={() => setShowAttendees(m)}><Users className="w-3 h-3 mr-1" />Lihat Absensi</Button></div>}</div></CardContent></Card>); })}</div>
      )}
      <Dialog open={!!showAttendees} onOpenChange={() => setShowAttendees(null)}><DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>Daftar Absensi: {showAttendees?.name}</DialogTitle></DialogHeader>{showAttendees && <div className="space-y-3">{getAttendees(showAttendees.id).length === 0 ? <p className="text-center text-slate-400 py-6">Belum ada yang absen</p> : <div className="border rounded-lg overflow-hidden"><table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="px-3 py-2 text-left font-medium text-slate-600">No</th><th className="px-3 py-2 text-left font-medium text-slate-600">Nama</th><th className="px-3 py-2 text-left font-medium text-slate-600">NIR</th><th className="px-3 py-2 text-left font-medium text-slate-600">Status</th>{isAdmin && <th className="px-3 py-2 text-left font-medium text-slate-600">Aksi</th>}</tr></thead><tbody className="divide-y divide-slate-100">{getAttendees(showAttendees.id).map((a, i) => <tr key={a.id} className="hover:bg-slate-50"><td className="px-3 py-2">{i+1}</td><td className="px-3 py-2 font-medium">{a.member_name}</td><td className="px-3 py-2 text-slate-500">{a.nir}</td><td className="px-3 py-2"><Badge className={a.is_verified ? 'bg-green-100 text-green-700 border-0' : 'bg-yellow-100 text-yellow-700 border-0'}>{a.is_verified ? 'Terverifikasi' : 'Belum'}</Badge></td>{isAdmin && <td className="px-3 py-2"><Button size="sm" variant="ghost" onClick={() => verifyMut.mutate({ id: a.id, val: !a.is_verified })}>{a.is_verified ? 'Batalkan' : 'Verifikasi'}</Button></td>}</tr>)}</tbody></table></div>}</div>}</DialogContent></Dialog>
    </div>
  );
}