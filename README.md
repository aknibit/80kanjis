# 80 kanjis

A small Spanish-language kanji collection built with **TypeScript + Vite**, without a UI framework, database, server, or runtime API. All 80 kanji and 240 vocabulary examples are in the source code.

## Run locally

Requires Node.js 22.13 or later.

```sh
npm ci
npm run dev
```

## Editor and production builds

| Command | Behavior | Output |
| --- | --- | --- |
| `npm run dev` | Live local editor with four difficulty selectors per row | Vite development server |
| `npm run build:dev` | Static editor build, including file linking, imports, exports, and browser drafts | `dist-dev/` |
| `npm run preview:dev` | Preview the static editor build | Local preview server |
| `npm run build` | Production build with four read-only difficulty badges per row | `dist/` |
| `npm run preview` | Preview the production build | Local preview server |

Both builds type-check the application. The editor is selected at build time with Vite's `editor` mode; production removes the editor implementation entirely. Production does not load browser drafts or include file-writing, import/export, or difficulty selection controls. It displays only the classification fetched from `difficulties.json`. Search and the reading visibility toggle remain available in both modes.

Validate data, persistence, migration, and both build outputs:

```sh
npm test
npm run build
npm run build:dev
npm run check:builds
```

## Deploy to a CDN

Upload the **contents of `dist/`** to any static host or CDN. Set the build command to `npm run build` and the output directory to `dist` when using a Git-based host. Vite uses relative asset URLs, so the same build works at a domain root or a subdirectory. There are no client-side routes or rewrite rules to configure.

Serve `index.html` and `difficulties.json` with revalidation (`Cache-Control: no-cache`). The content-hashed files in `assets/` can use `Cache-Control: public, max-age=31536000, immutable`.

Typography currently loads DM Sans and Noto Serif JP from Google Fonts, with system fallbacks. The collection and search do not depend on that service.

## Features

- Each collection row has four separate study blocks: one labeled Kanji and three labeled Vocabulario. They use four columns on desktop and a grouped 2×2 layout on smaller screens.
- Search across kanji, written words, kana readings, and Spanish meanings.
- Case-insensitive and accent-insensitive Spanish matching; hiragana, katakana, and half-width kana matching that preserves dakuten/handakuten.
- Multiple search terms must all appear on the same card.
- Search is reflected in the `?q=` URL parameter for bookmarks and sharing.
- Hide/show readings, empty results, keyboard shortcuts (`/` to search, `Escape` to clear), and an accessible collection information dialog.
- Four independent difficulty indicators per row: one for the kanji and one for each word (Fácil, Medio, Difícil, or Sin marcar). Repeated words share their difficulty across rows.
- Compact header and whole-row difficulty filters with counts, combined with search and the audio sample filter. Filters are bookmarkable via `?difficulty=hard&audio=1&q=...` and update after edits/imports.
- 38 vocabulary audio files with play/stop controls and source credits: 23 human recordings and 15 locally synthesized WAVs. All 30 words in the requested ten easy kanji rows are covered in both builds.
- In the editor: browser persistence, JSON import/export, and optional direct writing to a user-selected local JSON file.
- In production: read-only badges loaded exclusively from the public JSON file.

## Independent study items

### Whole-row difficulty

The collection always preserves all four blocks. `src/lib/row-difficulty.ts` derives a row's category from its current kanji and vocabulary ratings:

- **Difícil:** any of the four entries is hard, even if others are unmarked.
- **Medio:** at least one entry is medium and none is hard, even if others are unmarked.
- **Fácil:** all four entries are explicitly easy.
- **Sin completar:** only easy/unmarked entries, with at least one unmarked.
- **Todas:** every row.

Counts reflect the current text search and audio filter. The selected category is a view of the four existing marks; it does not add another persisted rating. Editing a shared word reclassifies every row that contains it. Production uses the fetched JSON; the editor uses its effective local ratings.

### Pronunciation audio

Use **Con audio · 38** or open `?audio=1#collection` to find rows with audio. Each available vocabulary block has a speaker button. A small **IA** marker and an accessible label identify synthesized audio. Only one clip plays at a time, playback starts after a click, and filtering stops playback. Press the button again to stop or retry a failed playback. Words without audio have no speaker button.

All 30 vocabulary words in the rows 二, 三, 四, 七, 八, 九, 十, 百, 千, and 日 have audio. These are the ten fully easy rows in the classification supplied by the user. Coverage is tied to item identity, so changing a rating does not remove audio. The eight other audio files from the original audition remain available too. Tests protect the requested row coverage without depending on future edits to the difficulty file.

Identity and reading must both match `src/data/pronunciations.ts`; alternative readings are never silently substituted. The simplified 三こ uses the recording of 三個, with the same reading and meaning. An unrelated homophone is not used as a substitute. Repeated words and future quizzes share the same item ID and lookup.

- **23 human recordings:** [Tofugu and WaniKani](https://github.com/tofugu/japanese-vocabulary-pronunciation-audio), under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The source mixes a native male professional (Tokyo accent) and a native female amateur (Kansai accent); individual speaker identity is not specified per file. The MP3s are unmodified, with shortened filenames. Tests verify upstream Git blob hashes.
- **15 synthesized recordings:** [VOICEVOX Nemo](https://voicevox.hiroshiba.jp/nemo/), voice 女声1 (CV: 亜咲比 凛), speaker 10005, engine 0.26.0 and core 0.17.0. These WAVs are subject to the [Nemo terms](https://voicevox.hiroshiba.jp/nemo/term/), including attribution and the prohibition on machine-learning use; the human recordings' CC BY-SA license does not apply to these files. They were generated locally once and checked against the collection's kana readings. 七色 explicitly uses なないろ with Tokyo accent [2], correcting the engine's default ななしょく. Exact synthesis queries, voice settings, and the accent reference are saved in `public/audio/generation.json`; tests protect the spoken readings and generated file checksums.

The files have **not received a native-speaker listening or accent review**; synthetic fluency alone does not establish pronunciation quality. This expanded set remains available for listening evaluation.

`public/audio/` contains the files, per-file sources in `CREDITS.txt`, the full original CC license, the Nemo voice-library policy, and generation metadata. Both builds copy the directory. The website serves audio from its own origin, including CDN subdirectories, with no runtime speech service, backend, or API key. The local synthesis engine is only an authoring tool and is not part of the app or build dependencies. Keep the credits and applicable terms alongside the audio when deploying.

### Item model

`src/data/study.ts` exposes a shared `studyCatalog`. The original PDF rows remain in `src/data/kanji.ts`, but the collection now renders independent items from this catalog. `StudyItem` is a TypeScript discriminated union defined in `src/types.ts`:

| Type | Content | Example ID |
| --- | --- | --- |
| `kanji` | Character, meanings, and references to its example vocabulary | `kanji:一` |
| `vocabulary` | Written word/expression, kana reading, meanings, and references to known kanji present in its spelling | `word:一年生` |

Both kinds have their own stable identity and difficulty. The IDs match the existing rating keys, so no ratings migration is needed for this display change. Words shared by several rows are one catalog item, preserving one classification and a single future study-history identity. Their definitions must agree; conflicting definitions fail validation instead of silently creating ambiguous quiz answers.

The catalog contains 312 independent items (80 kanji + 232 distinct vocabulary items), a `byId` lookup, and 80 presentation rows. A `StudyRow` holds exactly four IDs: one kanji followed by its three example words. Reordering rows or examples does not change item identities.

A future quiz can use `studyCatalog.items`, filter by `item.type`, and resolve current difficulty by `item.id`; it does not need the original row. Vocabulary items carry their complete reading and meanings. Kanji items deliberately do not invent an isolated reading from an example word: the PDF does not supply those readings. The present catalog supports kanji-meaning prompts and vocabulary-reading/meaning prompts; no quiz UI is implemented yet.

## Difficulty ratings: no backend

The website fetches `public/difficulties.json` on startup with `cache: 'no-store'`. Ratings are **not compiled into the JavaScript**. Replace `difficulties.json` on your CDN to update defaults without rebuilding the app, and configure the CDN to revalidate this file. The file currently contains the user-supplied classification of all 80 kanji and 232 unique words.

```json
{
  "version": 2,
  "kanji": {
    "一": "easy"
  },
  "words": {
    "一つ": "medium",
    "一ぴき": "hard",
    "一年生": null
  }
}
```

The `kanji` section uses the actual character; `words` uses the written vocabulary word. A word repeated in multiple rows has one shared classification. There are 80 kanji and 232 distinct words across the 240 examples. The four indicators in a row are independent: setting the kanji never changes its words.

`easy`, `medium`, and `hard` appear as Fácil, Medio, and Difícil. `null` explicitly clears a classification. Missing entries use the kanji fallback in `src/data/kanji.ts` or an unset word rating. Unknown items, unsupported versions, and invalid difficulties are rejected before changing any state.

Existing v1 files (`{ "version": 1, "ratings": { "一": "easy" } }`) remain readable. Their values migrate to the kanji section; words stay unset. All new saves and exports use v2. Legacy browser drafts are also recovered on first use, without deleting their old storage entry.

### Write straight to the project file

1. Open the website with `npm run dev` in a browser supporting the File System Access API (such as desktop Chrome or Edge).
2. Open **Mis dificultades → Vincular archivo local**.
3. Choose this project's **public/difficulties.json** and allow writing.
4. Change the kanji selector or any of its three word selectors. The app writes your choice directly to that file; there is no backend endpoint, database, or code regeneration.

Linking loads the selected file's entries into the current classification, retaining browser choices for entries absent from the file, then saves the merged classification. Each subsequent change is saved automatically. Writes are serialized and re-read the selected file first to preserve unrelated external edits. After a page reload, select the file again to re-enable direct writing; permissions and handles are not silently retained. Anyone working in this repository can read `public/difficulties.json` later, including Codex. Browser drafts are not automatically published: link and save this file, or replace it with an export, before building production.

The API requires a supported browser and a secure context (HTTPS or localhost). The static **editor build** can write to a local file selected by its user. The production build contains no file-writing interface or API calls. Neither build writes back to the CDN; publish the updated JSON file to update the public classification. See the [File System Access API documentation](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access).

### Browser-only and portable use

In editor mode, changes also persist in `localStorage`, under `80kanjis:difficulties:v2` (with migration from the v1 key). Editor drafts override the fetched defaults. Production ignores both storage keys, even when opened in the same browser. Importing or linking a file makes its included entries authoritative in that browser; unspecified entries remain unchanged. Use **Mis dificultades → Exportar JSON** to download the complete effective classification, share it, or replace the public JSON file. **Importar JSON** also works when direct file writing is unavailable.

Browser storage belongs to the current origin and browser profile; it does not sync between devices. If storage is unavailable, changes remain in memory and can still be exported. File permission or write failures leave the browser's current classification available and expose a retry action. No changes are uploaded automatically.

## Source notes

The data is transcribed from **80 kanjis x 3 palabras.pdf**, preserving its order, vocabulary, readings, and Spanish translations. The private source PDF is not included in the repository or build.

The seven slots marked `duplicado` are completed from the matching word elsewhere in the PDF: 一年生, 小石, 左右, 右手, 女子, 名人, and 小学校. The apparent katakana カ in カもち is normalized to the intended kanji 力 in 力もち. The wrapped meaning for 立 is joined as “ponerse de pie”. Other simplified mixed kanji/kana spellings are retained as supplied rather than expanded to dictionary spellings.

Tests verify the source sequence, vocabulary, search behavior, four-block row grouping, standalone study items, stable identities, shared word ratings, v1 migration, read-only state, rating persistence/import/export, and queued file writes with simulated storage and file failures. `check:builds` verifies that file-writing APIs, browser draft storage, and editor controls are absent from production. Spanish interface text lives in `src/main.ts`, `src/difficulty-editor.ts`, and `src/difficulty-viewer.ts`; visual styles live in `src/style.css`.
