import React from 'react';
import { Clock, Mail, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_6916ac7f41d5b45e7639dac6/ff5b405a8_IMG_2408.png";

export default function PendingApproval() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <img src={LOGO_URL} alt="Logo" className="w-28 h-28 mx-auto mb-6 object-contain" />
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6"><Clock className="w-10 h-10 text-amber-600" /></div>
          <h1 className="text-2xl font-bold text-slate-800 mb-3">Menunggu Persetujuan</h1>
          <p className="text-slate-600 mb-6">Akun Anda sedang dalam proses verifikasi oleh admin.</p>
          <div className="bg-blue-50 rounded-xl p-4 mb-6"><div className="flex items-center justify-center gap-2 text-blue-700"><Mail className="w-5 h-5" /><span className="text-sm font-medium">Notifikasi akan dikirim ke email Anda</span></div></div>
          <Button variant="outline" onClick={() => base44.auth.logout()} className="w-full"><LogOut className="w-4 h-4 mr-2" />Keluar</Button>
        </div>
      </div>
    </div>
  );
}