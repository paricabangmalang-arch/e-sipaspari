import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, Plus, ExternalLink, Pencil, Trash2, Search, Building2, BookOpen, Shield, GraduationCap, FileText, Download, Upload } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import CSVImporter from '@/components/ui/CSVImporter';

const FILE_TYPES = [{ value: 'Peraturan Pemerintah', icon: Building2 }, { value: 'Peraturan PARI', icon: Shield }, { value: 'Peraturan Bapeten', icon: FileText }, { value: 'Ilmiah', icon: GraduationCap }];

export default function DownloadPage() {
  const { user } = useOutletContext();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('Peraturan Pemerintah');
  const [search, setSearch] = useState('');
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({ file_type: '', title: '', file_url: '' });
  const [importDialog, setImportDialog] = useState(false);
  const isAdmin = user?.role === 'admin';

  const { data: downloads = [], isLoading } = useQuery({ queryKey: ['downloads'], queryFn: () => base44.entities.Download.list() });
  const createMutation = useMutation({ mutationFn: (d) => base44.entities.Download.create(d), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['downloads'] }); setAddDialog(false); } });
  const updateMutation = useMutation({ mutationFn: ({ id, data }) => base44.entities.Download.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['downloads'] }); setEditDialog(false); } });
  const deleteMutation = useMutation({ mutationFn: (id) => base44.entities.Download.delete(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['downloads'] }); setDeleteDialog(false); } });

  const filteredDownloads = downloads.filter(d => d.file_type === activeTab && d.title?.toLowerCase().includes(search.toLowerCase()));
  const getIcon = (type) => FILE_TYPES.find(f => f.value === type)?.icon || FileText;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-sky-100 to-blue-100 rounded-xl p-4 border border-sky-200"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center"><Download className="w-6 h-6 text-blue-600" /></div><div><h1 className="text-2xl font-bold text-slate-800">Download</h1><p className="text-slate-500 mt-1">Unduh berkas dan dokumen</p></div></div>{isAdmin && <div className="flex gap-2"><Button variant="outline" onClick={() => setImportDialog(true)} className="border-blue-300 text-blue-700 hover:bg-blue-50"><Upload className="w-4 h-4 mr-2" />Import</Button><Button onClick={() => { setFormData({ file_type: activeTab, title: '', file_url: '' }); setAddDialog(true); }} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Tambah Berkas</Button></div>}</div>
      <Card className="shadow-sm border-slate-100">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="border-b"><TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">{FILE_TYPES.map(t => { const Icon = t.icon; return <TabsTrigger key={t.value} value={t.value} className="flex items-center gap-2"><Icon className="w-4 h-4" /><span className="hidden sm:inline">{t.value}</span></TabsTrigger>; })}</TabsList></CardHeader>
          <CardContent className="p-6">
            <div className="relative w-full sm:w-72 mb-6"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="Cari berkas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
            {isLoading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div> : filteredDownloads.length === 0 ? <div className="text-center py-12 text-slate-500"><BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" /><p>Tidak ada berkas</p></div> : (
              <div className="grid gap-4">{filteredDownloads.map(file => { const Icon = getIcon(file.file_type); return (
                <div key={file.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-4"><div className="p-3 bg-white rounded-lg shadow-sm"><Icon className="w-5 h-5 text-blue-600" /></div><div><h4 className="font-medium text-slate-800">{file.title}</h4><Badge variant="outline" className="mt-1 text-xs">{file.file_type}</Badge></div></div>
                  <div className="flex items-center gap-2"><a href={file.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"><ExternalLink className="w-4 h-4" />Unduh</a>{isAdmin && <><Button variant="ghost" size="icon" onClick={() => { setSelectedFile(file); setFormData({...file}); setEditDialog(true); }}><Pencil className="w-4 h-4 text-blue-500" /></Button><Button variant="ghost" size="icon" onClick={() => { setSelectedFile(file); setDeleteDialog(true); }}><Trash2 className="w-4 h-4 text-red-500" /></Button></>}</div>
                </div>); })}</div>
            )}
          </CardContent>
        </Tabs>
      </Card>
      <Dialog open={addDialog} onOpenChange={setAddDialog}><DialogContent><DialogHeader><DialogTitle>Tambah Berkas</DialogTitle></DialogHeader><div className="space-y-4 py-4"><div><Label>Jenis Berkas</Label><Select value={formData.file_type} onValueChange={(v) => setFormData({...formData, file_type: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{FILE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.value}</SelectItem>)}</SelectContent></Select></div><div><Label>Judul</Label><Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} /></div><div><Label>Link Google Drive</Label><Input value={formData.file_url} onChange={(e) => setFormData({...formData, file_url: e.target.value})} /></div></div><DialogFooter><Button variant="outline" onClick={() => setAddDialog(false)}>Batal</Button><Button onClick={() => createMutation.mutate(formData)} disabled={createMutation.isPending}>{createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Simpan</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={editDialog} onOpenChange={setEditDialog}><DialogContent><DialogHeader><DialogTitle>Edit Berkas</DialogTitle></DialogHeader><div className="space-y-4 py-4"><div><Label>Judul</Label><Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} /></div><div><Label>Link</Label><Input value={formData.file_url} onChange={(e) => setFormData({...formData, file_url: e.target.value})} /></div></div><DialogFooter><Button variant="outline" onClick={() => setEditDialog(false)}>Batal</Button><Button onClick={() => updateMutation.mutate({ id: selectedFile.id, data: formData })} disabled={updateMutation.isPending}>Simpan</Button></DialogFooter></DialogContent></Dialog>
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus Berkas?</AlertDialogTitle><AlertDialogDescription>Hapus "{selectedFile?.title}"?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteMutation.mutate(selectedFile.id)}>Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <CSVImporter open={importDialog} onOpenChange={setImportDialog} entityName="Download" onSuccess={() => queryClient.invalidateQueries({ queryKey: ['downloads'] })} />
    </div>
  );
}