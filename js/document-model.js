/* ============================================================================
   document-model.js
   Construye un modelo de documento (lista de "bloques") a partir del
   estado del formulario, respetando la estructura del TIF y las
   convenciones de formato APA 7ª edición. Este modelo es la única fuente
   de verdad consumida tanto por la vista previa (preview.js) como por el
   exportador a DOCX (export-docx.js), para que ambos formatos coincidan.

   Tipos de bloque: h1, h2, h3, p, ul, table, refs, pagebreak, cover, toc

   El bloque "toc" (Índice) se arma en dos pasadas: primero se construye
   todo el contenido desde "Resumen" en adelante, registrando cada
   encabezado (con un id único) en `tocEntries`; recién al final se arma
   el índice con esas entradas y se antepone al contenido, tal como en el
   documento original (Portada → Índice → Resumen → capítulos...).
   ========================================================================== */

function nonEmptyRows(rows, columns) {
  return (rows || []).filter((r) => columns.some((c) => String(r[c.key] || '').trim() !== ''));
}

function buildDocumentModel(state) {
  const blocks = [];
  const tocEntries = [];
  let tableCounter = 0;
  let headingCounter = 0;
  const nextTableCaption = (title) => { tableCounter += 1; return `Tabla ${tableCounter}. ${title}`; };

  function heading(level, text) {
    headingCounter += 1;
    const id = `sec-${headingCounter}`;
    tocEntries.push({ level, text, id });
    blocks.push({ type: `h${level}`, text, id });
  }
  const h1 = (text) => heading(1, text);
  const h2 = (text) => heading(2, text);
  const h3 = (text) => heading(3, text);

  // Resumen
  h1('Resumen');
  blocks.push({ type: 'p', text: state.resumen.resumenTexto });
  blocks.push({ type: 'p', text: `Palabras clave: ${state.resumen.palabrasClave}` });
  blocks.push({ type: 'pagebreak' });

  // 1. Introducción
  h1('1. Introducción');
  blocks.push({ type: 'p', text: state.introduccion.introTexto });

  // 2. Planteamiento del problema
  h1('2. Planteamiento del problema');
  h2('2.1 Descripción de la situación problemática');
  blocks.push({ type: 'p', text: state.problema.descripcionSituacion });
  h2('2.2 Formulación del problema');
  blocks.push({ type: 'p', text: state.problema.formulacionProblema });
  h2('2.3 Delimitación del problema');
  blocks.push({ type: 'ul', items: [
    `Delimitación organizacional: ${state.problema.delimOrganizacional}`,
    `Delimitación temporal: ${state.problema.delimTemporal}`,
    `Delimitación funcional/tecnológica: ${state.problema.delimFuncional}`,
  ] });

  // 3. Justificación
  h1('3. Justificación');
  h2('3.1 Justificación práctica / institucional');
  blocks.push({ type: 'p', text: state.justificacion.justPractica });
  h2('3.2 Justificación tecnológica');
  blocks.push({ type: 'p', text: state.justificacion.justTecnologica });
  h2('3.3 Justificación académica');
  blocks.push({ type: 'p', text: state.justificacion.justAcademica });

  // 4. Objetivos
  h1('4. Objetivos');
  h2('4.1 Objetivo general');
  blocks.push({ type: 'p', text: state.objetivos.objetivoGeneral });
  h2('4.2 Objetivos específicos');
  blocks.push({ type: 'ul', items: (state.objetivos.objetivosEspecificos || []).filter(Boolean) });

  // 5. Marco teórico y referencial
  h1('5. Marco teórico y referencial');
  h2('5.1 Antecedentes');
  blocks.push({ type: 'p', text: state.marcoTeorico.antecedentes });
  h2('5.2 Marco teórico');
  blocks.push({ type: 'p', text: state.marcoTeorico.marcoTeoricoTexto });
  const glosarioRows = nonEmptyRows(state.marcoTeorico.marcoConceptual, [{ key: 'termino' }, { key: 'definicion' }, { key: 'fuente' }]);
  if (glosarioRows.length) {
    h2('5.3 Marco conceptual');
    blocks.push({ type: 'table', caption: nextTableCaption('Glosario de términos'), headers: ['Término', 'Definición', 'Fuente'], rows: glosarioRows.map((r) => [r.termino, r.definicion, r.fuente]) });
  }
  h2('5.4 Marco institucional/contextual');
  blocks.push({ type: 'p', text: state.marcoTeorico.marcoInstitucional });

  // 6. Marco metodológico
  h1('6. Marco metodológico');
  h2('6.1 Tipo de estudio');
  blocks.push({ type: 'p', text: state.metodologia.tipoEstudio });
  h2('6.2 Metodología de desarrollo de software');
  blocks.push({ type: 'p', text: `Metodología seleccionada: ${state.metodologia.metodologiaDesarrollo}.` });
  blocks.push({ type: 'p', text: state.metodologia.metodologiaDetalle });
  h2('6.3 Técnicas e instrumentos de relevamiento de información');
  blocks.push({ type: 'ul', items: state.metodologia.tecnicasRelevamiento || [] });
  h2('6.4 Herramientas de análisis y diseño');
  blocks.push({ type: 'ul', items: state.metodologia.herramientasAnalisis || [] });
  h2('6.5 Consideraciones éticas');
  blocks.push({ type: 'p', text: state.metodologia.consideracionesEticas });

  // 7. Diagnóstico
  h1('7. Diagnóstico de la situación actual');
  h2('7.1 Descripción del proceso/área actual (situación "AS IS")');
  blocks.push({ type: 'p', text: state.diagnostico.asIs });
  h2('7.2 Relevamiento de requerimientos');
  blocks.push({ type: 'p', text: state.diagnostico.relevamiento });
  h2('7.3 Análisis FODA');
  const foda = state.diagnostico.foda || {};
  blocks.push({
    type: 'table',
    caption: nextTableCaption('Matriz FODA'),
    headers: ['Fortalezas', 'Oportunidades'],
    rows: [[(foda.fortalezas || []).filter(Boolean).join('\n'), (foda.oportunidades || []).filter(Boolean).join('\n')]],
  });
  blocks.push({
    type: 'table',
    caption: nextTableCaption('Matriz FODA (continuación)'),
    headers: ['Debilidades', 'Amenazas'],
    rows: [[(foda.debilidades || []).filter(Boolean).join('\n'), (foda.amenazas || []).filter(Boolean).join('\n')]],
  });
  h2('7.4 Identificación de la brecha (situación deseada)');
  blocks.push({ type: 'p', text: state.diagnostico.brechaToBe });

  // 8. Propuesta de intervención
  const prop = state.propuesta;
  h1('8. Propuesta de intervención');
  h2('8.1 Fundamentación de la propuesta');
  blocks.push({ type: 'p', text: prop.fundamentacionPropuesta });
  h2('8.2 Alcance de la propuesta');
  blocks.push({ type: 'p', text: prop.alcance });
  h2('8.3 Especificación de requerimientos');
  h3('8.3.1 Requerimientos funcionales');
  const rfRows = nonEmptyRows(prop.rf, [{ key: 'codigo' }, { key: 'descripcion' }, { key: 'prioridad' }]);
  blocks.push({ type: 'table', caption: nextTableCaption('Requerimientos funcionales'), headers: ['Código', 'Requerimiento', 'Prioridad'], rows: rfRows.map((r) => [r.codigo, r.descripcion, r.prioridad]) });
  h3('8.3.2 Requerimientos no funcionales');
  const rnfRows = nonEmptyRows(prop.rnf, [{ key: 'categoria' }, { key: 'descripcion' }]);
  blocks.push({ type: 'table', caption: nextTableCaption('Requerimientos no funcionales'), headers: ['Categoría', 'Descripción'], rows: rnfRows.map((r) => [r.categoria, r.descripcion]) });
  h2('8.4 Diseño de la arquitectura de la solución');
  blocks.push({ type: 'p', text: `Estilo arquitectónico propuesto: ${prop.estiloArquitectonico}.` });
  blocks.push({ type: 'p', text: prop.arquitecturaDescripcion });
  h3('8.4.1 Tecnologías propuestas');
  const stackRows = nonEmptyRows(prop.stack, [{ key: 'componente' }, { key: 'tecnologia' }, { key: 'justificacion' }]);
  blocks.push({ type: 'table', caption: nextTableCaption('Stack tecnológico propuesto'), headers: ['Componente', 'Tecnología propuesta', 'Justificación'], rows: stackRows.map((r) => [r.componente, r.tecnologia, r.justificacion]) });
  h2('8.5 Modelado del sistema (diagramas UML)');
  blocks.push({ type: 'p', text: prop.casosUsoGeneral });
  const cu = prop.casoUsoPrincipal || {};
  blocks.push({ type: 'p', text: `Caso de uso: ${cu.nombre || ''} | Actor principal: ${cu.actor || ''}` });
  blocks.push({ type: 'ul', items: [
    `Precondiciones: ${cu.precondiciones || ''}`,
    `Flujo normal: ${cu.flujoNormal || ''}`,
    `Flujo alternativo: ${cu.flujoAlternativo || ''}`,
    `Postcondiciones: ${cu.postcondiciones || ''}`,
  ] });
  blocks.push({ type: 'p', text: `Diagrama de clases: ${prop.diagramaClasesDesc}` });
  blocks.push({ type: 'p', text: `Diagrama de secuencia: ${prop.diagramaSecuenciaDesc}` });
  blocks.push({ type: 'p', text: `Diagrama de actividades: ${prop.diagramaActividadesDesc}` });
  h2('8.6 Diseño de la base de datos');
  blocks.push({ type: 'p', text: `Tabla documentada: ${prop.tablaBD}` });
  const ddRows = nonEmptyRows(prop.diccionarioDatos, [{ key: 'campo' }, { key: 'tipoDato' }, { key: 'restriccion' }]);
  blocks.push({ type: 'table', caption: nextTableCaption(`Diccionario de datos — Tabla "${prop.tablaBD || ''}"`), headers: ['Campo', 'Tipo de dato', 'Restricción'], rows: ddRows.map((r) => [r.campo, r.tipoDato, r.restriccion]) });
  h2('8.7 Diseño de interfaces (prototipos)');
  blocks.push({ type: 'p', text: prop.interfacesDescripcion });
  h2('8.8 Plan de pruebas');
  blocks.push({ type: 'p', text: prop.planPruebasDescripcion });
  const cp = prop.casoPrueba || {};
  blocks.push({ type: 'ul', items: [
    `Entrada: ${cp.entrada || ''}`,
    `Resultado esperado: ${cp.resultadoEsperado || ''}`,
    `Resultado obtenido: ${cp.resultadoObtenido || ''}`,
  ] });
  h2('8.9 Plan de capacitación y gestión del cambio');
  blocks.push({ type: 'p', text: prop.planCapacitacion });

  // 9. Factibilidad
  h1('9. Estudio de factibilidad');
  h2('9.1 Factibilidad técnica');
  blocks.push({ type: 'p', text: state.factibilidad.factibilidadTecnica });
  h2('9.2 Factibilidad económica');
  blocks.push({ type: 'p', text: state.factibilidad.factibilidadEconomicaTexto });
  const presRows = nonEmptyRows(state.factibilidad.presupuesto, [{ key: 'concepto' }, { key: 'costo' }]);
  const total = presRows.reduce((s, r) => s + (parseFloat(r.costo) || 0), 0);
  const presRowsFmt = presRows.map((r) => [r.concepto, `$ ${parseFloat(r.costo || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`]);
  presRowsFmt.push(['Total estimado', `$ ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`]);
  blocks.push({ type: 'table', caption: nextTableCaption('Presupuesto estimado'), headers: ['Concepto', 'Costo estimado (USD)'], rows: presRowsFmt });
  h2('9.3 Factibilidad operativa');
  blocks.push({ type: 'p', text: state.factibilidad.factibilidadOperativa });
  h2('9.4 Factibilidad legal/normativa');
  blocks.push({ type: 'p', text: state.factibilidad.factibilidadLegal });

  // 10. Implementación y cronograma
  h1('10. Plan de implementación y cronograma');
  blocks.push({ type: 'p', text: state.implementacion.implementacionTexto });
  const cronoRows = nonEmptyRows(state.implementacion.cronograma, [{ key: 'etapa' }, { key: 'duracion' }, { key: 'responsable' }]);
  blocks.push({ type: 'table', caption: nextTableCaption('Cronograma de implementación'), headers: ['Etapa', 'Duración estimada', 'Responsable'], rows: cronoRows.map((r) => [r.etapa, r.duracion, r.responsable]) });

  // 11. Evaluación
  h1('11. Evaluación de la propuesta');
  const indRows = nonEmptyRows(state.evaluacion.indicadores, [{ key: 'tipo' }, { key: 'descripcion' }]);
  blocks.push({ type: 'table', caption: nextTableCaption('Indicadores de evaluación esperados'), headers: ['Tipo', 'Descripción'], rows: indRows.map((r) => [r.tipo, r.descripcion]) });

  // 12. Conclusiones
  h1('12. Conclusiones y recomendaciones');
  blocks.push({ type: 'p', text: state.conclusiones.conclusionesTexto });

  // 13. Referencias
  h1('Referencias bibliográficas');
  const refs = (state.referencias.referencias || []).slice().sort((a, b) => (a.autores || '').localeCompare(b.autores || '', 'es'));
  blocks.push({ type: 'refs', items: refs.map((r) => window.TIF_RENDER_FORM.formatAPAReference(r)) });

  // 14. Anexos
  const anexoRows = nonEmptyRows(state.anexos.anexos, [{ key: 'nombre' }, { key: 'descripcion' }]);
  if (anexoRows.length) {
    h1('Anexos');
    blocks.push({ type: 'table', caption: 'Listado de anexos', headers: ['Anexo', 'Nombre', 'Descripción'], rows: anexoRows.map((r, i) => [String.fromCharCode(65 + i), r.nombre, r.descripcion]) });
  }

  // Ensamble final: Portada → Índice → (Resumen y capítulos ya construidos)
  return [
    { type: 'cover', data: state.portada },
    { type: 'pagebreak' },
    { type: 'toc', entries: tocEntries },
    { type: 'pagebreak' },
    ...blocks,
  ];
}

window.TIF_DOCUMENT_MODEL = { buildDocumentModel };
