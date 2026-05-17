import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Pencil, Trash2, MapPin, Video, Clock, CalendarDays, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Navigate, useOutletContext } from 'react-router-dom';

export default function MeetingInvitation() {
  const { user } = useOutletContext();
  const isAdmin = user?.role === 'admin';
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: '', content: '', day_date: '', time: '', location_type: 'Offline', location_address: '', invitation_file_url: '' });

  const { data: meetings = [], isLoading } = useQuery({ queryKey: ['meetings'], queryFn: () => base44.entities.Meeting.list('-day_date') });
  const saveMut = useMutation({ mutationFn: async (d) => editing ? base44.entities.Meeting.update(editing.id, d) : base44.entities.Meeting.create(d), onSuccess: () => { qc.invalidateQueries(['meetings']); setOpen(false); setEditing(null); } });
  const delMut = useMutation({ mutationFn: (mid) => base44.entities.Meeting.delete(mid), onSuccess: () => qc.invalidateQueries(['meetings']) });

  const handleOpen = (m = null) => { if (m) { setEditing(m); setForm({ name: m.name, content: m.content, day_date: m.day_date, time: m.time, location_type: m.location_type, location_address: m.location_address||'', invitation_file_url: m.invitation_file_url||'' }); } else { setEditing(null); setForm({ name:'', content:'', day_date:'', time:'', location_type:'Offline', location_address:'', invitation_file_url:'' }); } setOpen(true); };
  const handleFileUpload = async (e) => { const f = e.target.files[0]; if (!f) return; setUploading(true); const { file_url } = await base44.integrations.Core.UploadFile({ file: f }); setForm(p => ({...p, invitation_file_url: file_url})); setUploading(false); };

  if (!isAdmin && !user?.is_pengurus) return <Navigate to="/Beranda" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-gradient-to-r from-sky-100 to-blue-100 rounded-xl p-4 border border-sky-200"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center"><CalendarDays className="w-6 h-6 text-blue-600" /></div><div><h1 className="text-2xl font-bold text-slate-800">Undangan Rapat</h1><p className="text-slate-500 mt-1">Kelola undangan rapat pengurus</p></div></div>{isAdmin && <Button onClick={() => handleOpen()} className="flex items-center gap-2"><Plus className="w-4 h-4" />Buat Undangan</Button>}</div>
      {isLoading ? <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div> : meetings.length === 0 ? <div className="text-center py-16 text-slate-400">Belum ada undangan rapat</div> : (
        <div className="grid gap-4">{meetings.map(m => (
          <Card key={m.id} className="border border-slate-200 shadow-sm"><CardContent className="p-5"><div className="flex justify-between items-start"><div className="flex-1"><h2 className="text-lg font-semibold text-slate-800 mb-2">{m.name}</h2><p className="text-slate-600 text-sm mb-3 whitespace-pre-line">{m.content}</p><div className="flex flex-wrap gap-3 text-sm text-slate-500"><span className="flex items-center gap-1"><CalendarDays className="w-4 h-4 text-blue-500" />{m.day_date ? format(new Date(m.day_date), 'EEEE, dd MMMM yyyy', { locale: id }) : '-'}</span><span className="flex items-center gap-1"><Clock className="w-4 h-4 text-blue-500" />{m.time} WIB</span><span className="flex items-center gap-1">{m.location_type === 'Online' ? <><Video className="w-4 h-4 text-green-500" /><Badge className="bg-green-100 text-green-700 border-0">Online</Badge></> : <><MapPin className="w-4 h-4 text-red-500" />{m.location_address || 'Offline'}</>}</span>{m.invitation_file_url && <a href={m.invitation_file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline"><FileText className="w-4 h-4" />Lihat Surat</a>}</div></div>{isAdmin && <div className="flex gap-2 ml-4"><Button size="icon" variant="outline" onClick={() => handleOpen(m)}><Pencil className="w-4 h-4" /></Button><Button size="icon" variant="outline" className="text-red-500" onClick={() => delMut.mutate(m.id)}><Trash2 className="w-4 h-4" /></Button></div>}</div></CardContent></Card>
        ))}</div>
      )}
      <Dialog open={open} onOpenChange={() => { setOpen(false); setEditing(null); }}><DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editing ? 'Edit' : 'Buat'} Undangan</DialogTitle></DialogHeader><div className="space-y-4 py-2"><div><Label>Nama Rapat *</Label><Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="mt-1" /></div><div><Label>Isi Undangan *</Label><Textarea value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))} rows={4} className="mt-1" /></div><div className="grid grid-cols-2 gap-3"><div><Label>Tanggal *</Label><Input type="date" value={form.day_date} onChange={e => setForm(f => ({...f, day_date: e.target.value}))} className="mt-1" /></div><div><Label>Jam *</Label><Input type="time" value={form.time} onChange={e => setForm(f => ({...f, time: e.target.value}))} className="mt-1" /></div></div><div><Label>Lokasi *</Label><Select value={form.location_type} onValueChange={v => setForm(f => ({...f, location_type: v}))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Online">Online</SelectItem><SelectItem value="Offline">Offline</SelectItem></SelectContent></Select></div>{form.location_type === 'Offline' && <div><Label>Alamat</Label><Input value={form.location_address} onChange={e => setForm(f => ({...f, location_address: e.target.value}))} className="mt-1" /></div>}<div><Label>Upload Surat</Label><Input type="file" accept=".pdf,.jpg,.png,.doc,.docx" onChange={handleFileUpload} disabled={uploading} className="mt-1" />{uploading && <Loader2 className="w-5 h-5 animate-spin text-blue-500 mt-1" />}</div></div><DialogFooter><Button variant="outline" onClick={() => { setOpen(false); setEditing(null); }}>Batal</Button><Button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending || !form.name || !form.day_date || !form.time}>{saveMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan'}</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}