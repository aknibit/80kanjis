import type { Kanji } from '../types.ts';

// Transcribed from 80 kanjis x 3 palabras.pdf. See README.md for source notes.
export const kanji = [
  {
    "id": "kanji-4e00",
    "character": "一",
    "meanings": [
      "uno"
    ],
    "vocabulary": [
      {
        "written": "一つ",
        "reading": "ひとつ",
        "meaning": "una cosa"
      },
      {
        "written": "一ぴき",
        "reading": "いっぴき",
        "meaning": "animal pequeño"
      },
      {
        "written": "一年生",
        "reading": "いちねんせい",
        "meaning": "estudiante (primero)"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-4e8c",
    "character": "二",
    "meanings": [
      "dos"
    ],
    "vocabulary": [
      {
        "written": "二つ",
        "reading": "ふたつ",
        "meaning": "dos cosas"
      },
      {
        "written": "二こ",
        "reading": "にこ",
        "meaning": "2 cosas pequeñas"
      },
      {
        "written": "二日",
        "reading": "ふつか",
        "meaning": "día 2 / dos días"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-4e09",
    "character": "三",
    "meanings": [
      "tres"
    ],
    "vocabulary": [
      {
        "written": "三つ",
        "reading": "みっつ",
        "meaning": "tres cosas"
      },
      {
        "written": "三こ",
        "reading": "さんこ",
        "meaning": "3 cosas pequeñas"
      },
      {
        "written": "三本",
        "reading": "さんぼん",
        "meaning": "3x largos/cilíndricos"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-56db",
    "character": "四",
    "meanings": [
      "cuatro"
    ],
    "vocabulary": [
      {
        "written": "四つ",
        "reading": "よっつ",
        "meaning": "cuatro cosas"
      },
      {
        "written": "四こ",
        "reading": "よんこ",
        "meaning": "4 cosas pequeñas"
      },
      {
        "written": "四月",
        "reading": "しがつ",
        "meaning": "Abril"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-4e94",
    "character": "五",
    "meanings": [
      "cinco"
    ],
    "vocabulary": [
      {
        "written": "五つ",
        "reading": "いつつ",
        "meaning": "cinco cosas"
      },
      {
        "written": "五こ",
        "reading": "ごこ",
        "meaning": "5 cosas pequeñas"
      },
      {
        "written": "五わ",
        "reading": "ごわ",
        "meaning": "cinco aves o conejos"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-516d",
    "character": "六",
    "meanings": [
      "seis"
    ],
    "vocabulary": [
      {
        "written": "六つ",
        "reading": "むっつ",
        "meaning": "seis cosas"
      },
      {
        "written": "六こ",
        "reading": "ろっこ",
        "meaning": "6 cosas pequeñas"
      },
      {
        "written": "六本",
        "reading": "ろっぽん",
        "meaning": "6x largos/cilíndricos"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-4e03",
    "character": "七",
    "meanings": [
      "siete"
    ],
    "vocabulary": [
      {
        "written": "七つ",
        "reading": "ななつ",
        "meaning": "siete cosas"
      },
      {
        "written": "七月",
        "reading": "しちがつ",
        "meaning": "Julio"
      },
      {
        "written": "七色",
        "reading": "なないろ",
        "meaning": "siete colores"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-516b",
    "character": "八",
    "meanings": [
      "ocho"
    ],
    "vocabulary": [
      {
        "written": "八つ",
        "reading": "やっつ",
        "meaning": "ocho cosas"
      },
      {
        "written": "八月",
        "reading": "はちがつ",
        "meaning": "Agosto"
      },
      {
        "written": "八日",
        "reading": "ようか",
        "meaning": "dia 8 / ocho días"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-4e5d",
    "character": "九",
    "meanings": [
      "nueve"
    ],
    "vocabulary": [
      {
        "written": "九つ",
        "reading": "ここのつ",
        "meaning": "nueve cosas"
      },
      {
        "written": "九こ",
        "reading": "きゅうこ",
        "meaning": "9 cosas pequeñas"
      },
      {
        "written": "九月",
        "reading": "くがつ",
        "meaning": "Septiembre"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-5341",
    "character": "十",
    "meanings": [
      "diez"
    ],
    "vocabulary": [
      {
        "written": "十年",
        "reading": "じゅうねん",
        "meaning": "diez años"
      },
      {
        "written": "十月",
        "reading": "じゅうがつ",
        "meaning": "Octubre"
      },
      {
        "written": "十日",
        "reading": "とおか",
        "meaning": "dia 10 / diez dias"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-767e",
    "character": "百",
    "meanings": [
      "cien"
    ],
    "vocabulary": [
      {
        "written": "百年",
        "reading": "ひゃくねん",
        "meaning": "cien años"
      },
      {
        "written": "百円",
        "reading": "ひゃくえん",
        "meaning": "cien yenes"
      },
      {
        "written": "百日",
        "reading": "ひゃくにち",
        "meaning": "cien dias"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-5343",
    "character": "千",
    "meanings": [
      "mil"
    ],
    "vocabulary": [
      {
        "written": "千年",
        "reading": "せんねん",
        "meaning": "mil años"
      },
      {
        "written": "千円",
        "reading": "せんえん",
        "meaning": "mil yenes"
      },
      {
        "written": "千人",
        "reading": "せんにん",
        "meaning": "mil personas"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-65e5",
    "character": "日",
    "meanings": [
      "dia",
      "sol"
    ],
    "vocabulary": [
      {
        "written": "三日",
        "reading": "みっか",
        "meaning": "dia 3 / tres dias"
      },
      {
        "written": "一日",
        "reading": "いちにち",
        "meaning": "1 dia"
      },
      {
        "written": "日時",
        "reading": "にちじ",
        "meaning": "fecha y hora"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-6708",
    "character": "月",
    "meanings": [
      "luna",
      "mes"
    ],
    "vocabulary": [
      {
        "written": "月み",
        "reading": "つきみ",
        "meaning": "contemplar la luna"
      },
      {
        "written": "二月",
        "reading": "にがつ",
        "meaning": "Febrero"
      },
      {
        "written": "まん月",
        "reading": "まんげつ",
        "meaning": "luna llena"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-706b",
    "character": "火",
    "meanings": [
      "fuego"
    ],
    "vocabulary": [
      {
        "written": "火じ",
        "reading": "かじ",
        "meaning": "incendio"
      },
      {
        "written": "火山",
        "reading": "かざん",
        "meaning": "volcán"
      },
      {
        "written": "火のこ",
        "reading": "ひのこ",
        "meaning": "chispas"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-6c34",
    "character": "水",
    "meanings": [
      "agua"
    ],
    "vocabulary": [
      {
        "written": "水玉",
        "reading": "みずたま",
        "meaning": "gotas de agua"
      },
      {
        "written": "水草",
        "reading": "みずくさ",
        "meaning": "planta acuática"
      },
      {
        "written": "水どう",
        "reading": "すいどう",
        "meaning": "agua corriente"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-6728",
    "character": "木",
    "meanings": [
      "árbol",
      "madera"
    ],
    "vocabulary": [
      {
        "written": "木目",
        "reading": "もくめ",
        "meaning": "vetas de la madera"
      },
      {
        "written": "にわ木",
        "reading": "にわき",
        "meaning": "árbol de jardín"
      },
      {
        "written": "木かげ",
        "reading": "こかげ",
        "meaning": "sombra de un árbol"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-91d1",
    "character": "金",
    "meanings": [
      "oro",
      "dinero"
    ],
    "vocabulary": [
      {
        "written": "お金",
        "reading": "おかね",
        "meaning": "dinero"
      },
      {
        "written": "金色",
        "reading": "きんいろ",
        "meaning": "color dorado"
      },
      {
        "written": "ちょ金",
        "reading": "ちょきん",
        "meaning": "ahorros"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-571f",
    "character": "土",
    "meanings": [
      "tierra"
    ],
    "vocabulary": [
      {
        "written": "土き",
        "reading": "どき",
        "meaning": "ceramica de barro"
      },
      {
        "written": "土足",
        "reading": "どそく",
        "meaning": "calzado de calle (puesto)"
      },
      {
        "written": "赤土",
        "reading": "あかつち",
        "meaning": "tierra roja"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-5c71",
    "character": "山",
    "meanings": [
      "montaña"
    ],
    "vocabulary": [
      {
        "written": "山みち",
        "reading": "やまみち",
        "meaning": "sendero de montaña"
      },
      {
        "written": "山いも",
        "reading": "やまいも",
        "meaning": "ñame japonés (tubérculo)"
      },
      {
        "written": "ふじ山",
        "reading": "ふじさん",
        "meaning": "monte fuji"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-5ddd",
    "character": "川",
    "meanings": [
      "río"
    ],
    "vocabulary": [
      {
        "written": "川かみ",
        "reading": "かわかみ",
        "meaning": "curso alto del rio"
      },
      {
        "written": "川しも",
        "reading": "かわしも",
        "meaning": "curso bajo del rio"
      },
      {
        "written": "川べり",
        "reading": "かわべり",
        "meaning": "orilla del rio"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-6797",
    "character": "林",
    "meanings": [
      "arboleda",
      "bosque"
    ],
    "vocabulary": [
      {
        "written": "竹林",
        "reading": "たけばやし",
        "meaning": "bosque de bambú"
      },
      {
        "written": "まつ林",
        "reading": "まつばやし",
        "meaning": "pinar"
      },
      {
        "written": "山林",
        "reading": "さんりん",
        "meaning": "bosque de montaña"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-68ee",
    "character": "森",
    "meanings": [
      "bosque"
    ],
    "vocabulary": [
      {
        "written": "森の中",
        "reading": "もりのなか",
        "meaning": "dentro del bosque"
      },
      {
        "written": "森林",
        "reading": "しんりん",
        "meaning": "bosque"
      },
      {
        "written": "青森",
        "reading": "あおもり",
        "meaning": "Aomori (ciudad)"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-7af9",
    "character": "竹",
    "meanings": [
      "bambú"
    ],
    "vocabulary": [
      {
        "written": "竹うま",
        "reading": "たけうま",
        "meaning": "zancos de bambú"
      },
      {
        "written": "竹やぶ",
        "reading": "たけやぶ",
        "meaning": "bambusal"
      },
      {
        "written": "竹わ",
        "reading": "ちくわ",
        "meaning": "pasta de pescado (tubo)"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-82b1",
    "character": "花",
    "meanings": [
      "flor"
    ],
    "vocabulary": [
      {
        "written": "花びら",
        "reading": "はなびら",
        "meaning": "pétalo"
      },
      {
        "written": "花たば",
        "reading": "はなたば",
        "meaning": "ramo de flores"
      },
      {
        "written": "花だん",
        "reading": "かだん",
        "meaning": "zona floreada"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-8349",
    "character": "草",
    "meanings": [
      "hierba"
    ],
    "vocabulary": [
      {
        "written": "草はら",
        "reading": "くさはら",
        "meaning": "pradera"
      },
      {
        "written": "草もち",
        "reading": "くさもち",
        "meaning": "mochi de artemisa"
      },
      {
        "written": "ざっ草",
        "reading": "ざっそう",
        "meaning": "mala hierba"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-77f3",
    "character": "石",
    "meanings": [
      "piedra"
    ],
    "vocabulary": [
      {
        "written": "小石",
        "reading": "こいし",
        "meaning": "piedrecita / guijarro"
      },
      {
        "written": "じ石",
        "reading": "じしゃく",
        "meaning": "imán"
      },
      {
        "written": "ほう石",
        "reading": "ほうせき",
        "meaning": "gema"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-8c9d",
    "character": "貝",
    "meanings": [
      "molusco",
      "concha"
    ],
    "vocabulary": [
      {
        "written": "貝がら",
        "reading": "かいがら",
        "meaning": "concha de molusco"
      },
      {
        "written": "まき貝",
        "reading": "まきがい",
        "meaning": "molusco de concha espiral"
      },
      {
        "written": "ほら貝",
        "reading": "ほらがい",
        "meaning": "caracola grande"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-866b",
    "character": "虫",
    "meanings": [
      "insecto",
      "bicho"
    ],
    "vocabulary": [
      {
        "written": "すず虫",
        "reading": "すずむし",
        "meaning": "grillo campana"
      },
      {
        "written": "こん虫",
        "reading": "こんちゅう",
        "meaning": "insecto"
      },
      {
        "written": "虫かご",
        "reading": "むしかご",
        "meaning": "caja/jaula de insectos"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-72ac",
    "character": "犬",
    "meanings": [
      "perro"
    ],
    "vocabulary": [
      {
        "written": "名犬",
        "reading": "めいけん",
        "meaning": "perro extraordinario"
      },
      {
        "written": "白い犬",
        "reading": "しろいいぬ",
        "meaning": "perro blanco"
      },
      {
        "written": "犬ぞり",
        "reading": "いぬぞり",
        "meaning": "trineo tirado por perros"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-7530",
    "character": "田",
    "meanings": [
      "arrozal"
    ],
    "vocabulary": [
      {
        "written": "田んぼ",
        "reading": "たんぼ",
        "meaning": "arrozal"
      },
      {
        "written": "水田",
        "reading": "すいでん",
        "meaning": "arrozal inundado"
      },
      {
        "written": "田うえ",
        "reading": "たうえ",
        "meaning": "plantación de arroz"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-5e74",
    "character": "年",
    "meanings": [
      "año",
      "edad"
    ],
    "vocabulary": [
      {
        "written": "年上",
        "reading": "としうえ",
        "meaning": "de mayor edad"
      },
      {
        "written": "一年生",
        "reading": "いちねんせい",
        "meaning": "estudiante (primero)"
      },
      {
        "written": "年より",
        "reading": "としより",
        "meaning": "anciano"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-7a7a",
    "character": "空",
    "meanings": [
      "cielo",
      "vacío"
    ],
    "vocabulary": [
      {
        "written": "空気",
        "reading": "くうき",
        "meaning": "aire"
      },
      {
        "written": "空色",
        "reading": "そらいろ",
        "meaning": "celeste / azul cielo"
      },
      {
        "written": "空ばこ",
        "reading": "からばこ",
        "meaning": "caja vacía"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-5929",
    "character": "天",
    "meanings": [
      "cielo"
    ],
    "vocabulary": [
      {
        "written": "天気",
        "reading": "てんき",
        "meaning": "tiempo atmosférico"
      },
      {
        "written": "天の川",
        "reading": "あまのがわ",
        "meaning": "vía láctea"
      },
      {
        "written": "天ごく",
        "reading": "てんごく",
        "meaning": "cielo / paraíso"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-6c17",
    "character": "気",
    "meanings": [
      "ánimo",
      "energía"
    ],
    "vocabulary": [
      {
        "written": "空気",
        "reading": "くうき",
        "meaning": "aire"
      },
      {
        "written": "気もち",
        "reading": "きもち",
        "meaning": "sentimiento / sensación"
      },
      {
        "written": "げん気",
        "reading": "げんき",
        "meaning": "salud / vitalidad"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-96e8",
    "character": "雨",
    "meanings": [
      "lluvia"
    ],
    "vocabulary": [
      {
        "written": "雨天",
        "reading": "うてん",
        "meaning": "tiempo lluvioso"
      },
      {
        "written": "雨ふり",
        "reading": "あめふり",
        "meaning": "lluvia / tiempo lluvioso"
      },
      {
        "written": "雨ぐも",
        "reading": "あまぐも",
        "meaning": "nube de lluvia"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-5915",
    "character": "夕",
    "meanings": [
      "atardecer"
    ],
    "vocabulary": [
      {
        "written": "夕日",
        "reading": "ゆうひ",
        "meaning": "sol del atardecer"
      },
      {
        "written": "夕がた",
        "reading": "ゆうがた",
        "meaning": "final de la tarde"
      },
      {
        "written": "夕ぐれ",
        "reading": "ゆうぐれ",
        "meaning": "anochecer / crepúsculo"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-767d",
    "character": "白",
    "meanings": [
      "blanco"
    ],
    "vocabulary": [
      {
        "written": "白ぐみ",
        "reading": "しろぐみ",
        "meaning": "equipo blanco"
      },
      {
        "written": "白い花",
        "reading": "しろいはな",
        "meaning": "flor blanca"
      },
      {
        "written": "空白",
        "reading": "くうはく",
        "meaning": "vacío / espacio blanco"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-9752",
    "character": "青",
    "meanings": [
      "azul"
    ],
    "vocabulary": [
      {
        "written": "青い",
        "reading": "あおい",
        "meaning": "azul (a veces verde)"
      },
      {
        "written": "青年",
        "reading": "せいねん",
        "meaning": "persona joven"
      },
      {
        "written": "青空",
        "reading": "あおぞら",
        "meaning": "cielo azul o despejado"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-8d64",
    "character": "赤",
    "meanings": [
      "rojo"
    ],
    "vocabulary": [
      {
        "written": "赤い車",
        "reading": "あかいくるま",
        "meaning": "coche rojo"
      },
      {
        "written": "赤ちゃん",
        "reading": "あかちゃん",
        "meaning": "bebé"
      },
      {
        "written": "赤はん",
        "reading": "せきはん",
        "meaning": "arroz con judias rojas 🎊"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-5927",
    "character": "大",
    "meanings": [
      "grande"
    ],
    "vocabulary": [
      {
        "written": "大すき",
        "reading": "だいすき",
        "meaning": "gustar mucho"
      },
      {
        "written": "大へん",
        "reading": "たいへん",
        "meaning": "difícil / grave / muy"
      },
      {
        "written": "大きい",
        "reading": "おおきい",
        "meaning": "grande"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-4e2d",
    "character": "中",
    "meanings": [
      "interior",
      "medio"
    ],
    "vocabulary": [
      {
        "written": "一日中",
        "reading": "いちにちじゅう",
        "meaning": "todo el día"
      },
      {
        "written": "中学校",
        "reading": "ちゅうがっこう",
        "meaning": "escuela secundaria (ESO)"
      },
      {
        "written": "中にわ",
        "reading": "なかにわ",
        "meaning": "patio interior"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-5c0f",
    "character": "小",
    "meanings": [
      "pequeño"
    ],
    "vocabulary": [
      {
        "written": "小石",
        "reading": "こいし",
        "meaning": "piedrecita / guijarro"
      },
      {
        "written": "小学校",
        "reading": "しょうがっこう",
        "meaning": "escuela primaria"
      },
      {
        "written": "小さい",
        "reading": "ちいさい",
        "meaning": "pequeño"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-4e0a",
    "character": "上",
    "meanings": [
      "arriba",
      "encima"
    ],
    "vocabulary": [
      {
        "written": "きの上",
        "reading": "きのうえ",
        "meaning": "en lo alto del árbol"
      },
      {
        "written": "上げる",
        "reading": "あげる",
        "meaning": "levantar / subir algo"
      },
      {
        "written": "上ぎ",
        "reading": "うわぎ",
        "meaning": "chaqueta"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-4e0b",
    "character": "下",
    "meanings": [
      "abajo",
      "debajo"
    ],
    "vocabulary": [
      {
        "written": "木の下",
        "reading": "きのした",
        "meaning": "bajo el árbol"
      },
      {
        "written": "下げる",
        "reading": "さげる",
        "meaning": "bajar algo"
      },
      {
        "written": "下校",
        "reading": "げこう",
        "meaning": "salida de la escuela"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-5de6",
    "character": "左",
    "meanings": [
      "izquierda"
    ],
    "vocabulary": [
      {
        "written": "左右",
        "reading": "さゆう",
        "meaning": "izquierda y derecha"
      },
      {
        "written": "左がわ",
        "reading": "ひだりがわ",
        "meaning": "lado izquierdo"
      },
      {
        "written": "左足",
        "reading": "ひだりあし",
        "meaning": "pie o pierna izquierda"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-53f3",
    "character": "右",
    "meanings": [
      "derecha"
    ],
    "vocabulary": [
      {
        "written": "左右",
        "reading": "さゆう",
        "meaning": "izquierda y derecha"
      },
      {
        "written": "右がわ",
        "reading": "みぎがわ",
        "meaning": "lado derecho"
      },
      {
        "written": "右手",
        "reading": "みぎて",
        "meaning": "mano derecha"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-5186",
    "character": "円",
    "meanings": [
      "círculo",
      "yen"
    ],
    "vocabulary": [
      {
        "written": "円い",
        "reading": "まるい",
        "meaning": "redondo / circular"
      },
      {
        "written": "円ばん",
        "reading": "えんばん",
        "meaning": "disco / circular y plano"
      },
      {
        "written": "円けい",
        "reading": "えんけい",
        "meaning": "forma circular"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-529b",
    "character": "力",
    "meanings": [
      "fuerza"
    ],
    "vocabulary": [
      {
        "written": "力もち",
        "reading": "ちからもち",
        "meaning": "persona fuerte"
      },
      {
        "written": "学力",
        "reading": "がくりょく",
        "meaning": "nivel académico"
      },
      {
        "written": "かい力",
        "reading": "かいりき",
        "meaning": "fuerza extraordinaria"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-53e3",
    "character": "口",
    "meanings": [
      "boca"
    ],
    "vocabulary": [
      {
        "written": "口ぶえ",
        "reading": "くちぶえ",
        "meaning": "silbido"
      },
      {
        "written": "口べに",
        "reading": "くちべに",
        "meaning": "pintalabios"
      },
      {
        "written": "人口",
        "reading": "じんこう",
        "meaning": "población / num.habitantes"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-76ee",
    "character": "目",
    "meanings": [
      "ojo"
    ],
    "vocabulary": [
      {
        "written": "目と口",
        "reading": "めとくち",
        "meaning": "ojos y boca"
      },
      {
        "written": "目つき",
        "reading": "めつき",
        "meaning": "mirada / expresión (ojos)"
      },
      {
        "written": "目てき",
        "reading": "もくてき",
        "meaning": "objetivo / propósito"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-624b",
    "character": "手",
    "meanings": [
      "mano"
    ],
    "vocabulary": [
      {
        "written": "右手",
        "reading": "みぎて",
        "meaning": "mano derecha"
      },
      {
        "written": "手くび",
        "reading": "てくび",
        "meaning": "muñeca (parte del cuerpo)"
      },
      {
        "written": "はく手",
        "reading": "はくしゅ",
        "meaning": "aplauso / aplaudir"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-8db3",
    "character": "足",
    "meanings": [
      "pie",
      "pierna"
    ],
    "vocabulary": [
      {
        "written": "足あと",
        "reading": "あしあと",
        "meaning": "huella / pisada"
      },
      {
        "written": "足くび",
        "reading": "あしくび",
        "meaning": "tobillo"
      },
      {
        "written": "一足",
        "reading": "いっそく",
        "meaning": "par de zapatos o calcetines"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-8033",
    "character": "耳",
    "meanings": [
      "oreja",
      "oido"
    ],
    "vocabulary": [
      {
        "written": "耳たぶ",
        "reading": "みみたぶ",
        "meaning": "lóbulo (oreja)"
      },
      {
        "written": "耳うち",
        "reading": "みみうち",
        "meaning": "susurrar al oido"
      },
      {
        "written": "目と耳",
        "reading": "めとみみ",
        "meaning": "ojos y oídos"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-97f3",
    "character": "音",
    "meanings": [
      "sonido"
    ],
    "vocabulary": [
      {
        "written": "音ぷ",
        "reading": "おんぷ",
        "meaning": "nota musical (escrita)"
      },
      {
        "written": "雨の音",
        "reading": "あめのおと",
        "meaning": "sonido de la lluvia"
      },
      {
        "written": "音いろ",
        "reading": "ねいろ",
        "meaning": "timbre (audio)"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-898b",
    "character": "見",
    "meanings": [
      "ver",
      "mirar"
    ],
    "vocabulary": [
      {
        "written": "見る",
        "reading": "みる",
        "meaning": "ver / mirar"
      },
      {
        "written": "見える",
        "reading": "みえる",
        "meaning": "verse / ser visible"
      },
      {
        "written": "見学",
        "reading": "けんがく",
        "meaning": "visita de observación"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-7acb",
    "character": "立",
    "meanings": [
      "ponerse de pie"
    ],
    "vocabulary": [
      {
        "written": "立つ",
        "reading": "たつ",
        "meaning": "ponerse o estar de pie"
      },
      {
        "written": "立てる",
        "reading": "たてる",
        "meaning": "levantar o poner algo de pie"
      },
      {
        "written": "き立",
        "reading": "きりつ",
        "meaning": "¡en pié!"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-4f11",
    "character": "休",
    "meanings": [
      "descansar"
    ],
    "vocabulary": [
      {
        "written": "休む",
        "reading": "やすむ",
        "meaning": "descansar / faltar"
      },
      {
        "written": "休める",
        "reading": "やすめる",
        "meaning": "dar descanso/reposar algo"
      },
      {
        "written": "休じつ",
        "reading": "きゅうじつ",
        "meaning": "dia libre o festivo"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-51fa",
    "character": "出",
    "meanings": [
      "salir",
      "sacar"
    ],
    "vocabulary": [
      {
        "written": "出る",
        "reading": "でる",
        "meaning": "salir"
      },
      {
        "written": "出す",
        "reading": "だす",
        "meaning": "sacar"
      },
      {
        "written": "出ぱつ",
        "reading": "しゅっぱつ",
        "meaning": "salida / partida"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-5165",
    "character": "入",
    "meanings": [
      "entrar"
    ],
    "vocabulary": [
      {
        "written": "入る",
        "reading": "はいる",
        "meaning": "entrar"
      },
      {
        "written": "入学",
        "reading": "にゅうがく",
        "meaning": "ingreso en escuela"
      },
      {
        "written": "入り口",
        "reading": "いりぐち",
        "meaning": "entrada / acceso"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-5973",
    "character": "女",
    "meanings": [
      "mujer"
    ],
    "vocabulary": [
      {
        "written": "女子",
        "reading": "じょし",
        "meaning": "chica / mujer"
      },
      {
        "written": "女の人",
        "reading": "おんなのひと",
        "meaning": "mujer"
      },
      {
        "written": "女と男",
        "reading": "おんなとおとこ",
        "meaning": "mujeres y hombres"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-7537",
    "character": "男",
    "meanings": [
      "hombre"
    ],
    "vocabulary": [
      {
        "written": "男子",
        "reading": "だんし",
        "meaning": "chico / hombre"
      },
      {
        "written": "男の人",
        "reading": "おとこのひと",
        "meaning": "hombre"
      },
      {
        "written": "男の子",
        "reading": "おとこのこ",
        "meaning": "niño / chico"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-5b50",
    "character": "子",
    "meanings": [
      "niño",
      "cria"
    ],
    "vocabulary": [
      {
        "written": "子ども",
        "reading": "こども",
        "meaning": "niño / niños"
      },
      {
        "written": "子犬",
        "reading": "こいぬ",
        "meaning": "cachorro (perrito)"
      },
      {
        "written": "女子",
        "reading": "じょし",
        "meaning": "chica / mujer"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-4eba",
    "character": "人",
    "meanings": [
      "persona"
    ],
    "vocabulary": [
      {
        "written": "人ごみ",
        "reading": "ひとごみ",
        "meaning": "multitud (gente)"
      },
      {
        "written": "名人",
        "reading": "めいじん",
        "meaning": "maestro (experto)"
      },
      {
        "written": "人げん",
        "reading": "にんげん",
        "meaning": "ser humano"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-540d",
    "character": "名",
    "meanings": [
      "nombre"
    ],
    "vocabulary": [
      {
        "written": "名前",
        "reading": "なまえ",
        "meaning": "nombre"
      },
      {
        "written": "名人",
        "reading": "めいじん",
        "meaning": "maestro (experto)"
      },
      {
        "written": "本名",
        "reading": "ほんみょう",
        "meaning": "nombre real"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-5b57",
    "character": "字",
    "meanings": [
      "letra",
      "carácter"
    ],
    "vocabulary": [
      {
        "written": "かん字",
        "reading": "かんじ",
        "meaning": "kanji"
      },
      {
        "written": "すう字",
        "reading": "すうじ",
        "meaning": "cifra (simbolo numérico)"
      },
      {
        "written": "てん字",
        "reading": "てんじ",
        "meaning": "braile"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-6587",
    "character": "文",
    "meanings": [
      "texto",
      "oración"
    ],
    "vocabulary": [
      {
        "written": "さく文",
        "reading": "さくぶん",
        "meaning": "redacción"
      },
      {
        "written": "文学",
        "reading": "ぶんがく",
        "meaning": "literatura"
      },
      {
        "written": "文なし",
        "reading": "もんなし",
        "meaning": "sin dinero"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-672c",
    "character": "本",
    "meanings": [
      "libro",
      "origen"
    ],
    "vocabulary": [
      {
        "written": "え本",
        "reading": "えほん",
        "meaning": "libro ilustrado"
      },
      {
        "written": "本だな",
        "reading": "ほんだな",
        "meaning": "estantería para libros"
      },
      {
        "written": "本とう",
        "reading": "ほんとう",
        "meaning": "verdad / verdadero"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-5b66",
    "character": "学",
    "meanings": [
      "estudiar",
      "aprender"
    ],
    "vocabulary": [
      {
        "written": "学年",
        "reading": "がくねん",
        "meaning": "curso escolar"
      },
      {
        "written": "小学生",
        "reading": "しょうがくせい",
        "meaning": "alumno de primaria"
      },
      {
        "written": "学ぶ",
        "reading": "まなぶ",
        "meaning": "aprender / estudiar"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-6821",
    "character": "校",
    "meanings": [
      "escuela"
    ],
    "vocabulary": [
      {
        "written": "小学校",
        "reading": "しょうがっこう",
        "meaning": "escuela primaria"
      },
      {
        "written": "校てい",
        "reading": "こうてい",
        "meaning": "patio de la escuela"
      },
      {
        "written": "てん校",
        "reading": "てんこう",
        "meaning": "cambio de escuela"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-5148",
    "character": "先",
    "meanings": [
      "antes",
      "punta"
    ],
    "vocabulary": [
      {
        "written": "先生",
        "reading": "せんせい",
        "meaning": "profesor / maestro"
      },
      {
        "written": "先とう",
        "reading": "せんとう",
        "meaning": "primero en la fila"
      },
      {
        "written": "足の先",
        "reading": "あしのさき",
        "meaning": "punta del pie"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-751f",
    "character": "生",
    "meanings": [
      "vida",
      "nacer"
    ],
    "vocabulary": [
      {
        "written": "生む",
        "reading": "うむ",
        "meaning": "parir / poner huevos"
      },
      {
        "written": "生きる",
        "reading": "いきる",
        "meaning": "vivir"
      },
      {
        "written": "生もの",
        "reading": "なまもの",
        "meaning": "alimento crudo"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-65e9",
    "character": "早",
    "meanings": [
      "temprano"
    ],
    "vocabulary": [
      {
        "written": "早い",
        "reading": "はやい",
        "meaning": "temprano"
      },
      {
        "written": "早足",
        "reading": "はやあし",
        "meaning": "paso rápido / andar rápido"
      },
      {
        "written": "早める",
        "reading": "はやめる",
        "meaning": "acelerar / adelantar la hora"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-6b63",
    "character": "正",
    "meanings": [
      "correcto"
    ],
    "vocabulary": [
      {
        "written": "正しい",
        "reading": "ただしい",
        "meaning": "correcto / justo"
      },
      {
        "written": "正じき",
        "reading": "しょうじき",
        "meaning": "honradez / sincero"
      },
      {
        "written": "正かい",
        "reading": "せいかい",
        "meaning": "respuesta correcta"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-738b",
    "character": "王",
    "meanings": [
      "rey"
    ],
    "vocabulary": [
      {
        "written": "王さま",
        "reading": "おうさま",
        "meaning": "rey"
      },
      {
        "written": "王かん",
        "reading": "おうかん",
        "meaning": "corona"
      },
      {
        "written": "こく王",
        "reading": "こくおう",
        "meaning": "rey/monarca (de un pais)"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-7389",
    "character": "玉",
    "meanings": [
      "bola",
      "gema"
    ],
    "vocabulary": [
      {
        "written": "玉虫",
        "reading": "たまむし",
        "meaning": "escarabajo joya"
      },
      {
        "written": "百円玉",
        "reading": "ひゃくえんだま",
        "meaning": "moneda de 100円"
      },
      {
        "written": "玉手ばこ",
        "reading": "たまてばこ",
        "meaning": "cofre (tesoro/sorpresa)"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-7cf8",
    "character": "糸",
    "meanings": [
      "hilo"
    ],
    "vocabulary": [
      {
        "written": "白い糸",
        "reading": "しろいいと",
        "meaning": "hilo blanco"
      },
      {
        "written": "赤い糸",
        "reading": "あかいいと",
        "meaning": "hilo rojo"
      },
      {
        "written": "きぬ糸",
        "reading": "きぬいと",
        "meaning": "hilo de seda"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-8eca",
    "character": "車",
    "meanings": [
      "vehículo",
      "rueda"
    ],
    "vocabulary": [
      {
        "written": "青い車",
        "reading": "あおいくるま",
        "meaning": "coche azul"
      },
      {
        "written": "でん車",
        "reading": "でんしゃ",
        "meaning": "tren"
      },
      {
        "written": "車りん",
        "reading": "しゃりん",
        "meaning": "rueda"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-6751",
    "character": "村",
    "meanings": [
      "aldea",
      "pueblo"
    ],
    "vocabulary": [
      {
        "written": "村の人",
        "reading": "むらのひと",
        "meaning": "gente del pueblo"
      },
      {
        "written": "町と村",
        "reading": "まちとむら",
        "meaning": "pueblos y aldeas"
      },
      {
        "written": "山村",
        "reading": "さんそん",
        "meaning": "pueblo de montaña"
      }
    ],
    "difficulty": null
  },
  {
    "id": "kanji-753a",
    "character": "町",
    "meanings": [
      "pueblo",
      "barrio"
    ],
    "vocabulary": [
      {
        "written": "町なみ",
        "reading": "まちなみ",
        "meaning": "paisaje urbano"
      },
      {
        "written": "町の中",
        "reading": "まちのなか",
        "meaning": "Dentro del pueblo / ciudad"
      },
      {
        "written": "町村",
        "reading": "ちょうそん",
        "meaning": "pueblos y aldeas / municipios"
      }
    ],
    "difficulty": null
  }
] as const satisfies readonly Kanji[];
