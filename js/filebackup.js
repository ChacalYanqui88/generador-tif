/* ============================================================================
   filebackup.js
   Respaldo automático en un archivo local, usando la File System Access
   API del navegador (Chrome / Edge). El usuario elige UNA vez un archivo
   en su PC (por ejemplo, dentro de su carpeta sincronizada de Google
   Drive / OneDrive) y, a partir de ahí, el sistema le va escribiendo
   encima en cada autoguardado, sin volver a pedir permiso ni depender de
   internet ni de ninguna cuenta.

   No requiere servidor ni OAuth: si el usuario elige guardar el archivo
   dentro de una carpeta sincronizada por Google Drive/OneDrive de
   escritorio, la sincronización a la nube la hace esa aplicación, no
   nosotros. Esto es justamente lo que sortea la limitación real de
   Google OAuth en páginas abiertas como archivo local (file://).

   Se degrada de forma segura: si el navegador no soporta la API
   (Firefox, Safari), la función isSupported() devuelve false y la app
   simplemente no muestra esta opción.
   ========================================================================== */

const DB_NAME = 'tif_generador_backup';
const STORE_NAME = 'handles';
const HANDLE_KEY = 'backupFile';

function isSupported() {
  return typeof window.showSaveFilePicker === 'function' && 'indexedDB' in window;
}

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key, value) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbDelete(key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Abre el selector nativo "Guardar como" y persiste el handle elegido en
// IndexedDB para poder reutilizarlo en futuras sesiones sin volver a
// preguntar (solo hace falta reconfirmar el permiso, ver verifyPermission).
async function pickBackupFile(suggestedName) {
  const handle = await window.showSaveFilePicker({
    suggestedName: suggestedName || 'TIF_autoguardado.json',
    types: [{ description: 'Respaldo de TIF (JSON)', accept: { 'application/json': ['.json'] } }],
  });
  await idbSet(HANDLE_KEY, handle);
  return handle;
}

async function getStoredHandle() {
  try {
    return await idbGet(HANDLE_KEY);
  } catch (e) {
    return null;
  }
}

async function clearStoredHandle() {
  await idbDelete(HANDLE_KEY);
}

// 'query' no requiere gesto del usuario (se puede llamar al cargar la
// página); 'request' sí lo requiere (solo se puede llamar dentro del
// handler de un clic).
async function queryPermission(handle) {
  if (!handle || !handle.queryPermission) return 'denied';
  return handle.queryPermission({ mode: 'readwrite' });
}
async function requestPermission(handle) {
  if (!handle || !handle.requestPermission) return 'denied';
  return handle.requestPermission({ mode: 'readwrite' });
}

async function writeBackup(handle, state) {
  const writable = await handle.createWritable();
  await writable.write(JSON.stringify(state, null, 2));
  await writable.close();
}

window.TIF_FILEBACKUP = {
  isSupported,
  pickBackupFile,
  getStoredHandle,
  clearStoredHandle,
  queryPermission,
  requestPermission,
  writeBackup,
};
