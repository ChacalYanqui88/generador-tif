/* ============================================================================
   render-form.js
   Construye el formulario de una sección a partir del esquema y mantiene
   sincronizado el objeto de estado. Las ediciones de texto no vuelven a
   pintar todo el formulario (para no perder el foco); las altas/bajas de
   filas de tablas/listas sí vuelven a pintar la sección.
   ========================================================================== */

function el(tag, attrs, children) {
  const node = document.createElement(tag);
  if (attrs) {
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    });
  }
  (children || []).forEach((c) => { if (c) node.appendChild(c); });
  return node;
}

function fieldErrorNode(field) {
  return el('p', { class: 'field-error', id: `err-${field.key}` });
}

function fieldHelpNode(field) {
  if (!field.help) return null;
  return el('p', { class: 'field-help', text: field.help });
}

function updateFieldError(field, value) {
  const errNode = document.getElementById(`err-${field.key}`);
  if (!errNode) return;
  const result = window.TIF_VALIDATE.validateField(field, value);
  errNode.textContent = result.valid ? '' : result.message;
  errNode.classList.toggle('is-error', !result.valid);
}

function wrapField(field, controlNode, extraLabel) {
  const labelText = extraLabel || field.label;
  const wrapper = el('div', { class: `field field-${field.type}` }, [
    el('label', { class: 'field-label', text: labelText, for: field.key }),
    fieldHelpNode(field),
    controlNode,
    fieldErrorNode(field),
  ]);
  return wrapper;
}

function renderSimpleControl(field, sectionData, onChange) {
  let input;
  if (field.type === 'textarea') {
    input = el('textarea', { id: field.key, rows: '4', placeholder: field.placeholder || '' });
    input.value = sectionData[field.key] || '';
  } else if (field.type === 'select') {
    input = el('select', { id: field.key });
    input.appendChild(el('option', { value: '', text: '— Seleccionar —' }));
    field.options.forEach((opt) => {
      const o = el('option', { value: opt, text: opt });
      if (sectionData[field.key] === opt) o.selected = true;
      input.appendChild(o);
    });
  } else {
    input = el('input', { id: field.key, type: 'text', placeholder: field.placeholder || '' });
    input.value = sectionData[field.key] || '';
  }
  const handler = () => {
    sectionData[field.key] = input.value;
    updateFieldError(field, input.value);
    onChange({ rerender: false });
  };
  input.addEventListener('input', handler);
  input.addEventListener('change', handler);
  if (field.type === 'textarea') {
    const counter = el('p', { class: 'field-counter' });
    const updateCounter = () => {
      const words = window.TIF_VALIDATE.countWords(input.value);
      counter.textContent = `${words} palabra${words === 1 ? '' : 's'}`;
    };
    input.addEventListener('input', updateCounter);
    updateCounter();
    const wrapper = wrapField(field, input);
    wrapper.appendChild(counter);
    return wrapper;
  }
  return wrapField(field, input);
}

function renderCheckboxesControl(field, sectionData, onChange) {
  const container = el('div', { class: 'checkbox-group' });
  const current = Array.isArray(sectionData[field.key]) ? sectionData[field.key] : [];
  field.options.forEach((opt) => {
    const id = `${field.key}-${opt.replace(/\W+/g, '_')}`;
    const checkbox = el('input', { type: 'checkbox', id, value: opt });
    checkbox.checked = current.includes(opt);
    checkbox.addEventListener('change', () => {
      const set = new Set(sectionData[field.key] || []);
      if (checkbox.checked) set.add(opt); else set.delete(opt);
      sectionData[field.key] = Array.from(set);
      updateFieldError(field, sectionData[field.key]);
      onChange({ rerender: false });
    });
    container.appendChild(el('div', { class: 'checkbox-item' }, [checkbox, el('label', { for: id, text: opt })]));
  });
  return wrapField(field, container);
}

function renderListControl(field, sectionData, onChange, rerenderSection) {
  if (!Array.isArray(sectionData[field.key])) sectionData[field.key] = [];
  const list = sectionData[field.key];
  const container = el('div', { class: 'dynamic-list' });
  list.forEach((item, idx) => {
    const input = el('input', { type: 'text', value: item || '', placeholder: `${field.itemLabel || 'Elemento'} ${idx + 1}` });
    input.value = item || '';
    input.addEventListener('input', () => {
      list[idx] = input.value;
      updateFieldError(field, list);
      onChange({ rerender: false });
    });
    const removeBtn = el('button', { type: 'button', class: 'btn-icon', title: 'Eliminar', text: '✕' });
    removeBtn.addEventListener('click', () => {
      list.splice(idx, 1);
      onChange({ rerender: false });
      rerenderSection();
    });
    container.appendChild(el('div', { class: 'dynamic-list-row' }, [input, removeBtn]));
  });
  const addBtn = el('button', { type: 'button', class: 'btn-secondary btn-small', text: `+ Agregar ${field.itemLabel || 'elemento'}` });
  addBtn.addEventListener('click', () => {
    list.push('');
    onChange({ rerender: false });
    rerenderSection();
  });
  const wrapper = wrapField(field, container);
  wrapper.appendChild(addBtn);
  return wrapper;
}

function autoFillTableCodes(field, rows) {
  if (field.autoCode) {
    rows.forEach((row, idx) => {
      row[field.columns.find((c) => c.auto).key] = `${field.autoCode}-${String(idx + 1).padStart(2, '0')}`;
    });
  }
  if (field.autoLetter) {
    rows.forEach((row, idx) => { row._letter = String.fromCharCode(65 + idx); });
  }
}

function renderTableControl(field, sectionData, onChange, rerenderSection) {
  if (!Array.isArray(sectionData[field.key])) sectionData[field.key] = [];
  const rows = sectionData[field.key];
  autoFillTableCodes(field, rows);

  const table = el('table', { class: 'dyn-table' });
  const thead = el('thead', {}, [el('tr', {}, [
    ...(field.autoLetter ? [el('th', { text: 'Anexo' })] : []),
    ...field.columns.map((c) => el('th', { text: c.label })),
    el('th', { text: '' }),
  ])]);
  table.appendChild(thead);
  const tbody = el('tbody');

  rows.forEach((row, rIdx) => {
    const tds = [];
    if (field.autoLetter) tds.push(el('td', { class: 'auto-cell', text: `Anexo ${row._letter}` }));
    field.columns.forEach((col) => {
      if (col.auto) {
        tds.push(el('td', { class: 'auto-cell', text: row[col.key] || '' }));
        return;
      }
      let control;
      if (col.type === 'select') {
        control = el('select', {});
        control.appendChild(el('option', { value: '', text: '—' }));
        col.options.forEach((opt) => {
          const o = el('option', { value: opt, text: opt });
          if (row[col.key] === opt) o.selected = true;
          control.appendChild(o);
        });
        control.addEventListener('change', () => { row[col.key] = control.value; onChange({ rerender: false }); updateFieldError(field, rows); });
      } else if (col.type === 'number') {
        control = el('input', { type: 'number', step: '0.01', value: row[col.key] || '' });
        control.addEventListener('input', () => {
          row[col.key] = control.value;
          onChange({ rerender: false });
          updateFieldError(field, rows);
          if (field.autoTotal) rerenderSection();
        });
      } else if (col.type === 'textarea') {
        control = el('textarea', { rows: '2' });
        control.value = row[col.key] || '';
        control.addEventListener('input', () => { row[col.key] = control.value; onChange({ rerender: false }); updateFieldError(field, rows); });
      } else {
        control = el('input', { type: 'text', value: row[col.key] || '' });
        control.value = row[col.key] || '';
        control.addEventListener('input', () => { row[col.key] = control.value; onChange({ rerender: false }); updateFieldError(field, rows); });
      }
      tds.push(el('td', {}, [control]));
    });
    const removeBtn = el('button', { type: 'button', class: 'btn-icon', title: 'Eliminar fila', text: '✕' });
    removeBtn.addEventListener('click', () => {
      rows.splice(rIdx, 1);
      onChange({ rerender: false });
      rerenderSection();
    });
    tds.push(el('td', {}, [removeBtn]));
    tbody.appendChild(el('tr', {}, tds));
  });
  table.appendChild(tbody);

  if (field.autoTotal) {
    const total = rows.reduce((sum, r) => sum + (parseFloat(r[field.columns.find((c) => c.type === 'number').key]) || 0), 0);
    const tfoot = el('tfoot', {}, [el('tr', {}, [
      el('td', { text: 'Total estimado', colspan: String(field.columns.length) }),
      el('td', { text: `$ ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` }),
    ])]);
    table.appendChild(tfoot);
  }

  const addBtn = el('button', { type: 'button', class: 'btn-secondary btn-small', text: '+ Agregar fila' });
  addBtn.addEventListener('click', () => {
    const newRow = {};
    field.columns.forEach((c) => { newRow[c.key] = ''; });
    rows.push(newRow);
    onChange({ rerender: false });
    rerenderSection();
  });

  const tableScroll = el('div', { class: 'table-scroll' }, [table]);
  const wrapper = wrapField(field, tableScroll);
  wrapper.appendChild(addBtn);
  return wrapper;
}

function renderGroupControl(field, sectionData, onChange) {
  if (!sectionData[field.key] || typeof sectionData[field.key] !== 'object') sectionData[field.key] = {};
  const groupData = sectionData[field.key];
  const container = el('div', { class: 'group-box' });
  field.fields.forEach((sf) => {
    let input;
    if (sf.type === 'textarea') {
      input = el('textarea', { rows: '2' });
    } else {
      input = el('input', { type: 'text' });
    }
    input.value = groupData[sf.key] || '';
    input.addEventListener('input', () => {
      groupData[sf.key] = input.value;
      updateFieldError(field, groupData);
      onChange({ rerender: false });
    });
    container.appendChild(el('div', { class: 'group-field' }, [
      el('label', { text: sf.label }),
      input,
    ]));
  });
  return wrapField(field, container);
}

function renderFodaControl(field, sectionData, onChange, rerenderSection) {
  if (!sectionData[field.key]) sectionData[field.key] = { fortalezas: [], oportunidades: [], debilidades: [], amenazas: [] };
  const foda = sectionData[field.key];
  const quadrantLabels = { fortalezas: 'Fortalezas', oportunidades: 'Oportunidades', debilidades: 'Debilidades', amenazas: 'Amenazas' };
  const grid = el('div', { class: 'foda-grid' });
  Object.keys(quadrantLabels).forEach((q) => {
    if (!Array.isArray(foda[q])) foda[q] = [];
    const list = foda[q];
    const box = el('div', { class: `foda-box foda-${q}` }, [el('h4', { text: quadrantLabels[q] })]);
    list.forEach((item, idx) => {
      const input = el('input', { type: 'text', value: item || '' });
      input.value = item || '';
      input.addEventListener('input', () => { list[idx] = input.value; updateFieldError(field, foda); onChange({ rerender: false }); });
      const removeBtn = el('button', { type: 'button', class: 'btn-icon', text: '✕' });
      removeBtn.addEventListener('click', () => { list.splice(idx, 1); onChange({ rerender: false }); rerenderSection(); });
      box.appendChild(el('div', { class: 'dynamic-list-row' }, [input, removeBtn]));
    });
    const addBtn = el('button', { type: 'button', class: 'btn-secondary btn-small', text: '+ Agregar' });
    addBtn.addEventListener('click', () => { list.push(''); onChange({ rerender: false }); rerenderSection(); });
    box.appendChild(addBtn);
    grid.appendChild(box);
  });
  return wrapField(field, grid);
}

function formatAPAReference(ref) {
  const a = (ref.autores || '').trim();
  const y = (ref.anio || 's.f.').trim();
  const t = (ref.titulo || '').trim();
  switch (ref.tipo) {
    case 'Libro':
      return `${a} (${y}). ${t}${ref.edicion ? ` (${ref.edicion})` : ''}. ${ref.editorial || ''}.`.replace(/\s+\./g, '.');
    case 'Capítulo de libro':
      return `${a} (${y}). ${t}. En ${ref.editorial || 'Editor(es)'}. ${ref.fuente || 'Título del libro'}${ref.edicion ? ` (${ref.edicion})` : ''}.`;
    case 'Artículo de revista científica':
      return `${a} (${y}). ${t}. ${ref.fuente || 'Nombre de la revista'}${ref.volumen ? `, ${ref.volumen}` : ''}. ${ref.url || ''}`.trim();
    case 'Sitio web / documento en línea':
      return `${a} (${y}). ${t}. ${ref.fuente || ''} ${ref.url || ''}`.trim();
    case 'Norma o estándar técnico':
      return `${a}. (${y}). ${t}${ref.edicion ? `, ${ref.edicion}` : ''}. ${ref.url || ''}`.trim();
    case 'Tesis o TIF':
      return `${a} (${y}). ${t} [Trabajo de integración final, ${ref.editorial || 'Institución'}]. ${ref.url || ''}`.trim();
    default:
      return `${a} (${y}). ${t}.`;
  }
}

function renderRefsControl(field, sectionData, onChange, rerenderSection) {
  if (!Array.isArray(sectionData[field.key])) sectionData[field.key] = [];
  const refs = sectionData[field.key];
  const wrapper = el('div', { class: 'refs-box' });

  // Lista de referencias ya cargadas, orden alfabético (como exige APA)
  const sorted = [...refs].sort((x, y) => (x.autores || '').localeCompare(y.autores || '', 'es'));
  const list = el('div', { class: 'refs-list' });
  if (sorted.length === 0) {
    list.appendChild(el('p', { class: 'field-help', text: 'Todavía no cargaste referencias.' }));
  }
  sorted.forEach((ref) => {
    const realIdx = refs.indexOf(ref);
    const removeBtn = el('button', { type: 'button', class: 'btn-icon', title: 'Eliminar', text: '✕' });
    removeBtn.addEventListener('click', () => { refs.splice(realIdx, 1); onChange({ rerender: false }); rerenderSection(); });
    list.appendChild(el('div', { class: 'ref-item' }, [
      el('p', { class: 'ref-text apa-hanging', text: formatAPAReference(ref) }),
      removeBtn,
    ]));
  });

  // Formulario de alta de referencia
  const form = el('div', { class: 'ref-form' });
  const tipoSelect = el('select', {});
  window.TIF_SCHEMA.TIPOS_REFERENCIA.forEach((t) => tipoSelect.appendChild(el('option', { value: t, text: t })));
  const autoresInput = el('input', { type: 'text', placeholder: 'Apellido, I. N., & Apellido, I.' });
  const anioInput = el('input', { type: 'text', placeholder: 'Año (ej. 2024 o s.f.)' });
  const tituloInput = el('input', { type: 'text', placeholder: 'Título' });
  const fuenteInput = el('input', { type: 'text', placeholder: 'Revista / sitio / libro contenedor (si aplica)' });
  const edicionInput = el('input', { type: 'text', placeholder: 'Edición / versión (si aplica)' });
  const editorialInput = el('input', { type: 'text', placeholder: 'Editorial / institución (si aplica)' });
  const urlInput = el('input', { type: 'text', placeholder: 'URL o DOI (si aplica)' });

  form.appendChild(el('div', { class: 'ref-form-grid' }, [
    el('div', { class: 'group-field' }, [el('label', { text: 'Tipo de fuente' }), tipoSelect]),
    el('div', { class: 'group-field' }, [el('label', { text: 'Autor/es' }), autoresInput]),
    el('div', { class: 'group-field' }, [el('label', { text: 'Año' }), anioInput]),
    el('div', { class: 'group-field' }, [el('label', { text: 'Título' }), tituloInput]),
    el('div', { class: 'group-field' }, [el('label', { text: 'Revista / sitio / libro' }), fuenteInput]),
    el('div', { class: 'group-field' }, [el('label', { text: 'Edición / versión' }), edicionInput]),
    el('div', { class: 'group-field' }, [el('label', { text: 'Editorial / institución' }), editorialInput]),
    el('div', { class: 'group-field' }, [el('label', { text: 'URL / DOI' }), urlInput]),
  ]));

  const addBtn = el('button', { type: 'button', class: 'btn-secondary btn-small', text: '+ Agregar referencia' });
  addBtn.addEventListener('click', () => {
    if (!autoresInput.value.trim() || !tituloInput.value.trim()) {
      alert('Completá al menos el autor y el título de la referencia.');
      return;
    }
    refs.push({
      tipo: tipoSelect.value,
      autores: autoresInput.value.trim(),
      anio: anioInput.value.trim() || 's.f.',
      titulo: tituloInput.value.trim(),
      fuente: fuenteInput.value.trim(),
      edicion: edicionInput.value.trim(),
      editorial: editorialInput.value.trim(),
      url: urlInput.value.trim(),
    });
    onChange({ rerender: false });
    rerenderSection();
  });
  form.appendChild(addBtn);

  wrapper.appendChild(list);
  wrapper.appendChild(el('hr'));
  wrapper.appendChild(form);
  return wrapField(field, wrapper);
}

function renderSectionForm(container, section, state, onChange) {
  container.innerHTML = '';
  const sectionData = state[section.id];
  const rerenderSection = () => renderSectionForm(container, section, state, onChange);

  const header = el('div', { class: 'section-header' }, [
    el('h2', { text: section.num ? `${section.num}. ${section.title}` : section.title }),
  ]);
  container.appendChild(header);

  section.fields.forEach((field) => {
    if (field.heading) {
      const headingText = field.headingText || field.label;
      container.appendChild(el('h3', { class: 'sub-heading', text: headingText }));
    }
    let node;
    switch (field.type) {
      case 'text': case 'textarea': case 'select':
        node = renderSimpleControl(field, sectionData, onChange); break;
      case 'checkboxes':
        node = renderCheckboxesControl(field, sectionData, onChange); break;
      case 'list':
        node = renderListControl(field, sectionData, onChange, rerenderSection); break;
      case 'table':
        node = renderTableControl(field, sectionData, onChange, rerenderSection); break;
      case 'group':
        node = renderGroupControl(field, sectionData, onChange); break;
      case 'foda':
        node = renderFodaControl(field, sectionData, onChange, rerenderSection); break;
      case 'refs':
        node = renderRefsControl(field, sectionData, onChange, rerenderSection); break;
      default:
        node = null;
    }
    if (node) container.appendChild(node);
  });
}

window.TIF_RENDER_FORM = { renderSectionForm, formatAPAReference };
