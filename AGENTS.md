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
   Lo que no hace falta al cargar no se pide al cargar: las frases de los kanji (`content/kanji-sentences.json`, unos 20 KB con gzip) se piden al abrir la primera ventana de un kanji y se guardan para el resto de la visita. Meterlas en `collection.json` triplicaría lo que se precarga; no les añadas preload.
5. **Solo se precarga DM Sans.** Las fuentes japonesas pesan más y competirían con el JS y los JSON; precárgalas solo si una medición demuestra que mejora la carga. El `href` de un preload de fuente debe ser `/src/fonts/...`, para que Vite lo convierta en el mismo archivo con hash que usa el CSS.
6. **Caché de GitHub Pages.** Pages envía `Cache-Control: max-age=600`: tras un despliegue, quien ya visitó la web puede ver el contenido anterior hasta 10 minutos. Es el precio de no volver a descargar los JSON en cada visita.

Tamaños de referencia (noviembre de 2026). Si un cambio los aumenta de forma apreciable, dilo y justifícalo:

| Archivo | Tamaño |
| --- | --- |
| `dm-sans.woff2` | 21 KB |
| `noto-sans-jp.woff2` | 94 KB (84 KB antes de los ejemplos y frases de los contadores) |
| `noto-serif-jp.woff2` | 218 KB (195 KB antes de los ejemplos y frases de los contadores) |
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
- **Filtros:** en el teléfono ocupan todo el ancho y se desplazan hasta el borde de la pantalla; el contador de resultados va debajo. Contadores tiene una segunda fila, «Dificultad», que se combina con la de grupos (fáciles de objetos): cada botón cuenta lo que mostraría con el otro filtro aplicado (`filterByGroupAndDifficulty()`), y cada fila se desplaza por separado. En las secciones con fichas (`layout: "cards"`, ahora solo Vocabulario) se reparten en varias líneas, sin desplazamiento, y en el teléfono son más compactos (36 px de alto, 13 px de texto). Con los nueve temas actuales ocupan ocho líneas a 320 px y dos en escritorio.
- **Buscador:** el texto de ayuda se asigna con `fitPlaceholder()` (`src/search-placeholder.ts`), con una versión larga y una corta. Se muestra la larga solo si cabe, medida con la fuente real. La corta tiene que caber a 320 px; evita caracteres fuera de Latin‑1, como «ō», que DM Sans no incluye.
- **Controles táctiles:** con puntero táctil, los botones Audio/Info miden 30 px de alto a la vista, pero un `::after` invisible amplía su zona táctil a 44 px. No los conviertas en cajas de 44 px.
- **Fichas de los 80 kanji:** en el teléfono (≤600 px) cada tarjeta es una lista. El kanji, sus significados, Info y la dificultad forman la cabecera, separada por una línea fina; debajo van las tres palabras, sin columnas ni líneas entre ellas. Así la lectura queda en la misma línea que la palabra a partir de 360 px. Se eligió frente al 2×2 (lecturas que saltaban de línea y orden de lectura confuso) aunque alarga la página un 22 %. En tablets se mantiene el 2×2 y en escritorio las cuatro columnas. Se hace solo con CSS (`display: contents` y grid), sin tocar el HTML.
- **Terminaciones de los contadores:** van alineadas a la derecha, junto al número de formas, que lleva encima los puntos de dificultad del contador, como en las fichas de kanji. Por debajo de 900 px pasan a su propia fila y ocupan todo el ancho, también bajo el símbolo, para que tres terminaciones (〜ひゃく, 〜ぴゃく, 〜びゃく) quepan en una línea a 320 px.
- **Tablas de contadores:** escritura, lectura, ejemplo y frase, en ese orden. La escritura (alineada a la derecha, en una columna de 112 px que cabe 三十一日) y la lectura (alineada a la izquierda) se leen como una pareja. El ejemplo y la frase ponen el japonés, su lectura y su traducción uno debajo de otro, como los ejemplos léxicos; la frase, un poco más pequeña. La escritura nunca se parte (`nowrap`), y las lecturas solo saltan de línea entre variantes, en el « · », y los ejemplos entre bloques, gracias a `word-break: keep-all` con `overflow-wrap: break-word`. No uses `overflow-wrap: anywhere` en esas celdas: deja que la tabla las estreche y parte las palabras japonesas. Las cuatro columnas solo caben por encima de 900 px. Por debajo, la tabla pasa a ser una rejilla: el ejemplo y la frase bajan bajo la lectura, uno al lado del otro, y en el teléfono (≤600 px) uno debajo del otro. A 320 px ni siquiera cabrían tres columnas: さんじゅういちにち y su ejemplo, しちがつ さんじゅういちにち, ya suman más que el ancho. La columna de la escritura, compartida con `subgrid`, mide lo que la escritura más larga de esa tabla. Sin cabecera visible, una raya fina a la izquierda (`--action-border`, como las frases de la ventana de un kanji) distingue la frase del ejemplo. `display: grid` y `contents` pueden borrar la semántica de tabla en algunos lectores de pantalla, así que `renderCounter()` pone los roles ARIA (`table`, `rowgroup`, `row`, `columnheader`, `rowheader`, `cell`) de forma explícita; no los quites.
- **Filas léxicas con ejemplos:** una entrada con `examples` se despliega como un contador (`details`, con + / −). El `summary` solo admite contenido de frase, así que esas filas usan `span` en lugar de `h3` y `p`. Si alguna entrada de la lista se despliega, todas las filas reservan la columna del + para que significados y etiquetas queden alineados. En el teléfono el + queda arriba a la derecha, junto a la palabra, y los ejemplos van en una columna. Las frases solo saltan de línea en los espacios entre bloques (`word-break: keep-all`), igual que las lecturas de los contadores.
- **Formas de los adjetivos:** los ejemplos con `form` se colocan en una tabla de 2 × 2 (afirmativo arriba, negativo abajo; presente a la izquierda, pasado a la derecha), con el nombre de la forma encima de cada frase. En el teléfono van en una columna, en el mismo orden: presente y pasado afirmativos, y luego presente y pasado negativos. Es el orden en que se trabajan en clase; no lo cambies. A 320 px la columna de la frase mide 236 px y el bloque más largo, 「面倒くさくなかったです。」, 228 px: un bloque más ancho se parte por cualquier sitio y puede dejar el 「。」 solo en una línea. Por eso los adjetivos な escriben `では ありません`, con espacio. Si añades un adjetivo largo, comprueba sus frases a 320 px.
- **Fichas léxicas** (`layout: "cards"`): un masonry en el que cada ficha conserva su altura. `src/masonry.ts` calcula las columnas a partir de `--card-min` y `--card-gap`, que define el CSS, y coloca cada ficha en la columna más corta con `position: absolute` y `transform`, así que el orden se lee de izquierda a derecha. Un `ResizeObserver` vuelve a colocarlas cuando cambia el ancho o llegan las fuentes. No se usa CSS nativo (`grid-lanes`/`masonry`), que aún no está en todos los navegadores, ni `columns`, que ordena de arriba abajo. El ancho mínimo es de 180 px en escritorio, 150 px por debajo de 900 px y 132 px en el teléfono, para que a 320 px quepan dos columnas (2 × 132 px más el hueco caben en 284 px). La traducción (`meaning`) va en el color del contenido de estudio y el matiz (`note`: registro, uso o contexto) debajo, más pequeño y en `--text-soft`, que da más contraste que el `--body-soft` de las filas (5,6:1 frente a 4,5:1 en claro). Solo un espacio de 12 px separa el japonés del significado; el cambio de tipografía hace el resto. Se probaron una línea a todo el ancho, un marco tintado, una raya corta y el rōmaji en la misma línea que la lectura: las tres primeras recargaban la ficha con tantas en pantalla, y la cuarta mezclaba dos disposiciones en el teléfono, porque el rōmaji salta de línea en unas fichas y en otras no. El tema cierra la ficha como un pie fino, a todo el ancho, bajo una línea clara (`--table-line`), y solo aparece con «Todo»: con un tema seleccionado, el filtro ya lo nombra. Una franja tintada para el pie se probó y se descartó, porque `--row-highlight` es casi igual que `--page` y la etiqueta parecía fuera de la ficha. El margen interior de la ficha está en `--card-pad`, que usa el pie para llegar a los bordes. Con «Todo», las fichas salen en orden aleatorio, mezclado una vez por visita, así que buscar no las reordena; con un tema seleccionado, siguen el orden del JSON. La escritura y la lectura solo saltan de línea en los espacios y después de «／», y los significados después de «/»: `renderWord()` añade un `<wbr>` tras cada barra y el CSS usa `word-break: keep-all`. Por debajo de 380 px el margen interior y la escritura se reducen para que 8 kana de lectura (はんとけいまわり) y 6 de escritura (クラスルーム) quepan en una línea.
- **Ventana de un kanji:** los 80 kanji muestran su vocabulario o sus frases en dos pestañas, «Vocabulario» y «Frases», con el patrón de pestañas de WAI-ARIA: las flechas, Inicio y Fin cambian de pestaña, y solo la activa recibe el tabulador. La pestaña elegida se mantiene al abrir otro kanji durante la visita, pero no se guarda en el navegador. La ventana mide 640 px, para que casi todas las frases quepan en una línea, y se ancla arriba en lugar de centrarse: así, al cambiar de pestaña o de kanji cambia la altura sin que las pestañas se muevan bajo el cursor. Las frases solo saltan de línea en los espacios entre bloques (`word-break: keep-all`); a 320 px las más largas ocupan tres líneas. Solo se destaca el kanji de la ventana, con el tono de `--accent` y sin efecto al pasar el ratón: las frases no son botones, para que un lector de pantalla las lea seguidas. Los kanji de apoyo no tienen frases ni pestañas y conservan los 560 px.
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
