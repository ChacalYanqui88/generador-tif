/* ============================================================================
   validate.js
   Reglas de validación por campo/sección y cálculo de avance general.
   Todas las funciones son puras: reciben el field/section + el valor y
   devuelven { valid, message }.
   ========================================================================== */

function countWords(str) {
  if (!str) return 0;
  const trimmed = String(str).trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function validateSimpleField(field, value) {
  const isEmpty = value === undefined || value === null || String(value).trim() === '';
  if (field.required && isEmpty) {
    return { valid: false, message: 'Este campo es obligatorio.' };
  }
  if (isEmpty) return { valid: true, message: '' };

  if (field.minLength && String(value).trim().length < field.minLength) {
    return { valid: false, message: `Debe tener al menos ${field.minLength} caracteres.` };
  }
  if (field.pattern && !field.pattern.test(String(value).trim())) {
    return { valid: false, message: field.patternMsg || 'Formato inválido.' };
  }
  if (field.minWords) {
    const words = countWords(value);
    if (words < field.minWords) {
      return { valid: false, message: `Se recomiendan al menos ${field.minWords} palabras (llevás ${words}).` };
    }
  }
  if (field.maxWords) {
    const words = countWords(value);
    if (words > field.maxWords) {
      return { valid: false, message: `No debería superar las ${field.maxWords} palabras (llevás ${words}).` };
    }
  }
  if (field.minItemsCSV) {
    const items = String(value).split(',').map((s) => s.trim()).filter(Boolean);
    if (items.length < field.minItemsCSV) {
      return { valid: false, message: `Ingresá al menos ${field.minItemsCSV} elementos separados por coma.` };
    }
  }
  return { valid: true, message: '' };
}

function validateListField(field, value) {
  const arr = Array.isArray(value) ? value.filter((v) => String(v || '').trim() !== '') : [];
  if (field.required && arr.length === 0) {
    return { valid: false, message: 'Agregá al menos un elemento.' };
  }
  if (field.minItems && arr.length < field.minItems) {
    return { valid: false, message: `Se recomiendan al menos ${field.minItems} elementos (llevás ${arr.length}).` };
  }
  return { valid: true, message: '' };
}

function validateCheckboxesField(field, value) {
  const arr = Array.isArray(value) ? value : [];
  if (field.required && arr.length < (field.minItems || 1)) {
    return { valid: false, message: 'Seleccioná al menos una opción.' };
  }
  return { valid: true, message: '' };
}

function validateTableField(field, value) {
  const rows = Array.isArray(value) ? value : [];
  const nonEmptyRows = rows.filter((row) => field.columns.some((c) => String(row[c.key] || '').trim() !== ''));
  if (field.required && nonEmptyRows.length === 0) {
    return { valid: false, message: 'Agregá al menos una fila.' };
  }
  if (field.minRows && nonEmptyRows.length < field.minRows) {
    return { valid: false, message: `Se recomiendan al menos ${field.minRows} filas (llevás ${nonEmptyRows.length}).` };
  }
  // cada fila no vacía debe tener todas sus columnas completas
  for (const row of nonEmptyRows) {
    for (const col of field.columns) {
      if (col.auto) continue;
      if (String(row[col.key] || '').trim() === '') {
        return { valid: false, message: 'Hay filas con columnas vacías. Completá todas las columnas de cada fila.' };
      }
    }
  }
  return { valid: true, message: '' };
}

function validateGroupField(field, value) {
  const v = value || {};
  const missing = field.fields.filter((sf) => sf.required !== false && String(v[sf.key] || '').trim() === '');
  if (missing.length > 0) {
    return { valid: false, message: `Completá: ${missing.map((m) => m.label).join(', ')}.` };
  }
  return { valid: true, message: '' };
}

function validateFodaField(field, value) {
  const v = value || {};
  const quadrants = ['fortalezas', 'oportunidades', 'debilidades', 'amenazas'];
  const empties = quadrants.filter((q) => !Array.isArray(v[q]) || v[q].filter((x) => String(x || '').trim()).length === 0);
  if (empties.length > 0) {
    return { valid: false, message: `Cargá al menos un ítem en: ${empties.join(', ')}.` };
  }
  return { valid: true, message: '' };
}

function validateRefsField(field, value) {
  const arr = Array.isArray(value) ? value : [];
  if (field.required && arr.length < (field.minItems || 1)) {
    return { valid: false, message: `Agregá al menos ${field.minItems || 1} referencias bibliográficas.` };
  }
  return { valid: true, message: '' };
}

function validateField(field, value) {
  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'select':
      return validateSimpleField(field, value);
    case 'list':
      return validateListField(field, value);
    case 'checkboxes':
      return validateCheckboxesField(field, value);
    case 'table':
      return validateTableField(field, value);
    case 'group':
      return validateGroupField(field, value);
    case 'foda':
      return validateFodaField(field, value);
    case 'refs':
      return validateRefsField(field, value);
    default:
      return { valid: true, message: '' };
  }
}

function validateSection(section, sectionData) {
  const errors = {};
  let valid = true;
  section.fields.forEach((field) => {
    const result = validateField(field, sectionData[field.key]);
    if (!result.valid) {
      errors[field.key] = result.message;
      if (field.required !== false) valid = false;
    }
  });
  return { valid, errors };
}

function validateAll(state) {
  const results = {};
  let totalRequired = 0;
  let totalOk = 0;
  window.TIF_SCHEMA.SECTIONS.forEach((section) => {
    const r = validateSection(section, state[section.id] || {});
    results[section.id] = r;
    section.fields.forEach((field) => {
      if (field.required !== false) {
        totalRequired += 1;
        if (!r.errors[field.key]) totalOk += 1;
      }
    });
  });
  const progress = totalRequired === 0 ? 100 : Math.round((totalOk / totalRequired) * 100);
  return { results, progress, totalRequired, totalOk };
}

function getMissingSummary(state) {
  const { results } = validateAll(state);
  const missing = [];
  window.TIF_SCHEMA.SECTIONS.forEach((section) => {
    const r = results[section.id];
    if (!r.valid) {
      Object.keys(r.errors).forEach((fieldKey) => {
        const field = section.fields.find((f) => f.key === fieldKey);
        if (field && field.required !== false) {
          missing.push({ sectionId: section.id, sectionTitle: section.short, fieldLabel: field.label, message: r.errors[fieldKey] });
        }
      });
    }
  });
  return missing;
}

window.TIF_VALIDATE = { countWords, validateField, validateSection, validateAll, getMissingSummary };
