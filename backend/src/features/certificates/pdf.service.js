import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import PDFDocument from 'pdfkit';
import { APP_NAME } from '@dgp/shared';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Drop a Devanagari TTF here to render Marathi text (e.g. NotoSansDevanagari-Regular.ttf).
// PDFKit's built-in fonts have no Devanagari glyphs, so the template stays English until
// this font is present; then the labels below can switch to Marathi without code changes.
const DEVANAGARI_FONT_PATH = join(
  __dirname,
  '../../../assets/fonts/NotoSansDevanagari-Regular.ttf',
);

const GRAM_PANCHAYAT_NAME = 'Grampanchayat Sakharale';
const TITLES = {
  Residence: 'Residence Certificate',
  Birth: 'Birth Certificate',
  Death: 'Death Certificate',
  SevenTwelve: '7/12 & 8A Certificate',
  Other: 'Certificate',
};

/** Draw a labelled placeholder box (QR / signature / seal). */
function placeholderBox(doc, x, y, w, h, label) {
  doc.save();
  doc.rect(x, y, w, h).dash(2, { space: 2 }).stroke('#999');
  doc.undash();
  doc
    .fontSize(8)
    .fillColor('#999')
    .text(label, x, y + h / 2 - 4, { width: w, align: 'center' });
  doc.restore();
  doc.fillColor('#000');
}

/**
 * Generate a professional certificate PDF and resolve a Buffer. Template is isolated here
 * so it stays reusable across certificate types.
 *
 * @param {{ application: object, citizen: object, officer: object }} params
 * @returns {Promise<Buffer>}
 */
export function generateCertificatePdf({ application, citizen, officer }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const hasDevanagari = existsSync(DEVANAGARI_FONT_PATH);
    if (hasDevanagari) doc.registerFont('devanagari', DEVANAGARI_FONT_PATH);

    const pageWidth = doc.page.width - 100;

    // ---- Government header ----
    doc.fontSize(11).fillColor('#444').text('Government of Maharashtra', { align: 'center' });
    doc.moveDown(0.2);
    doc.fontSize(16).fillColor('#15803d').text(GRAM_PANCHAYAT_NAME, { align: 'center' });
    doc.fontSize(10).fillColor('#444').text(APP_NAME, { align: 'center' });
    doc
      .moveTo(50, doc.y + 6)
      .lineTo(doc.page.width - 50, doc.y + 6)
      .stroke('#15803d');
    doc.moveDown(1.2);

    // ---- Title + certificate number ----
    doc
      .fontSize(15)
      .fillColor('#000')
      .text(
        // "Other" carries its own citizen-supplied title; the rest use the fixed template name.
        application.certificateType === 'Other'
          ? application.applicationData?.certificateTitle || 'Certificate'
          : TITLES[application.certificateType] || 'Certificate',
        { align: 'center', underline: true },
      );
    doc.moveDown(0.4);
    doc
      .fontSize(10)
      .fillColor('#333')
      .text(`Certificate No: ${application.applicationId}`, { align: 'center' });
    doc.moveDown(1);

    // ---- QR placeholder (top-right) ----
    placeholderBox(doc, doc.page.width - 130, 60, 70, 70, 'QR');

    // ---- Body ----
    doc.fontSize(11).fillColor('#000');
    doc.text(
      `This is to certify that the following details, submitted to ${GRAM_PANCHAYAT_NAME}, ` +
        `have been verified and recorded.`,
      { width: pageWidth, align: 'left' },
    );
    doc.moveDown(0.8);

    doc.fontSize(11).text(`Applicant: ${citizen.fullName}`, { continued: false });
    if (citizen.mobile) doc.text(`Mobile: ${citizen.mobile}`);
    if (citizen.village) doc.text(`Village: ${citizen.village}`);
    doc.moveDown(0.6);

    // Certificate-type specific fields from applicationData.
    doc.fontSize(11).fillColor('#000').text('Certificate details:', { underline: true });
    doc.moveDown(0.2);
    const data = application.applicationData || {};
    Object.entries(data).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
      doc.fontSize(10).fillColor('#333').text(`${label}: ${value}`);
    });
    doc.moveDown(1);

    doc
      .fontSize(10)
      .fillColor('#333')
      .text(`Issue date: ${new Date().toLocaleDateString('en-IN')}`);
    doc.moveDown(2);

    // ---- Officer, signature + seal ----
    const bottomY = doc.y;
    placeholderBox(doc, 50, bottomY, 130, 60, 'Official Seal');
    placeholderBox(doc, doc.page.width - 230, bottomY, 130, 60, 'Signature');
    doc
      .fontSize(9)
      .fillColor('#333')
      .text(officer?.fullName || 'Panchayat Officer', doc.page.width - 230, bottomY + 64, {
        width: 130,
        align: 'center',
      });
    doc.text('Authorised Officer', doc.page.width - 230, bottomY + 76, {
      width: 130,
      align: 'center',
    });

    doc
      .fontSize(8)
      .fillColor('#999')
      .text(
        'This certificate is digitally generated. Verify via the QR code / certificate number.',
        50,
        doc.page.height - 70,
        { width: pageWidth, align: 'center' },
      );

    doc.end();
  });
}
