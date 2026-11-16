# AGENTS.md

Instrucciones para agentes y personas que modifican este repositorio. `CLAUDE.md` es un enlace simbólico a este archivo: edita solo `AGENTS.md`.

80kanjis es una web estática (TypeScript + Vite, sin framework) publicada en GitHub Pages. El funcionamiento general está en [README.md](README.md) y el formato del contenido en [CONTENIDO.md](CONTENIDO.md).

## Antes de dar un cambio por terminado

```sh
npm run check:content
npm test
npm run build
npm run check:build
```

Es la misma secuencia que ejecuta CI. Si una comprobación falla, corrige la causa en lugar de relajarla.

## Rendimiento: reglas que hay que mantener

La carga inicial se optimizó en noviembre de 2026. Estas reglas evitan que vuelva a empeorar; `check:build` y los tests de los cargadores vigilan las principales.

1. **Sin fuentes ni CSS de terceros.** No vuelvas a añadir Google Fonts ni otro CDN, ni ningún `@import` en el CSS. Las fuentes se declaran con `@font-face` en `src/style.css` y viven en `src/fonts/`, para que Vite les añada un hash al nombre. No las muevas a `public/`: sin hash, un navegador podría seguir usando una versión antigua en caché.
2. **Los datos de arranque se piden desde el HTML.** `index.html` precarga `content/navigation.json`, `collection.json` y DM Sans. Si cambias la ruta o el nombre de alguno, actualiza el preload y `scripts/check-build.mjs`.
3. **Cada `fetch` debe coincidir con su preload.** Misma URL relativa a `document.baseURI`, sin parámetros añadidos, con el modo y las credenciales por defecto y sin opción `cache`. Si no coinciden, el archivo se descarga dos veces. No uses `cache: 'no-store'`, `'reload'` ni `'no-cache'`, ni añadas `?v=` o marcas de tiempo: el navegador ya revalida con ETag.
4. **Nada de peticiones en cadena.** `boot()` en `src/main.ts` pide la navegación y la colección en paralelo. Si un dato nuevo hace falta al cargar, pídelo a la vez que los demás; si lo necesitan la mayoría de las visitas, añade también su preload.
5. **Solo se precarga DM Sans.** Las fuentes japonesas pesan más y competirían con el JS y los JSON; precárgalas solo si una medición demuestra que mejora la carga. El `href` de un preload de fuente debe ser `/src/fonts/...`, para que Vite lo convierta en el mismo archivo con hash que usa el CSS.
6. **Caché de GitHub Pages.** Pages envía `Cache-Control: max-age=600`: tras un despliegue, quien ya visitó la web puede ver el contenido anterior hasta 10 minutos. Es el precio de no volver a descargar los JSON en cada visita.

Tamaños de referencia (noviembre de 2026). Si un cambio los aumenta de forma apreciable, dilo y justifícalo:

| Archivo | Tamaño |
| --- | --- |
| `dm-sans.woff2` | 21 KB |
| `noto-sans-jp.woff2` | 84 KB |
| `noto-serif-jp.woff2` | 195 KB |
| JS (gzip) | 31 KB |
| CSS (gzip) | 7 KB, incluidos los dos temas |

## Tema claro y oscuro

- **Los colores solo se usan a través de variables.** Están definidas en `src/style.css`: los valores claros en `:root` y los oscuros en `:root[data-theme='dark']`. No escribas colores literales en las reglas. Cada variable nueva necesita valor claro y oscuro.
- **Dos excepciones intencionadas:** `::selection` y `dialog::backdrop` tienen una regla explícita por tema, porque esos pseudoelementos no heredan bien las variables en navegadores antiguos.
- **`--accent` es para texto; `--accent-fill` es para fondos** con `--on-accent` encima. En claro coinciden; en oscuro no, porque un verde legible como texto es demasiado claro como fondo.
- **Los valores claros son el diseño original.** Al pasar el CSS a variables se comprobó que el modo claro queda idéntico píxel a píxel. No los cambies al retocar el oscuro.
- **Contraste:** en oscuro, cada color de texto debe tener al menos 4,5:1 sobre su fondo (WCAG AA). El mínimo actual es 4,6, el del texto de ejemplo del buscador.
- **En oscuro, el contenido de estudio va en blanco puro (`#fff`),** por legibilidad: un blanco grisáceo cansaba al leer. Incluye kanji, palabras, lecturas en kana y significados, a través de `--text`, `--reading`, `--reading-ending`, `--meaning`, `--meaning-strong`, `--chip-text`, `--table-label`, `--title-soft`, `--dialog-example` y `--guide-example`. Las etiquetas, el rōmaji, las notas y los textos de ayuda siguen en gris para mantener la jerarquía. Si añades texto de estudio nuevo, usa una de esas variables.
- **Cómo se aplica el tema:**
  - un script en línea en `index.html` lee la preferencia y pone `data-theme` en `<html>` antes de pintar, para que no haya un destello del tema equivocado;
  - `src/theme.ts` gestiona el botón;
  - si cambias la clave (`80kanjis-theme`) o sus valores (`light`/`dark`), cámbialos en los dos sitios;
  - sin preferencia guardada, la página sigue al sistema, también en vivo;
  - elegir el mismo tema que el sistema borra la preferencia.
- **El script en línea debe seguir siendo mínimo,** síncrono y sin peticiones de red: bloquea el análisis del HTML.
- **El tema es lo único que la web guarda en el navegador.** `check:build` falla si el bundle o `index.html` usan `localStorage` con otra clave, o si usan `sessionStorage`, IndexedDB o cookies. Guardar cualquier otra cosa (dificultades, progreso…) es una decisión de producto: no la tomes de forma implícita.
- **Cabecera en móvil:** el adorno «日本語 — ESPAÑOL» se oculta por debajo de 430 px para que quepan los botones de tema y de información. Si añades algo a la cabecera, comprueba que cabe entre 320 y 1000 px de ancho.

## Móvil

Revisa cualquier cambio de interfaz entre 320 y 430 px de ancho, con emulación táctil, además del escritorio.

- **Menú:** por debajo de 680 px se reparte en varias líneas para que se vean todas las secciones, y «Kana» queda al final. Con las seis secciones actuales ocupa dos líneas a 320 px con solo 5 px de margen: si añades una sección o alargas un nombre, comprueba que no pasa a tres líneas.
- **Filtros:** en el teléfono ocupan todo el ancho y se desplazan hasta el borde de la pantalla; el contador de resultados va debajo.
- **Buscador:** el texto de ayuda se asigna con `fitPlaceholder()` (`src/search-placeholder.ts`), con una versión larga y una corta. Se muestra la larga solo si cabe, medida con la fuente real. La corta tiene que caber a 320 px; evita caracteres fuera de Latin‑1, como «ō», que DM Sans no incluye.
- **Controles táctiles:** con puntero táctil, los botones Audio/Info miden 30 px de alto a la vista, pero un `::after` invisible amplía su zona táctil a 44 px. No los conviertas en cajas de 44 px.
- **Fichas de los 80 kanji:** en el teléfono (≤600 px) cada tarjeta es una lista. El kanji, sus significados, Info y la dificultad forman la cabecera, separada por una línea fina; debajo van las tres palabras, sin columnas ni líneas entre ellas. Así la lectura queda en la misma línea que la palabra a partir de 360 px. Se eligió frente al 2×2 (lecturas que saltaban de línea y orden de lectura confuso) aunque alarga la página un 22 %. En tablets se mantiene el 2×2 y en escritorio las cuatro columnas. Se hace solo con CSS (`display: contents` y grid), sin tocar el HTML.
- **Kana:** las columnas se estrechan a 84 px (104 px en las combinaciones) para mostrar más sílabas sin cambiar el orden tradicional de la tabla.

## Fuentes recortadas

Cada familia es un único WOFF2 con solo los caracteres que usa la web. Los genera `scripts/subset-fonts.py`:

```sh
python3 -m pip install fonttools brotli   # una vez
npm run fonts
```

- El script descarga las fuentes originales de google/fonts desde un commit fijo (`REVISION`), comprueba su SHA-256 y las guarda en `tmp/font-sources/`, que Git ignora.
- Incluye los caracteres de estos archivos y los lista en `src/fonts/characters.txt`:
  - los valores de texto de `public/collection.json` y `public/content/*.json`, salvo `study.schema.json`;
  - el texto literal de `index.html`, `src/style.css` y `src/**/*.ts`, salvo los tests.
- DM Sans incluye además ASCII, Latin‑1 y la puntuación tipográfica habitual, para lo que se escriba en el buscador.
- `npm run check:content` falla si alguno de esos caracteres no está en `characters.txt`. No edites `characters.txt` a mano: ejecuta `npm run fonts` e incluye en el commit los `.woff2` y `characters.txt` regenerados.
- La salida es determinista. Si `npm run fonts` cambia los `.woff2` sin que haya caracteres nuevos, han cambiado las fuentes o las herramientas: revísalo antes de confirmarlo.
- Para actualizar la versión de las fuentes, cambia `REVISION` y los hashes a propósito y revisa el resultado en el navegador.
- El script y el chequeo de `scripts/check-content.ts` deben leer los mismos archivos. Si cambias uno, cambia el otro.

## Limitaciones de glifos

Ninguna rompe la página, pero todas degradan la tipografía. Tenlas en cuenta antes de añadir funciones o contenido.

### Qué caracteres quedan fuera

- **Todo carácter que no estaba al generar las fuentes** se dibuja con una fuente del sistema, glifo a glifo. Una misma palabra puede mezclar dos tipografías, y el resultado depende del sistema operativo: Hiragino en macOS, Yu Gothic o Meiryo en Windows, Noto CJK en Android.
- **Texto que el script no ve:**
  - lo que escribe el usuario (el buscador usa DM Sans, que nunca tuvo glifos japoneses);
  - datos de APIs o de archivos fuera de `public/content/`;
  - texto generado al ejecutarse (`String.fromCharCode`, rangos de kana);
  - caracteres escritos como escapes (`'あ'`) en TypeScript, porque el script lee el texto literal: escribe el carácter tal cual. En los JSON los escapes sí cuentan, porque el script los interpreta.
- **Contenido sustituido sin recompilar.** El README permite sustituir `collection.json` en el CDN sin recompilar. Sigue valiendo para los datos, pero si el JSON trae caracteres nuevos hay que ejecutar `npm run fonts`, recompilar y desplegar.
- **Glifos que la familia no tiene**, como emojis, kanji muy raros o símbolos ausentes en Noto JP y DM Sans. El recorte no puede añadirlos; `npm run fonts` los avisa con `Warning: no font has …`.
- **Japonés dentro de texto en DM Sans**, como `日本語` en la cabecera o `一歩ずつ` al final de la colección. Siempre ha usado la fuente del sistema. Para que use Noto, el elemento necesita `font-family: var(--japanese)` o `var(--japanese-reading)`.

### Pesos y estilos

| Familia | Uso | Pesos incluidos |
| --- | --- | --- |
| DM Sans | Texto general | 400–700 variable; tamaño óptico fijo (`opsz` 14), como lo servía Google |
| Noto Sans JP | Lecturas (`--japanese-reading`) | Solo 400 |
| Noto Serif JP | Kanji y palabras (`--japanese`) | 400–600 variable |

Con `font-synthesis: none`, el navegador no inventa pesos ni cursivas:

- un peso fuera del rango usa el más cercano: 700 en Noto Serif JP se ve como 600, y una lectura en negrita se ve en 400;
- `font-style: italic` se ve recta, porque ninguna familia incluye cursiva.

Para añadir un peso, cambia el eje en `FONTS` (`scripts/subset-fonts.py`) y el `font-weight` del `@font-face` en `src/style.css`.

### Funciones OpenType

- **Se conservan** las predeterminadas de fontTools, que cubren lo que el navegador aplica por defecto: `kern`, `liga`, `calt`, `ccmp`, `locl`, `frac`/`numr`/`dnom`, `palt`/`halt` y las verticales `vert`/`vrt2`/`vkrn`/`vpal`/`vhal`. La escritura vertical del diálogo de kanji (`writing-mode: vertical-rl`) funciona.
- **Se eliminan** en DM Sans `case`, `ordn`, `sups`, `ss01`–`ss08` y `aalt`; en las japonesas, `jp78`/`jp83`/`jp90`, `nlck`, `fwid`/`hwid`/`pwid`, `hist`, `dlig`, `aalt` y `ruby`. En esta versión de Noto, `ruby` solo cambia 5 marcas tonales de bopomofo, así que las lecturas en `<rt>` no cambian aunque Firefox la active.
- Por tanto, no tienen efecto `font-variant-east-asian`, `font-variant-position: super` ni los `font-feature-settings` de esas funciones. Para usarlas, añádelas a `options.layout_features` en el script y regenera.
- `font-variant-numeric: tabular-nums` (en los contadores de resultados) no hace nada: DM Sans no tiene `tnum`, tampoco cuando se servía desde Google.

## Si estos límites estorban

Opciones con su coste aproximado. Mide antes de decidir.

- **Mostrar texto japonés abierto** (lo que escribe el usuario o datos externos): añade otro `@font-face` con el mismo `font-family`, un `unicode-range` amplio y una versión más completa de la fuente. Declara el subset después, con un `unicode-range` generado desde `characters.txt`. Así el navegador solo descarga la fuente grande cuando aparece un carácter que el subset no tiene.
- **Ampliar el subset con un conjunto fijo**, por ejemplo kana y los 2.136 jōyō kanji. El tamaño crece casi en proporción a los glifos: unos 0,25 KB por glifo en Noto Serif JP 400–600 y 0,11 KB en Noto Sans JP 400, es decir, unos 600 KB y 260 KB.
- **Aligerar Noto Serif JP:** con el rango 400–500 pesa 174 KB y solo con 400, 108 KB. Cambia el aspecto de los kanji grandes, que usan 500.
- **Volver a Google Fonts:** con `<link rel="preconnect">` y `<link rel="stylesheet">` en `index.html`, nunca con `@import` en el CSS. Cubre cualquier carácter, a cambio de depender de un tercero y descargar más.
