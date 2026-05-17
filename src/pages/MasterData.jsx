import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Building2, MapPin, Loader2, Search, Upload } from 'lucide-react';
import CSVImporter from '@/components/ui/CSVImporter';
import { Navigate, useOutletContext } from 'react-router-dom';

export default function MasterData() {
  const { user } = useOutletContext();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('instansi');
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [importDialog, setImportDialog] = useState(false);

  const { data: institutions = [], isLoading: iL } = useQuery({ queryKey: ['institutions'], queryFn: () => base44.entities.Institution.list() });
  const { data: provinces = [], isLoading: pL } = useQuery({ queryKey: ['provinces'], queryFn: () => base44.entities.Province.list() });

  const instMut = useMutation({ mutationFn: (d) => selectedItem ? base44.entities.Institution.update(selectedItem.id, d) : base44.entities.Institution.create(d), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['institutions'] }); setDialog(false); setSelectedItem(null); setFormData({ name: '' }); } });
  const provMut = useMutation({ mutationFn: (d) => selectedItem ? base44.entities.Province.update(selectedItem.id, d) : base44.entities.Province.create(d), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['provinces'] }); setDialog(false); setSelectedItem(null); setFormData({ name: '' }); } });
  const delInstMut = useMutation({ mutationFn: (id) => base44.entities.Institution.delete(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['institutions'] }); setDeleteDialog(false); } });
  const delProvMut = useMutation({ mutationFn: (id) => base44.entities.Province.delete(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['provinces'] }); setDeleteDialog(false); } });

  const handleAdd = () => { setSelectedItem(null); setFormData({ name: '' }); setDialog(true); };
  const handleEdit = (item) => { setSelectedItem(item); setFormData({ name: item.name }); setDialog(true); };
  const handleDelete = (item) => { setSelectedItem(item); setDeleteDialog(true); };
  const handleSave = () => { activeTab === 'instansi' ? instMut.mutate(formData) : provMut.mutate(formData); };
  const handleConfirmDelete = () => { activeTab === 'instansi' ? delInstMut.mutate(selectedItem.id) : delProvMut.mutate(selectedItem.id); };

  const filteredInst = institutions.filter(i => i.name?.toLowerCase().includes(search.toLowerCase()));
  const filteredProv = provinces.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

  const DataList = ({ data, loading, icon: Icon }) => (
    <div className="space-y-2">
      {loading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div> : data.length === 0 ? <div className="text-center py-8 text-slate-500">Tidak ada data</div> : data.map(item => (
        <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
          <div className="flex items-center gap-3"><div className="p-2 bg-white rounded-lg"><Icon className="w-4 h-4 text-slate-600" /></div><span className="font-medium text-slate-800">{item.name}</span></div>
          <div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="w-4 h-4 text-blue-500" /></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(item)}><Trash2 className="w-4 h-4 text-red-500" /></Button></div>
        </div>
      ))}
    </div>
  );

  if (user?.role !== 'admin') return <Navigate to="/Beranda" />;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-sky-100 to-blue-100 rounded-xl p-4 border border-sky-200 flex items-center gap-3"><div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center"><Building2 className="w-6 h-6 text-blue-600" /></div><div><h1 className="text-2xl font-bold text-slate-800">Master Data</h1><p className="text-slate-500 mt-1">Kelola data instansi dan provinsi</p></div></div>
      <Card className="shadow-sm border-slate-100">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="border-b"><TabsList className="grid w-full max-w-md grid-cols-2"><TabsTrigger value="instansi" className="flex items-center gap-2"><Building2 className="w-4 h-4" />Instansi</TabsTrigger><TabsTrigger value="provinsi" className="flex items-center gap-2"><MapPin className="w-4 h-4" />Provinsi</TabsTrigger></TabsList></CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-between mb-6">
              <div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="Cari..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
              <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setImportDialog(true)}><Upload className="w-4 h-4 mr-2" />Import</Button><Button size="sm" onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Tambah</Button></div>
            </div>
            <TabsContent value="instansi" className="mt-0"><DataList data={filteredInst} loading={iL} icon={Building2} /></TabsContent>
            <TabsContent value="provinsi" className="mt-0"><DataList data={filteredProv} loading={pL} icon={MapPin} /></TabsContent>
          </CardContent>
        </Tabs>
      </Card>
      <Dialog open={dialog} onOpenChange={setDialog}><DialogContent><DialogHeader><DialogTitle>{selectedItem ? 'Edit' : 'Tambah'} {activeTab === 'instansi' ? 'Instansi' : 'Provinsi'}</DialogTitle></DialogHeader><div className="py-4"><Label>Nama</Label><Input value={formData.name} onChange={(e) => setFormData({ name: e.target.value })} placeholder="Masukkan nama" /></div><DialogFooter><Button variant="outline" onClick={() => setDialog(false)}>Batal</Button><Button onClick={handleSave} disabled={instMut.isPending || provMut.isPending}>{(instMut.isPending || provMut.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Simpan</Button></DialogFooter></DialogContent></Dialog>
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus Data?</AlertDialogTitle><AlertDialogDescription>Hapus "{selectedItem?.name}"?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleConfirmDelete}>Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <CSVImporter open={importDialog} onOpenChange={setImportDialog} entityName={activeTab === 'instansi' ? 'Institution' : 'Province'} onSuccess={() => { queryClient.invalidateQueries({ queryKey: ['institutions'] }); queryClient.invalidateQueries({ queryKey: ['provinces'] }); }} />
    </div>
  );
}