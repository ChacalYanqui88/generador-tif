/* ============================================================================
   export-docx.js
   Genera un archivo .docx real (formato APA 7ª edición) a partir del
   modelo de documento, usando la librería "docx" (cargada localmente
   desde vendor/docx.umd.min.js, expone el global window.docx).

   Convenciones APA 7 aplicadas:
   - Fuente Times New Roman 12 pt en todo el cuerpo.
   - Interlineado doble (line: 480) en todo el documento.
   - Márgenes de 2.54 cm (1440 twips) en las 4 direcciones.
   - Portada: contenido centrado, título en negrita.
   - Encabezado 1: centrado y en negrita. Encabezado 2: izquierda y
     negrita. Encabezado 3: izquierda, negrita e itálica.
   - Referencias con sangría francesa (hanging indent) de 1.27 cm.
   - Tablas con líneas horizontales solamente (estilo de tres líneas).
   - Numeración de página en el encabezado, alineada a la derecha.
   - Índice automático (campo TableOfContents de Word) generado a partir
     de los encabezados reales (Heading1/2/3), con números de página
     correctos una vez que Word actualiza los campos al abrir el archivo.
   ========================================================================== */

const FONT = 'Times New Roman';
const SIZE = 24; // 12pt en half-points
const LINE_DOUBLE = 480; // interlineado doble

function run(text, opts) {
  return new docx.TextRun(Object.assign({ text: text == null ? '' : String(text), font: FONT, size: SIZE }, opts || {}));
}

function paraFromText(text, opts) {
  const lines = String(text || '').split('\n');
  const children = [];
  lines.forEach((line, idx) => {
    if (idx > 0) children.push(new docx.TextRun({ break: 1 }));
    children.push(run(line));
  });
  return new docx.Paragraph(Object.assign({
    children,
    spacing: { line: LINE_DOUBLE },
    alignment: docx.AlignmentType.JUSTIFIED,
  }, opts || {}));
}

// Los encabezados usan los estilos reales "Heading1/2/3" de Word (definidos
// más abajo, en buildDocxDocument, con el look APA) en lugar de solo texto
// en negrita: así el Índice (TableOfContents) puede detectarlos y generar
// automáticamente las entradas con su número de página real.
function heading1(text) {
  return new docx.Paragraph({
    children: [run(text)],
    heading: docx.HeadingLevel.HEADING_1,
    pageBreakBefore: true,
  });
}

function heading2(text) {
  return new docx.Paragraph({
    children: [run(text)],
    heading: docx.HeadingLevel.HEADING_2,
  });
}

function heading3(text) {
  return new docx.Paragraph({
    children: [run(text)],
    heading: docx.HeadingLevel.HEADING_3,
  });
}

function tocNoteParagraph() {
  return new docx.Paragraph({
    children: [run('Nota: este índice se genera automáticamente. Si al abrir el documento no ves los números de página, hacé clic derecho sobre el índice → "Actualizar campos" (o seleccioná el índice y presioná F9).', { italics: true, size: 20 })],
    spacing: { line: 240, before: 80, after: 240 },
  });
}

function bulletParagraph(text) {
  return new docx.Paragraph({
    children: [run(text)],
    bullet: { level: 0 },
    spacing: { line: LINE_DOUBLE },
  });
}

function referenceParagraph(text) {
  return new docx.Paragraph({
    children: [run(text)],
    spacing: { line: LINE_DOUBLE, after: 120 },
    indent: { left: 720, hanging: 720 }, // sangría francesa 1.27cm
  });
}

const NO_BORDER = { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const RULE = { style: docx.BorderStyle.SINGLE, size: 4, color: '000000' };

function tableCell(text, { header = false, top = false, bottom = false } = {}) {
  return new docx.TableCell({
    children: [new docx.Paragraph({
      children: [run(text, { bold: header })],
      spacing: { line: 240 },
    })],
    borders: {
      top: top ? RULE : NO_BORDER,
      bottom: bottom ? RULE : NO_BORDER,
      left: NO_BORDER,
      right: NO_BORDER,
    },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
  });
}

function buildDocxTable(headers, rows) {
  const headerRow = new docx.TableRow({
    children: headers.map((h) => tableCell(h, { header: true, top: true, bottom: true })),
    tableHeader: true,
  });
  const bodyRows = rows.length
    ? rows.map((r, idx) => new docx.TableRow({
      children: r.map((c) => tableCell(c, { bottom: idx === rows.length - 1 })),
    }))
    : [new docx.TableRow({ children: headers.map(() => tableCell('—', { bottom: true })) })];
  return new docx.Table({
    width: { size: 100, type: docx.WidthType.PERCENTAGE },
    rows: [headerRow, ...bodyRows],
  });
}

function tableCaptionParagraph(caption) {
  const parts = caption.split('.');
  const num = parts[0].trim();
  const title = parts.slice(1).join('.').trim();
  return new docx.Paragraph({
    children: [run(`${num}.`, { bold: true }), run(' '), run(title, { italics: true })],
    spacing: { line: LINE_DOUBLE, before: 200, after: 80 },
  });
}

function buildCoverParagraphs(data) {
  const d = data || {};
  const centered = (text, opts) => new docx.Paragraph({
    children: [run(text, opts)],
    alignment: docx.AlignmentType.CENTER,
    spacing: { line: LINE_DOUBLE, after: 120 },
  });
  return [
    centered(d.universidad || ''),
    centered(d.facultad || ''),
    centered(d.carrera || ''),
    new docx.Paragraph({ text: '', spacing: { line: LINE_DOUBLE } }),
    new docx.Paragraph({ text: '', spacing: { line: LINE_DOUBLE } }),
    centered('TRABAJO DE INTEGRACIÓN FINAL (TIF)', { bold: true }),
    centered('Modalidad: Propuesta de Intervención', { bold: true }),
    new docx.Paragraph({ text: '', spacing: { line: LINE_DOUBLE } }),
    centered(`“${d.titulo || ''}”`, { bold: true, size: 28 }),
    new docx.Paragraph({ text: '', spacing: { line: LINE_DOUBLE } }),
    new docx.Paragraph({ text: '', spacing: { line: LINE_DOUBLE } }),
    centered(`Autor/a: ${d.autor || ''}`),
    centered(`Director/a: ${d.director || ''}`),
    new docx.Paragraph({ text: '', spacing: { line: LINE_DOUBLE } }),
    centered(`${d.ciudad || ''}, ${d.pais || ''}`),
    centered(`${d.mes || ''} de ${d.anio || ''}`),
  ];
}

function blocksToDocxChildren(blocks) {
  const children = [];
  blocks.forEach((block, idx) => {
    switch (block.type) {
      case 'cover':
        children.push(...buildCoverParagraphs(block.data));
        break;
      case 'pagebreak':
        // el salto de página se resuelve con pageBreakBefore en el próximo heading;
        // si el bloque siguiente no es heading, forzamos un salto explícito.
        if (!blocks[idx + 1] || !['h1'].includes(blocks[idx + 1].type)) {
          children.push(new docx.Paragraph({ children: [], pageBreakBefore: true }));
        }
        break;
      case 'toc':
        children.push(new docx.TableOfContents('Índice', { hyperlink: true, headingStyleRange: '1-3' }));
        children.push(tocNoteParagraph());
        break;
      case 'h1':
        children.push(heading1(block.text));
        break;
      case 'h2':
        children.push(heading2(block.text));
        break;
      case 'h3':
        children.push(heading3(block.text));
        break;
      case 'p':
        if (block.text) children.push(paraFromText(block.text));
        break;
      case 'ul':
        (block.items || []).filter(Boolean).forEach((i) => children.push(bulletParagraph(i)));
        break;
      case 'table':
        children.push(tableCaptionParagraph(block.caption));
        children.push(buildDocxTable(block.headers, block.rows));
        children.push(new docx.Paragraph({ text: '', spacing: { line: LINE_DOUBLE } }));
        break;
      case 'refs':
        if (block.items.length) {
          block.items.forEach((r) => children.push(referenceParagraph(r)));
        } else {
          children.push(paraFromText('Sin referencias cargadas.'));
        }
        break;
      default:
        break;
    }
  });
  return children;
}

function buildDocxDocument(blocks) {
  const children = blocksToDocxChildren(blocks);

  return new docx.Document({
    features: { updateFields: true }, // Word pregunta al abrir si actualizar el Índice (y otros campos)
    styles: {
      default: {
        document: { run: { font: FONT, size: SIZE } },
      },
      paragraphStyles: [
        {
          id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: FONT, size: SIZE, bold: true },
          paragraph: { alignment: docx.AlignmentType.CENTER, spacing: { line: LINE_DOUBLE, before: 240, after: 120 } },
        },
        {
          id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: FONT, size: SIZE, bold: true },
          paragraph: { alignment: docx.AlignmentType.LEFT, spacing: { line: LINE_DOUBLE, before: 200, after: 100 } },
        },
        {
          id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: FONT, size: SIZE, bold: true, italics: true },
          paragraph: { alignment: docx.AlignmentType.LEFT, spacing: { line: LINE_DOUBLE, before: 160, after: 80 } },
        },
      ],
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
        },
      },
      headers: {
        default: new docx.Header({
          children: [new docx.Paragraph({
            alignment: docx.AlignmentType.RIGHT,
            children: [new docx.TextRun({ children: [docx.PageNumber.CURRENT], font: FONT, size: SIZE })],
          })],
        }),
      },
      children,
    }],
  });
}

async function exportToDocx(blocks, fileNameBase) {
  const doc = buildDocxDocument(blocks);
  const blob = await docx.Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileNameBase || 'TIF'}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

window.TIF_EXPORT_DOCX = { exportToDocx, buildDocxDocument };
