# 80 kanjis

A small Spanish-language kanji collection built with **TypeScript + Vite**, without a UI framework, database, server, or runtime API. All 80 kanji, 232 unique words (240 examples), readings, Spanish translations, and published difficulties live in **public/collection.json**, the single source of truth.

## Run locally

Requires Node.js 22.13 or later.

```sh
npm ci
npm run dev
```

## Build and preview

The project has a single static application. Difficulty classifications are displayed as badges and are always read from `public/collection.json`.

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

Typography currently loads DM Sans and Noto Serif JP from Google Fonts, with system fallbacks. The collection and search do not depend on that service.

## Features

- Each collection row has four separate study blocks: one labeled Kanji and three labeled Vocabulario. They use four columns on desktop and a grouped 2×2 layout on smaller screens.
- Search across kanji, written words, kana readings, and Spanish meanings.
- Case-insensitive and accent-insensitive Spanish matching; hiragana, katakana, and half-width kana matching that preserves dakuten/handakuten.
- Multiple search terms must all appear on the same card.
- Search is reflected in the `?q=` URL parameter for bookmarks and sharing.
- Always-visible vocabulary readings, empty results, keyboard shortcuts (`/` to search, `Escape` to clear), and an accessible collection information dialog.
- Four independent difficulty indicators per row: one for the kanji and one for each word (Fácil, Medio, Difícil, or Sin marcar). Repeated words share their difficulty across rows.
- Compact header and whole-row difficulty filters with counts, combined with search and the audio filter. Filters are bookmarkable via `?difficulty=hard&audio=1&q=...`.
- 38 vocabulary audio files with play/stop controls and source credits: 23 human recordings and 15 locally synthesized WAVs. All 30 words in the requested ten easy kanji rows are covered in both builds.
- Read-only difficulty badges loaded exclusively from the canonical JSON file.

## Independent study items

### Whole-row difficulty

The collection always preserves all four blocks. `src/lib/row-difficulty.ts` derives a row's category from its current kanji and vocabulary ratings:

- **Difícil:** any of the four entries is hard, even if others are unmarked.
- **Medio:** at least one entry is medium and none is hard, even if others are unmarked.
- **Fácil:** all four entries are explicitly easy.
- **Sin completar:** only easy/unmarked entries, with at least one unmarked.
- **Todas:** every row.

Counts reflect the current text search and audio filter. The selected category is a view of the four existing marks; it does not add another persisted rating. A shared word's classification applies to every row containing it. All classifications come from the fetched JSON. “Sin completar” appears only when the current search/audio results contain incomplete rows. If an old bookmark selects that category when none remain, the view returns to Todas and updates the URL.

### Pronunciation audio

Use **Con audio · 38** or open `?audio=1#collection` to find rows with audio. Each available vocabulary block has a speaker button. A small **IA** marker and an accessible label identify synthesized audio. Only one clip plays at a time, playback starts after a click, and filtering stops playback. Press the button again to stop or retry a failed playback. Words without audio have no speaker button.

All 30 vocabulary words in the rows 二, 三, 四, 七, 八, 九, 十, 百, 千, and 日 have audio. These are the ten fully easy rows in the classification supplied by the user. Coverage is tied to item identity, so changing a rating does not remove audio. The eight other audio files from the original audition remain available too. Tests protect the requested row coverage without depending on future edits to the difficulty file.

Identity and reading must both match `src/data/pronunciations.ts`; alternative readings are never silently substituted. The simplified 三こ uses the recording of 三個, with the same reading and meaning. An unrelated homophone is not used as a substitute. Repeated words and future quizzes share the same item ID and lookup.

- **23 human recordings:** [Tofugu and WaniKani](https://github.com/tofugu/japanese-vocabulary-pronunciation-audio), under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The source mixes a native male professional (Tokyo accent) and a native female amateur (Kansai accent); individual speaker identity is not specified per file. The MP3s are unmodified, with shortened filenames. Tests verify upstream Git blob hashes.
- **15 synthesized recordings:** [VOICEVOX Nemo](https://voicevox.hiroshiba.jp/nemo/), voice 女声1 (CV: 亜咲比 凛), speaker 10005, engine 0.26.0 and core 0.17.0. These WAVs are subject to the [Nemo terms](https://voicevox.hiroshiba.jp/nemo/term/), including attribution and the prohibition on machine-learning use; the human recordings' CC BY-SA license does not apply to these files. They were generated locally once and checked against the collection's kana readings. 七色 explicitly uses なないろ with Tokyo accent [2], correcting the engine's default ななしょく. Exact synthesis queries, voice settings, and the accent reference are saved in `public/audio/generation.json`; tests protect the spoken readings and generated file checksums.

The files have **not received a native-speaker listening or accent review**; synthetic fluency alone does not establish pronunciation quality. This expanded set remains available for listening evaluation.

`public/audio/` contains the files, per-file sources in `CREDITS.txt`, the full original CC license, the Nemo voice-library policy, and generation metadata. Both builds copy the directory. The website serves audio from its own origin, including CDN subdirectories, with no runtime speech service, backend, or API key. The local synthesis engine is only an authoring tool and is not part of the app or build dependencies. Keep the credits and applicable terms alongside the audio when deploying.

### Item model

`loadCollection()` reads and validates the unified JSON. `collectionRows()` derives search/presentation rows, and `createStudyCatalog()` builds independent study items from those rows. None of these functions contains a second copy of the study content. `StudyItem` is a TypeScript discriminated union defined in `src/types.ts`:

| Type | Content | Example ID |
| --- | --- | --- |
| `kanji` | Character, meanings, and references to its example vocabulary | `kanji:一` |
| `vocabulary` | Written word/expression, kana reading, meanings, and references to known kanji present in its spelling | `word:一年生` |

Both kinds have their own stable identity. Their classifications are resolved from the canonical JSON with the same item IDs. Words shared by several rows are one catalog item, preserving one classification and a single future study-history identity. Their definitions must agree; conflicting definitions fail validation instead of silently creating ambiguous quiz answers.

The catalog contains 312 independent items (80 kanji + 232 distinct vocabulary items), a `byId` lookup, and 80 presentation rows. A `StudyRow` holds exactly four IDs: one kanji followed by its three example words. Reordering rows or examples does not change item identities.

A future quiz can use `studyCatalog.items`, filter by `item.type`, and resolve current difficulty by `item.id`; it does not need the original row. Vocabulary items carry their complete reading and meanings. Kanji items deliberately do not invent an isolated reading from an example word: the PDF does not supply those readings. The present catalog supports kanji-meaning prompts and vocabulary-reading/meaning prompts; no quiz UI is implemented yet.

## Single source of truth

**Edit `public/collection.json` to change study content or difficulties.** It contains every character, word, reading, translation, row order, and all 312 classifications. The application only reads this file.

The versioned JSON has two sections. Each kanji contains its meanings, difficulty, and three vocabulary references. Each unique word is defined once with its reading, Spanish meaning, and difficulty. A word appearing in several rows shares the same definition and classification.

```json
{
  "version": 1,
  "kanji": [
    {
      "character": "一",
      "meanings": ["uno"],
      "difficulty": "easy",
      "vocabulary": ["一つ", "一ぴき", "一年生"]
    }
  ],
  "vocabulary": [
    { "written": "一つ", "reading": "ひとつ", "meaning": "una cosa", "difficulty": "easy" },
    { "written": "一ぴき", "reading": "いっぴき", "meaning": "animal pequeño", "difficulty": "medium" },
    { "written": "一年生", "reading": "いちねんせい", "meaning": "estudiante (primero)", "difficulty": "easy" }
  ]
}
```

The real file uses two-space indentation, one field per line, and stable source order for readable Git diffs. `easy`, `medium`, `hard`, and `null` mean Fácil, Medio, Difícil, and Sin marcar. Difficulty is required on every kanji and word. The four ratings in a row are independent. The source has no isolated kanji readings, so those are not invented.

The app fetches **one `collection.json` on startup** with `cache: 'no-store'`, relative to its deployment URL. Content and ratings are not compiled into JavaScript. Replacing that file on the CDN updates both without rebuilding the application; configure the CDN to revalidate it. Invalid versions, duplicate kanji/words, incomplete content, invalid levels, and broken vocabulary references are rejected with a load error instead of silently using an older copy.

To edit readings or translations, update this JSON and reload the page. Runtime study IDs remain `kanji:<character>` and `word:<written>`. Changing a word's reading makes a mismatched audio unavailable until the corresponding recording is updated.

### Review data changes in Git

1. Edit the relevant definition in **public/collection.json**. Difficulty values are `easy`, `medium`, `hard`, or `null`.
2. Review `git diff -- public/collection.json` before committing. The two-space indentation and stable ordering keep changes readable.
3. Reload the local page to read the updated file. When deploying data changes, publish the updated `collection.json` on the CDN.

Word definitions are shared across rows. The browser reads the source file on every startup and does not store or override classifications locally.

## Source notes

The data is transcribed from **80 kanjis x 3 palabras.pdf**, preserving its order, vocabulary, readings, and Spanish translations. The private source PDF is not included in the repository or build.

The seven slots marked `duplicado` are completed from the matching word elsewhere in the PDF: 一年生, 小石, 左右, 右手, 女子, 名人, and 小学校. The apparent katakana カ in カもち is normalized to the intended kanji 力 in 力もち. The wrapped meaning for 立 is joined as “ponerse de pie”. Other simplified mixed kanji/kana spellings are retained as supplied rather than expanded to dictionary spellings.

Tests read the same canonical JSON and verify its schema, source sequence, vocabulary references, shared definitions, search, row grouping/filtering, stable identities, read-only classifications, and audio coverage. `check:build` verifies the deployed collection, audio files, relative asset URLs, visible readings, and the absence of editing controls and browser storage code. Spanish interface text lives in `src/main.ts`; visual styles live in `src/style.css`.
