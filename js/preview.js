/* ============================================================================
   preview.js
   Renderiza el modelo de documento (document-model.js) como HTML con
   estilos APA 7 (ver css/apa.css), tanto para la vista previa en pantalla
   como para la exportación a PDF vía impresión del navegador.
   ========================================================================== */

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderCoverHtml(data) {
  const d = data || {};
  return `
    <section class="apa-cover">
      <div class="apa-cover-top">
        <p>${escapeHtml(d.universidad)}</p>
        <p>${escapeHtml(d.facultad)}</p>
        <p>${escapeHtml(d.carrera)}</p>
      </div>
      <div class="apa-cover-middle">
        <p class="apa-cover-label">TRABAJO DE INTEGRACIÓN FINAL (TIF)</p>
        <p class="apa-cover-label">Modalidad: Propuesta de Intervención</p>
        <p class="apa-cover-title">&ldquo;${escapeHtml(d.titulo)}&rdquo;</p>
      </div>
      <div class="apa-cover-bottom">
        <p>Autor/a: ${escapeHtml(d.autor)}</p>
        <p>Director/a: ${escapeHtml(d.director)}</p>
        <p>${escapeHtml(d.ciudad)}, ${escapeHtml(d.pais)}</p>
        <p>${escapeHtml(d.mes)} de ${escapeHtml(d.anio)}</p>
      </div>
    </section>`;
}

function renderTocHtml(block) {
  const items = (block.entries || []).map((e) => `<li class="toc-level-${e.level}"><a href="#${e.id}"><span class="toc-text">${escapeHtml(e.text)}</span><span class="toc-leader"></span></a></li>`).join('');
  return `
    <section class="apa-toc">
      <h1 class="apa-h1">Índice</h1>
      <p class="toc-note">Nota: esta vista previa es navegable en pantalla, pero no muestra números de página reales.
        En el archivo <strong>.docx</strong> exportado, el índice es un campo automático de Word: al abrirlo,
        actualizalo con clic derecho sobre el índice → <em>Actualizar campos</em> (o tecla F9) para que
        aparezcan los números de página correctos.</p>
      <ul class="toc-list">${items}</ul>
    </section>`;
}

function renderTableHtml(block) {
  const headerRow = `<tr>${block.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr>`;
  const rows = block.rows.length
    ? block.rows.map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c).replace(/\n/g, '<br>')}</td>`).join('')}</tr>`).join('')
    : `<tr><td colspan="${block.headers.length}" class="empty-cell">Sin datos cargados</td></tr>`;
  return `
    <div class="apa-table-wrap">
      <p class="apa-table-caption"><strong>${escapeHtml(block.caption.split('.')[0])}.</strong> <em>${escapeHtml(block.caption.split('.').slice(1).join('.').trim())}</em></p>
      <table class="apa-table">
        <thead>${headerRow}</thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function renderBlockHtml(block) {
  switch (block.type) {
    case 'cover':
      return renderCoverHtml(block.data);
    case 'pagebreak':
      return '<div class="page-break"></div>';
    case 'toc':
      return renderTocHtml(block);
    case 'h1':
      return `<h1 class="apa-h1"${block.id ? ` id="${block.id}"` : ''}>${escapeHtml(block.text)}</h1>`;
    case 'h2':
      return `<h2 class="apa-h2"${block.id ? ` id="${block.id}"` : ''}>${escapeHtml(block.text)}</h2>`;
    case 'h3':
      return `<h3 class="apa-h3"${block.id ? ` id="${block.id}"` : ''}>${escapeHtml(block.text)}</h3>`;
    case 'p':
      return block.text ? `<p class="apa-p">${escapeHtml(block.text).replace(/\n/g, '<br>')}</p>` : '';
    case 'ul': {
      const items = (block.items || []).filter(Boolean);
      if (!items.length) return '';
      return `<ul class="apa-ul">${items.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`;
    }
    case 'table':
      return renderTableHtml(block);
    case 'refs': {
      if (!block.items.length) return '<p class="apa-p">Sin referencias cargadas.</p>';
      return block.items.map((r) => `<p class="apa-ref">${escapeHtml(r)}</p>`).join('');
    }
    default:
      return '';
  }
}

function renderPreviewHTML(blocks) {
  return blocks.map(renderBlockHtml).join('\n');
}

window.TIF_PREVIEW = { renderPreviewHTML };
