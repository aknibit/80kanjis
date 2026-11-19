# Contenido de estudio

Los archivos de `public/` son la fuente de la verdad publicada. El navegador los lee directamente y Vite los copia a `dist/` sin transformarlos. No hace falta una base de datos ni acceder al vault desde el servidor de build.

## Archivos

| Sección | Fuente canónica | Contenido inicial |
| --- | --- | --- |
| 80 kanjis | `public/collection.json` | 80 kanji, 232 palabras, lecturas, significados y dificultades |
| Menú | `public/content/navigation.json` | Orden, etiquetas, tipos y archivos de las secciones |
| Contadores | `public/content/counters.json` | 19 contadores y 3 grupos de números; lecturas, variantes, preguntas, un ejemplo en japonés y una frase de uso diario por forma, y la dificultad de cada contador |
| Kana | `public/content/kana.json` | 46 sonidos básicos, 25 con marcas y 33 combinaciones; hiragana y katakana |
| Verbos | `public/content/verbs.json` | 59 entradas en forma ます, cada una con dos ejemplos: primero los 20 verbos esenciales, luego los del curso y las expresiones |
| Vocabulario | `public/content/vocabulary.json` | 305 entradas agrupadas en diez temas |
| Adjetivos y adverbios | `public/content/modifiers.json` | 72 entradas: 37 adjetivos い y 18 な, cada uno con cuatro ejemplos (presente y pasado, afirmativo y negativo), y 17 adverbios con dos ejemplos |
| Frases de los kanji | `public/content/kanji-sentences.json` | 480 frases para la ventana de cada uno de los 80 kanji: dos sencillas y cuatro con adjetivos, adverbios y contadores |
| Esquema de edición | `public/content/study.schema.json` | Formato de los archivos nuevos para editores compatibles con JSON Schema |

Cada archivo nuevo declara `version`, `kind`, `title`, `description`, `sources`, `groups`, `guides` y `entries`. Los textos de estudio y sus clasificaciones viven en esos archivos, no en los componentes TypeScript.

El menú conserva primero las secciones principales. `placement: "support"` coloca Kana separado al final, a la derecha; en móvil sigue visible mientras el menú principal permite desplazamiento horizontal.

Una sección léxica puede declarar `layout: "cards"` en el menú, como Vocabulario. Sus entradas se muestran como fichas compactas en tantas columnas como quepan y sin igualar alturas. Los filtros ocupan varias líneas en lugar de desplazarse. Con «Todo», las fichas aparecen en orden aleatorio en cada visita y cada una indica su grupo en el pie; con un grupo seleccionado, siguen el orden del archivo, que conviene que siga teniendo sentido, y no repiten el grupo. Las fichas no se despliegan, así que una sección en fichas no puede tener entradas con `examples`; los tests lo comprueban. Sin `layout`, la sección usa filas, como Verbos y Adjetivos y adverbios.

En Kana, los tres grupos comparten las mismas once columnas por familia de sonidos: vocales, k/g, s/z, t/d, n, h/b/p, m, y, r, w y ん, desde la derecha. Así, か・が・きゃ・ぎゃ quedan en la misma columna. `position.row` avanza hacia abajo dentro de cada grupo: los básicos y dakuten usan a・i・u・e・o; handakuten ocupa un segundo bloque de cinco filas en la columna h/b/p. Las combinaciones usan bloques ya・yu・yo, seguidos de las variantes con dakuten y handakuten en sus mismas columnas. Se admiten hasta quince filas y se conservan los huecos de や・ゆ・よ y わ・を. Se comprueba que no haya posiciones duplicadas dentro de un grupo. Los tres grupos comparten el desplazamiento horizontal, también al filtrar o buscar.

## Procedencia

La importación inicial del 16 de noviembre de 2026 usa las notas temáticas de **日本語 / Primer curso organizado**, que ya documentan correcciones del archivo original. Se conservan sus lecturas, traducciones y distinciones de uso. Las redacciones personales y el archivo de apuntes sin corregir no se han importado.

En el vocabulario, `meaning` es solo la traducción y `note` recoge el matiz de registro, uso o contexto (`cena` y `coloquial`, en lugar de `cena, coloquial`). Las fichas muestran la nota más pequeña y en gris. El 16 de noviembre de 2026 se separaron así 29 significados importados, sin cambiar su contenido salvo para que la nota se entienda sola (`«viajar» se dice りょこうします`). Ese día también se escribieron con kanji tres entradas que estaban en kana, siguiendo el criterio del curso de usar kanji aunque sean poco frecuentes (林檎, 鸚鵡): うち como 家／内, くし como 櫛 y みかん como 蜜柑. Siguen en kana おかき, ひよこ y ものづくり, que se escriben así habitualmente, y los préstamos en katakana.

Las fuentes del vault se registran con el nombre, la ruta relativa de la nota y su SHA-256 en el momento de importación. La huella identifica esa revisión; el build no exige tener iCloud u Obsidian disponibles. El vault original no se modifica. Los cambios posteriores se trasladan al JSON y se revisan en el PR; no hay sincronización automática que pueda sobrescribir una edición.

Los contadores parten de la imagen proporcionada. Se distinguen duración en días y días del mes, y 百・千・万 se tipifican como números. El calendario se completa hasta el 31 con `new additions.md`. `editorialNotes` documenta la normalización de とお y las decisiones de transcripción. Las celdas vacías de las centenas y los millares no se rellenan automáticamente. Las referencias de consulta están en `sources`. Los ejemplos en japonés de cada forma y pregunta, y la dificultad de cada contador, se añadieron para esta web el 19 de noviembre de 2026; los ejemplos traducen los usos en español que ya tenía cada forma, salvo donde no había una frase natural: «cinco opciones» pasó a «cinco puntos clave» (五つの ポイント), «diez promesas» a «contar hasta diez» (十まで 数える, porque 十 solo se lee とお al contar), «cinco piezas de puzle» a «cinco botones», y las duraciones, edades, fechas y cantidades, que eran genéricas («tres días», «día tres del mes», «trescientos»), a usos concretos (三日間の 雨, 三月 三日, 三百円). Ese mismo día se añadió una frase de uso diario por forma y pregunta, escrita para esta web: en tiendas, en casa, en clase o al quedar (きっぷを 一枚 ください。, 十二日は ははの たん生日です。). Más tarde ese día se reescribieron con el vocabulario de clase (ver más abajo).

Los verbos empiezan por el grupo `essentials`: los 20 verbos esenciales, en el orden de la lista proporcionada (de 起きます a 寝ます), que no es alfabético. Diecisiete ya estaban en la nota del curso y conservan su `id` y su fuente; 飲みます, 写真を撮ります y テニスをします se añadieron desde esa lista. Todos los verbos de la sección, no solo los esenciales, llevan dos ejemplos escritos para esta web, no importados del vault: frases cortas que solo usan palabras de la propia web (vocabulario, adjetivos, contadores y las palabras de los 80 kanji). たばこ, en el ejemplo de 吸います, es la excepción: solo aparece en el significado del verbo. Revisa su traducción como cualquier otro contenido.

Los adjetivos y adverbios siguen el mismo criterio: sus ejemplos se escribieron para esta web el 16 de noviembre de 2026 y solo usan palabras de la propia web. Una palabra cuenta si es una entrada o una de las palabras de un kanji. No basta con que forme parte de otra (答え, en 答え合わせ) ni con que su kanji esté entre los 80 (川 o 水 solos): el 17 de noviembre se cambiaron tres frases por esos motivos. Cada lectura coincide con la que da la web para esa palabra. Cada adjetivo tiene cuatro, uno por forma cortés, en el orden en que se trabajan en clase: presente afirmativo, pasado afirmativo, presente negativo y pasado negativo. Las guías de conjugación siguen el mismo orden. Los negativos usan las formas del curso: 〜くないです y 〜くなかったです en los adjetivos い, y 〜では ありません y 〜では ありませんでした en los な, nunca じゃ. きれい y いい tienen ejemplos de sus formas negativas, que son las que más confunden (きれいでは ありません, よくないです). Los adverbios tienen dos ejemplos; las frases que tenían como nota (`とても おもしろいです。`) pasaron a ser ejemplos con traducción, y あまり y ぜんぜん conservan la nota de que se usan con una forma negativa. Ese día también se juntaron los adjetivos い: おいしい, まずい, あまい y いい estaban detrás de los な.

Las frases de los kanji se escribieron para esta web el 18 de noviembre de 2026, con el mismo criterio que los ejemplos de verbos y adjetivos: solo usan palabras de la web, con su lectura y su grafía (子ども, 火じ, でん車). Cada kanji tiene dos frases sencillas y cuatro más elaboradas; cada una de esas cuatro usa un adjetivo, un adverbio o un contador, y entre las cuatro aparecen los tres. Una frase escribe su kanji como parte de una palabra: como 円 solo existe en 百円, 千円 y 百円玉, no hay precios como 三百円, y los meses eran los de la colección (二月, 四月, 七月…); desde el 19 de noviembre, Vocabulario tiene los doce. Las frases no se repiten entre kanji. Viven en un archivo aparte porque solo hacen falta al abrir una ventana: así la colección que se carga con la página sigue pesando lo mismo.

El 19 de noviembre de 2026 se incorporó el vocabulario de las hojas de clase de los temas 1 a 9 (fuente `class-handouts`):
- 209 entradas nuevas: 173 en Vocabulario, 6 en Verbos y 30 en Adjetivos y adverbios;
- un tema nuevo, «Tiempo y calendario»;
- los contadores 〜時 y 〜分.

«Lugares y edificios» pasó a llamarse «Lugares y transporte».

Las palabras nuevas siguen la grafía de clase:
- solo se escriben con kanji los 80, los de apoyo (個 色 庭 時 前), 何, 今 y 間 (時間);
- el resto va en kana, también dentro de una palabra (ち下てつ, 月よう日, 先しゅう, らい年);
- una palabra con lectura especial va entera en kana si alguno de sus kanji no está en esa lista (あした, けさ).

Las entradas anteriores conservan su grafía, así que conviven 晩ご飯 y あさごはん, o 難しい y あたらしい. 赤い, 白い, 青い, 大きい y 小さい ya eran palabras de los 80 kanji; se añadieron a Adjetivos para mostrar sus cuatro formas. Por la misma razón, Vocabulario tiene los doce meses, aunque seis ya estaban en la colección.

No se importaron:
- los demostrativos ni las palabras interrogativas (これ, どこ, いくら), que las frases usan en kana;
- las frases hechas (もしもし, いただきます);
- los préstamos en desuso (ワープロ, テレホンカード);
- los nombres de ciudades.

Desde ese día, los contextos (las frases de los kanji y los ejemplos de todas las secciones) usan sobre todo el vocabulario de esas hojas y solo la gramática de los temas 1 a 9:
- です y ます en presente y pasado, afirmativo y negativo;
- los adjetivos い y な;
- 好き, 上手, 分かります, あります e います;
- から para dar la causa;
- ませんか y ましょう;
- あげます y もらいます;
- もう y まだ.

No usan la forma て, salvo 〜て ください y la entrada 覚えて います. Tampoco usan 〜たい, 〜に なります ni la forma simple.

Ese día se reescribieron los ejemplos y las frases de los contadores que usaban otras palabras (理由, 友達, 紙, 映画) o gramática posterior (持って います, 住んで います, 一歳に なります). Los animales y objetos que no son palabras de la web se escriben en kana (ねこ, ぞう, つる, きって): así se ven sus usos sin añadir kanji que no se estudian.

También se reescribieron 99 ejemplos de verbos y de adjetivos y adverbios que usaban palabras del vault que no están en las hojas (弁護士, 怠け者, 王さま, 鸚鵡, 税金, 字幕, 満月, 年賀状). Ahora tratan situaciones de clase: horarios, transporte, compras, comida, aficiones y familia (まいあさ 七時に 起きます。, バスで 美術館へ 行きました。). Esas palabras siguen en Vocabulario. En los ejemplos de verbos y adjetivos ya no aparecen; en los contadores solo quedan donde muestran un uso que el vocabulario de clase no cubre (一羽の 鸚鵡, 七枚の 年賀状).

Las entradas escritas solo en hiragana no repiten la lectura en la página (あさ, でんわをかけます), igual que los ejemplos sin kanji. Las de katakana sí la muestran en hiragana (バス, ばす).

`npm run check:content` lee cada contexto con las palabras de la colección, de las secciones léxicas y de los contadores: las frases de los kanji, los ejemplos de las entradas y de las guías, y el ejemplo y la frase de cada forma de un contador. Rechaza un kanji que no forme parte de una de esas palabras o una lectura distinta de la de la web (川 o 森 solos, さんほん en lugar de さんぼん). Acepta las formas conjugadas de verbos y adjetivos い (休みませんでした, 嬉しかった) y el verbo de una expresión aunque haya algo en medio (写真を 三枚 撮りました). También comprueba que haya frases para todos los kanji, en el orden de la colección, y que las cuatro avanzadas usen adjetivos, adverbios y contadores. Las palabras en kana (とても, おかき, ひよこ) no se pueden comprobar así: revísalas a mano, igual que la naturalidad de la frase y su traducción.

El vault no contiene una tabla completa de kana: esa sección se completa con la referencia de la Embajada de Japón indicada en su archivo. Los kana no usan la fuente de kanji decorativa: se presentan en Noto Sans JP para facilitar su reconocimiento.

## Editar o añadir entradas

1. Edita el archivo de la sección. Conserva el `id` de una entrada existente, aunque corrijas su grafía o significado: será su identidad al usarla en un quiz u otra vista.
2. Para una entrada nueva, elige un `id` único y estable, con letras latinas minúsculas, números y guiones.
3. Usa un `group` y un `sourceId` declarados en el mismo archivo. Añade la fuente si no existe.
4. Las lecturas léxicas se escriben en hiragana. Las variantes de contadores se guardan como lecturas distintas dentro de `readings`, nunca escondidas en un campo de texto.
5. Guarda las cantidades de un contador ordenadas y sin duplicados. Cada forma y pregunta incluye un `example` con un uso real en japonés (`written`), su lectura en kana (`reading`) y su traducción (`meaning`), que la tabla muestra en la columna «Ejemplo»: `一本の 鉛筆`, `いっぽんの えんぴつ`, `un lápiz`. Separa los bloques con espacios, como en los ejemplos léxicos; la lectura tiene los mismos bloques y los préstamos pueden quedarse en katakana. La validación comprueba que el ejemplo escriba la forma (一本, 何本) y que su lectura use una de las de la forma (いっぽん, no いちほん). Las formas usan «número の cosa» (`二枚の 写真`), en el mismo orden que el español; las fechas, mes y día (`七月 七日`); los números, un precio en yenes (`三百円`), y las preguntas, una frase completa (`卵は 何個 ありますか。`). Cada forma y pregunta lleva además una `sentence`, con los mismos campos y las mismas reglas: una frase completa de uso diario, en forma cortés, que termina en 。, ？ o ！ y que la tabla muestra en la columna «Frase» (`鉛筆を 一本 かして ください。`). En la frase el número con el contador va donde se dice, tras la cosa y su partícula, así que completa lo que muestra el ejemplo. Que no repita el ejemplo: busca otra situación (en la pregunta de 〜本, el ejemplo pregunta por lápices y la frase, por cervezas). Siempre que se pueda, cada forma usa un ejemplo concreto y distinto de un uso real del contador, para que sus diez filas muestren todo lo que cuenta (〜本: un lápiz, dos botellas… siete películas, diez llamadas de teléfono), en vez de repetir una categoría genérica como «objetos alargados». En el contador general 〜つ, usa conceptos que no tengan un contador más adecuado (preguntas, ideas, razones), no objetos que ya tienen el suyo (una manzana se cuenta mejor con 〜個). Comprueba que cada objeto se cuenta así en el japonés actual; evita los usos tradicionales o dudosos, como 〜羽 con conejos. Los números (百, 千, 万) usan precios, el uso más habitual al empezar, y `value` conserva la cantidad numérica para ordenar y validar. `special` indica una lectura irregular o un cambio de sonido; no es una dificultad de estudio.
   Cada contador declara además su `difficulty` (`easy`, `medium` o `hard`): lo que cuesta aprender sus lecturas y su uso, no lo pronto que se necesita. Fácil, sin cambios de sonido o solo el patrón いっ・はっ・じゅっ (〜枚, 〜台, 〜個, 〜冊, 〜週間, 〜歳, 千, 万); medio, terminaciones que alternan o unas pocas lecturas irregulares (〜本, 〜匹, 〜杯, 〜足, 百, 〜人, 〜か月, que además se confunde con 一月); difícil, series que hay que aprender de memoria o un uso difícil de delimitar (〜つ, 〜日, 〜日間, 〜羽, 〜頭 frente a 〜匹). Las fechas son difíciles aunque se necesiten desde el principio: quien filtra por «Fácil» busca lo que menos esfuerzo cuesta. La cabecera la muestra con los puntos de las fichas de kanji, y la página filtra por ella en una segunda fila que se combina con la de grupos (fáciles de objetos: `?section=counters&group=objects&difficulty=easy`). Un contador nuevo necesita su dificultad; la validación rechaza uno sin ella.
6. Si el cambio necesita una explicación, usa `note`, `notes` o una guía en `guides`, según el tipo de entrada.
   Una entrada léxica puede llevar `examples`, con frases que usen la propia entrada y vocabulario que ya esté en la web. Con ejemplos, la fila se despliega para mostrarlos. Cada ejemplo tiene `written`, `reading` y `meaning`, como los de las guías. En `written` y `reading`, separa los bloques con espacios, como en los libros para principiantes (`休日は 遅く 起きます。`): la frase solo salta de línea en esos espacios. `reading` va en kana, sin kanji; los préstamos pueden quedarse en katakana (`コーヒーを のみます。`). Si la frase no tiene kanji, `reading` repite `written` y la lectura no se muestra (`テニスが できます。`). La validación rechaza un ejemplo que no contenga la entrada, aunque esté conjugada (起きました cuenta para 起きます).
   Un grupo léxico puede declarar `inflection`: `"i-adjective"` o `"na-adjective"`. Cada ejemplo de sus entradas indica entonces su `form` (`present-affirmative`, `past-affirmative`, `present-negative` o `past-negative`), y la fila muestra los cuatro en una tabla de 2 × 2 (afirmativo arriba y negativo abajo; presente a la izquierda y pasado a la derecha), cada uno con el nombre de su forma. Tienen que ser los cuatro y en ese orden, y cada frase debe terminar con la forma cortés correspondiente, en la escritura y en la lectura: la validación rechaza `きれくないです` o `べんりではありません` en el lugar del pasado negativo. Escribe `では ありません` con espacio, como `覚えて います`: ありません es otra palabra, y así el bloque más largo cabe en una línea a 320 px.
7. Cada contador lista en `endings` sus terminaciones en hiragana (por ejemplo `["ほん", "ぽん", "ぼん"]`), que se muestran en su cabecera. Van de más a menos frecuentes: una forma o la pregunta cuenta una vez si alguna de sus lecturas termina así. La validación rechaza una terminación que ninguna lectura use o un orden que no respete esa frecuencia. Las lecturas irregulares, como ひとり o ついたち, no necesitan terminación propia.
8. Si añades un kanji a la colección, añade también sus seis frases en `kanji-sentences.json`, en la misma posición. Cada frase tiene `written`, `reading` y `meaning`, con los bloques separados por espacios como en los ejemplos léxicos; `simple` lleva dos y `advanced`, cuatro.
9. Si el texto usa un carácter que no aparecía antes (un kanji, un kana o un símbolo nuevo), ejecuta `npm run fonts` e incluye en el commit los archivos regenerados de `src/fonts/`. Las fuentes solo contienen los caracteres del contenido; consulta las limitaciones en [AGENTS.md](AGENTS.md).

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

La página de entrada sigue siendo la colección de 80 kanji. Las otras secciones usan `?section=counters`, `?section=kana`, `?section=verbs`, `?section=vocabulary` y `?section=modifiers`. `q` conserva la búsqueda, `group` el filtro de las secciones nuevas y, en Contadores, `difficulty` el de dificultad.

Todas usan el mismo `index.html`. Se pueden abrir, compartir y recargar desde un subdirectorio de GitHub Pages o un CDN, sin rutas de servidor ni reglas de reescritura.
