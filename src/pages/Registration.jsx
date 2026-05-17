import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, User, Upload, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_6916ac7f41d5b45e7639dac6/ff5b405a8_IMG_2408.png";

export default function Registration() {
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ full_name: '', nir: '', gender: '', birth_place: '', birth_date: '', address: '', education: '', education_institution: '', graduation_year: '', sip_number: '', sip_end_date: '', work_institution: '', employment_status: '' });
  const { data: institutions = [] } = useQuery({ queryKey: ['institutions'], queryFn: () => base44.entities.Institution.list() });

  useEffect(() => { (async () => { const u = await base44.auth.me(); setCurrentUser(u); setFormData(p => ({...p, full_name: u.full_name || ''})); })(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    let photoUrl = '';
    if (photoFile) { const { file_url } = await base44.integrations.Core.UploadFile({ file: photoFile }); photoUrl = file_url; }
    const memberData = { ...formData, user_email: currentUser.email, photo_url: photoUrl, graduation_year: parseInt(formData.graduation_year) || 0, is_registered: true };
    const existing = await base44.entities.Member.filter({ user_email: currentUser.email });
    if (existing?.length > 0) await base44.entities.Member.update(existing[0].id, memberData);
    else await base44.entities.Member.create(memberData);
    await base44.auth.updateMe({ is_registered: true });
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8"><img src={LOGO_URL} alt="Logo" className="w-24 h-24 mx-auto mb-4 object-contain" /><h1 className="text-2xl font-bold text-slate-800">Registrasi Anggota</h1><p className="text-slate-500 mt-2">Lengkapi data diri Anda</p></div>
        <Card className="shadow-lg border-0"><CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg"><CardTitle className="flex items-center gap-2"><User className="w-5 h-5" />Form Registrasi</CardTitle><CardDescription className="text-blue-100">Lengkapi semua data dengan benar</CardDescription></CardHeader>
          <CardContent className="p-6">
            {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center mb-6"><div className="w-32 h-40 bg-slate-100 rounded-lg overflow-hidden mb-3 border-2 border-dashed border-slate-300">{photoPreview ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-slate-400"><User className="w-8 h-8 mb-2" /><span className="text-xs">Foto</span></div>}</div><Label htmlFor="photo" className="cursor-pointer"><div className="flex items-center gap-2 text-blue-600"><Upload className="w-4 h-4" /><span className="text-sm font-medium">Upload Foto</span></div></Label><Input id="photo" type="file" accept="image/*" className="hidden" onChange={(e) => { const f=e.target.files[0]; if(f){setPhotoFile(f); const r=new FileReader(); r.onloadend=()=>setPhotoPreview(r.result); r.readAsDataURL(f);} }} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2"><Label>Nama Lengkap *</Label><Input value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} required /></div>
                <div><Label>NIR *</Label><Input value={formData.nir} onChange={(e) => setFormData({...formData, nir: e.target.value})} required /></div>
                <div><Label>Jenis Kelamin *</Label><Select value={formData.gender} onValueChange={(v) => setFormData({...formData, gender: v})}><SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger><SelectContent><SelectItem value="Laki-laki">Laki-laki</SelectItem><SelectItem value="Perempuan">Perempuan</SelectItem></SelectContent></Select></div>
                <div><Label>Tempat Lahir *</Label><Input value={formData.birth_place} onChange={(e) => setFormData({...formData, birth_place: e.target.value})} required /></div>
                <div><Label>Tanggal Lahir *</Label><Input type="date" value={formData.birth_date} onChange={(e) => setFormData({...formData, birth_date: e.target.value})} required /></div>
                <div className="md:col-span-2"><Label>Alamat *</Label><Textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required /></div>
                <div><Label>Pendidikan *</Label><Select value={formData.education} onValueChange={(v) => setFormData({...formData, education: v})}><SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger><SelectContent><SelectItem value="D3">D3</SelectItem><SelectItem value="D4">D4</SelectItem><SelectItem value="S1">S1</SelectItem><SelectItem value="S2">S2</SelectItem></SelectContent></Select></div>
                <div><Label>Institusi Pendidikan *</Label><Input value={formData.education_institution} onChange={(e) => setFormData({...formData, education_institution: e.target.value})} required /></div>
                <div><Label>Tahun Lulus *</Label><Input type="number" value={formData.graduation_year} onChange={(e) => setFormData({...formData, graduation_year: e.target.value})} required /></div>
                <div><Label>No. SIP *</Label><Input value={formData.sip_number} onChange={(e) => setFormData({...formData, sip_number: e.target.value})} required /></div>
                <div><Label>Periode Akhir SIP *</Label><Input type="date" value={formData.sip_end_date} onChange={(e) => setFormData({...formData, sip_end_date: e.target.value})} required /></div>
                <div><Label>Instansi Kerja *</Label><Select value={formData.work_institution} onValueChange={(v) => setFormData({...formData, work_institution: v})}><SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger><SelectContent>{institutions.map(i => <SelectItem key={i.id} value={i.name}>{i.name}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Status Pegawai *</Label><Select value={formData.employment_status} onValueChange={(v) => setFormData({...formData, employment_status: v})}><SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger><SelectContent><SelectItem value="PNS">PNS</SelectItem><SelectItem value="PPPK">PPPK</SelectItem><SelectItem value="Kontrak">Kontrak</SelectItem><SelectItem value="Honorer">Honorer</SelectItem><SelectItem value="Swasta">Swasta</SelectItem></SelectContent></Select></div>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg" disabled={loading}>{loading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />Menyimpan...</> : <><CheckCircle className="w-5 h-5 mr-2" />Simpan & Lanjutkan</>}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}