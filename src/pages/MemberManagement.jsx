import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DataTable from '@/components/ui/DataTable';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, Plus, Upload, User, CheckCircle } from 'lucide-react';
import CSVImporter from '@/components/ui/CSVImporter';
import moment from 'moment';
import { useOutletContext } from 'react-router-dom';

export default function MemberManagement() {
  const { user } = useOutletContext();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [viewDialog, setViewDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [importDialog, setImportDialog] = useState(false);
  const [addDialog, setAddDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [profileData, setProfileData] = useState({ full_name: '', nir: '', gender: '', birth_place: '', birth_date: '', address: '', education: '', education_institution: '', graduation_year: '', sip_number: '', sip_end_date: '', work_institution: '', employment_status: '' });
  const [formData, setFormData] = useState({ user_email: '', full_name: '', nir: '', gender: '', birth_place: '', birth_date: '', address: '', education: '', education_institution: '', graduation_year: '', sip_number: '', sip_end_date: '', work_institution: '', employment_status: '' });

  const isAdmin = user?.role === 'admin';
  const canEdit = isAdmin || user?.is_sekretaris;

  const { data: members = [], isLoading } = useQuery({ queryKey: ['members'], queryFn: () => base44.entities.Member.list() });
  const { data: institutions = [] } = useQuery({ queryKey: ['institutions'], queryFn: () => base44.entities.Institution.list() });
  const { data: myMemberData } = useQuery({ queryKey: ['my-member', user?.email], queryFn: () => base44.entities.Member.filter({ user_email: user.email }), enabled: !isAdmin && !!user?.email });

  useEffect(() => {
    if (myMemberData?.length > 0) { const m = myMemberData[0]; setProfileData({ full_name: m.full_name||'', nir: m.nir||'', gender: m.gender||'', birth_place: m.birth_place||'', birth_date: m.birth_date||'', address: m.address||'', education: m.education||'', education_institution: m.education_institution||'', graduation_year: m.graduation_year||'', sip_number: m.sip_number||'', sip_end_date: m.sip_end_date||'', work_institution: m.work_institution||'', employment_status: m.employment_status||'' }); if (m.photo_url) setPhotoPreview(m.photo_url); }
    else if (user) setProfileData(prev => ({...prev, full_name: user.full_name||''}));
  }, [myMemberData, user]);

  const handleSaveProfile = async () => {
    setProfileSaving(true); setProfileSuccess(false);
    let photoUrl = myMemberData?.[0]?.photo_url || '';
    if (photoFile) { const { file_url } = await base44.integrations.Core.UploadFile({ file: photoFile }); photoUrl = file_url; }
    const data = { ...profileData, user_email: user.email, photo_url: photoUrl, graduation_year: parseInt(profileData.graduation_year) || 0, is_registered: true };
    if (myMemberData?.length > 0) await base44.entities.Member.update(myMemberData[0].id, data);
    else await base44.entities.Member.create(data);
    await base44.auth.updateMe({ is_registered: true });
    queryClient.invalidateQueries({ queryKey: ['my-member', user?.email] });
    setProfileSaving(false); setProfileSuccess(true); setTimeout(() => setProfileSuccess(false), 3000);
  };

  const createMutation = useMutation({ mutationFn: (d) => base44.entities.Member.create(d), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['members'] }); setAddDialog(false); } });
  const updateMutation = useMutation({ mutationFn: ({ id, data }) => base44.entities.Member.update(id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['members'] }); setEditDialog(false); } });
  const deleteMutation = useMutation({ mutationFn: (id) => base44.entities.Member.delete(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['members'] }); setDeleteDialog(false); } });

  const filteredMembers = members.filter(m => m.full_name?.toLowerCase().includes(search.toLowerCase()) || m.nir?.toLowerCase().includes(search.toLowerCase()) || m.work_institution?.toLowerCase().includes(search.toLowerCase()));
  const getSIPStatus = (d) => { if (!d) return null; const days = moment(d).diff(moment(),'days'); if (days < 0) return { color: 'bg-red-900', days }; if (days <= 30) return { color: 'bg-red-500', days }; if (days <= 90) return { color: 'bg-yellow-500', days }; return { color: 'bg-green-500', days }; };

  const adminColumns = [
    { header: 'Anggota', render: (r) => <div className="flex items-center gap-3"><Avatar><AvatarImage src={r.photo_url} /><AvatarFallback>{r.full_name?.charAt(0)}</AvatarFallback></Avatar><div><p className="font-medium text-slate-800">{r.full_name}</p><p className="text-sm text-slate-500">{r.nir}</p></div></div> },
    { header: 'Jenis Kelamin', accessor: 'gender' }, { header: 'Pendidikan', accessor: 'education' }, { header: 'Instansi', accessor: 'work_institution' },
    { header: 'Status Pegawai', accessor: 'employment_status', render: (r) => <Badge variant="outline">{r.employment_status}</Badge> },
    { header: 'Status SIP', render: (r) => { const s = getSIPStatus(r.sip_end_date); if (!s) return '-'; return <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${s.color}`} /><span className="text-xs">{s.days < 0 ? 'Expired' : `${s.days} hari`}</span></div>; } }
  ];
  const userColumns = [{ header: 'Nama', render: (r) => <span className="font-medium">{r.full_name}</span> }, { header: 'NIR', accessor: 'nir' }, { header: 'Jenis Kelamin', accessor: 'gender' }, { header: 'Instansi', accessor: 'work_institution' }];

  const ProfileForm = () => (
    <Card><CardHeader><CardTitle>Data Diri Anggota</CardTitle></CardHeader><CardContent>
      {profileSuccess && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2"><CheckCircle className="w-4 h-4" />Data berhasil disimpan!</div>}
      <div className="flex flex-col items-center mb-6">
        <div className="w-32 h-40 bg-slate-100 rounded-lg overflow-hidden mb-3 border-2 border-dashed border-slate-300">{photoPreview ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-slate-400"><User className="w-8 h-8 mb-2" /><span className="text-xs">Foto</span></div>}</div>
        <Label htmlFor="profile-photo" className="cursor-pointer"><div className="flex items-center gap-2 text-blue-600"><Upload className="w-4 h-4" /><span className="text-sm font-medium">Upload Foto</span></div></Label>
        <Input id="profile-photo" type="file" accept="image/*" className="hidden" onChange={(e) => { const f=e.target.files[0]; if(f){setPhotoFile(f); const r=new FileReader(); r.onloadend=()=>setPhotoPreview(r.result); r.readAsDataURL(f);}}} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2"><Label>Nama Lengkap dengan Gelar</Label><Input value={profileData.full_name} onChange={(e) => setProfileData({...profileData, full_name: e.target.value})} /></div>
        <div><Label>NIR</Label><Input value={profileData.nir} onChange={(e) => setProfileData({...profileData, nir: e.target.value})} /></div>
        <div><Label>Jenis Kelamin</Label><Select value={profileData.gender} onValueChange={(v) => setProfileData({...profileData, gender: v})}><SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger><SelectContent><SelectItem value="Laki-laki">Laki-laki</SelectItem><SelectItem value="Perempuan">Perempuan</SelectItem></SelectContent></Select></div>
        <div><Label>Tempat Lahir</Label><Input value={profileData.birth_place} onChange={(e) => setProfileData({...profileData, birth_place: e.target.value})} /></div>
        <div><Label>Tanggal Lahir</Label><Input type="date" value={profileData.birth_date} onChange={(e) => setProfileData({...profileData, birth_date: e.target.value})} /></div>
        <div className="md:col-span-2"><Label>Alamat</Label><Textarea value={profileData.address} onChange={(e) => setProfileData({...profileData, address: e.target.value})} /></div>
        <div><Label>Pendidikan</Label><Select value={profileData.education} onValueChange={(v) => setProfileData({...profileData, education: v})}><SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger><SelectContent><SelectItem value="D3">D3</SelectItem><SelectItem value="D4">D4</SelectItem><SelectItem value="S1">S1</SelectItem><SelectItem value="S2">S2</SelectItem></SelectContent></Select></div>
        <div><Label>Institusi Pendidikan</Label><Input value={profileData.education_institution} onChange={(e) => setProfileData({...profileData, education_institution: e.target.value})} /></div>
        <div><Label>Tahun Lulus</Label><Input type="number" value={profileData.graduation_year} onChange={(e) => setProfileData({...profileData, graduation_year: e.target.value})} /></div>
        <div><Label>No. SIP</Label><Input value={profileData.sip_number} onChange={(e) => setProfileData({...profileData, sip_number: e.target.value})} /></div>
        <div><Label>Periode Akhir SIP</Label><Input type="date" value={profileData.sip_end_date} onChange={(e) => setProfileData({...profileData, sip_end_date: e.target.value})} /></div>
        <div><Label>Instansi Kerja</Label><Select value={profileData.work_institution} onValueChange={(v) => setProfileData({...profileData, work_institution: v})}><SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger><SelectContent>{institutions.map(i => <SelectItem key={i.id} value={i.name}>{i.name}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Status Pegawai</Label><Select value={profileData.employment_status} onValueChange={(v) => setProfileData({...profileData, employment_status: v})}><SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger><SelectContent><SelectItem value="PNS">PNS</SelectItem><SelectItem value="PPPK">PPPK</SelectItem><SelectItem value="Kontrak">Kontrak</SelectItem><SelectItem value="Honorer">Honorer</SelectItem><SelectItem value="Swasta">Swasta</SelectItem></SelectContent></Select></div>
      </div>
      <Button onClick={handleSaveProfile} disabled={profileSaving} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 h-11">{profileSaving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Menyimpan...</> : <><CheckCircle className="w-4 h-4 mr-2" />Simpan Data</>}</Button>
    </CardContent></Card>
  );

  const isFirstTime = !isAdmin && (!myMemberData || myMemberData.length === 0);

  return (
    <div className="space-y-6">
      {isFirstTime && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800">Selamat datang! Silakan lengkapi data profil Anda</p>
            <p className="text-sm text-amber-700 mt-1">Harap isi data diri Anda pada tab "Profil Saya" di bawah ini agar dapat menggunakan semua fitur aplikasi.</p>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center bg-gradient-to-r from-sky-100 to-blue-100 rounded-xl p-4 border border-sky-200"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center"><User className="w-6 h-6 text-blue-600" /></div><div><h1 className="text-2xl font-bold text-slate-800">Manajemen Anggota</h1><p className="text-slate-500 mt-1">Data anggota PARI Kota Malang</p></div></div>{canEdit && <Button onClick={() => { setFormData({ user_email:'',full_name:'',nir:'',gender:'',birth_place:'',birth_date:'',address:'',education:'',education_institution:'',graduation_year:'',sip_number:'',sip_end_date:'',work_institution:'',employment_status:'' }); setAddDialog(true); }} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Tambah Anggota</Button>}</div>
      <Tabs defaultValue={isAdmin ? "daftar" : "profil"}><TabsList className="mb-4">{!isAdmin && <TabsTrigger value="profil">Profil Saya</TabsTrigger>}<TabsTrigger value="daftar">Daftar Anggota</TabsTrigger></TabsList>
        {!isAdmin && <TabsContent value="profil"><ProfileForm /></TabsContent>}
        <TabsContent value="daftar"><DataTable columns={canEdit ? adminColumns : userColumns} data={filteredMembers} searchValue={search} onSearch={setSearch} searchPlaceholder="Cari nama, NIR, atau instansi..." onView={(m) => { setSelectedMember(m); setViewDialog(true); }} onEdit={canEdit ? (m) => { setSelectedMember(m); setFormData({...m}); setEditDialog(true); } : undefined} onDelete={canEdit ? (m) => { setSelectedMember(m); setDeleteDialog(true); } : undefined} onImport={canEdit ? () => setImportDialog(true) : undefined} showImport={canEdit} showExport={canEdit} isAdmin={canEdit} loading={isLoading} /></TabsContent>
      </Tabs>

      <Dialog open={viewDialog} onOpenChange={setViewDialog}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Detail Anggota</DialogTitle></DialogHeader>{selectedMember && <div className="space-y-6"><div className="flex items-center gap-4"><Avatar className="w-24 h-24"><AvatarImage src={selectedMember.photo_url} /><AvatarFallback className="text-2xl">{selectedMember.full_name?.charAt(0)}</AvatarFallback></Avatar><div><h3 className="text-xl font-bold">{selectedMember.full_name}</h3><p className="text-slate-500">NIR: {selectedMember.nir}</p></div></div>{canEdit && <div className="grid grid-cols-2 gap-4 text-sm"><div><p className="text-slate-500">Jenis Kelamin</p><p className="font-medium">{selectedMember.gender}</p></div><div><p className="text-slate-500">TTL</p><p className="font-medium">{selectedMember.birth_place}, {selectedMember.birth_date}</p></div><div><p className="text-slate-500">Instansi</p><p className="font-medium">{selectedMember.work_institution}</p></div><div><p className="text-slate-500">Status</p><p className="font-medium">{selectedMember.employment_status}</p></div></div>}</div>}</DialogContent></Dialog>
      <Dialog open={editDialog} onOpenChange={setEditDialog}><DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Edit Anggota</DialogTitle></DialogHeader><div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4"><div className="md:col-span-2"><Label>Nama</Label><Input value={formData.full_name||''} onChange={(e) => setFormData({...formData, full_name: e.target.value})} /></div><div><Label>NIR</Label><Input value={formData.nir||''} onChange={(e) => setFormData({...formData, nir: e.target.value})} /></div><div><Label>Jenis Kelamin</Label><Select value={formData.gender} onValueChange={(v) => setFormData({...formData, gender: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Laki-laki">Laki-laki</SelectItem><SelectItem value="Perempuan">Perempuan</SelectItem></SelectContent></Select></div></div><DialogFooter><Button variant="outline" onClick={() => setEditDialog(false)}>Batal</Button><Button onClick={() => updateMutation.mutate({ id: selectedMember.id, data: {...formData, graduation_year: parseInt(formData.graduation_year)} })} disabled={updateMutation.isPending}>{updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Simpan</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={addDialog} onOpenChange={setAddDialog}><DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Tambah Anggota</DialogTitle></DialogHeader><div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4"><div><Label>Email</Label><Input value={formData.user_email||''} onChange={(e) => setFormData({...formData, user_email: e.target.value})} /></div><div><Label>Nama</Label><Input value={formData.full_name||''} onChange={(e) => setFormData({...formData, full_name: e.target.value})} /></div><div><Label>NIR</Label><Input value={formData.nir||''} onChange={(e) => setFormData({...formData, nir: e.target.value})} /></div></div><DialogFooter><Button variant="outline" onClick={() => setAddDialog(false)}>Batal</Button><Button onClick={() => createMutation.mutate({...formData, graduation_year: parseInt(formData.graduation_year)})} disabled={createMutation.isPending}>{createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Simpan</Button></DialogFooter></DialogContent></Dialog>
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus Anggota?</AlertDialogTitle><AlertDialogDescription>Hapus data {selectedMember?.full_name}?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteMutation.mutate(selectedMember.id)}>Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <CSVImporter open={importDialog} onOpenChange={setImportDialog} entityName="Member" onSuccess={() => queryClient.invalidateQueries({ queryKey: ['members'] })} />
    </div>
  );
}