# Contenido de estudio

Los archivos de `public/` son la fuente de la verdad publicada. El navegador los lee directamente y Vite los copia a `dist/` sin transformarlos. No hace falta una base de datos ni acceder al vault desde el servidor de build.

## Archivos

| Sección | Fuente canónica | Contenido inicial |
| --- | --- | --- |
| 80 kanjis | `public/collection.json` | 80 kanji, 232 palabras, lecturas, significados y dificultades |
| Menú | `public/content/navigation.json` | Orden, etiquetas, tipos y archivos de las secciones |
| Contadores | `public/content/counters.json` | 19 contadores y 3 grupos de números; lecturas, variantes, preguntas, un ejemplo en japonés y una frase de uso diario por forma, y la dificultad de cada contador |
| Kana | `public/content/kana.json` | 46 sonidos básicos, 25 con marcas y 33 combinaciones; hiragana y katakana |
| Verbos | `public/content/verbs.json` | 59 entradas en forma ます, cada una con cuatro ejemplos (presente y pasado, afirmativo y negativo): primero los 20 verbos esenciales, luego los del curso y las expresiones; la dificultad de cada verbo |
| Vocabulario | `public/content/vocabulary.json` | 306 entradas agrupadas en diez temas, cada una con su dificultad |
| Adjetivos y adverbios | `public/content/modifiers.json` | 71 entradas: 36 adjetivos い y 18 な, cada uno con cuatro ejemplos (presente y pasado, afirmativo y negativo), y 17 adverbios con dos ejemplos; la dificultad de cada entrada |
| Frases de los kanji | `public/content/kanji-sentences.json` | 480 frases para la ventana de cada uno de los 80 kanji: dos sencillas y cuatro con adjetivos, adverbios y contadores |
| Esquema de edición | `public/content/study.schema.json` | Formato de los archivos nuevos para editores compatibles con JSON Schema |

Cada archivo nuevo declara `version`, `kind`, `title`, `description`, `sources`, `groups`, `guides` y `entries`. Los textos de estudio y sus clasificaciones viven en esos archivos, no en los componentes TypeScript.

El menú conserva primero las secciones principales. `placement: "support"` coloca Vocabulario y Kana separados al final, a la derecha, en el orden del archivo; en móvil sigue visible mientras el menú principal permite desplazamiento horizontal.

Una sección léxica puede declarar `layout: "cards"` en el menú, como Vocabulario. Sus entradas se muestran como fichas compactas en tantas columnas como quepan y sin igualar alturas. Los filtros ocupan varias líneas en lugar de desplazarse. Con «Todo», las fichas aparecen en orden aleatorio en cada visita y cada una indica su grupo en el pie; con un grupo seleccionado, siguen el orden del archivo, que conviene que siga teniendo sentido, y no repiten el grupo. Las fichas no se despliegan, así que una sección en fichas no puede tener entradas con `examples`; los tests lo comprueban. Sin `layout`, la sección usa filas, como Verbos y Adjetivos y adverbios.

En Kana, los tres grupos comparten las mismas once columnas por familia de sonidos: vocales, k/g, s/z, t/d, n, h/b/p, m, y, r, w y ん, desde la derecha. Así, か・が・きゃ・ぎゃ quedan en la misma columna. `position.row` avanza hacia abajo dentro de cada grupo: los básicos y dakuten usan a・i・u・e・o; handakuten ocupa un segundo bloque de cinco filas en la columna h/b/p. Las combinaciones usan bloques ya・yu・yo, seguidos de las variantes con dakuten y handakuten en sus mismas columnas. Se admiten hasta quince filas y se conservan los huecos de や・ゆ・よ y わ・を. Se comprueba que no haya posiciones duplicadas dentro de un grupo. Los tres grupos comparten el desplazamiento horizontal, también al filtrar o buscar.

## Procedencia

La importación inicial del 16 de noviembre de 2026 usa las notas temáticas de **日本語 / Primer curso organizado**, que ya documentan correcciones del archivo original. Se conservan sus lecturas, traducciones y distinciones de uso. Las redacciones personales y el archivo de apuntes sin corregir no se han importado.

En el vocabulario, `meaning` es solo la traducción y `note` recoge el matiz de registro, uso o contexto (`cena` y `coloquial`, en lugar de `cena, coloquial`). Las fichas muestran la nota más pequeña y en gris. El 16 de noviembre de 2026 se separaron así 29 significados importados, sin cambiar su contenido salvo para que la nota se entienda sola (`«viajar» se dice りょこうします`). Ese día también se escribieron con kanji tres entradas que estaban en kana, siguiendo el criterio del curso de usar kanji aunque sean poco frecuentes (林檎, 鸚鵡): うち como 家／内, くし como 櫛 y みかん como 蜜柑. Siguen en kana おかき, ひよこ y ものづくり, que se escriben así habitualmente, y los préstamos en katakana.

Las fuentes del vault se registran con el nombre, la ruta relativa de la nota y su SHA-256 en el momento de importación. La huella identifica esa revisión; el build no exige tener iCloud u Obsidian disponibles. El vault original no se modifica. Los cambios posteriores se trasladan al JSON y se revisan en el PR; no hay sincronización automática que pueda sobrescribir una edición.

Los contadores parten de la imagen proporcionada. Se distinguen duración en días y días del mes, y 百・千・万 se tipifican como números. El calendario se completa hasta el 31 con `new additions.md`. `editorialNotes` documenta la normalización de とお y las decisiones de transcripción. Las celdas vacías de las centenas y los millares no se rellenan automáticamente. Las referencias de consulta están en `sources`. Los ejemplos en japonés de cada forma y pregunta, y la dificultad de cada contador, se añadieron para esta web el 19 de noviembre de 2026; los ejemplos traducen los usos en español que ya tenía cada forma, salvo donde no había una frase natural: «cinco opciones» pasó a «cinco puntos clave» (五つの ポイント), «diez promesas» a «contar hasta diez» (十まで 数える, porque 十 solo se lee とお al contar), «cinco piezas de puzle» a «cinco botones», y las duraciones, edades, fechas y cantidades, que eran genéricas («tres días», «día tres del mes», «trescientos»), a usos concretos (三日間の 雨, 三月 三日, 三百円). Ese mismo día se añadió una frase de uso diario por forma y pregunta, escrita para esta web: en tiendas, en casa, en clase o al quedar (きっぷを 一枚 ください。, 十二日は ははの たん生日です。). Más tarde ese día se reescribieron con el vocabulario de clase (ver más abajo).

Los verbos empiezan por el grupo `essentials`: los 20 verbos esenciales, en el orden de la lista proporcionada (de 起きます a 寝ます), que no es alfabético. Diecisiete ya estaban en la nota del curso y conservan su `id` y su fuente; 飲みます, 写真を撮ります y テニスをします se añadieron desde esa lista. Todos los verbos de la sección, no solo los esenciales, llevan cuatro ejemplos escritos para esta web, no importados del vault, uno por forma cortés: frases cortas que solo usan palabras de la propia web (vocabulario, adjetivos, contadores y las palabras de los 80 kanji). たばこ, en dos ejemplos de 吸います, es la excepción: solo aparece en el significado del verbo. Revisa su traducción como cualquier otro contenido.

Los adjetivos y adverbios siguen el mismo criterio: sus ejemplos se escribieron para esta web el 16 de noviembre de 2026 y solo usan palabras de la propia web. Una palabra cuenta si es una entrada o una de las palabras de un kanji. No basta con que forme parte de otra (答え, en 答え合わせ) ni con que su kanji esté entre los 80 (川 o 水 solos): el 17 de noviembre se cambiaron tres frases por esos motivos. Cada lectura coincide con la que da la web para esa palabra. Cada adjetivo tiene cuatro, uno por forma cortés, en el orden en que se trabajan en clase: presente afirmativo, pasado afirmativo, presente negativo y pasado negativo. Las guías de conjugación siguen el mismo orden. Los negativos usan las formas del curso: 〜くないです y 〜くなかったです en los adjetivos い, y 〜では ありません y 〜では ありませんでした en los な, nunca じゃ. きれい y いい tienen ejemplos de sus formas negativas, que son las que más confunden (きれいでは ありません, よくないです). Los adverbios tienen dos ejemplos; las frases que tenían como nota (`とても おもしろいです。`) pasaron a ser ejemplos con traducción, y あまり y ぜんぜん conservan la nota de que se usan con una forma negativa. Ese día también se juntaron los adjetivos い: おいしい, まずい, あまい y いい estaban detrás de los な.

Las frases de los kanji se escribieron para esta web el 18 de noviembre de 2026, con el mismo criterio que los ejemplos de verbos y adjetivos: solo usan palabras de la web, con su lectura y su grafía (子ども, 火じ, でん車). Cada kanji tiene dos frases sencillas y cuatro más elaboradas; cada una de esas cuatro usa un adjetivo, un adverbio o un contador, y entre las cuatro aparecen los tres. Una frase escribe su kanji como parte de una palabra. Por eso, hasta el 19 de noviembre, los únicos precios eran 百円 y 千円, y los meses, los de la colección (二月, 四月, 七月…). Ese día Vocabulario incorporó 円 y los doce meses. Las frases no se repiten entre kanji. Viven en un archivo aparte porque solo hacen falta al abrir una ventana: así la colección que se carga con la página sigue pesando lo mismo.

El 19 de noviembre de 2026 se incorporó el vocabulario de las hojas de clase de los temas 1 a 9 (fuente `class-handouts`):
- 210 entradas nuevas: 174 en Vocabulario, 6 en Verbos y 30 en Adjetivos y adverbios;
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

Ese día se reescribieron los ejemplos y las frases de los contadores que usaban otras palabras (理由, 友達, 紙, 映画) o gramática posterior (持って います, 住んで います, 一歳に なります). Los animales y objetos que no son palabras de la web se escriben en kana (ねこ, ぞう, つる, きって): así se ven sus usos sin añadir kanji que no se estudian. Más tarde, la frase de cada forma pasó a usar el mismo concepto que su ejemplo: 148 parejas hablaban de cosas distintas (二つの アイデア / パンを 二つ ください。).

También se reescribieron 99 ejemplos de verbos y de adjetivos y adverbios que usaban palabras del vault que no están en las hojas (弁護士, 怠け者, 王さま, 鸚鵡, 税金, 字幕, 満月, 年賀状). Ahora tratan situaciones de clase: horarios, transporte, compras, comida, aficiones y familia (まいあさ 七時に 起きます。, バスで 美術館へ 行きました。). Esas palabras siguen en Vocabulario. En los ejemplos de verbos y adjetivos ya no aparecen; en los contadores solo quedan donde muestran un uso que el vocabulario de clase no cubre (一羽の 鸚鵡, 七枚の 年賀状).

Ese mismo día se reescribieron 116 de las 480 frases de los kanji:
- las que usaban palabras del vault que no están en las hojas (弁護士, 喫茶店, 鸚鵡, 税金, 筆箱);
- las que usaban gramática posterior al tema 9 (寝て います, 入って います, より);
- las que repetían un ejemplo de otra sección (机の 上に 辞書が あります。);
- otras, para que todas las palabras nuevas aparezcan al menos en un contexto.

Las frases nuevas usan el vocabulario de clase alrededor de las palabras del kanji (日よう日に テニスを します。, 九時に えきで 会いましょう。). Las demás ya usaban palabras de los 80 kanji o de clase y se conservan. En las frases de los kanji quedan pocas palabras del vault, casi siempre porque llevan el kanji (お年玉, 花屋, 高校). Ningún contexto repite otro de la web.

También el 19 de noviembre de 2026 se clasificaron por dificultad las 437 entradas de Verbos, Vocabulario y Adjetivos y adverbios, con el criterio descrito en «Editar o añadir entradas», y después se revisaron a mano. Resultado actual:

| Sección | Fácil | Medio | Difícil |
| --- | --- | --- | --- |
| Vocabulario | 167 | 90 | 49 |
| Verbos | 25 | 19 | 15 |
| Adjetivos y adverbios | 28 | 36 | 7 |

El nivel del JLPT sale de las listas de Jonathan Waller ([tanos.co.uk](https://www.tanos.co.uk/jlpt/)), las de referencia desde que el examen dejó de publicar listas oficiales en 2010. Se consultaron en la versión de [open-anki-jlpt-decks](https://github.com/jamsinclair/open-anki-jlpt-decks). Esas listas tienen huecos y algunos niveles dudosos. Faltan いい, 高校, りんご y スーパー, y ponen エンジニア en N1, まあまあ y しんかんせん en N2 y ビール en N3. Por eso las palabras de las hojas de clase cuentan como N5 y los préstamos que se reconocen al oírlos no suben. 50 entradas no están en las listas, y su nivel se estimó: por sus partes si son compuestos (準備運動 = 準備 + 運動) y por su frecuencia si no (鯛, 鸚鵡, ひよこ). En esa primera clasificación, el JLPT subió 87 entradas.

Ese mismo día se reajustaron a mano 26 verbos, 62 palabras de Vocabulario y 14 adjetivos y adverbios, según lo que cuestan en clase.

Verbos:
- a difícil: dar y recibir (あげます, もらいます, como ya estaba くれます), prestar y tomar prestado (かします, かります), 修理します, 準備します, 答え合わせをします, おくります, 受けます, 比べます, 習います y 鳴きます／泣きます;
- a medio: 歩きます, 生まれます, おしえます, きります, 作ります, 録音します y 覚えています;
- a fácil: 休みます, 聞きます, 寝ます, 描きます, 分かります y, un poco más tarde, あります e います.

Vocabulario:
- a fácil: 家族, ちち, はは, 皆さん, みんな, 授業, 白板, 火, 今日, 今年 y きょ年;
- a medio: ご家族, おとうさん, おかあさん, おっと, つま, おくさん, 自分, 家／内, ほかの人, ぎんこういん, エンジニア, 書き取り, 日直, 郵便局, ち下, うけつけ, にもつ, ネクタイ, プレゼント, はさみ, おみやげ, めいし, 鯉, 縦, 横, お花見, ようじ, やきゅう, ひる休み, ごぜん, ごご y けさ;
- a difícil: 書き試験, 準備運動, 専門学校, 図書室, うりば, 近道, 坂, 旗, 笛, 機械, 虫眼鏡, 年賀状, 筆, お年玉, 貝, 髭, 税金, やくそく y 修理.

Adjetivos y adverbios:
- a fácil: 嬉しい;
- a medio: つまらない, 若い, ひくい, いい／よい, かっこいい, きれい, しんせつ, すてき, まあまあ y そろそろ;
- a difícil: 羨ましい, 得意 y だいたい.

Esa revisión manda sobre el criterio: no recalcules esas dificultades.

Más tarde, ese mismo día, los verbos pasaron a tener cuatro ejemplos, uno por forma cortés, como los adjetivos: se conservaron 81 de los anteriores y se escribieron 155. También se aplicó a todos los contextos la regla de nivel (punto 10 de «Editar o añadir entradas») y se reescribieron los que no la cumplían:
- 242 de las 480 frases de los kanji;
- 82 ejemplos y frases de los contadores;
- 49 ejemplos de adjetivos y adverbios.

En los contadores fáciles no había bastantes cosas fáciles en la web para cada forma de 〜枚, 〜冊, 〜歳 y 〜週間, así que algunas formas cuentan objetos y animales en kana (はがき, ピザ, うさぎ, ねこ).

Después, あります e います pasaron a fácil. Mientras fueron medios, una frase fácil no podía decir «hay» ni «tengo», y abundaban 「〜を 買いました」 y 「とても + adjetivo」. Con el cambio se recuperaron 30 frases anteriores que solo se habían reescrito por esos dos verbos (19 de los kanji y 11 de los contadores) y se reescribieron 38 de las más repetidas con «hay» y «tengo» (33 de los kanji y 5 de los contadores): 雑誌を 三冊 買いました。 → へやに 雑誌が 三冊 あります。

También ese día se unificaron las dos entradas de あつい: 暑い, del vault («calor ambiental»), y あつい, de las hojas de clase («caliente», de bebidas y cosas). Ahora son una sola, 暑い／熱い, como 早い／速い, con dos ejemplos de cada sentido. Conserva el `id`, la fuente y la dificultad de 暑い, y sigue la grafía del vault, con kanji: 熱 se añadió a las fuentes.

Las entradas escritas solo en hiragana no repiten la lectura en la página (あさ, でんわをかけます), igual que los ejemplos sin kanji. Las de katakana sí la muestran en hiragana (バス, ばす).

`npm run check:content` lee cada contexto con las palabras de la colección, de las secciones léxicas y de los contadores: las frases de los kanji, los ejemplos de las entradas y de las guías, y el ejemplo y la frase de cada forma de un contador. Rechaza un kanji que no forme parte de una de esas palabras o una lectura distinta de la de la web (川 o 森 solos, さんほん en lugar de さんぼん). Acepta las formas conjugadas de verbos y adjetivos い (休みませんでした, 嬉しかった) y el verbo de una expresión aunque haya algo en medio (写真を 三枚 撮りました). También comprueba que haya frases para todos los kanji, en el orden de la colección, y que las cuatro avanzadas usen adjetivos, adverbios y contadores. Las palabras en kana (とても, おかき, ひよこ) no se pueden comprobar así: revísalas a mano, igual que la naturalidad de la frase y su traducción.

Por último, comprueba el nivel de cada contexto (punto 10 de «Editar o añadir entradas»). Para eso también reconoce las palabras de la web escritas en kana, por el principio de cada bloque y con su terminación: えきで, ありませんでした, かして. Una palabra en kana que no es de la web sigue pasando sin aviso.

El 21 de noviembre de 2026 se revisaron las 1501 frases y ejemplos de la web con el nivel gramatical de la clase (punto 11 de «Editar o añadir entradas»), y se reescribieron 130:
- 47 frases de los kanji;
- 66 ejemplos de Verbos y de Adjetivos y adverbios;
- 17 frases de Contadores.

Los motivos más frecuentes eran el sujeto con が delante de un verbo, el complemento con は en las negativas (肉は 食べません) y la descripción con が (足が 長いです). Cuando el cambio quitaba un contador, se sustituyó por una edad, una hora, una fecha o un precio, para que las cuatro frases avanzadas de cada kanji sigan usando un adjetivo, un adverbio y un contador.

El vault no contiene una tabla completa de kana: esa sección se completa con la referencia de la Embajada de Japón indicada en su archivo. Los kana no usan la fuente de kanji decorativa: se presentan en Noto Sans JP para facilitar su reconocimiento.

## Editar o añadir entradas

1. Edita el archivo de la sección. Conserva el `id` de una entrada existente, aunque corrijas su grafía o significado: será su identidad al usarla en un quiz u otra vista.
2. Para una entrada nueva, elige un `id` único y estable, con letras latinas minúsculas, números y guiones.
3. Usa un `group` y un `sourceId` declarados en el mismo archivo. Añade la fuente si no existe.
4. Las lecturas léxicas se escriben en hiragana. Las variantes de contadores se guardan como lecturas distintas dentro de `readings`, nunca escondidas en un campo de texto.
5. Guarda las cantidades de un contador ordenadas y sin duplicados. Cada forma y pregunta incluye un `example` con un uso real en japonés (`written`), su lectura en kana (`reading`) y su traducción (`meaning`), que la tabla muestra en la columna «Ejemplo»: `一本の 鉛筆`, `いっぽんの えんぴつ`, `un lápiz`. Separa los bloques con espacios, como en los ejemplos léxicos; la lectura tiene los mismos bloques y los préstamos pueden quedarse en katakana. La validación comprueba que el ejemplo escriba la forma (一本, 何本) y que su lectura use una de las de la forma (いっぽん, no いちほん). Las formas usan «número の cosa» (`二枚の 写真`), en el mismo orden que el español; las fechas, mes y día (`七月 七日`); los números, un precio en yenes (`三百円`), y las preguntas, una frase completa (`卵は 何個 ありますか。`). Cada forma y pregunta lleva además una `sentence`, con los mismos campos y las mismas reglas: una frase completa de uso diario, en forma cortés, que termina en 。, ？ o ！ y que la tabla muestra en la columna «Frase» (`鉛筆を 一本 ください。`). En la frase el número con el contador va donde se dice, tras la cosa y su partícula, así que completa lo que muestra el ejemplo. La frase usa el mismo concepto que el ejemplo, en una situación de uso diario: el mismo objeto (一本の 鉛筆 → 鉛筆を 一本 ください。), la misma fecha (七月 七日 → 七月 七日は たなばたです。) o, en la pregunta, la misma cosa (鉛筆は 何本 ありますか。 → 鉛筆を 何本 買いましたか。). Lo comprueba un test. Siempre que se pueda, cada forma usa un ejemplo concreto y distinto de un uso real del contador, para que sus diez filas muestren todo lo que cuenta (〜本: un lápiz, dos botellas… siete películas, diez llamadas de teléfono), en vez de repetir una categoría genérica como «objetos alargados». En el contador general 〜つ, usa conceptos que no tengan un contador más adecuado (preguntas, ideas, razones), no objetos que ya tienen el suyo (una manzana se cuenta mejor con 〜個). Comprueba que cada objeto se cuenta así en el japonés actual; evita los usos tradicionales o dudosos, como 〜羽 con conejos. Los números (百, 千, 万) usan precios, el uso más habitual al empezar, y `value` conserva la cantidad numérica para ordenar y validar. `special` indica una lectura irregular o un cambio de sonido; no es una dificultad de estudio.
   Cada contador declara además su `difficulty` (`easy`, `medium` o `hard`): lo que cuesta aprender sus lecturas y su uso, no lo pronto que se necesita. Fácil, sin cambios de sonido o solo el patrón いっ・はっ・じゅっ (〜枚, 〜台, 〜個, 〜冊, 〜週間, 〜歳, 千, 万); medio, terminaciones que alternan o unas pocas lecturas irregulares (〜本, 〜匹, 〜杯, 〜足, 百, 〜人, 〜か月, que además se confunde con 一月); difícil, series que hay que aprender de memoria o un uso difícil de delimitar (〜つ, 〜日, 〜日間, 〜羽, 〜頭 frente a 〜匹). Las fechas son difíciles aunque se necesiten desde el principio: quien filtra por «Fácil» busca lo que menos esfuerzo cuesta. La cabecera la muestra con los puntos de las fichas de kanji, y la página filtra por ella en una segunda fila, sin título y con el tono de cada nivel, que se combina con la de grupos (fáciles de objetos: `?section=counters&group=objects&difficulty=easy`). Un contador nuevo necesita su dificultad; la validación rechaza uno sin ella.
6. Si el cambio necesita una explicación, usa `note`, `notes` o una guía en `guides`, según el tipo de entrada.
   Una entrada léxica puede llevar `examples`, con frases que usen la propia entrada y vocabulario que ya esté en la web. Con ejemplos, la fila se despliega para mostrarlos. Cada ejemplo tiene `written`, `reading` y `meaning`, como los de las guías. En `written` y `reading`, separa los bloques con espacios, como en los libros para principiantes (`休日は 遅く 起きます。`): la frase solo salta de línea en esos espacios. `reading` va en kana, sin kanji; los préstamos pueden quedarse en katakana (`コーヒーを のみます。`). Si la frase no tiene kanji, `reading` repite `written` y la lectura no se muestra (`テニスが できます。`). La validación rechaza un ejemplo que no contenga la entrada, aunque esté conjugada (起きました cuenta para 起きます).
   Un grupo léxico puede declarar `inflection`: `"i-adjective"`, `"na-adjective"` o `"verb"` (verbos en forma ます, como los tres grupos de Verbos). Cada ejemplo de sus entradas indica entonces su `form` (`present-affirmative`, `past-affirmative`, `present-negative` o `past-negative`), y la fila muestra los cuatro en una tabla de 2 × 2 (afirmativo arriba y negativo abajo; presente a la izquierda y pasado a la derecha), cada uno con el nombre de su forma. Tienen que ser los cuatro y en ese orden, y cada frase debe terminar con la forma cortés correspondiente, en la escritura y en la lectura: la validación rechaza `きれくないです`, `べんりではありません` o `起きません` en el lugar del pasado negativo. Los verbos terminan en 〜ます, 〜ました, 〜ません y 〜ませんでした, sin preguntas ni invitaciones, y además la frase contiene la entrada seguida: 写真を 撮りました, no 写真を 三枚 撮りました. Escribe `では ありません` con espacio, como `覚えて います`: ありません es otra palabra, y así el bloque más largo cabe en una línea a 320 px.
   Cada entrada léxica declara su `difficulty` (`easy`, `medium` o `hard`), con el mismo sentido que en los contadores: lo que cuesta aprenderla. La validación rechaza una entrada sin ella. La página la muestra con los puntos de las fichas de kanji y filtra por ella en una segunda fila, como en Contadores. Una entrada que también es una palabra de la colección conserva la dificultad que tiene allí (小学校, 青い, los meses), y un test lo comprueba. 早い／速い no es la misma entrada que 早い: hay que distinguir los dos kanji, y queda en medio. Una dificultad revisada a mano (ver «Procedencia») manda sobre el criterio. Para las demás, se decide en dos pasos, y queda el nivel más alto:
   - **Sus trampas.** Sin ninguna, fácil. Medio: un segundo sentido o un matiz (かれ: él; novio, ごはん), un préstamo acortado (パソコン, デパート), una pareja que se confunde (さむい/つめたい), una partícula propia (会います, すき) o una forma que engaña al conjugar (いい, かっこいい, きれい). Difícil: una lectura especial de kanji que se estudian (八百屋), un uso que depende de con quién se habla o de quién es (しゅじん, かない, 僕, くれます, 召し上がります) o un adjetivo な que parece い y además lleva が (きらい). Los kanji ajenos al curso no cuentan: 鸚鵡 se juzga como おうむ, porque la lectura siempre se ve.
   - **Su nivel del JLPT,** que solo puede subirla. N5 no cambia nada; N4 y N3 la suben al menos a medio; N2, N1 y las palabras demasiado raras para estar en las listas, a difícil. Las palabras de las hojas de clase cuentan como N5, y los préstamos que se reconocen al oírlos no suben. Que una palabra haya que memorizarla sin pista tampoco la sube, porque eso ya lo mide el JLPT: 宿題 y ぎゅうにゅう son N5, no tienen trampa y son fáciles.
7. Cada contador lista en `endings` sus terminaciones en hiragana (por ejemplo `["ほん", "ぽん", "ぼん"]`), que se muestran en su cabecera. Van de más a menos frecuentes: una forma o la pregunta cuenta una vez si alguna de sus lecturas termina así. La validación rechaza una terminación que ninguna lectura use o un orden que no respete esa frecuencia. Las lecturas irregulares, como ひとり o ついたち, no necesitan terminación propia.
8. Si añades un kanji a la colección, añade también sus seis frases en `kanji-sentences.json`, en la misma posición. Cada frase tiene `written`, `reading` y `meaning`, con los bloques separados por espacios como en los ejemplos léxicos; `simple` lleva dos y `advanced`, cuatro. Cada frase tiene su audio en `public/audio/sentences/`: si cambias, añades o mueves una frase, ejecuta `npm run audio` (con `lameenc` instalado) e incluye los MP3 y `generation.json` en el commit. `npm run check:content` falla si el audio de alguna frase no corresponde a su texto y su lectura. Si el motor leyera mal una palabra, el script se detiene y lista las frases: corrígela en su diccionario (ver AGENTS.md).
9. Si el texto usa un carácter que no aparecía antes (un kanji, un kana o un símbolo nuevo), ejecuta `npm run fonts` e incluye en el commit los archivos regenerados de `src/fonts/`. Las fuentes solo contienen los caracteres del contenido; consulta las limitaciones en [AGENTS.md](AGENTS.md).
10. Cada contexto usa palabras del nivel de lo que muestra o más fáciles. Los ejemplos de una entrada fácil, las frases de un kanji fácil y el ejemplo y la frase de cada forma de un contador fácil solo usan palabras fáciles; los de uno medio, fáciles y medias; los de uno difícil, cualquiera. Cuentan todas las palabras de la web: sustantivos, verbos, adjetivos, adverbios y contadores (las horas, como 七時, son medias). No cuentan la propia entrada, las formas del propio contador ni, en las frases de un kanji, la palabra que lo escribe: 川, 虫, 田, 雨 y 口 son fáciles, pero ninguna palabra con ellos lo es. Una palabra que está en dos listas cuenta con su nivel más fácil: 早い es fácil en la colección, aunque 早い／速い sea medio. Las guías no ilustran ninguna entrada y quedan fuera. Si cambias la dificultad de una palabra, `npm run check:content` dice qué frases dejan de cumplir la regla.
11. Las frases y los ejemplos solo usan estructuras de las lecciones 1 a 10 de *Minna no Nihongo*, el nivel de la clase. Lo propuso la profesora en noviembre de 2026. Lo que viene del material importado puede ignorar ese límite: los 80 kanji y sus palabras, los contadores y las entradas y guías de las notas y las hojas de clase. Así:
    - los contadores y las duraciones (三冊, 二つ, 二週間) valen en cualquier sección;
    - una palabra importada lleva su construcción propia: 入る, 座ります y 立てる con に, 歩きます y 出る con を, 見える, ノートに 書きます, スペインごに 訳します, y los verbos que son en sí una estructura posterior (くれます, 覚えています, できます, 心が折れます, 苦しみます, 召し上がります);
    - las guías de las notas explican lo que se trabaja en clase, aunque sea posterior (しずかで べんりです).

    Además, valen en toda la web, por indicación de la profesora:
    - el pasado de adjetivos y nombres de la lección 12 (面白かったです, 雨ふりでした);
    - には y にも (日本には 火山が たくさん あります, スペインにも 山が あります);
    - に de finalidad (お花見に 行きませんか, 準備に 八日間 かかりました) y に de lugar (コーヒーに さとうを いれました);
    - まだ con negativa (えいがは まだ 始まりません);
    - の en usos sencillos (日本までの ひこうき), pero no en oraciones de relativo (気もちの いい 休日).

    Lo que rodea a esas palabras sí se limita a las lecciones 1 a 10. Quedan fuera, entre otras estructuras:
    - el complemento con は en lugar de を (肉は 食べません → わたしは 肉を 食べません) y は en lugar de が (てん字は 分かりません → てん字が 分かりません);
    - では y とは (鉛筆では 書きません → 鉛筆で…);
    - el sujeto con が delante de un verbo (ともだちが 来ます → ともだちは 来ます) o de un adjetivo (足が 長いです → かれの 足は 長いです), salvo con あります, います, 分かります, できます y los adjetivos como すき o 上手;
    - la forma て (書いて ください), los adjetivos como adverbio (早く 起きます) y la forma de diccionario en una frase;
    - で de causa, de ocasión o de edad (雨の音で 起きました, 旅行で 撮りました, 六歳で), に con 買います (ははに 買いました) y あります para un acontecimiento (コンサートが あります);
    - と 言います y las oraciones de relativo.

    Sí valen la palabra de tiempo con は (きのうは, 日よう日は) y 〜が あります para horarios y obligaciones (授業が あります, しごとが ありました), como 約束が あります en la lección 9.

    Las frases no usan あなた: a la profesora no le gusta, y en japonés se evita si se sabe el nombre. La entrada de Vocabulario lo explica. `npm run check:content` no comprueba la gramática: revisa a mano cada frase nueva o cambiada.

Ejemplo de una entrada léxica:

```json
{
  "id": "verb-tabemasu",
  "written": "食べます",
  "reading": "たべます",
  "romaji": "tabemasu",
  "meaning": "comer",
  "group": "main",
  "difficulty": "easy",
  "sourceId": "verbs-note"
}
```

Las dificultades de los 80 kanji siguen asociadas a `collection.json` y sus identificadores originales. Cada palabra del vocabulario de `collection.json` y cada frase de `kanji-sentences.json` tienen un audio generado: si cambias, añades o quitas una, ejecuta `npm run audio` (ver «Audio» en [AGENTS.md](AGENTS.md)). Las otras secciones no tienen audios. Contadores, Verbos, Vocabulario y Adjetivos y adverbios guardan la dificultad de cada entrada en su propio archivo; Kana no tiene.

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

La página de entrada sigue siendo la colección de 80 kanji. Las otras secciones usan `?section=counters`, `?section=kana`, `?section=verbs`, `?section=vocabulary` y `?section=modifiers`. `q` conserva la búsqueda, `group` el filtro de las secciones nuevas y `difficulty` el de dificultad (`?section=vocabulary&group=topic-5&difficulty=easy`). La dificultad es la misma en toda la web y el navegador la recuerda: una dirección con un nivel válido la cambia para todas las secciones.

Todas usan el mismo `index.html`. Se pueden abrir, compartir y recargar desde un subdirectorio de GitHub Pages o un CDN, sin rutas de servidor ni reglas de reescritura.
