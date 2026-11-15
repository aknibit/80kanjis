# 80 kanjis

A small Spanish-language kanji collection built with **TypeScript + Vite**, without a UI framework, database, server, or runtime API. All 80 kanji, 232 unique words (240 examples), readings, Spanish translations, and published difficulties live in **public/collection.json**, the single source of truth.

## Run locally

Requires Node.js 22.13 or later.

```sh
npm ci
npm run dev
```

## Build and preview

The project has a single static application. Difficulty classifications are displayed as icons and are always read from `public/collection.json`.

| Command | Behavior |
| --- | --- |
| `npm run dev` | Local development server with live reload |
| `npm run build` | Type-check and build the application into `dist/` |
| `npm run preview` | Preview the production build locally |

Validate the collection and build:

```sh
npm test
npm run build
npm run check:build
```

## Deploy to a CDN

Upload the **contents of `dist/`** to any static host or CDN. Set the build command to `npm run build` and the output directory to `dist` when using a Git-based host. Vite uses relative asset URLs, so the same build works at a domain root or a subdirectory. There are no client-side routes or rewrite rules to configure.

Serve `index.html` and `collection.json` with revalidation (`Cache-Control: no-cache`). The content-hashed files in `assets/` can use `Cache-Control: public, max-age=31536000, immutable`.

Typography loads DM Sans, Noto Serif JP, and Noto Sans JP from Google Fonts, with system fallbacks. Kanji and written words retain Noto Serif JP; vocabulary readings use Noto Sans JP at 16 px with a darker color, including in dialogs. Basic on/kun readings in support dialogs use the same Japanese sans-serif family. The collection and search do not depend on that service.

## Features

- Each collection row has four separate study blocks: one labeled Kanji and three labeled Vocabulario. They use four columns on desktop and a grouped 2×2 layout on smaller screens.
- Search across kanji, written words, kana readings, and Spanish meanings.
- Case-insensitive and accent-insensitive Spanish matching; hiragana, katakana, and half-width kana matching that preserves dakuten/handakuten.
- Multiple search terms must all appear on the same card.
- Search is reflected in the `?q=` URL parameter for bookmarks and sharing.
- Always-visible vocabulary readings, empty results, keyboard shortcuts (`/` to search, `Escape` to clear), and an accessible collection information dialog.
- Four independent difficulty indicators per row: one for the kanji and one for each word (Fácil, Medio, Difícil, or Sin marcar). Repeated words share their difficulty across rows.
- Compact header and whole-row difficulty filters with counts, combined with search. Filters sit in one row with the total kanji count on the right; on narrow screens, the filter buttons scroll horizontally. Filters are bookmarkable via `?difficulty=hard&q=...`.
- 232 vocabulary audio files with play/stop controls and source credits: 108 human recordings and 124 locally synthesized WAVs. Every vocabulary item in the collection has audio; changing classifications does not remove it.
- Compact cards with audio in the upper-right corner and difficulty immediately to its left. One green, two yellow, or three red flat dots indicate easy, medium, or hard; faded dots mean unmarked. Names remain available in tooltips and accessible labels. Kanji blocks use a soft gray background.
- The main accent is a rich pine green. Every vocabulary kanji is clickable and uses Noto Serif JP at its original moderate weight, slightly larger than the surrounding kana, with soft layered text shadows that follow the character’s strokes: pine green for the row’s kanji, blue for other main kanji, and dark red for support characters outside the 80. Kanji have no underlines or background shapes; the colored shadow grows stronger on hover and keyboard focus. Native dialogs show meanings and examples; support dialogs also show basic on/kun readings, an explanation, and a dictionary source. Escape, the close button, and clicking the backdrop dismiss the dialog and return focus.
- Main kanji cards show their reviewed meanings as readable 14 px chips and a circular information “i” button in the upper-right corner, matching the audio button’s size and position. Dictionary on/kun readings stay in the modal alongside usage notes and every collection word containing that kanji. The character (without a hover effect) and the information button both open the same dialog. Complete-word readings remain the authority for sound changes and irregular compounds. Dictionary readings remain searchable, with or without the okurigana dot.

## Independent study items

### Whole-row difficulty

The collection always preserves all four blocks. `src/lib/row-difficulty.ts` derives a row's category from its current kanji and vocabulary ratings:

- **Difícil:** any of the four entries is hard, even if others are unmarked.
- **Medio:** at least one entry is medium and none is hard, even if others are unmarked.
- **Fácil:** all four entries are explicitly easy.
- **Sin completar:** only easy/unmarked entries, with at least one unmarked.
- **Todas:** every row.

Counts reflect the current text search. The selected category is a view of the four existing marks; it does not add another persisted rating. A shared word's classification applies to every row containing it. All classifications come from the fetched JSON. “Sin completar” appears only when the current search results contain incomplete rows. If an old bookmark selects that category when none remain, the view returns to Todas and updates the URL.

### Pronunciation audio

Each vocabulary block has a speaker button in its upper-right corner. A small **IA** marker and an accessible label identify synthesized audio. Only one clip plays at a time, playback starts after a click, and filtering stops playback. Press the button again to stop or retry a failed playback.

All **232 unique vocabulary items** have audio, covering all 240 example slots in the 80 kanji rows. Repeated words share a recording. Coverage is independent of difficulty classifications. Tests require every vocabulary item to have exactly one matching audio; new words or changed readings must receive a corresponding clip.

Identity and reading must both match `src/data/pronunciations.ts`; alternative readings are never silently substituted. Simplified spellings are explicitly matched to the same word and reading (for example 火じ → 火事 and 一ぴき → 一匹). Each recording's source spelling is listed in CREDITS.txt. An unrelated homophone is not used as a substitute. Repeated words and future quizzes share the same item ID and lookup.

- **108 human recordings:** [Tofugu and WaniKani](https://github.com/tofugu/japanese-vocabulary-pronunciation-audio), under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The source mixes a native male professional (Tokyo accent) and a native female amateur (Kansai accent); individual speaker identity is not specified per file. The MP3s are unmodified, with shortened filenames. Tests verify upstream Git blob hashes.
- **124 synthesized recordings:** [VOICEVOX Nemo](https://voicevox.hiroshiba.jp/nemo/), voice 女声1 (CV: 亜咲比 凛), speaker 10005, engine 0.26.0 and core 0.17.0. These WAVs are subject to the [Nemo terms](https://voicevox.hiroshiba.jp/nemo/term/), including attribution and the prohibition on machine-learning use; the human recordings' CC BY-SA license does not apply to these files. They were generated locally once and checked against the collection's kana readings. 七色 explicitly uses なないろ with Tokyo accent [2], correcting the engine's default ななしょく. 山みち explicitly uses やまみち with Tokyo accent [2], and 空ばこ uses a single からばこ phrase. 竹林 and 木の上 explicitly retain the source readings たけばやし and きのうえ. Standard spoken long-vowel spellings are documented without changing the canonical readings. Exact synthesis queries, voice settings, and pronunciation references are saved in `public/audio/generation.json`; tests protect the spoken readings and generated file checksums.

The files have **not received a native-speaker listening or accent review**; synthetic fluency alone does not establish pronunciation quality. This expanded set remains available for listening evaluation.

`public/audio/` contains the files, per-file sources in `CREDITS.txt`, the full original CC license, the Nemo voice-library policy, and generation metadata. The static build copies the directory. The website serves audio from its own origin, including CDN subdirectories, with no runtime speech service, backend, or API key. The local synthesis engine is only an authoring tool and is not part of the app or build dependencies. Keep the credits and applicable terms alongside the audio when deploying.

### Item model

`loadCollection()` reads and validates the unified JSON. `collectionRows()` derives search/presentation rows, and `createStudyCatalog()` builds independent study items from those rows. None of these functions contains a second copy of the study content. `StudyItem` is a TypeScript discriminated union defined in `src/types.ts`:

| Type | Content | Example ID |
| --- | --- | --- |
| `kanji` | Character, reviewed meanings, dictionary on/kun readings, and references to its example vocabulary | `kanji:一` |
| `vocabulary` | Written word/expression, kana reading, meanings, and references to known kanji present in its spelling | `word:一年生` |

Both kinds have their own stable identity. Their classifications are resolved from the canonical JSON with the same item IDs. Words shared by several rows are one catalog item, preserving one classification and a single future study-history identity. Their definitions must agree; conflicting definitions fail validation instead of silently creating ambiguous quiz answers.

The catalog contains 312 independent items (80 kanji + 232 distinct vocabulary items), a `byId` lookup, and 80 presentation rows. A `StudyRow` holds exactly four IDs: one kanji followed by its three example words. Reordering rows or examples does not change item identities.

A future quiz can use `studyCatalog.items`, filter by `item.type`, and resolve current difficulty by `item.id`; it does not need the original row. Vocabulary items carry their complete reading and meanings. Kanji items carry reviewed dictionary `onyomi` and `kunyomi` arrays, independently of the full-word pronunciations. They are a practical selection rather than an exhaustive dictionary entry; a context-free kanji prompt should accept multiple valid readings. No quiz UI is implemented yet.

## Single source of truth

**Edit `public/collection.json` to change study content or difficulties.** It contains every character, word, reading, translation, row order, and all 312 classifications. The application only reads this file.

The versioned JSON has two main sections: `kanji` and `vocabulary`. Each main kanji contains its meanings, `onyomi`, `kunyomi`, difficulty, three vocabulary references, an optional explanatory `note`, and an HTTPS `sourceUrl`. Each unique word is defined once with its reading, Spanish meaning, and difficulty. A word appearing in several rows shares the same definition and classification. `kanjiReview` records the review date, dictionary release, source, license, and credits file.

The optional `supportingKanji` section supplies reference information for characters outside the 80: `character`, Spanish `meanings`, `onyomi`, `kunyomi`, a Spanish `note`, and an HTTPS `sourceUrl`. It currently includes 個, 色 and 庭, plus 時 and 前, which already appeared in the original vocabulary. Their basic readings are checked against KanjiPedia, with a source link in each modal. They do not add study rows, independent difficulty ratings, or quiz items to the main catalog. When this section is present, every written kanji must resolve to a main or support definition.

```json
{
  "version": 1,
  "kanji": [
    {
      "character": "一",
      "meanings": ["uno"],
      "onyomi": ["イチ", "イツ"],
      "kunyomi": ["ひと", "ひと.つ"],
      "difficulty": "easy",
      "vocabulary": ["一つ", "一ぴき", "一年生"],
      "sourceUrl": "https://www.edrdg.org/wiki/KANJIDIC_Project.html"
    }
  ],
  "vocabulary": [
    { "written": "一つ", "reading": "ひとつ", "meaning": "una cosa", "difficulty": "easy" },
    { "written": "一ぴき", "reading": "いっぴき", "meaning": "un animal pequeño", "difficulty": "medium" },
    { "written": "一年生", "reading": "いちねんせい", "meaning": "alumno de primer curso", "difficulty": "easy" }
  ]
}
```

The real file uses two-space indentation, one field per line, and stable source order for readable Git diffs. `easy`, `medium`, `hard`, and `null` mean Fácil, Medio, Difícil, and Sin marcar. Difficulty is required on every kanji and word. The four ratings in a row are independent. On readings are in katakana and kun readings in hiragana; a dot separates okurigana (for example `み.る`). Either reading group may be empty, but a kanji must have at least one reading overall. These dictionary additions are separate from the PDF's complete-word readings.

The app fetches **one `collection.json` on startup** with `cache: 'no-store'`, relative to its deployment URL. Content and ratings are not compiled into JavaScript. Replacing that file on the CDN updates both without rebuilding the application; configure the CDN to revalidate it. Invalid versions, duplicate kanji/words, incomplete content, invalid levels, and broken vocabulary references are rejected with a load error instead of silently using an older copy.

To edit readings or translations, update this JSON and reload the page. Runtime study IDs remain `kanji:<character>` and `word:<written>`. Changing a word's reading makes a mismatched audio unavailable until the corresponding recording is updated.

### Review data changes in Git

1. Edit the relevant definition in **public/collection.json**. Difficulty values are `easy`, `medium`, `hard`, or `null`.
2. Review `git diff -- public/collection.json` before committing. The two-space indentation and stable ordering keep changes readable.
3. Reload the local page to read the updated file. When deploying data changes, publish the updated `collection.json` on the CDN.

Word definitions are shared across rows. The browser reads the source file on every startup and does not store or override classifications locally.

## Source notes

The data is transcribed from **80 kanjis x 3 palabras.pdf**, preserving its order, vocabulary, readings, and Spanish translations. The private source PDF is not included in the repository or build.

The seven slots marked `duplicado` are completed from the matching word elsewhere in the PDF: 一年生, 小石, 左右, 右手, 女子, 名人, and 小学校. The apparent katakana カ in カもち is normalized to the intended kanji 力 in 力もち. The wrapped meaning for 立 is joined as “ponerse de pie”. Reviewed exceptions expand 月み → 月見, 川かみ → 川上, 川しも → 川下, きの上 → 木の上 and 休じつ → 休日, plus the existing occurrences of the counter 個, 色 in 音色, and 庭 in 庭木・中庭・校庭. Their readings, translations, difficulties, and audio files are unchanged. Other simplified mixed kanji/kana spellings are retained as supplied.

The 80 main kanji meanings were reviewed on 2026-11-15 against [KANJIDIC2](https://www.edrdg.org/wiki/KANJIDIC_Project.html), database 2026-319, with selected clarifications checked in [KanjiPedia](https://www.kanjipedia.jp/). Additions include 生 as raw/uncooked, 青 as young, 気 as air, 金 as metal, and notes for 本 as a long-object counter and 文 as an old monetary unit. 中 explicitly includes ジュウ for 一日中, verified in KanjiPedia despite its omission from the current KANJIDIC2 entry. Existing vocabulary definitions, ratings, row order, and audio are unchanged.

The KANJIDIC2-derived reading lists and enriched meanings are credited to EDRDG / Jim Breen and distributed under CC BY-SA 4.0. `public/data/CREDITS.txt` includes provenance, editorial criteria, and the refresh procedure; the full license ships alongside it. Credits are available from the information dialog, and every kanji modal links to a source. This adds no runtime dictionary service or extra content fetch.

The vocabulary's Spanish translations were subsequently reviewed: 30 approved wording, accent, and capitalization corrections were applied, retaining all other translations. Japanese spellings, readings, difficulties, and audio were preserved.

Tests read the same canonical JSON and verify its schema, source sequence, vocabulary references, shared definitions, search, row grouping/filtering, stable identities, read-only classifications, and audio coverage. `check:build` verifies the deployed collection, audio files, relative asset URLs, visible readings, and the absence of editing controls and browser storage code. Spanish interface text lives in `src/main.ts` and `src/kanji-ui.ts`; visual styles live in `src/style.css`. `src/lib/kanji-reference.ts` resolves both kinds of kanji and classifies every character without duplicating study content.
