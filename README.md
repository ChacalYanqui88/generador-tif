# Generador de TIF — Propuesta de Intervención (APA 7)

Aplicación web local (HTML + CSS + JavaScript, sin instalación ni conexión a
internet salvo para la exportación a DOCX la primera vez) que guía paso a
paso la redacción de un Trabajo de Integración Final en modalidad
**Propuesta de Intervención**, siguiendo la estructura y los ejemplos del
documento `TIF_Propuesta_Intervencion_Sistemas_Informacion.docx`.

## Cómo usarlo

1. Abrí **`index.html`** con doble clic (se abre en tu navegador: Chrome,
   Edge o Firefox).
2. Completá cada una de las 16 secciones del panel izquierdo (Portada,
   Resumen, Introducción, ... Anexos). El sistema valida en vivo:
   - campos obligatorios,
   - longitud mínima de palabras en textos clave (resumen, introducción,
     justificaciones, conclusiones, etc.),
   - cantidad mínima de filas en tablas (requerimientos, FODA, presupuesto,
     cronograma, diccionario de datos, etc.),
   - formato de las referencias bibliográficas (APA 7).
3. La barra superior muestra el **% de avance** y cada ítem del menú se
   marca con un ✓ verde cuando la sección está completa.
4. En cualquier momento podés abrir **👁 Vista previa** para ver el
   documento completo ya compaginado en formato APA 7 (portada, **índice**,
   títulos numerados, tablas numeradas, referencias con sangría francesa,
   etc.). En pantalla, el índice es navegable: hacé clic en cualquier
   entrada para saltar directo a esa sección.
5. Desde la vista previa, **🖨 Imprimir / Guardar como PDF** abre el
   diálogo de impresión del navegador — elegí "Guardar como PDF" como
   destino para obtener el PDF final (con texto seleccionable, no una
   imagen).
6. **⬇ Exportar DOCX** genera un archivo `.docx` real (editable en Word)
   con el mismo contenido y formato. Si faltan campos obligatorios, el
   sistema te avisa antes de exportar pero te permite continuar igual
   (por ejemplo, para compartir un borrador con tu director/a).

## Fichas de lectura y trazabilidad de citas

Desde el botón **📑 Fichas de lectura** de la barra superior podés abrir un
banco de notas de tus fuentes: no hace falta cargar una ficha por cada cita
que uses, solo las que consideres útiles para tu trabajo. Cada ficha
admite:

- Tipo: cita textual, paráfrasis, resumen o comentario.
- Referencia vinculada (elegida de tu lista de Referencias) o autor/año
  escrito a mano, página(s), tema y el contenido en sí.

Con el botón **🔍 Volver a analizar el texto**, el sistema recorre todo lo
que escribiste en el TIF buscando citas en formato APA —`(Autor, Año)` o
`Autor (Año)`— y te muestra, para cada una:

- ✓ **Con referencia y ficha**: está en la bibliografía y tenés una ficha
  de respaldo.
- ⚠ **Con referencia, sin ficha**: está en la bibliografía pero no cargaste
  ninguna ficha de esa fuente.
- ✕ **No está en la lista de Referencias**: aviso importante — revisá si
  falta agregarla en el capítulo de Referencias bibliográficas.

También te avisa qué fichas cargaste que todavía no citaste en el
desarrollo (no es necesariamente un error, puede ser material de consulta
pendiente de incorporar).

> Es una detección heurística/orientativa por expresiones regulares, no
> un chequeo exhaustivo ni infalible: sirve como ayuda para no olvidarte
> de respaldar tus citas, pero la revisión final del formato APA y del
> contenido queda en manos del autor/a y su director/a.

Las fichas de lectura viajan junto con el resto del proyecto (autoguardado
y archivo `.json`), pero **no se incluyen en la exportación a DOCX/PDF**:
son una herramienta de trabajo interna, no un capítulo del TIF.

## Respaldo automático en archivo (recomendado)

Además del autoguardado en el navegador, podés activar un respaldo más
robusto con el botón **📁 Activar respaldo en archivo** de la barra
superior (disponible en **Chrome y Edge**; no aparece en Firefox/Safari,
que todavía no soportan esta función del navegador):

1. Al activarlo, el navegador te muestra el selector nativo "Guardar
   como" — elegí dónde y con qué nombre guardar el archivo. **Si elegís
   una carpeta sincronizada por Google Drive de escritorio, OneDrive, o
   similar, ese archivo va a subirse solo a la nube** cada vez que se
   actualice, sin que el sistema necesite conectarse a ninguna cuenta.
2. A partir de ahí, en cada autoguardado el sistema le escribe encima a
   ese mismo archivo automáticamente, sin volver a pedir permiso.
3. Si el navegador revoca el permiso (por ejemplo, después de cerrar y
   reabrir el navegador varias veces), el botón se pone en amarillo
   ("⚠️ Respaldo pausado"): hacé clic y elegí "Reactivar permiso" para
   retomarlo — no hace falta volver a elegir el archivo.
4. "Desactivar respaldo" deja de escribirle a ese archivo (no lo borra).

Este mecanismo protege contra el cierre accidental de la pestaña, un
corte de luz, una falla del navegador o de la conexión: siempre vas a
tener, además de lo guardado en este navegador, una copia reciente en un
archivo real de tu PC (y en la nube, si elegiste una carpeta
sincronizada).

> ¿Por qué no una integración directa con Google Drive (OAuth)? Ese login
> de Google no funciona en páginas abiertas como archivo local
> (`file://`) — exigiría montar un servidor y que cada usuario cree su
> propio proyecto en Google Cloud Console. El respaldo en archivo local
> logra el mismo objetivo (una copia a salvo, incluso en la nube) sin esa
> fricción ni esa dependencia de internet.

## Guardar y retomar el trabajo

- El formulario se autoguarda en el navegador (localStorage) a medida que
  escribís, así que si cerrás la pestaña podés volver a abrir `index.html`
  y vas a encontrar todo tal como lo dejaste.
- Para trabajar desde otra computadora, hacer una copia de resguardo, o
  compartir el avance con tu director/a, usá **💾 Guardar proyecto**: baja
  un archivo `.json` con todas tus respuestas. Ese archivo se vuelve a
  cargar con **📂 Abrir proyecto**.
- **Nuevo** borra el borrador actual del navegador y empieza de cero
  (pide confirmación antes de hacerlo).

## Estructura del proyecto

```
index.html              interfaz principal
css/app.css              estilos de la aplicación (formulario, menú, etc.)
css/apa.css              estilos del documento en formato APA 7 (vista previa e impresión/PDF)
js/schema.js              definición de las 16 secciones del TIF y sus campos
js/state.js               estado global + autoguardado + import/export JSON
js/validate.js             reglas de validación
js/render-form.js          construcción del formulario dinámico
js/document-model.js       arma el documento final (portada, capítulos, tablas, referencias)
js/fichas.js                 fichas de lectura + cotejo heurístico de citas APA en el texto
js/filebackup.js             respaldo automático en archivo local (File System Access API)
js/preview.js               convierte el documento a HTML con formato APA 7
js/export-docx.js           genera el archivo .docx real (librería docx.js)
vendor/docx.umd.min.js      librería de generación de DOCX (incluida localmente)
```

## Índice

El documento incluye un **Índice** automático justo después de la portada
(Portada → Índice → Resumen → capítulos...), tal como en la plantilla
original:

- En la **vista previa** es una lista clicable, con sangría por nivel
  (capítulo / apartado / subapartado), para navegar el documento en
  pantalla. No muestra números de página reales (el navegador no tiene
  forma confiable de calcularlos antes de imprimir).
- En el **DOCX exportado** es un campo real de Word (`TableOfContents`),
  construido a partir de los estilos de encabezado reales del documento
  (Heading 1/2/3). Al abrir el archivo, Word pregunta si querés
  **actualizar los campos**: aceptá esa opción (o hacé clic derecho sobre
  el índice → "Actualizar campos", o seleccionalo y presioná F9) para que
  aparezcan los números de página correctos y definitivos.
- El **PDF** exportado desde la vista previa hereda el índice tal como se
  ve en pantalla (sin números de página). Si necesitás el PDF con
  paginación exacta en el índice, la forma más prolija es: exportar el
  DOCX, actualizar el índice en Word, y desde ahí generar el PDF final
  ("Guardar como PDF" / "Exportar a PDF" de Word).

### ¿El índice es fijo o se genera según lo que vas completando?

Las dos cosas a la vez, según la parte:

- **La estructura de capítulos es fija**: los 16 capítulos y sus apartados
  (1. Introducción, 2.1 Descripción de la situación..., 8.3.1
  Requerimientos funcionales, etc.) **siempre aparecen en el índice, estén
  completos o vacíos**, porque son la estructura obligatoria del TIF y no
  dependen de si ya escribiste el contenido. Hay dos excepciones
  condicionales: "5.3 Marco conceptual" solo aparece si cargaste al menos
  un término en el glosario, y "Anexos" solo aparece si cargaste al menos
  un anexo.
- **Pero se reconstruye por completo cada vez que lo mirás**: no es un
  texto escrito una sola vez. Cada vez que abrís Vista previa o exportás,
  el sistema vuelve a armar el índice desde cero con tu información
  actual (por eso las dos entradas condicionales aparecen o desaparecen
  solas a medida que cargás o borrás esas tablas).
- **El DOCX exportado es una foto de ese momento**: contiene los
  encabezados que existían en el documento cuando lo generaste. El
  "Actualizar campos" de Word (F9) recalcula únicamente los **números de
  página**, no vuelve a consultar la app — si después seguís completando
  el TIF y cambian las secciones, hay que **volver a exportar el DOCX**
  para que el índice refleje esos cambios.

## Notas sobre el formato APA 7 aplicado

- Fuente Times New Roman 12 pt, interlineado doble, márgenes de 2,54 cm.
- Portada centrada con universidad, facultad, carrera, título, autor/a,
  director/a, ciudad/país y fecha.
- Encabezado de nivel 1 centrado y en negrita; nivel 2 alineado a la
  izquierda y en negrita; nivel 3 en negrita e itálica.
- Tablas numeradas correlativamente ("Tabla 1", "Tabla 2", ...) con líneas
  horizontales únicamente (sin líneas verticales), tal como indica APA 7.
- Referencias bibliográficas ordenadas alfabéticamente con sangría
  francesa, generadas automáticamente a partir de los datos que cargás en
  el formulario (autor, año, título, editorial/fuente, URL/DOI).

## Requisitos

- Un navegador moderno (Chrome, Edge o Firefox actualizado).
- Conexión a internet: **no es necesaria** — todas las librerías
  (incluida la de generación de DOCX) están incluidas en la carpeta
  `vendor/`.

## Créditos

- Autor: Alejandro Cano.
- Modelo de plantilla propuesto por el Dr. Sergio Marcelo Puglieso.
