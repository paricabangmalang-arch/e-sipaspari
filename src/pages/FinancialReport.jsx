import React, { useState } from 'react';
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
import { Loader2, ExternalLink, Plus, Wallet } from 'lucide-react';
import CSVImporter from '@/components/ui/CSVImporter';
import { useOutletContext } from 'react-router-dom';

export default function FinancialReport() {
  const { user } = useOutletContext();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [importDialog, setImportDialog] = useState(false);
  const [formData, setFormData] = useState({ report_type: '', description: '', period: '', file_url: '' });

  const canEdit = user?.role === 'admin' || user?.is_bendahara;
  const { data: reports = [], isLoading } = useQuery({ queryKey: ['financial-reports'], queryFn: () => base44.entities.FinancialReport.list('-created_date') });
  const createMutation = useMutation({ mutationFn: (d) => base44.entities.FinancialReport.create(d), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['financial-reports'] }); setAddDialog(false); } });
  const updateMutation = useMutation({ mutationFn: ({ id, data }) => base44.entities.FinancialReport.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['financial-reports'] }); setEditDialog(false); } });
  const deleteMutation = useMutation({ mutationFn: (id) => base44.entities.FinancialReport.delete(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['financial-reports'] }); setDeleteDialog(false); } });

  const filteredReports = reports.filter(r => r.description?.toLowerCase().includes(search.toLowerCase()) || r.period?.toLowerCase().includes(search.toLowerCase()));
  const columns = [
    { header: 'Jenis', accessor: 'report_type', render: (r) => <Badge variant="outline">{r.report_type}</Badge> },
    { header: 'Deskripsi', accessor: 'description' },
    { header: 'Periode', accessor: 'period' },
    { header: 'Berkas', accessor: 'file_url', render: (r) => r.file_url ? <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 flex items-center gap-1"><ExternalLink className="w-4 h-4" />Lihat</a> : '-' }
  ];

  const FormFields = () => (
    <div className="space-y-4 py-4">
      <div><Label>Jenis Laporan</Label><Select value={formData.report_type} onValueChange={(v) => setFormData({...formData, report_type: v})}><SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger><SelectContent><SelectItem value="Bulanan">Bulanan</SelectItem><SelectItem value="Tahunan">Tahunan</SelectItem><SelectItem value="Insidentil">Insidentil</SelectItem></SelectContent></Select></div>
      <div><Label>Deskripsi</Label><Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
      <div><Label>Periode</Label><Input value={formData.period} onChange={(e) => setFormData({...formData, period: e.target.value})} placeholder="contoh: Januari 2024" /></div>
      <div><Label>Link Google Drive</Label><Input value={formData.file_url} onChange={(e) => setFormData({...formData, file_url: e.target.value})} placeholder="https://drive.google.com/..." /></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-sky-100 to-blue-100 rounded-xl p-4 border border-sky-200"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center"><Wallet className="w-6 h-6 text-blue-600" /></div><div><h1 className="text-2xl font-bold text-slate-800">Laporan Keuangan</h1><p className="text-slate-500 mt-1">Kelola laporan keuangan organisasi</p></div></div>{canEdit && <Button onClick={() => { setFormData({ report_type:'', description:'', period:'', file_url:'' }); setAddDialog(true); }} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Tambah</Button>}</div>
      <DataTable columns={columns} data={filteredReports} searchValue={search} onSearch={setSearch} searchPlaceholder="Cari deskripsi atau periode..." onEdit={canEdit ? (r) => { setSelectedReport(r); setFormData({...r}); setEditDialog(true); } : undefined} onDelete={canEdit ? (r) => { setSelectedReport(r); setDeleteDialog(true); } : undefined} onImport={canEdit ? () => setImportDialog(true) : undefined} showImport={canEdit} showExport={canEdit} isAdmin={canEdit} loading={isLoading} showActions={canEdit} />
      <Dialog open={addDialog} onOpenChange={setAddDialog}><DialogContent><DialogHeader><DialogTitle>Tambah Laporan</DialogTitle></DialogHeader><FormFields /><DialogFooter><Button variant="outline" onClick={() => setAddDialog(false)}>Batal</Button><Button onClick={() => createMutation.mutate(formData)} disabled={createMutation.isPending}>{createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Simpan</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={editDialog} onOpenChange={setEditDialog}><DialogContent><DialogHeader><DialogTitle>Edit Laporan</DialogTitle></DialogHeader><FormFields /><DialogFooter><Button variant="outline" onClick={() => setEditDialog(false)}>Batal</Button><Button onClick={() => updateMutation.mutate({ id: selectedReport.id, data: formData })} disabled={updateMutation.isPending}>{updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Simpan</Button></DialogFooter></DialogContent></Dialog>
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus Laporan?</AlertDialogTitle><AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteMutation.mutate(selectedReport.id)}>Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <CSVImporter open={importDialog} onOpenChange={setImportDialog} entityName="FinancialReport" onSuccess={() => queryClient.invalidateQueries({ queryKey: ['financial-reports'] })} />
    </div>
  );
}