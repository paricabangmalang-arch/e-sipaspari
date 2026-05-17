function toCSV(columns, data) {
  const headers = columns.map(c => `"${c.header}"`).join(',');
  const rows = data.map(row =>
    columns.map(col => {
      const val = row[col.accessor];
      if (val === null || val === undefined) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',')
  );
  return [headers, ...rows].join('\n');
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToCSV(columns, data, filename = 'data') {
  const csvContent = toCSV(columns, data);
  downloadFile('\uFEFF' + csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

export function exportToExcel(columns, data, filename = 'data') {
  const headers = columns.map(c => `<th>${c.header}</th>`).join('');
  const rows = data.map(row =>
    '<tr>' + columns.map(col => {
      const val = row[col.accessor];
      return `<td>${val !== null && val !== undefined ? String(val) : ''}</td>`;
    }).join('') + '</tr>'
  ).join('');
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"/></head><body><table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></body></html>`;
  downloadFile(html, `${filename}.xls`, 'application/vnd.ms-excel');
}

export function printData(columns, data, title = 'Data') {
  const headers = columns.map(c => `<th style="border:1px solid #ccc;padding:8px;background:#f1f5f9;font-weight:bold;">${c.header}</th>`).join('');
  const rows = data.map(row =>
    '<tr>' + columns.map(col => {
      const val = row[col.accessor];
      return `<td style="border:1px solid #ccc;padding:8px;">${val !== null && val !== undefined ? String(val) : '-'}</td>`;
    }).join('') + '</tr>'
  ).join('');
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>${title}</title><style>body{font-family:Arial,sans-serif;margin:20px}h2{color:#1e40af;margin-bottom:16px}table{border-collapse:collapse;width:100%;font-size:12px}@media print{body{margin:0}}</style></head><body><h2>${title}</h2><p style="color:#64748b;margin-bottom:12px;">Dicetak pada: ${new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</p><table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></body></html>`;
  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

export async function exportToPDF(columns, data, title = 'Data') {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}`, 14, 22);
  const body = data.map(row => columns.map(col => { const val = row[col.accessor]; return val !== null && val !== undefined ? String(val) : '-'; }));
  let y = 30;
  const colWidth = (pageWidth - 28) / columns.length;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(30, 64, 175);
  doc.setTextColor(255);
  doc.rect(14, y, pageWidth - 28, 8, 'F');
  columns.forEach((col, i) => doc.text(col.header.slice(0, 18), 16 + i * colWidth, y + 5.5));
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);
  body.forEach((row, ri) => {
    if (y > 185) { doc.addPage(); y = 14; }
    if (ri % 2 === 0) { doc.setFillColor(241, 245, 249); doc.rect(14, y, pageWidth - 28, 7, 'F'); }
    row.forEach((val, i) => doc.text(String(val).slice(0, 20), 16 + i * colWidth, y + 5));
    y += 7;
  });
  doc.save(`${title}.pdf`);
}