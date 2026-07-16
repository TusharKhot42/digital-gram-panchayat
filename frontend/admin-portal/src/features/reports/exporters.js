/**
 * Client-side report exports with zero added dependencies:
 * - CSV: plain text blob, opens everywhere.
 * - Excel: an HTML table served as .xls — Excel and LibreOffice open it natively. Avoids
 *   shipping a spreadsheet library for a periodic one-table download.
 * - PDF: the browser's print-to-PDF via window.print() (the page carries print styles).
 */

/** Flatten the report object into [section, label, value] rows shared by CSV and Excel. */
export function reportRows(report, t) {
  const rows = [];
  const push = (section, label, value) => rows.push([section, label, String(value)]);

  const sections = [
    ['complaints', report.complaints],
    ['certificates', report.certificates],
    ['tax', report.tax],
    ['users', report.users],
    ['schemes', report.schemes],
    ['notices', report.notices],
  ];

  for (const [key, mod] of sections) {
    const section = t(`reports.section.${key}`);
    push(section, t('reports.total'), mod.total);
    if (key === 'tax') {
      push(section, t('reports.assessed'), mod.assessed);
      push(section, t('reports.collected'), mod.collected);
      push(section, t('reports.outstanding'), mod.outstanding);
    }
    if (key === 'notices') push(section, t('reports.published'), mod.published);
    for (const list of ['byStatus', 'byCategory', 'byType', 'byActive', 'byPublished']) {
      for (const item of mod[list] ?? []) {
        push(section, String(item.label), item.value);
      }
    }
  }
  return rows;
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCsv(report, t) {
  const header = [t('reports.col.section'), t('reports.col.metric'), t('reports.col.value')];
  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [header, ...reportRows(report, t)].map((r) => r.map(escape).join(','));
  // BOM so Excel decodes Marathi text as UTF-8.
  download(
    new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }),
    'dgp-report.csv',
  );
}

export function exportExcel(report, t) {
  const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const header = [t('reports.col.section'), t('reports.col.metric'), t('reports.col.value')];
  const tr = (cells, tag) => `<tr>${cells.map((c) => `<${tag}>${esc(c)}</${tag}>`).join('')}</tr>`;
  const html =
    '<html><head><meta charset="utf-8"></head><body><table border="1">' +
    tr(header, 'th') +
    reportRows(report, t)
      .map((r) => tr(r, 'td'))
      .join('') +
    '</table></body></html>';
  download(new Blob([html], { type: 'application/vnd.ms-excel' }), 'dgp-report.xls');
}

export function exportPdf() {
  window.print();
}
