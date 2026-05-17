import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DataTable from '@/components/ui/DataTable';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, CheckCircle, XCircle, Shield, User, Plus, UserCog, Wallet, FileSignature, Calendar, Upload } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Navigate, useOutletContext } from 'react-router-dom';
import CSVImporter from '@/components/ui/CSVImporter';
import UserCSVImporter from '@/components/ui/UserCSVImporter';

export default function UserManagement() {
  const { user } = useOutletContext();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [importDialog, setImportDialog] = useState(false);
  const [inviteDialog, setInviteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ email: '', full_name: '', role: 'user', status: 'approved' });

  const { data: users = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: () => base44.entities.User.list() });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditDialog(false);
      setSelectedUser(null);
      if (variables.data.status === 'approved') {
        const approvedUser = users.find(u => u.id === variables.id);
        // Email notification removed
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.User.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); setDeleteDialog(false); setSelectedUser(null); }
  });

  const filteredUsers = users.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()) || u.full_name?.toLowerCase().includes(search.toLowerCase()));

  const handleEdit = (userData) => {
    setSelectedUser(userData);
    setFormData({ role: userData.role, status: userData.status || 'pending', is_pengurus: userData.is_pengurus || false, is_bendahara: userData.is_bendahara || false, is_sekretaris: userData.is_sekretaris || false, is_panitia: userData.is_panitia || false });
    setEditDialog(true);
  };

  const handleDelete = (userData) => { setSelectedUser(userData); setDeleteDialog(true); };
  const handleSave = () => { updateMutation.mutate({ id: selectedUser.id, data: formData }); };

  const columns = [
    { header: 'Email', accessor: 'email', render: (row) => <span className="font-medium text-slate-800">{row.email}</span> },
    { header: 'Nama', accessor: 'full_name', render: (row) => row.full_name || '-' },
    { header: 'Role', accessor: 'role', render: (row) => <Badge variant={row.role === 'admin' ? 'default' : 'secondary'}>{row.role === 'admin' ? <><Shield className="w-3 h-3 mr-1" />Admin</> : <><User className="w-3 h-3 mr-1" />Anggota</>}</Badge> },
    { header: 'Status', accessor: 'status', render: (row) => { const s = row.status || 'pending'; const c = { pending: 'bg-amber-100 text-amber-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' }; return <Badge className={c[s]}>{s === 'pending' ? 'Menunggu' : s === 'approved' ? 'Disetujui' : 'Ditolak'}</Badge>; } },
    { header: 'Registrasi', accessor: 'is_registered', render: (row) => <Badge variant={row.is_registered ? 'default' : 'outline'}>{row.is_registered ? 'Sudah' : 'Belum'}</Badge> },
    { header: 'Pengurus', accessor: 'is_pengurus', render: (row) => row.is_pengurus ? <Badge className="bg-purple-100 text-purple-700 border-0"><UserCog className="w-3 h-3 mr-1" />Pengurus</Badge> : <Badge variant="outline" className="text-slate-400">-</Badge> },
    { header: 'Bendahara', accessor: 'is_bendahara', render: (row) => row.is_bendahara ? <Badge className="bg-emerald-100 text-emerald-700 border-0"><Wallet className="w-3 h-3 mr-1" />Bendahara</Badge> : <Badge variant="outline" className="text-slate-400">-</Badge> },
    { header: 'Sekretaris', accessor: 'is_sekretaris', render: (row) => row.is_sekretaris ? <Badge className="bg-orange-100 text-orange-700 border-0"><FileSignature className="w-3 h-3 mr-1" />Sekretaris</Badge> : <Badge variant="outline" className="text-slate-400">-</Badge> },
    { header: 'Panitia', accessor: 'is_panitia', render: (row) => row.is_panitia ? <Badge className="bg-cyan-100 text-cyan-700 border-0"><Calendar className="w-3 h-3 mr-1" />Panitia</Badge> : <Badge variant="outline" className="text-slate-400">-</Badge> },
  ];

  if (user?.role !== 'admin') return <Navigate to="/Beranda" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-sky-100 to-blue-100 rounded-xl p-4 border border-sky-200">
        <div className="flex items-center gap-3"><div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center"><UserCog className="w-6 h-6 text-blue-600" /></div><div><h1 className="text-2xl font-bold text-slate-800">Manajemen User</h1><p className="text-slate-500 mt-1">Kelola akun pengguna aplikasi</p></div></div>
        <Button onClick={() => setInviteDialog(true)} variant="outline" className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"><Upload className="w-4 h-4" />Import CSV</Button>
      </div>
      <DataTable columns={columns} data={filteredUsers} searchValue={search} onSearch={setSearch} searchPlaceholder="Cari berdasarkan email atau nama..." onEdit={handleEdit} onDelete={handleDelete} onImport={() => setImportDialog(true)} showImport={true} showExport={true} isAdmin={true} exportTitle="Data Pengguna" loading={isLoading} />

      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Email</Label><Input value={selectedUser?.email || ''} disabled /></div>
            <div><Label>Role</Label><Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="user">Anggota</SelectItem></SelectContent></Select></div>
            <div><Label>Status</Label><Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">Menunggu</SelectItem><SelectItem value="approved">Disetujui</SelectItem><SelectItem value="rejected">Ditolak</SelectItem></SelectContent></Select></div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100"><div><Label className="text-sm font-medium text-purple-800">Akses Ruang Pengurus</Label></div><Switch checked={!!formData.is_pengurus} onCheckedChange={(v) => setFormData({...formData, is_pengurus: v})} /></div>
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100"><div><Label className="text-sm font-medium text-emerald-800">Bendahara</Label></div><Switch checked={!!formData.is_bendahara} onCheckedChange={(v) => setFormData({...formData, is_bendahara: v})} /></div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100"><div><Label className="text-sm font-medium text-orange-800">Sekretaris</Label></div><Switch checked={!!formData.is_sekretaris} onCheckedChange={(v) => setFormData({...formData, is_sekretaris: v})} /></div>
            <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg border border-cyan-100"><div><Label className="text-sm font-medium text-cyan-800">Panitia Event</Label></div><Switch checked={!!formData.is_panitia} onCheckedChange={(v) => setFormData({...formData, is_panitia: v})} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditDialog(false)}>Batal</Button><Button onClick={handleSave} disabled={updateMutation.isPending}>{updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus User?</AlertDialogTitle><AlertDialogDescription>Apakah Anda yakin ingin menghapus user {selectedUser?.email}?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteMutation.mutate(selectedUser.id)}>Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>

      <CSVImporter open={importDialog} onOpenChange={setImportDialog} entityName="User" onSuccess={() => queryClient.invalidateQueries({ queryKey: ['users'] })} />
      <UserCSVImporter open={inviteDialog} onOpenChange={setInviteDialog} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['users'] })} />
    </div>
  );
}