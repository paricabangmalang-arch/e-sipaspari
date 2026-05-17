import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Upload, Plus, Pencil, Trash2, Eye, FileText, FileSpreadsheet, Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/utils/exportData';

export default function DataTable({ columns, data, searchPlaceholder = "Cari...", onSearch, searchValue, onAdd, onEdit, onDelete, onView, onImport, exportTitle = 'Data', showActions = true, showImport = false, showExport = false, isAdmin = false, currentPage = 1, totalPages = 1, onPageChange, loading = false }) {
  const exportColumns = columns.filter(c => c.accessor);
  const handleExport = (type) => {
    if (type === 'csv') exportToCSV(exportColumns, data, exportTitle);
    else if (type === 'excel') exportToExcel(exportColumns, data, exportTitle);
    else if (type === 'pdf') exportToPDF(exportColumns, data, exportTitle);
    else if (type === 'print') printData(exportColumns, data, exportTitle);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder={searchPlaceholder} value={searchValue} onChange={(e) => onSearch?.(e.target.value)} className="pl-9 bg-slate-50 border-slate-200" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {showImport && isAdmin && onImport && <Button variant="outline" size="sm" onClick={onImport}><Upload className="w-4 h-4 mr-2" />Import CSV</Button>}
          {showExport && isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Export</Button></DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('csv')}><FileText className="w-4 h-4 mr-2" />CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}><FileSpreadsheet className="w-4 h-4 mr-2" />Excel</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}><FileText className="w-4 h-4 mr-2" />PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('print')}><Printer className="w-4 h-4 mr-2" />Print</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {onAdd && isAdmin && <Button size="sm" className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Tambah</Button>}
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              {columns.map((col, index) => <TableHead key={index} className="font-semibold text-slate-700">{col.header}</TableHead>)}
              {showActions && <TableHead className="text-right">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={columns.length + (showActions ? 1 : 0)} className="text-center py-8"><div className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="text-slate-500">Memuat data...</span></div></TableCell></TableRow>
            ) : data?.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length + (showActions ? 1 : 0)} className="text-center py-8 text-slate-500">Tidak ada data</TableCell></TableRow>
            ) : (
              data?.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-slate-50/50">
                  {columns.map((col, colIndex) => <TableCell key={colIndex}>{col.render ? col.render(row) : row[col.accessor]}</TableCell>)}
                  {showActions && (
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        {onView && <Button variant="ghost" size="icon" onClick={() => onView(row)}><Eye className="w-4 h-4 text-slate-500" /></Button>}
                        {onEdit && isAdmin && <Button variant="ghost" size="icon" onClick={() => onEdit(row)}><Pencil className="w-4 h-4 text-blue-500" /></Button>}
                        {onDelete && isAdmin && <Button variant="ghost" size="icon" onClick={() => onDelete(row)}><Trash2 className="w-4 h-4 text-red-500" /></Button>}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">Halaman {currentPage} dari {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => onPageChange?.(currentPage - 1)}><ChevronLeft className="w-4 h-4" /></Button>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => onPageChange?.(currentPage + 1)}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      )}
    </div>
  );
}