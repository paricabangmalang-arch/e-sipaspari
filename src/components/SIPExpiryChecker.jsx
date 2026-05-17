import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Send, Loader2, CheckCircle2 } from 'lucide-react';
import moment from 'moment';
import { toast } from 'sonner';

export default function SIPExpiryChecker() {
  const [sending, setSending] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const { data: members = [], refetch } = useQuery({ queryKey: ['members-sip-check'], queryFn: () => base44.entities.Member.list(), enabled: false });

  const getExpiringSoon = () => members.filter(m => { if (!m.sip_end_date) return false; const d = moment(m.sip_end_date).diff(moment(), 'days'); return d > 0 && d <= 30; });
  const getExpired = () => members.filter(m => { if (!m.sip_end_date) return false; return moment(m.sip_end_date).isBefore(moment()); });

  const handleCheck = async () => { setSending(true); await refetch(); setLastChecked(new Date()); toast.success('Pengecekan selesai'); setSending(false); };

  const handleSendNotifications = async () => {
    setSending(true);
    const all = [...getExpiringSoon(), ...getExpired()];
    for (const m of all) {
      await base44.integrations.Core.SendEmail({ from_name: 'eSIPAS PARI Kota Malang', to: m.user_email, subject: 'Pengingat SIP', body: `SIP Anda (${m.sip_number}) akan/telah berakhir pada ${moment(m.sip_end_date).format('DD MMMM YYYY')}. Mohon segera perpanjang.` });
    }
    toast.success(`Berhasil mengirim ${all.length} notifikasi`);
    setSending(false);
  };

  const expiringSoon = getExpiringSoon();
  const expired = getExpired();

  return (
    <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
        <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-orange-600" />Notifikasi SIP Expired</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex gap-3">
          <Button onClick={handleCheck} disabled={sending} variant="outline" className="flex-1">{sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}Cek Status SIP</Button>
          <Button onClick={handleSendNotifications} disabled={sending || (!expiringSoon.length && !expired.length)} className="flex-1 bg-orange-600 hover:bg-orange-700">{sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}Kirim Notifikasi</Button>
        </div>
        {lastChecked && <div className="text-xs text-slate-500 text-center">Terakhir dicek: {moment(lastChecked).format('DD/MM/YYYY HH:mm')}</div>}
        {members.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"><div><p className="text-sm font-medium">SIP Akan Expired (≤30 hari)</p></div><Badge className="bg-orange-100 text-orange-800 text-lg px-3 py-1">{expiringSoon.length}</Badge></div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg"><div><p className="text-sm font-medium">SIP Sudah Expired</p></div><Badge className="bg-red-100 text-red-800 text-lg px-3 py-1">{expired.length}</Badge></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}