import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DataTable from '@/components/ui/DataTable';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, Plus, ExternalLink, Clock, CheckCircle, FileText, Award } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

export default function CertificateLetter() {
  const { user } = useOutletContext();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [memberData, setMemberData] = useState(null);
  const [formData, setFormData] = useState({ purpose: '' });
  const [editFormData, setEditFormData] = useState({});
  const [letterNumberError, setLetterNumberError] = useState('');
  const canEdit = user?.role === 'admin' || user?.is_sekretaris;

  const { data: letters = [], isLoading } = useQuery({ queryKey: ['certificate-letters'], queryFn: () => base44.entities.CertificateLetter.list('-created_date') });
  const { data: member } = useQuery({ queryKey: ['my-member', user?.email], queryFn: async () => { const m = await base44.entities.Member.filter({ user_email: user?.email }); return m[0]; }, enabled: !!user?.email });
  useEffect(() => { if (member) setMemberData(member); }, [member]);

  const createMutation = useMutation({ mutationFn: (d) => base44.entities.CertificateLetter.create(d), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['certificate-letters'] }); setAddDialog(false); } });
  const updateMutation = useMutation({ mutationFn: ({ id, data }) => base44.entities.CertificateLetter.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['certificate-letters'] }); setEditDialog(false); } });
  const deleteMutation = useMutation({ mutationFn: (id) => base44.entities.CertificateLetter.delete(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['certificate-letters'] }); setDeleteDialog(false); } });

  const filteredLetters = letters.filter(l => { const m = l.member_name?.toLowerCase().includes(search.toLowerCase()) || l.nir?.toLowerCase().includes(search.toLowerCase()); if (!canEdit) return m && l.member_email === user?.email; return m; });
  const statusConfig = { 'Diterima': { color: 'bg-blue-100 text-blue-700', icon: Clock }, 'Proses': { color: 'bg-amber-100 text-amber-700', icon: FileText }, 'Selesai': { color: 'bg-green-100 text-green-700', icon: CheckCircle } };
  const columns = [
    { header: 'Nama', accessor: 'member_name', render: (r) => <span className="font-medium">{r.member_name}</span> },
    { header: 'NIR', accessor: 'nir' },
    { header: 'No. Surat', accessor: 'letter_number', render: (r) => r.letter_number || '-' },
    { header: 'Keperluan', accessor: 'purpose', render: (r) => <span className="text-sm">{r.purpose?.substring(0,50)}{r.purpose?.length > 50 ? '...' : ''}</span> },
    { header: 'Status', accessor: 'status', render: (r) => { const c = statusConfig[r.status]; const Icon = c?.icon || Clock; return <Badge className={c?.color}><Icon className="w-3 h-3 mr-1" />{r.status}</Badge>; } },
    { header: 'Berkas', accessor: 'file_url', render: (r) => r.file_url && r.status === 'Selesai' ? <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 flex items-center gap-1"><ExternalLink className="w-4 h-4" />Unduh</a> : '-' }
  ];

  const handleSave = async () => {
    if (editFormData.status === 'Selesai' && !editFormData.letter_number) { setLetterNumberError('Nomor urut harus diisi'); return; }
    let finalData = { ...editFormData };
    if (editFormData.status === 'Selesai' && editFormData.letter_number) {
      const monthRoman = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
      const now = new Date();
      finalData.letter_number = `DK.04.07/PARI.III.3573/${editFormData.letter_number}/${monthRoman[now.getMonth()]}/${now.getFullYear()}`;
    }
    updateMutation.mutate({ id: selectedLetter.id, data: finalData });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-sky-100 to-blue-100 rounded-xl p-4 border border-sky-200"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center"><Award className="w-6 h-6 text-blue-600" /></div><div><h1 className="text-2xl font-bold text-slate-800">Surat Keterangan</h1><p className="text-slate-500 mt-1">Pengajuan surat keterangan anggota</p></div></div><Button onClick={() => { setFormData({ purpose: '' }); setAddDialog(true); }} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Ajukan Surat</Button></div>
      <DataTable columns={columns} data={filteredLetters} searchValue={search} onSearch={setSearch} searchPlaceholder="Cari nama atau NIR..." onEdit={canEdit ? (l) => { setSelectedLetter(l); setEditFormData({ status: l.status, letter_number: l.letter_number || '' }); setLetterNumberError(''); setEditDialog(true); } : undefined} onDelete={canEdit ? (l) => { setSelectedLetter(l); setDeleteDialog(true); } : undefined} showExport={canEdit} isAdmin={canEdit} loading={isLoading} showActions={canEdit} />
      <Dialog open={addDialog} onOpenChange={setAddDialog}><DialogContent><DialogHeader><DialogTitle>Ajukan Surat Keterangan</DialogTitle></DialogHeader><div className="space-y-4 py-4"><div className="bg-slate-50 p-4 rounded-lg text-sm"><p><strong>Nama:</strong> {memberData?.full_name || '-'}</p><p><strong>NIR:</strong> {memberData?.nir || '-'}</p></div><div><Label>Keperluan Surat</Label><Textarea value={formData.purpose} onChange={(e) => setFormData({...formData, purpose: e.target.value})} rows={4} /></div></div><DialogFooter><Button variant="outline" onClick={() => setAddDialog(false)}>Batal</Button><Button onClick={() => createMutation.mutate({ member_email: user.email, member_name: memberData?.full_name, nir: memberData?.nir, birth_place_date: `${memberData?.birth_place}, ${memberData?.birth_date}`, institution: memberData?.work_institution, purpose: formData.purpose, status: 'Diterima' })} disabled={createMutation.isPending || !memberData}>{createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Ajukan</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={editDialog} onOpenChange={setEditDialog}><DialogContent><DialogHeader><DialogTitle>Update Status Surat</DialogTitle></DialogHeader><div className="space-y-4 py-4"><div className="bg-slate-50 p-4 rounded-lg text-sm"><p><strong>Pemohon:</strong> {selectedLetter?.member_name}</p><p><strong>Keperluan:</strong> {selectedLetter?.purpose}</p></div><div><Label>Status</Label><Select value={editFormData.status} onValueChange={(v) => setEditFormData({...editFormData, status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Diterima">Diterima</SelectItem><SelectItem value="Proses">Proses</SelectItem><SelectItem value="Selesai">Selesai</SelectItem></SelectContent></Select></div>{editFormData.status === 'Selesai' && <div><Label>Nomor Urut Surat *</Label><Input value={editFormData.letter_number || ''} onChange={(e) => { setEditFormData({...editFormData, letter_number: e.target.value}); setLetterNumberError(''); }} placeholder="001" />{letterNumberError && <p className="text-sm text-red-500 mt-1">{letterNumberError}</p>}</div>}</div><DialogFooter><Button variant="outline" onClick={() => setEditDialog(false)}>Batal</Button><Button onClick={handleSave} disabled={updateMutation.isPending}>{updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Simpan</Button></DialogFooter></DialogContent></Dialog>
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus Pengajuan?</AlertDialogTitle><AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteMutation.mutate(selectedLetter.id)}>Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}