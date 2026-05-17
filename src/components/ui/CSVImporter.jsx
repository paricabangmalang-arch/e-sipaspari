import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Upload, Loader2, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CSVImporter({ open, onOpenChange, entityName, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const getJsonSchema = () => {
    const schemas = {
      User: { type: 'object', properties: { email: { type: 'string' }, full_name: { type: 'string' }, role: { type: 'string' }, status: { type: 'string' } } },
      Member: { type: 'object', properties: { user_email: { type: 'string' }, full_name: { type: 'string' }, nir: { type: 'string' }, gender: { type: 'string' }, work_institution: { type: 'string' }, employment_status: { type: 'string' } } },
      Institution: { type: 'object', properties: { name: { type: 'string' } } },
      Province: { type: 'object', properties: { name: { type: 'string' } } }
    };
    return schemas[entityName] || { type: 'object', properties: {} };
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) { setFile(selectedFile); setResult(null); }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true); setResult(null);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const response = await base44.integrations.Core.ExtractDataFromUploadedFile({ file_url: file_url, json_schema: getJsonSchema() });
    if (response.status === 'success' && response.output) {
      const dataArray = Array.isArray(response.output) ? response.output : [response.output];
      await base44.entities[entityName].bulkCreate(dataArray);
      setResult({ success: true, message: `Berhasil mengimpor ${dataArray.length} data` });
      setTimeout(() => { onSuccess?.(); handleClose(); }, 2000);
    } else {
      setResult({ success: false, message: response.details || 'Gagal mengekstrak data' });
    }
    setLoading(false);
  };

  const handleClose = () => { setFile(null); setResult(null); onOpenChange(false); };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Import Data dari CSV / Excel</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Pilih File CSV / Excel</Label>
            <Input type="file" accept=".csv,.xlsx,.json" onChange={handleFileChange} disabled={loading} className="mt-2" />
          </div>
          {file && <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg"><FileText className="w-5 h-5 text-slate-600" /><span className="text-sm font-medium">{file.name}</span></div>}
          {result && (
            <div className={`flex items-start gap-2 p-3 rounded-lg ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {result.success ? <CheckCircle className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
              <p className="text-sm font-medium">{result.message}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>Batal</Button>
          <Button onClick={handleImport} disabled={!file || loading}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Mengimpor...</> : <><Upload className="w-4 h-4 mr-2" />Import</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}