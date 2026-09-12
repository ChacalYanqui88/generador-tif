/* ============================================================================
   state.js
   Estado global de la aplicación + persistencia en localStorage + import/
   export de proyecto en formato JSON (para guardar/retomar el trabajo).
   ========================================================================== */

const STORAGE_KEY = 'tif_generador_state_v1';

function defaultValueForField(field) {
  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'select':
      return field.default || '';
    case 'checkboxes':
      return [];
    case 'list':
      return [];
    case 'table':
      return [];
    case 'group': {
      const g = {};
      field.fields.forEach((sf) => { g[sf.key] = ''; });
      return g;
    }
    case 'foda':
      return { fortalezas: [], oportunidades: [], debilidades: [], amenazas: [] };
    case 'refs':
      return [];
    default:
      return '';
  }
}

function buildDefaultState() {
  const state = {};
  window.TIF_SCHEMA.SECTIONS.forEach((section) => {
    state[section.id] = {};
    section.fields.forEach((field) => {
      state[section.id][field.key] = defaultValueForField(field);
    });
  });
  // Herramienta auxiliar de fichas de lectura (no es un capítulo del TIF,
  // ver js/fichas.js). Se guarda dentro del mismo estado para que viaje
  // junto con el autoguardado y el archivo .json del proyecto.
  state.fichasLectura = [];
  return state;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildDefaultState();
    const parsed = JSON.parse(raw);
    // fusiona con el default para tolerar cambios de esquema entre versiones
    const base = buildDefaultState();
    Object.keys(base).forEach((sectionId) => {
      if (sectionId === 'fichasLectura') return;
      if (parsed[sectionId]) {
        Object.assign(base[sectionId], parsed[sectionId]);
      }
    });
    if (Array.isArray(parsed.fichasLectura)) base.fichasLectura = parsed.fichasLectura;
    return base;
  } catch (e) {
    console.warn('No se pudo leer el estado guardado, se usa uno nuevo.', e);
    return buildDefaultState();
  }
}

function saveStateToStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.warn('No se pudo guardar el borrador en localStorage.', e);
    return false;
  }
}

function clearStateStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

function exportStateAsJSONFile(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const fileName = (state.portada && state.portada.titulo)
    ? state.portada.titulo.replace(/[^\w\sÀ-ÿ-]/g, '').trim().replace(/\s+/g, '_').slice(0, 60)
    : 'proyecto_tif';
  a.href = url;
  a.download = `${fileName || 'proyecto_tif'}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function importStateFromJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const base = buildDefaultState();
        Object.keys(base).forEach((sectionId) => {
          if (sectionId === 'fichasLectura') return;
          if (parsed[sectionId]) Object.assign(base[sectionId], parsed[sectionId]);
        });
        if (Array.isArray(parsed.fichasLectura)) base.fichasLectura = parsed.fichasLectura;
        resolve(base);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file, 'utf-8');
  });
}

window.TIF_STATE_UTILS = {
  buildDefaultState,
  loadState,
  saveStateToStorage,
  clearStateStorage,
  exportStateAsJSONFile,
  importStateFromJSONFile,
};
