import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Upload, Loader2, FileText, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Progress } from "@/components/ui/progress";

// Parse CSV text (handles BOM, quoted fields)
function parseCSV(text) {
  const lines = text.replace(/^\uFEFF/, '').split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const parseRow = (line) => {
    const cols = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQ = !inQ; continue; }
      if (c === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue; }
      cur += c;
    }
    cols.push(cur.trim());
    return cols;
  };
  const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_'));
  return lines.slice(1).map(line => {
    const vals = parseRow(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return obj;
  }).filter(r => r.email || r['"email"'] || r['email']);
}

export default function UserCSVImporter({ open, onOpenChange, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [parsedUsers, setParsedUsers] = useState([]);

  const handleFileChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setResults(null);
    const text = await f.text();
    const rows = parseCSV(text);
    setParsedUsers(rows);
  };

  const handleImport = async () => {
    if (!parsedUsers.length) return;
    setLoading(true);
    setProgress(0);
    const success = [], failed = [];

    for (let i = 0; i < parsedUsers.length; i++) {
      const row = parsedUsers[i];
      // Normalize email key (handle BOM variants)
      const email = (row.email || row['"email"'] || '').trim();
      const role = (row.role || 'user').trim().toLowerCase() === 'admin' ? 'admin' : 'user';
      if (!email) { failed.push({ email: '(kosong)', reason: 'Email kosong' }); continue; }
      try {
        await base44.users.inviteUser(email, role);
        success.push(email);
      } catch (err) {
        failed.push({ email, reason: err?.message || 'Gagal' });
      }
      setProgress(Math.round(((i + 1) / parsedUsers.length) * 100));
    }

    setResults({ success, failed });
    setLoading(false);
    if (success.length > 0) onSuccess?.();
  };

  const handleClose = () => {
    if (loading) return;
    setFile(null); setParsedUsers([]); setResults(null); setProgress(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Import User dari CSV</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Pilih File CSV</Label>
            <Input type="file" accept=".csv" onChange={handleFileChange} disabled={loading} className="mt-2" />
            <p className="text-xs text-slate-500 mt-1">Format kolom: Email, Nama, Role, Status, ...</p>
          </div>

          {parsedUsers.length > 0 && !results && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">{parsedUsers.length} user ditemukan siap diundang</span>
              </div>
              <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                {parsedUsers.map((u, i) => (
                  <p key={i} className="text-xs text-blue-600">{u.email || u['"email"'] || '?'} ({(u.role || 'user').toLowerCase() === 'admin' ? 'Admin' : 'Anggota'})</p>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span>Mengundang user...</span><span>{progress}%</span></div>
              <Progress value={progress} />
            </div>
          )}

          {results && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200 text-green-700">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{results.success.length} user berhasil diundang</span>
              </div>
              {results.failed.length > 0 && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 text-red-700 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{results.failed.length} gagal</span>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {results.failed.map((f, i) => (
                      <p key={i} className="text-xs text-red-600 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />{f.email}: {f.reason}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>Batal</Button>
          <Button onClick={handleImport} disabled={!parsedUsers.length || loading || !!results}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Mengundang...</> : <><Upload className="w-4 h-4 mr-2" />Undang {parsedUsers.length} User</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}