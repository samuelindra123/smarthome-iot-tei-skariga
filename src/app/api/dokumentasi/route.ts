import { baseSections } from '@/lib/pdfContent';
import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from 'pdf-lib';

// Estimate: ~450-550 words per PDF page at font size 11 (A4 portrait, standard margins).
// We will replicate / expand sections until we approach ~75 pages.
// Instead of generating huge static file, stream on-demand.

// EXACT page requirement
const TARGET_PAGES = 75; // exactly 75 pages
const SIGNATURE_PAGES = 1;
const CONTENT_PAGES_TARGET = TARGET_PAGES - SIGNATURE_PAGES;

export async function GET() {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const mono = await pdfDoc.embedFont(StandardFonts.Courier);

  let contentPagesCreated = 0;
  let logicalRepeat = 0;
  const maxRepeats = 20;

  const pageMargin = 50;
  const lineHeight = 14;
  const bodySize = 11;
  const titleSize = 16;
  const smallSize = 8;

  const addPage = () => pdfDoc.addPage([595.28, 841.89]); // A4

  const writeWrapped = (page: PDFPage, text: string, x: number, y: number, maxWidth: number, fontRef: PDFFont, size: number) => {
    const words = text.split(/\s+/);
    let line = '';
    let cursorY = y;
    words.forEach(w => {
      const test = line ? line + ' ' + w : w;
      const width = fontRef.widthOfTextAtSize(test, size);
      if (width > maxWidth) {
        page.drawText(line, { x, y: cursorY, size, font: fontRef });
        cursorY -= lineHeight;
        line = w;
      } else {
        line = test;
      }
    });
    if (line) {
      page.drawText(line, { x, y: cursorY, size, font: fontRef });
      cursorY -= lineHeight;
    }
    return cursorY;
  };

  const writeSection = (sec: typeof baseSections[number], idx: number, cycle: number) => {
    const page = addPage();
    let y = page.getHeight() - pageMargin;
    // Title
    page.drawText(sec.title, { x: pageMargin, y, size: titleSize, font: fontBold });
    y -= lineHeight * 2;
    // Paragraphs
    sec.paragraphs?.forEach(p => {
      y = writeWrapped(page, p.replace('(otomatis saat generate)', new Date().toLocaleDateString('id-ID')), pageMargin, y, page.getWidth() - pageMargin * 2, font, bodySize) - 4;
    });
    // Bullets
    if (sec.bulletPoints) {
      sec.bulletPoints.forEach(b => { y = writeWrapped(page, '• ' + b, pageMargin, y, page.getWidth() - pageMargin * 2, font, bodySize) - 2; });
      y -= 4;
    }
    // Table
    if (sec.table) {
      const headers = sec.table.headers;
      const rows = sec.table.rows;
      const colWidths = headers.map(h => mono.widthOfTextAtSize(h, bodySize) + 12);
      rows.forEach(r => r.forEach((cell, i) => {
        const w = mono.widthOfTextAtSize(cell, bodySize) + 12;
        if (w > colWidths[i]) colWidths[i] = w;
      }));
      let x = pageMargin;
      headers.forEach((h,i)=> {
        page.drawText(h, { x, y, size: bodySize, font: fontBold });
        x += colWidths[i];
      });
      y -= lineHeight;
      rows.forEach(r => {
        x = pageMargin;
        r.forEach((c,i)=> {
          page.drawText(c, { x, y, size: bodySize, font: mono });
          x += colWidths[i];
        });
        y -= lineHeight;
      });
      y -= lineHeight / 2;
    }
    // Code
    if (sec.code) {
      const lines = sec.code.split('\n');
      lines.forEach(l => { page.drawText(l, { x: pageMargin, y, size: 9, font: mono, color: rgb(0.1,0.1,0.1) }); y -= lineHeight; });
      y -= lineHeight / 2;
    }
    // Footer
    page.drawText(`Bagian ${idx + 1} / Siklus ${cycle + 1}` , { x: page.getWidth() - pageMargin - 160, y: pageMargin / 2, size: smallSize, font, color: rgb(0.4,0.4,0.4) });
  };

  while (contentPagesCreated < CONTENT_PAGES_TARGET && logicalRepeat < maxRepeats) {
    for (let i = 0; i < baseSections.length; i++) {
      if (contentPagesCreated >= CONTENT_PAGES_TARGET) break;
      writeSection(baseSections[i], i, logicalRepeat);
      contentPagesCreated++;
      if (contentPagesCreated >= CONTENT_PAGES_TARGET) break;
    }
    logicalRepeat++;
  }

  // Final signature page
  const sig = pdfDoc.addPage([595.28, 841.89]);
  sig.drawText('Penutup', { x: 50, y: sig.getHeight() - 70, size: 20, font: fontBold });
  let sy = sig.getHeight() - 70 - 40;
  const closing = [
    'Dokumen ini dihasilkan secara otomatis melalui endpoint PDF pada aplikasi Next.js.',
    'Disusun oleh:',
    '',
    'Samuel Indra Bastian',
    'Kelas: XI EIA',
    'SMK PGRI 3 Malang'
  ];
  closing.forEach(line => { sig.drawText(line, { x: 50, y: sy, size: 12, font }); sy -= 22; });

  // Ensure exact page count: if somehow fewer, pad with blank pages; if more (should not), we accept overflow (but logic prevents overflow)
  while (pdfDoc.getPageCount() < TARGET_PAGES) pdfDoc.addPage([595.28, 841.89]);

  const pdfBytes = await pdfDoc.save();
  // Cast to Uint8Array acceptable by Web Response in Node/Edge (wrap in Buffer for compatibility)
  const body = Buffer.from(pdfBytes);
  return new Response(body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="dokumentasi-smarthome.pdf"'
    }
  });
}
