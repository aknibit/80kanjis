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

El menú conserva primero las secciones principales. `placement: "support"` coloca Kana separado al final, a la derecha; en móvil sigue visible mientras el menú principal permite desplazamiento horizontal.

En Kana, los tres grupos comparten las mismas once columnas por familia de sonidos: vocales, k/g, s/z, t/d, n, h/b/p, m, y, r, w y ん, desde la derecha. Así, か・が・きゃ・ぎゃ quedan en la misma columna. `position.row` avanza hacia abajo dentro de cada grupo: los básicos y dakuten usan a・i・u・e・o; handakuten ocupa un segundo bloque de cinco filas en la columna h/b/p. Las combinaciones usan bloques ya・yu・yo, seguidos de las variantes con dakuten y handakuten en sus mismas columnas. Se admiten hasta quince filas y se conservan los huecos de や・ゆ・よ y わ・を. Se comprueba que no haya posiciones duplicadas dentro de un grupo. Los tres grupos comparten el desplazamiento horizontal, también al filtrar o buscar.

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
5. Guarda las cantidades de un contador ordenadas y sin duplicados. Cada forma y pregunta incluye en `meaning` un ejemplo de uso en español, que la tabla muestra en la columna «Ejemplo»: por ejemplo, `cuatro fotografías`, `una bicicleta` o `¿Cuántas semanas?`. Siempre que se pueda, cada forma usa un ejemplo concreto y distinto de un uso real del contador, para que sus diez filas muestren todo lo que cuenta (〜本: un lápiz, dos botellas… siete películas, diez llamadas de teléfono), en vez de repetir una categoría genérica como «objetos alargados». En el contador general 〜つ, usa conceptos que no tengan un contador más adecuado (preguntas, ideas, razones), no objetos que ya tienen el suyo (una manzana se cuenta mejor con 〜個). Comprueba que cada objeto se cuenta así en el japonés actual; evita los usos tradicionales o dudosos, como 〜羽 con conejos. Los números (百, 千, 万) se traducen como cantidades, sin añadir un objeto que el japonés no lleva. La tabla muestra esa traducción en lugar de `value`, que conserva la cantidad numérica para ordenar y validar. `special` indica una lectura irregular o un cambio de sonido; no es una dificultad de estudio.
6. Si el cambio necesita una explicación, usa `note`, `notes` o una guía en `guides`, según el tipo de entrada.
7. Cada contador lista en `endings` sus terminaciones en hiragana (por ejemplo `["ほん", "ぽん", "ぼん"]`), que se muestran en su cabecera. Van de más a menos frecuentes: una forma o la pregunta cuenta una vez si alguna de sus lecturas termina así. La validación rechaza una terminación que ninguna lectura use o un orden que no respete esa frecuencia. Las lecturas irregulares, como ひとり o ついたち, no necesitan terminación propia.
8. Si el texto usa un carácter que no aparecía antes (un kanji, un kana o un símbolo nuevo), ejecuta `npm run fonts` e incluye en el commit los archivos regenerados de `src/fonts/`. Las fuentes solo contienen los caracteres del contenido; consulta las limitaciones en [AGENTS.md](AGENTS.md).

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

La validación comprueba versiones, campos obligatorios y desconocidos, IDs únicos, rutas seguras, fuentes, referencias de grupos, lecturas, correspondencias hiragana/katakana, cantidades ordenadas y que las fuentes incluyan todos los caracteres. El chequeo del build verifica que los JSON publicados son idénticos a los archivos canónicos.

`Validate pull request` ejecuta estas comprobaciones en cada PR, sin publicar. El workflow de Pages las repite antes de desplegar los cambios de `main`.

Revisa también los cambios de significado y pronunciación: una validación estructural no puede decidir si una traducción es correcta.

## URLs estáticas

La página de entrada sigue siendo la colección de 80 kanji. Las otras secciones usan `?section=counters`, `?section=kana`, `?section=verbs`, `?section=vocabulary` y `?section=modifiers`. `q` conserva la búsqueda y `group` el filtro de las secciones nuevas.

Todas usan el mismo `index.html`. Se pueden abrir, compartir y recargar desde un subdirectorio de GitHub Pages o un CDN, sin rutas de servidor ni reglas de reescritura.
