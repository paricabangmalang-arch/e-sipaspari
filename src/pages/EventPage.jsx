import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, Plus, Calendar, Users, Pencil, Trash2, ExternalLink, Award } from 'lucide-react';
import moment from 'moment';
import { useOutletContext } from 'react-router-dom';

export default function EventPage() {
  const { user } = useOutletContext();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [registerDialog, setRegisterDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [memberData, setMemberData] = useState(null);
  const [transferProof, setTransferProof] = useState(null);
  const [flyerFile, setFlyerFile] = useState(null);
  const [formData, setFormData] = useState({ title: '', event_date: '', description: '', quota: '', status: 'Buka Pendaftaran', certificate_url: '' });
  const canEdit = user?.role === 'admin' || user?.is_sekretaris;

  const { data: events = [], isLoading } = useQuery({ queryKey: ['events'], queryFn: () => base44.entities.Event.list('-event_date') });
  const { data: registrations = [] } = useQuery({ queryKey: ['event-registrations'], queryFn: () => base44.entities.EventRegistration.list('-created_date') });
  const { data: member } = useQuery({ queryKey: ['my-member-ev', user?.email], queryFn: async () => { const m = await base44.entities.Member.filter({ user_email: user?.email }); return m[0]; }, enabled: !!user?.email });
  useEffect(() => { if (member) setMemberData(member); }, [member]);

  const createEventMutation = useMutation({ mutationFn: async (d) => { let url = ''; if (flyerFile) { const { file_url } = await base44.integrations.Core.UploadFile({ file: flyerFile }); url = file_url; } return base44.entities.Event.create({ ...d, flyer_url: url, registered_count: 0 }); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['events'] }); setAddDialog(false); setFlyerFile(null); } });
  const updateEventMutation = useMutation({ mutationFn: ({ id, data }) => base44.entities.Event.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['events'] }); setEditDialog(false); } });
  const deleteEventMutation = useMutation({ mutationFn: (id) => base44.entities.Event.delete(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['events'] }); setDeleteDialog(false); } });
  const registerMutation = useMutation({ mutationFn: async (d) => { let proofUrl = ''; if (transferProof) { const { file_url } = await base44.integrations.Core.UploadFile({ file: transferProof }); proofUrl = file_url; } await base44.entities.EventRegistration.create({ ...d, transfer_proof_url: proofUrl }); const ev = events.find(e => e.id === selectedEvent.id); await base44.entities.Event.update(selectedEvent.id, { registered_count: (ev.registered_count || 0) + 1 }); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['events'] }); queryClient.invalidateQueries({ queryKey: ['event-registrations'] }); setRegisterDialog(false); } });

  const filteredEvents = events.filter(e => e.title?.toLowerCase().includes(search.toLowerCase()));
  const isRegistered = (eid) => registrations.some(r => r.event_id === eid && r.member_email === user?.email);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-sky-100 to-blue-100 rounded-xl p-4 border border-sky-200"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center"><Calendar className="w-6 h-6 text-blue-600" /></div><div><h1 className="text-2xl font-bold text-slate-800">Event</h1><p className="text-slate-500 mt-1">Kelola event dan pendaftaran</p></div></div>{canEdit && <Button onClick={() => { setFormData({ title:'', event_date:'', description:'', quota:'', status:'Buka Pendaftaran', certificate_url:'' }); setFlyerFile(null); setAddDialog(true); }} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Tambah Event</Button>}</div>
      <Input placeholder="Cari event..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-72" />
      {isLoading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div> : filteredEvents.length === 0 ? <div className="text-center py-12 text-slate-500"><Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />Tidak ada event</div> : (
        <div className="grid grid-cols-1 gap-6">{filteredEvents.map(event => { const sisa = event.quota - (event.registered_count || 0); return (
          <Card key={event.id} className="overflow-hidden shadow-lg border-0 rounded-2xl">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/5 lg:w-1/3">{event.flyer_url ? <img src={event.flyer_url} alt={event.title} className="w-full h-full object-cover min-h-[300px]" /> : <div className="w-full h-full min-h-[300px] bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center"><Calendar className="w-20 h-20 text-white/50" /></div>}</div>
              <CardContent className="p-6 md:w-3/5 lg:w-2/3 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-3"><h3 className="font-semibold text-2xl text-slate-800">{event.title}</h3><Badge variant={event.status === 'Buka Pendaftaran' ? 'default' : 'secondary'}>{event.status}</Badge></div>
                <p className="text-base text-slate-500 mb-4">{moment(event.event_date).format('DD MMMM YYYY')}</p>
                {event.description && <p className="text-base text-slate-600 mb-6 line-clamp-3">{event.description}</p>}
                <div className="space-y-3">
                  {event.certificate_url && (
                    <a href={event.certificate_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm hover:bg-amber-100">
                      <Award className="w-4 h-4" />Lihat Sertifikat
                    </a>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-6 text-base text-slate-600"><div className="flex items-center gap-2"><Users className="w-5 h-5" />Kuota: {event.quota}</div><span>Sisa: {sisa}</span></div>
                    <div className="flex gap-1">
                      {event.status === 'Buka Pendaftaran' && sisa > 0 && !isRegistered(event.id) && <Button size="sm" onClick={() => { setSelectedEvent(event); setTransferProof(null); setRegisterDialog(true); }}>Daftar</Button>}
                      {isRegistered(event.id) && <Badge className="bg-green-100 text-green-700">Terdaftar</Badge>}
                      {canEdit && <><Button variant="ghost" size="icon" onClick={() => { setSelectedEvent(event); setFormData({...event, quota: String(event.quota), certificate_url: event.certificate_url||''}); setEditDialog(true); }}><Pencil className="w-4 h-4 text-blue-500" /></Button><Button variant="ghost" size="icon" onClick={() => { setSelectedEvent(event); setDeleteDialog(true); }}><Trash2 className="w-4 h-4 text-red-500" /></Button></>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>); })}</div>
      )}
      <Dialog open={addDialog} onOpenChange={setAddDialog}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Tambah Event</DialogTitle></DialogHeader><div className="space-y-4 py-4"><div><Label>Judul</Label><Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} /></div><div><Label>Flyer</Label><Input type="file" accept="image/*" onChange={(e) => setFlyerFile(e.target.files[0])} /></div><div><Label>Tanggal</Label><Input type="date" value={formData.event_date} onChange={(e) => setFormData({...formData, event_date: e.target.value})} /></div><div><Label>Keterangan</Label><Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div><div><Label>Kuota</Label><Input type="number" value={formData.quota} onChange={(e) => setFormData({...formData, quota: e.target.value})} /></div><div><Label className="flex items-center gap-2"><Award className="w-4 h-4 text-amber-500" />Link Sertifikat (Google Drive)</Label><Input value={formData.certificate_url} onChange={(e) => setFormData({...formData, certificate_url: e.target.value})} placeholder="https://drive.google.com/..." /></div></div><DialogFooter><Button variant="outline" onClick={() => setAddDialog(false)}>Batal</Button><Button onClick={() => createEventMutation.mutate({...formData, quota: parseInt(formData.quota)})} disabled={createEventMutation.isPending}>{createEventMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Simpan</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={editDialog} onOpenChange={setEditDialog}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Edit Event</DialogTitle></DialogHeader><div className="space-y-4 py-4"><div><Label>Judul</Label><Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} /></div><div><Label>Tanggal</Label><Input type="date" value={formData.event_date} onChange={(e) => setFormData({...formData, event_date: e.target.value})} /></div><div><Label>Kuota</Label><Input type="number" value={formData.quota} onChange={(e) => setFormData({...formData, quota: e.target.value})} /></div><div><Label>Status</Label><Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Buka Pendaftaran">Buka Pendaftaran</SelectItem><SelectItem value="Tutup">Tutup</SelectItem></SelectContent></Select></div><div><Label className="flex items-center gap-2"><Award className="w-4 h-4 text-amber-500" />Link Sertifikat (Google Drive)</Label><Input value={formData.certificate_url||''} onChange={(e) => setFormData({...formData, certificate_url: e.target.value})} placeholder="https://drive.google.com/..." /></div></div><DialogFooter><Button variant="outline" onClick={() => setEditDialog(false)}>Batal</Button><Button onClick={() => updateEventMutation.mutate({ id: selectedEvent.id, data: {...formData, quota: parseInt(formData.quota)} })} disabled={updateEventMutation.isPending}>Simpan</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={registerDialog} onOpenChange={setRegisterDialog}><DialogContent><DialogHeader><DialogTitle>Daftar: {selectedEvent?.title}</DialogTitle></DialogHeader><div className="space-y-4 py-4"><div className="bg-slate-50 p-4 rounded-lg text-sm"><p><strong>Nama:</strong> {memberData?.full_name}</p><p><strong>NIR:</strong> {memberData?.nir}</p></div><div><Label>Bukti Transfer</Label><Input type="file" accept="image/*" onChange={(e) => setTransferProof(e.target.files[0])} className="mt-2" /></div></div><DialogFooter><Button variant="outline" onClick={() => setRegisterDialog(false)}>Batal</Button><Button onClick={() => registerMutation.mutate({ event_id: selectedEvent.id, event_title: selectedEvent.title, member_email: user.email, member_name: memberData?.full_name, nir: memberData?.nir, gender: memberData?.gender, institution: memberData?.work_institution, status: 'Menunggu' })} disabled={registerMutation.isPending || !memberData}>{registerMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Daftar</Button></DialogFooter></DialogContent></Dialog>
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus Event?</AlertDialogTitle><AlertDialogDescription>Hapus "{selectedEvent?.title}"?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteEventMutation.mutate(selectedEvent.id)}>Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}