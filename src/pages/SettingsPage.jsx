import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, User, Lock, Upload, CheckCircle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

export default function SettingsPage() {
  const { user } = useOutletContext();
  const queryClient = useQueryClient();
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileData, setProfileData] = useState({ full_name: '', nir: '', gender: '', birth_place: '', birth_date: '', address: '', education: '', education_institution: '', graduation_year: '', sip_number: '', sip_end_date: '', work_institution: '', employment_status: '', photo_url: '' });

  const { data: member, isLoading } = useQuery({ queryKey: ['my-member-settings', user?.email], queryFn: async () => { const m = await base44.entities.Member.filter({ user_email: user?.email }); return m[0]; }, enabled: !!user?.email });
  const { data: institutions = [] } = useQuery({ queryKey: ['institutions'], queryFn: () => base44.entities.Institution.list() });

  useEffect(() => { if (member) { setProfileData({ full_name: member.full_name||'', nir: member.nir||'', gender: member.gender||'', birth_place: member.birth_place||'', birth_date: member.birth_date||'', address: member.address||'', education: member.education||'', education_institution: member.education_institution||'', graduation_year: member.graduation_year||'', sip_number: member.sip_number||'', sip_end_date: member.sip_end_date||'', work_institution: member.work_institution||'', employment_status: member.employment_status||'', photo_url: member.photo_url||'' }); setPhotoPreview(member.photo_url); } }, [member]);

  const handleSaveProfile = async () => {
    setSaving(true); setMessage({ type: '', text: '' });
    let photoUrl = profileData.photo_url;
    if (photoFile) { const { file_url } = await base44.integrations.Core.UploadFile({ file: photoFile }); photoUrl = file_url; }
    await base44.entities.Member.update(member.id, { ...profileData, photo_url: photoUrl, graduation_year: parseInt(profileData.graduation_year) });
    queryClient.invalidateQueries({ queryKey: ['my-member-settings'] });
    setMessage({ type: 'success', text: 'Profil berhasil disimpan!' }); setPhotoFile(null); setSaving(false);
  };

  if (isLoading) return <div className="flex justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-sky-100 to-blue-100 rounded-xl p-4 border border-sky-200"><h1 className="text-2xl font-bold text-slate-800">Pengaturan</h1><p className="text-slate-500 mt-1">Kelola akun dan profil Anda</p></div>
      <Card className="shadow-sm border-slate-100">
        <Tabs defaultValue="profile">
          <CardHeader className="border-b"><TabsList><TabsTrigger value="profile" className="flex items-center gap-2"><User className="w-4 h-4" />Profil</TabsTrigger><TabsTrigger value="account" className="flex items-center gap-2"><Lock className="w-4 h-4" />Akun</TabsTrigger></TabsList></CardHeader>
          <CardContent className="p-6">
            <TabsContent value="profile" className="mt-0">
              {message.text && <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700'}`}>{message.text}</div>}
              <div className="flex flex-col items-center mb-6"><Avatar className="w-32 h-32 mb-4"><AvatarImage src={photoPreview} /><AvatarFallback className="text-4xl bg-slate-100">{profileData.full_name?.charAt(0)}</AvatarFallback></Avatar><Label htmlFor="photo" className="cursor-pointer"><div className="flex items-center gap-2 text-blue-600"><Upload className="w-4 h-4" /><span className="text-sm font-medium">Ganti Foto</span></div></Label><Input id="photo" type="file" accept="image/*" className="hidden" onChange={(e) => { const f=e.target.files[0]; if(f){setPhotoFile(f); const r=new FileReader(); r.onloadend=()=>setPhotoPreview(r.result); r.readAsDataURL(f);}}} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2"><Label>Nama Lengkap</Label><Input value={profileData.full_name} onChange={(e) => setProfileData({...profileData, full_name: e.target.value})} /></div>
                <div><Label>NIR</Label><Input value={profileData.nir} onChange={(e) => setProfileData({...profileData, nir: e.target.value})} /></div>
                <div><Label>Jenis Kelamin</Label><Select value={profileData.gender} onValueChange={(v) => setProfileData({...profileData, gender: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Laki-laki">Laki-laki</SelectItem><SelectItem value="Perempuan">Perempuan</SelectItem></SelectContent></Select></div>
                <div><Label>Tempat Lahir</Label><Input value={profileData.birth_place} onChange={(e) => setProfileData({...profileData, birth_place: e.target.value})} /></div>
                <div><Label>Tanggal Lahir</Label><Input type="date" value={profileData.birth_date} onChange={(e) => setProfileData({...profileData, birth_date: e.target.value})} /></div>
                <div className="md:col-span-2"><Label>Alamat</Label><Textarea value={profileData.address} onChange={(e) => setProfileData({...profileData, address: e.target.value})} /></div>
                <div><Label>No. SIP</Label><Input value={profileData.sip_number} onChange={(e) => setProfileData({...profileData, sip_number: e.target.value})} /></div>
                <div><Label>Periode Akhir SIP</Label><Input type="date" value={profileData.sip_end_date} onChange={(e) => setProfileData({...profileData, sip_end_date: e.target.value})} /></div>
                <div><Label>Instansi Kerja</Label><Select value={profileData.work_institution} onValueChange={(v) => setProfileData({...profileData, work_institution: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{institutions.map(i => <SelectItem key={i.id} value={i.name}>{i.name}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Status Pegawai</Label><Select value={profileData.employment_status} onValueChange={(v) => setProfileData({...profileData, employment_status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PNS">PNS</SelectItem><SelectItem value="PPPK">PPPK</SelectItem><SelectItem value="Kontrak">Kontrak</SelectItem><SelectItem value="Honorer">Honorer</SelectItem><SelectItem value="Swasta">Swasta</SelectItem></SelectContent></Select></div>
              </div>
              <Button onClick={handleSaveProfile} disabled={saving} className="bg-blue-600 hover:bg-blue-700 mt-6">{saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Menyimpan...</> : <><CheckCircle className="w-4 h-4 mr-2" />Simpan</>}</Button>
            </TabsContent>
            <TabsContent value="account" className="mt-0">
              <div className="max-w-md space-y-6"><Card><CardHeader><CardTitle className="text-lg">Informasi Akun</CardTitle></CardHeader><CardContent className="space-y-4"><div><Label>Email</Label><Input value={user?.email || ''} disabled /></div><div><Label>Role</Label><Input value={user?.role === 'admin' ? 'Administrator' : 'Anggota'} disabled /></div></CardContent></Card><Card><CardHeader><CardTitle className="text-lg">Keamanan</CardTitle><CardDescription>Untuk mengganti password, gunakan "Lupa Password" di halaman login</CardDescription></CardHeader><CardContent><Button variant="outline" onClick={() => base44.auth.logout()}><Lock className="w-4 h-4 mr-2" />Keluar untuk Reset Password</Button></CardContent></Card></div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}