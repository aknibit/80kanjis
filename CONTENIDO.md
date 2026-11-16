# Contenido de estudio

Los archivos de `public/` son la fuente de la verdad publicada. El navegador los lee directamente y Vite los copia a `dist/` sin transformarlos. No hace falta una base de datos ni acceder al vault desde el servidor de build.

## Archivos

| Sección | Fuente canónica | Contenido inicial |
| --- | --- | --- |
| 80 kanjis | `public/collection.json` | 80 kanji, 232 palabras, lecturas, significados y dificultades |
| Menú | `public/content/navigation.json` | Orden, etiquetas, tipos y archivos de las secciones |
| Contadores | `public/content/counters.json` | 17 contadores y 3 grupos de números; lecturas, variantes y preguntas |
| Kana | `public/content/kana.json` | 46 sonidos básicos, 25 con marcas y 33 combinaciones; hiragana y katakana |
| Verbos | `public/content/verbs.json` | 50 entradas del curso, principalmente en forma ます |
| Vocabulario | `public/content/vocabulary.json` | 132 entradas agrupadas por tema |
| Adjetivos y adverbios | `public/content/modifiers.json` | 42 entradas: adjetivos い, adjetivos な y adverbios |
| Esquema de edición | `public/content/study.schema.json` | Formato de los archivos nuevos para editores compatibles con JSON Schema |

Cada archivo nuevo declara `version`, `kind`, `title`, `description`, `sources`, `groups`, `guides` y `entries`. Los textos de estudio y sus clasificaciones viven en esos archivos, no en los componentes TypeScript.

## Procedencia

La importación inicial del 16 de noviembre de 2026 usa las notas temáticas de **日本語 / Primer curso organizado**, que ya documentan correcciones del archivo original. Se conservan sus lecturas, traducciones y distinciones de uso. Las redacciones personales y el archivo de apuntes sin corregir no se han importado.

Las fuentes del vault se registran con el nombre, la ruta relativa de la nota y su SHA-256 en el momento de importación. La huella identifica esa revisión; el build no exige tener iCloud u Obsidian disponibles. El vault original no se modifica. Los cambios posteriores se trasladan al JSON y se revisan en el PR; no hay sincronización automática que pueda sobrescribir una edición.

Los contadores parten de la imagen proporcionada. Se distinguen duración en días y días del mes, y 百・千・万 se tipifican como números. El calendario se completa hasta el 31 con `new additions.md`. `editorialNotes` documenta la normalización de とお y las decisiones de transcripción. Las celdas vacías de las centenas y los millares no se rellenan automáticamente. Las referencias de consulta están en `sources`.

El vault no contiene una tabla completa de kana: esa sección se completa con la referencia de la Embajada de Japón indicada en su archivo. Los kana no usan la fuente de kanji decorativa: se presentan en Noto Sans JP para facilitar su reconocimiento.

## Editar o añadir entradas

1. Edita el archivo de la sección. Conserva el `id` de una entrada existente, aunque corrijas su grafía o significado: será su identidad al usarla en un quiz u otra vista.
2. Para una entrada nueva, elige un `id` único y estable, con letras latinas minúsculas, números y guiones.
3. Usa un `group` y un `sourceId` declarados en el mismo archivo. Añade la fuente si no existe.
4. Las lecturas léxicas se escriben en hiragana. Las variantes de contadores se guardan como lecturas distintas dentro de `readings`, nunca escondidas en un campo de texto.
5. Guarda las cantidades de un contador ordenadas y sin duplicados. `special` indica una lectura irregular o un cambio de sonido; no es una dificultad de estudio.
6. Si el cambio necesita una explicación, usa `note`, `notes` o una guía en `guides`, según el tipo de entrada.

Ejemplo de una entrada léxica:

```json
{
  "id": "verb-tabemasu",
  "written": "食べます",
  "reading": "たべます",
  "romaji": "tabemasu",
  "meaning": "comer",
  "group": "main",
  "sourceId": "verbs-note"
}
```

Las dificultades y los audios existentes siguen asociados a `collection.json` y sus identificadores originales. Las nuevas secciones muestran lecturas y contenidos de consulta; no se generan audios ni clasificaciones por defecto.

Para añadir otra sección léxica, crea un archivo con `kind: "lexicon"` y añádelo al menú. No requiere otro componente de presentación. Los tipos nuevos de contenido sí necesitan su definición y su vista.

## Validar un PR

```sh
npm run check:content
npm test
npm run build
npm run check:build
```

La validación comprueba versiones, campos obligatorios y desconocidos, IDs únicos, rutas seguras, fuentes, referencias de grupos, lecturas, correspondencias hiragana/katakana y cantidades ordenadas. El chequeo del build verifica que los JSON publicados son idénticos a los archivos canónicos.

`Validate pull request` ejecuta estas comprobaciones en cada PR, sin publicar. El workflow de Pages las repite antes de desplegar los cambios de `main`.

Revisa también los cambios de significado y pronunciación: una validación estructural no puede decidir si una traducción es correcta.

## URLs estáticas

La página de entrada sigue siendo la colección de 80 kanji. Las otras secciones usan `?section=counters`, `?section=kana`, `?section=verbs`, `?section=vocabulary` y `?section=modifiers`. `q` conserva la búsqueda y `group` el filtro de las secciones nuevas.

Todas usan el mismo `index.html`. Se pueden abrir, compartir y recargar desde un subdirectorio de GitHub Pages o un CDN, sin rutas de servidor ni reglas de reescritura.
