/* ============================================================================
   schema.js
   Modelo de datos del TIF (Trabajo de Integración Final - Propuesta de
   Intervención). Cada objeto de SECTIONS define un capítulo del documento
   y sus campos de formulario, con las reglas usadas por validate.js y
   render-form.js. document-model.js usa las mismas claves para componer
   el documento final en formato APA 7.
   ========================================================================== */

const METODOLOGIAS = ['Cascada', 'RUP (Proceso Unificado de Rational)', 'Scrum', 'Kanban', 'Extreme Programming (XP)', 'Otra'];
const TECNICAS_RELEVAMIENTO = ['Entrevistas a referentes/usuarios clave', 'Observación directa de procesos', 'Encuestas a usuarios finales', 'Análisis documental'];
const HERRAMIENTAS_ANALISIS = ['UML (casos de uso, clases, secuencia, actividades, despliegue)', 'Modelo Entidad-Relación (DER)', 'Herramientas de prototipado (Figma, Balsamiq, Adobe XD)', 'Diagrama de Gantt'];
const ARQUITECTURAS = ['Cliente-servidor en tres capas', 'Arquitectura basada en microservicios', 'Arquitectura monolítica', 'Serverless', 'Otra'];
const PRIORIDADES = ['Alta', 'Media', 'Baja'];
const CATEGORIAS_RNF = ['Rendimiento', 'Seguridad', 'Usabilidad', 'Disponibilidad', 'Escalabilidad', 'Otro'];
const TIPOS_INDICADOR = ['Eficiencia', 'Calidad', 'Satisfacción', 'Otro'];
const TIPOS_REFERENCIA = ['Libro', 'Capítulo de libro', 'Artículo de revista científica', 'Sitio web / documento en línea', 'Norma o estándar técnico', 'Tesis o TIF'];

const SECTIONS = [
  {
    id: 'portada', num: '', title: 'Portada', short: 'Portada',
    fields: [
      { key: 'universidad', label: 'Universidad', type: 'text', required: true },
      { key: 'facultad', label: 'Facultad', type: 'text', required: true },
      { key: 'carrera', label: 'Carrera', type: 'text', required: true, default: 'Licenciatura en Sistemas de Información' },
      { key: 'titulo', label: 'Título del TIF', type: 'text', required: true, minLength: 10,
        help: 'Debe incluir el nombre del sistema/solución propuesta y la organización destinataria.' },
      { key: 'autor', label: 'Autor/a (nombre y apellido)', type: 'text', required: true },
      { key: 'director', label: 'Director/a', type: 'text', required: true },
      { key: 'ciudad', label: 'Ciudad', type: 'text', required: true },
      { key: 'pais', label: 'País', type: 'text', required: true },
      { key: 'mes', label: 'Mes de presentación', type: 'text', required: true },
      { key: 'anio', label: 'Año', type: 'text', required: true, pattern: /^\d{4}$/, patternMsg: 'Debe ser un año de 4 dígitos.' },
    ],
  },
  {
    id: 'resumen', num: '', title: 'Resumen', short: 'Resumen',
    fields: [
      { key: 'resumenTexto', label: 'Resumen', type: 'textarea', required: true, minWords: 120, maxWords: 300,
        help: 'APA 7 sugiere un resumen de entre 150 y 250 palabras, en un único párrafo, sin sangría.' },
      { key: 'palabrasClave', label: 'Palabras clave (separadas por coma)', type: 'text', required: true, minItemsCSV: 3,
        help: 'Mínimo 3 palabras clave, separadas por coma.' },
    ],
  },
  {
    id: 'introduccion', num: '1', title: 'Introducción', short: '1. Introducción',
    fields: [
      { key: 'introTexto', label: 'Texto de introducción', type: 'textarea', required: true, minWords: 150,
        help: 'Debe presentar el tema, la modalidad de intervención y la organización del documento por capítulos.' },
    ],
  },
  {
    id: 'problema', num: '2', title: 'Planteamiento del problema', short: '2. Planteamiento del problema',
    fields: [
      { key: 'descripcionSituacion', label: '2.1 Descripción de la situación problemática', type: 'textarea', required: true, minWords: 60, heading: 2 },
      { key: 'formulacionProblema', label: '2.2 Formulación del problema (pregunta central)', type: 'textarea', required: true, minWords: 15, heading: 2 },
      { key: 'delimOrganizacional', label: '2.3 Delimitación organizacional', type: 'textarea', required: true, minWords: 10, heading: 2 },
      { key: 'delimTemporal', label: 'Delimitación temporal', type: 'textarea', required: true, minWords: 10 },
      { key: 'delimFuncional', label: 'Delimitación funcional/tecnológica', type: 'textarea', required: true, minWords: 10 },
    ],
  },
  {
    id: 'justificacion', num: '3', title: 'Justificación', short: '3. Justificación',
    fields: [
      { key: 'justPractica', label: '3.1 Justificación práctica / institucional', type: 'textarea', required: true, minWords: 40, heading: 2 },
      { key: 'justTecnologica', label: '3.2 Justificación tecnológica', type: 'textarea', required: true, minWords: 40, heading: 2 },
      { key: 'justAcademica', label: '3.3 Justificación académica', type: 'textarea', required: true, minWords: 40, heading: 2 },
    ],
  },
  {
    id: 'objetivos', num: '4', title: 'Objetivos', short: '4. Objetivos',
    fields: [
      { key: 'objetivoGeneral', label: '4.1 Objetivo general', type: 'textarea', required: true, minWords: 10, heading: 2 },
      { key: 'objetivosEspecificos', label: '4.2 Objetivos específicos', type: 'list', required: true, minItems: 3, itemLabel: 'Objetivo específico', heading: 2,
        help: 'Cada objetivo específico debería corresponderse luego con un capítulo o apartado del desarrollo.' },
    ],
  },
  {
    id: 'marcoTeorico', num: '5', title: 'Marco teórico y referencial', short: '5. Marco teórico',
    fields: [
      { key: 'antecedentes', label: '5.1 Antecedentes', type: 'textarea', required: true, minWords: 60, heading: 2 },
      { key: 'marcoTeoricoTexto', label: '5.2 Marco teórico', type: 'textarea', required: true, minWords: 60, heading: 2 },
      { key: 'marcoConceptual', label: '5.3 Marco conceptual (glosario)', type: 'table', required: true, minRows: 2, heading: 2,
        columns: [
          { key: 'termino', label: 'Término' },
          { key: 'definicion', label: 'Definición', type: 'textarea' },
          { key: 'fuente', label: 'Fuente' },
        ] },
      { key: 'marcoInstitucional', label: '5.4 Marco institucional/contextual', type: 'textarea', required: true, minWords: 60, heading: 2 },
    ],
  },
  {
    id: 'metodologia', num: '6', title: 'Marco metodológico', short: '6. Marco metodológico',
    fields: [
      { key: 'tipoEstudio', label: '6.1 Tipo de estudio', type: 'textarea', required: true, minWords: 20, heading: 2 },
      { key: 'metodologiaDesarrollo', label: '6.2 Metodología de desarrollo de software', type: 'select', required: true, options: METODOLOGIAS, heading: 2 },
      { key: 'metodologiaDetalle', label: 'Detalle (fases/sprints, roles, artefactos generados)', type: 'textarea', required: true, minWords: 30 },
      { key: 'tecnicasRelevamiento', label: '6.3 Técnicas e instrumentos de relevamiento', type: 'checkboxes', required: true, minItems: 1, options: TECNICAS_RELEVAMIENTO, heading: 2 },
      { key: 'herramientasAnalisis', label: '6.4 Herramientas de análisis y diseño', type: 'checkboxes', required: true, minItems: 1, options: HERRAMIENTAS_ANALISIS, heading: 2 },
      { key: 'consideracionesEticas', label: '6.5 Consideraciones éticas', type: 'textarea', required: true, minWords: 20, heading: 2 },
    ],
  },
  {
    id: 'diagnostico', num: '7', title: 'Diagnóstico de la situación actual', short: '7. Diagnóstico',
    fields: [
      { key: 'asIs', label: '7.1 Descripción del proceso actual (situación "AS IS")', type: 'textarea', required: true, minWords: 60, heading: 2 },
      { key: 'relevamiento', label: '7.2 Relevamiento de requerimientos', type: 'textarea', required: true, minWords: 40, heading: 2 },
      { key: 'foda', label: '7.3 Análisis FODA', type: 'foda', required: true, heading: 2 },
      { key: 'brechaToBe', label: '7.4 Identificación de la brecha (AS IS vs. TO BE)', type: 'textarea', required: true, minWords: 40, heading: 2 },
    ],
  },
  {
    id: 'propuesta', num: '8', title: 'Propuesta de intervención', short: '8. Propuesta de intervención',
    fields: [
      { key: 'fundamentacionPropuesta', label: '8.1 Fundamentación de la propuesta', type: 'textarea', required: true, minWords: 40, heading: 2 },
      { key: 'alcance', label: '8.2 Alcance de la propuesta (qué incluye y qué no incluye)', type: 'textarea', required: true, minWords: 40, heading: 2 },
      { key: 'rf', label: '8.3.1 Requerimientos funcionales', type: 'table', required: true, minRows: 3, autoCode: 'RF', heading: 3,
        columns: [
          { key: 'codigo', label: 'Código', auto: true },
          { key: 'descripcion', label: 'Requerimiento', type: 'textarea' },
          { key: 'prioridad', label: 'Prioridad', type: 'select', options: PRIORIDADES },
        ] },
      { key: 'rnf', label: '8.3.2 Requerimientos no funcionales', type: 'table', required: true, minRows: 3, heading: 3,
        columns: [
          { key: 'categoria', label: 'Categoría', type: 'select', options: CATEGORIAS_RNF },
          { key: 'descripcion', label: 'Descripción', type: 'textarea' },
        ] },
      { key: 'estiloArquitectonico', label: '8.4 Estilo arquitectónico propuesto', type: 'select', required: true, options: ARQUITECTURAS, heading: 2 },
      { key: 'arquitecturaDescripcion', label: 'Descripción y justificación de la arquitectura', type: 'textarea', required: true, minWords: 40 },
      { key: 'stack', label: '8.4.1 Tecnologías propuestas', type: 'table', required: true, minRows: 3, heading: 3,
        columns: [
          { key: 'componente', label: 'Componente' },
          { key: 'tecnologia', label: 'Tecnología propuesta' },
          { key: 'justificacion', label: 'Justificación breve', type: 'textarea' },
        ] },
      { key: 'casosUsoGeneral', label: '8.5 Casos de uso: descripción general y actores', type: 'textarea', required: true, minWords: 30, heading: 2 },
      { key: 'casoUsoPrincipal', label: 'Especificación del caso de uso principal', type: 'group', required: true,
        fields: [
          { key: 'nombre', label: 'Nombre del caso de uso' },
          { key: 'actor', label: 'Actor principal' },
          { key: 'precondiciones', label: 'Precondiciones', type: 'textarea' },
          { key: 'flujoNormal', label: 'Flujo normal', type: 'textarea' },
          { key: 'flujoAlternativo', label: 'Flujo alternativo', type: 'textarea' },
          { key: 'postcondiciones', label: 'Postcondiciones', type: 'textarea' },
        ] },
      { key: 'diagramaClasesDesc', label: 'Diagrama de clases (entidades, atributos y relaciones)', type: 'textarea', required: true, minWords: 30 },
      { key: 'diagramaSecuenciaDesc', label: 'Diagrama de secuencia (caso de uso crítico)', type: 'textarea', required: true, minWords: 20 },
      { key: 'diagramaActividadesDesc', label: 'Diagrama de actividades (situación TO BE)', type: 'textarea', required: true, minWords: 20 },
      { key: 'tablaBD', label: 'Nombre de la tabla principal documentada', type: 'text', required: true, heading: 2, headingText: '8.6 Diseño de la base de datos' },
      { key: 'diccionarioDatos', label: 'Diccionario de datos de la tabla', type: 'table', required: true, minRows: 3,
        columns: [
          { key: 'campo', label: 'Campo' },
          { key: 'tipoDato', label: 'Tipo de dato' },
          { key: 'restriccion', label: 'Restricción' },
        ] },
      { key: 'interfacesDescripcion', label: '8.7 Diseño de interfaces (descripción funcional de pantallas)', type: 'textarea', required: true, minWords: 30, heading: 2 },
      { key: 'planPruebasDescripcion', label: '8.8 Estrategia de pruebas', type: 'textarea', required: true, minWords: 30, heading: 2 },
      { key: 'casoPrueba', label: 'Caso de prueba de ejemplo', type: 'group', required: true,
        fields: [
          { key: 'entrada', label: 'Entrada' },
          { key: 'resultadoEsperado', label: 'Resultado esperado' },
          { key: 'resultadoObtenido', label: 'Resultado obtenido' },
        ] },
      { key: 'planCapacitacion', label: '8.9 Plan de capacitación y gestión del cambio', type: 'textarea', required: true, minWords: 30, heading: 2 },
    ],
  },
  {
    id: 'factibilidad', num: '9', title: 'Estudio de factibilidad', short: '9. Factibilidad',
    fields: [
      { key: 'factibilidadTecnica', label: '9.1 Factibilidad técnica', type: 'textarea', required: true, minWords: 30, heading: 2 },
      { key: 'factibilidadEconomicaTexto', label: '9.2 Factibilidad económica (análisis)', type: 'textarea', required: true, minWords: 30, heading: 2 },
      { key: 'presupuesto', label: 'Presupuesto estimado', type: 'table', required: true, minRows: 2, autoTotal: true,
        columns: [
          { key: 'concepto', label: 'Concepto' },
          { key: 'costo', label: 'Costo estimado (USD)', type: 'number' },
        ] },
      { key: 'factibilidadOperativa', label: '9.3 Factibilidad operativa', type: 'textarea', required: true, minWords: 30, heading: 2 },
      { key: 'factibilidadLegal', label: '9.4 Factibilidad legal/normativa', type: 'textarea', required: true, minWords: 20, heading: 2 },
    ],
  },
  {
    id: 'implementacion', num: '10', title: 'Plan de implementación y cronograma', short: '10. Implementación',
    fields: [
      { key: 'implementacionTexto', label: 'Descripción de las etapas de implementación', type: 'textarea', required: true, minWords: 30 },
      { key: 'cronograma', label: 'Cronograma de implementación', type: 'table', required: true, minRows: 3,
        columns: [
          { key: 'etapa', label: 'Etapa' },
          { key: 'duracion', label: 'Duración estimada' },
          { key: 'responsable', label: 'Responsable' },
        ] },
    ],
  },
  {
    id: 'evaluacion', num: '11', title: 'Evaluación de la propuesta', short: '11. Evaluación',
    fields: [
      { key: 'indicadores', label: 'Indicadores de evaluación esperados', type: 'table', required: true, minRows: 3,
        columns: [
          { key: 'tipo', label: 'Tipo', type: 'select', options: TIPOS_INDICADOR },
          { key: 'descripcion', label: 'Descripción del indicador', type: 'textarea' },
        ] },
    ],
  },
  {
    id: 'conclusiones', num: '12', title: 'Conclusiones y recomendaciones', short: '12. Conclusiones',
    fields: [
      { key: 'conclusionesTexto', label: 'Conclusiones y recomendaciones', type: 'textarea', required: true, minWords: 80,
        help: 'Debe retomar cada objetivo específico y señalar cómo fue abordado.' },
    ],
  },
  {
    id: 'referencias', num: '13', title: 'Referencias bibliográficas', short: '13. Referencias',
    fields: [
      { key: 'referencias', label: 'Referencias (formato APA 7)', type: 'refs', required: true, minItems: 3 },
    ],
  },
  {
    id: 'anexos', num: '14', title: 'Anexos', short: '14. Anexos',
    fields: [
      { key: 'anexos', label: 'Listado de anexos', type: 'table', required: false, minRows: 0, autoLetter: true,
        columns: [
          { key: 'nombre', label: 'Nombre del anexo' },
          { key: 'descripcion', label: 'Descripción', type: 'textarea' },
        ] },
    ],
  },
];

// Exponer en window para el resto de los módulos (script clásico, sin bundler).
window.TIF_SCHEMA = { SECTIONS, TIPOS_REFERENCIA };
