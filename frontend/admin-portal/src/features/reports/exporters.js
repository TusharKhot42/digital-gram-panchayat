/**
 * Client-side report exports with zero added dependencies:
 * - CSV: plain text blob with UTF-8 BOM, opens natively in Excel/LibreOffice.
 * - Excel: an HTML table served as .xls — Excel and LibreOffice open it natively with formatting.
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
    new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }),
    'dgp-summary-report.csv',
  );
}

export function exportExcel(report, t) {
  const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const header = [t('reports.col.section'), t('reports.col.metric'), t('reports.col.value')];
  const tr = (cells, tag) => `<tr>${cells.map((c) => `<${tag}>${esc(c)}</${tag}>`).join('')}</tr>`;
  const html =
    '<html><head><meta charset="utf-8"></head><body><h2>ग्रामपंचायत अहवाल / Gram Panchayat Report</h2><table border="1">' +
    tr(header, 'th') +
    reportRows(report, t)
      .map((r) => tr(r, 'td'))
      .join('') +
    '</table></body></html>';
  download(new Blob([html], { type: 'application/vnd.ms-excel' }), 'dgp-summary-report.xls');
}

/** Specialized Tax Register Excel export */
export function exportTaxRegister(taxData, t) {
  const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const header = ['कर नोंद क्र. / Tax ID', 'मालमत्ता / Property', 'मालक / Owner', 'आकारणी / Assessed (₹)', 'भरणा / Paid (₹)', 'थकबाकी / Dues (₹)', 'स्थिती / Status'];
  const tr = (cells, tag) => `<tr>${cells.map((c) => `<${tag}>${esc(c)}</${tag}>`).join('')}</tr>`;
  const rows = (taxData ?? []).map((row) => [
    row.taxId || row.id || '-',
    row.propertyName || row.propertyType || 'घरपट्टी/पाणीपट्टी',
    row.ownerName || row.citizenName || 'ग्रामस्थ',
    row.amountAssessed ?? row.amount ?? 0,
    row.amountPaid ?? 0,
    row.amountDue ?? row.outstanding ?? 0,
    row.status || 'Pending',
  ]);

  const html =
    '<html><head><meta charset="utf-8"></head><body><h2>ग्रामपंचायत कर वसूली वही / Property Tax Collection Register</h2><table border="1">' +
    tr(header, 'th') +
    rows.map((r) => tr(r, 'td')).join('') +
    '</table></body></html>';
  download(new Blob([html], { type: 'application/vnd.ms-excel' }), 'dgp-tax-register.xls');
}

/** Specialized Complaints Audit Register Excel export */
export function exportComplaintsRegister(complaintsData, t) {
  const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const header = ['तक्रार क्र. / ID', 'विषय / Subject', 'प्रवर्ग / Category', 'तक्रारदार / Complainant', 'दिनांक / Date', 'स्थिती / Status'];
  const tr = (cells, tag) => `<tr>${cells.map((c) => `<${tag}>${esc(c)}</${tag}>`).join('')}</tr>`;
  const rows = (complaintsData ?? []).map((c) => [
    c.complaintId || c.id || '-',
    c.title || '-',
    c.category || '-',
    c.citizenName || c.user?.fullName || 'ग्रामस्थ',
    c.createdAt ? new Date(c.createdAt).toLocaleDateString('mr-IN') : '-',
    c.status || 'Pending',
  ]);

  const html =
    '<html><head><meta charset="utf-8"></head><body><h2>ग्रामपंचायत तक्रार निवारण नोंद / Complaints Audit Register</h2><table border="1">' +
    tr(header, 'th') +
    rows.map((r) => tr(r, 'td')).join('') +
    '</table></body></html>';
  download(new Blob([html], { type: 'application/vnd.ms-excel' }), 'dgp-complaints-register.xls');
}

/** Specialized Certificate Issuance Register Excel export */
export function exportCertificatesRegister(certificatesData, t) {
  const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const header = ['अर्ज क्र. / Application ID', 'प्रमाणपत्र प्रकार / Type', 'अर्जदार / Applicant', 'अर्ज दिनांक / Applied Date', 'स्थिती / Status'];
  const tr = (cells, tag) => `<tr>${cells.map((c) => `<${tag}>${esc(c)}</${tag}>`).join('')}</tr>`;
  const rows = (certificatesData ?? []).map((a) => [
    a.applicationId || a.id || '-',
    a.type || a.certificateType || 'दाखला',
    a.applicantName || a.user?.fullName || 'ग्रामस्थ',
    a.createdAt ? new Date(a.createdAt).toLocaleDateString('mr-IN') : '-',
    a.status || 'Submitted',
  ]);

  const html =
    '<html><head><meta charset="utf-8"></head><body><h2>ग्रामपंचायत दाखले वितरण वही / Certificate Issuance Register</h2><table border="1">' +
    tr(header, 'th') +
    rows.map((r) => tr(r, 'td')).join('') +
    '</table></body></html>';
  download(new Blob([html], { type: 'application/vnd.ms-excel' }), 'dgp-certificates-register.xls');
}

export function exportPdf() {
  window.print();
}

