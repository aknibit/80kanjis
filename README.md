# 80 kanjis

A Spanish-language Japanese study tool built with **TypeScript + Vite**, without a UI framework, database, server, or runtime API. The landing page remains the collection of 80 kanji and 232 unique words (240 examples), whose source of truth is **public/collection.json**. Counters, kana, verbs, thematic vocabulary, adjectives, and adverbs each load their own versioned JSON from **public/content/**. See [CONTENIDO.md](CONTENIDO.md) for the content format, provenance, and PR review workflow.

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
| `npm run check:content` | Validate canonical content, IDs, groups, sources, section references, and font coverage |
| `npm run fonts` | Rebuild the font subsets in `src/fonts/` (requires `python3 -m pip install fonttools brotli`) |

Validate the collection and build:

```sh
npm run check:content
npm test
npm run build
npm run check:build
```

## Deploy to a CDN

Upload the **contents of `dist/`** to any static host or CDN. Set the build command to `npm run build` and the output directory to `dist` when using a Git-based host. Vite uses relative asset URLs, so the same build works at a domain root or a subdirectory. There are no client-side routes or rewrite rules to configure.

Serve `index.html`, `collection.json`, and the JSON files in `content/` with revalidation (`Cache-Control: no-cache`). The content-hashed files in `assets/` can use `Cache-Control: public, max-age=31536000, immutable`.

Typography uses self-hosted subsets of DM Sans, Noto Serif JP, and Noto Sans JP in `src/fonts/`, one WOFF2 per family with system fallbacks and no third-party requests. Because the content is a closed set, `scripts/subset-fonts.py` keeps only the characters in `public/` and the interface source (DM Sans also keeps Latin-1 for typed searches); `npm run check:content` fails when new text needs `npm run fonts`. `index.html` preloads `collection.json`, `content/navigation.json`, and DM Sans so they download with the page instead of after the app bundle runs. Kanji and written words retain Noto Serif JP; vocabulary readings use Noto Sans JP at 16 px with a darker color, including in dialogs. Basic on/kun readings in support dialogs use the same Japanese sans-serif family. The collection and search do not depend on that service.

## Deploy to GitHub Pages

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and deploys the compiled website on pushes to `main`, or manually from the Actions tab. It uses Node.js 22, installs from `package-lock.json` with `npm ci`, runs the tests and build checks, and publishes the contents of `dist/` as a Pages artifact.

One-time setup for this repository:

1. Open [Settings → Pages](https://github.com/aknibit/80kanjis/settings/pages), then select **GitHub Actions** under **Build and deployment → Source**. Publishing `main` directly serves the source HTML and cannot compile the TypeScript application.
2. Commit and push the deployment configuration to `main`.
3. Check **Actions → Deploy to GitHub Pages**. Once deployment succeeds, the default site URL is [https://aknibit.github.io/80kanjis/](https://aknibit.github.io/80kanjis/).

Keep `dist/` in `.gitignore`; GitHub generates it during the workflow, so it does not need to appear in the repository. Keep Vite's `base: './'`: asset, collection, and audio URLs are already relative and work under `/80kanjis/`, at a domain root, and on other CDNs. This app uses query parameters rather than client-side routes, so no router or 404 workaround is required.

To publish later changes, push to `main`. You can also select **Run workflow** from the workflow's Actions page. The GitHub Pages deployment URL is shown by the deployment job.

## Features

- Six menu entries: 80 kanji (the default home page), counters, verbs, vocabulary, and adjectives/adverbs, with Kana separated at the far right as a support section. Sections use CDN-compatible query URLs and load only their own content file. New sections include search, group filters, usage notes, source references, and stable entry IDs for future quiz reuse. Compact kana charts follow Japanese column order, beginning with あ at the upper right and vowels running downwards, preserving empty positions and scrolling horizontally on narrow screens.
- Vocabulary shows compact cards in a masonry of as many columns as fit (two on a 320 px phone, six on a wide desktop), each card with its own height: the word, its reading and rōmaji, the translation with any usage or register note in smaller grey text, and the topic as a slim footer. Under «Todo» the cards come in a random order, shuffled once per visit; a selected topic keeps the file's order and hides the footer. The ten topic filters wrap onto several lines instead of scrolling. Vocabulary, verbs, and adjectives/adverbs also give every entry a study difficulty, shown with the dots of the kanji cards (in the upper-right corner of a card, or above a row's group tag), and filter by it with the difficulty drop-down shared by every section, which combines with the topics: `?section=vocabulary&group=topic-5&difficulty=easy`. The level reflects the word's own traps (a second meaning, a special reading, a use that depends on whom one talks to), which its JLPT level can only raise; the criterion is in CONTENIDO.md. Every example sentence uses words no harder than what it illustrates: an easy verb, kanji or counter only gets easy words around it, a medium one easy and medium words, and `npm run check:content` enforces it. Verbs open to their four polite forms (〜ます, 〜ました, 〜ません, 〜ませんでした) in the same 2 × 2 table as the adjectives. Any lexicon section can opt in with `layout: "cards"` in `navigation.json`; verbs and adjectives/adverbs keep their rows.
- Counter reference with 22 expandable groups whose headers show the title with its description, plus the most common endings as chips in their own column (for example 〜ほん, 〜ぽん, 〜ぼん), each form's writing and reading shown as one pair (writing right-aligned, reading left-aligned) followed by a real use in Japanese and a complete everyday sentence, each with its kana reading and Spanish translation (一本の 鉛筆, un lápiz; 鉛筆を 一本 ください。, Un lápiz, por favor.). Below 900 px the example and the sentence move under the reading, side by side on tablets and stacked on phones, explicit pronunciation variants and sound changes, questions, calendar dates through the 31st, and a distinction between counters and number units. Each counter has a study difficulty, shown with the dots of the kanji cards; the shared difficulty drop-down combines with the group filter and is bookmarkable via `?section=counters&group=objects&difficulty=easy`. Kana compares hiragana and katakana for 104 basic, voiced, and contracted sounds. The curated vault supplies 53 verbs, 132 vocabulary entries, and 42 adjectives/adverbs; the class handouts for lessons 1–9 add 6 verbs, 174 vocabulary entries, 30 adjectives/adverbs (one of them, あつい, has since merged with 暑い into 暑い／熱い), and the 〜時 and 〜分 counters.
- Typed runtime content validation, JSON Schema editing support, and a read-only PR workflow that tests and builds every proposed change. The build never depends on an accessible Obsidian vault.
- The collection is a stack of white cards, one per row, each with four study columns: one headed by its “Info kanji 01” button and three labeled Vocabulario. Fine vertical rules separate the columns, and an 8 px gap of page background separates the rows; individual entries have no borders of their own. Tablets use a grouped 2×2 layout with a fine rule between the two pairs of each row. On phones each card becomes a list: the kanji and its meanings form the header, and the three words follow underneath, each with its reading on the same line, its meaning below, and Audio and difficulty aligned to the right.
- Light and dark themes. The page follows the system setting until the header toggle (next to “?”) overrides it; the choice is remembered in `localStorage`, and choosing the system theme again clears it. The theme and the chosen difficulty are the only things the site stores in the browser. All colors are tokens in `src/style.css`, with dark text at WCAG AA contrast or better.
- On phones the menu wraps onto two lines so every section stays visible, group filters span the full width and scroll to the screen edge with the result count below them, the difficulty drop-down stays beside the title, and search hints switch to a shorter text whenever the full one would be cut off.
- Search across kanji, written words, kana readings, and Spanish meanings.
- Case-insensitive and accent-insensitive Spanish matching; hiragana, katakana, and half-width kana matching that preserves dakuten/handakuten.
- Multiple search terms must all appear on the same card.
- Search is reflected in the `?q=` URL parameter for bookmarks and sharing.
- A row’s kanji opens full screen from its large character, its “Info kanji 01” button or the green kanji in its words, with the same content as its modal, two columns on desktop, and a bar to go back to the list («Todos los kanji») or step to the previous or next kanji on screen, following the active search and difficulty (also with the ← and → keys). The kanji travels in `?kanji=水`, so the browser’s Back button returns to the list, at the row of the last kanji seen. Blue and red kanji still open the modal, which also opens on top of the full-screen view.
- Always-visible vocabulary readings, empty results, keyboard shortcuts (`/` to search, `Escape` to clear), and an accessible collection information dialog.
- Four independent difficulty indicators per row: one for the kanji and one for each word (Fácil, Medio, Difícil, or Sin marcar). Repeated words share their difficulty across rows.
- One difficulty drop-down for the whole site, floated to the right of each page title (Todas, Fácil, Medio, Difícil: «Todas» agrees with its «Dificultad» title). It is hand-made, a select-only combobox following the WAI-ARIA pattern, so that the button and every option keep the tint and dots of their level; the options show the counts of the open page, combined with its search and group. The choice applies to every section, is remembered in `localStorage` (`80kanjis-difficulty`) and travels in `?difficulty=`; a link with a valid level wins and is remembered too, so `?difficulty=hard&q=...` opens at that level. Kana has no difficulties and hides it. On the kanji page it filters whole rows. On touch screens the button and the options are 44 px tall.
- 232 vocabulary audio files with play/stop controls and source credits: 108 human recordings and 124 locally synthesized WAVs. Every vocabulary item in the collection has audio; changing classifications does not remove it.
- Compact columns with “Info kanji 01” and “Audio” buttons, each with an inline icon, at the upper left and difficulty at the upper right. Info is blue, the tone of the collection kanji, and as wide as its label; Audio stays green. Audio and the difficulty indicators share a 68 px width (60 px on phones) and 22 px height, and the difficulty dots end at the column’s right edge; on touch devices they grow to 30 px with an invisible 44 px touch area. During playback, “Audio” changes to “Parar” with a stop icon; generated recordings retain a small inline “IA” marker with its own spacing and a subtle separator. One green, two yellow, or three red flat dots indicate easy, medium, or hard; faded dots mean unmarked. Names remain available in tooltips and accessible labels. The 56 px kanji (49 px on phones) stays on the right below the level, 8 px from the column edge, with the meaning chips aligned at the upper left, including on mobile.
- The main accent is a rich pine green. Every vocabulary kanji is clickable and uses Noto Serif JP at its original moderate weight, slightly larger than the surrounding kana, with soft layered text shadows that follow the character’s strokes: pine green for the row’s kanji, blue for other main kanji, and dark red for support characters outside the 80. Kanji have no underlines or background shapes; the colored shadow grows stronger on hover and keyboard focus. Native dialogs show meanings and examples; support dialogs also show basic on/kun readings, an explanation, and a dictionary source. Escape, the close button, and clicking the backdrop dismiss the dialog and return focus.
- Main kanji cards show their reviewed meanings as readable 14 px chips and a blue “Info kanji 01” button in the upper-left corner, in the audio button’s position. Dictionary readings use a compact vertical layout without individual borders or backgrounds. On and kun groups sit next to one another at their natural width in a single row, with keyboard-accessible horizontal scrolling when needed. Kana-only readings run from top to bottom. Okurigana examples show the written form (一つ) with hiragana furigana to the right of the kanji (ひと), keeping the kana ending outside the annotation. Okurigana dots are hidden in the UI, and the explanation uses the current kanji as its example. Usage notes and every collection word containing that kanji remain in the modal, each word with its own Audio button. The modal of each of the 80 kanji also shows six example sentences (two simple ones and four with adjectives, adverbs and counters), with their kana reading, translation and a generated Audio button; they only use words taught on the site. The vocabulary and the sentences are two tabs of a 640 px modal anchored near the top, so switching tabs never moves them; the chosen tab carries over to the next kanji during the visit. They load from `public/content/kanji-sentences.json` the first time a modal opens, not with the page. The character (without a hover effect) and the information button both open the kanji full screen, with the same content as the modal. Complete-word readings remain the authority for sound changes and irregular compounds. Dictionary readings remain searchable, with or without the okurigana dot.

## Independent study items

### Whole-row difficulty

The collection always preserves all four blocks. `src/lib/row-difficulty.ts` derives a row's category from its current kanji and vocabulary ratings:

- **Difícil:** any of the four entries is hard, even if others are unmarked.
- **Medio:** at least one entry is medium and none is hard, even if others are unmarked.
- **Fácil:** all four entries are explicitly easy.
- **Sin completar:** only easy/unmarked entries, with at least one unmarked.
- **Todas:** every row.

Counts reflect the current text search. The selected category is a view of the four existing marks; it does not add another persisted rating. A shared word's classification applies to every row containing it. All classifications come from the fetched JSON. “Sin completar” appears only when the current search results contain incomplete rows. If an old bookmark selects that category when none remain, or another section was chosen with it, the view returns to Todas and updates the URL. The categories are the options of the difficulty drop-down shared by every section; Sin completar only exists on this page.

### Pronunciation audio

Each vocabulary block has a speaker button, and so does each word and each sentence in a kanji’s modal. A small **IA** marker and an accessible label identify synthesized audio. Only one clip plays at a time across the page and the modal, playback starts after a click, and filtering, closing the modal or opening another kanji stops playback. Playback errors inside the modal are announced there. Press the button again to stop or retry a failed playback.

All **232 unique vocabulary items** have audio, covering all 240 example slots in the 80 kanji rows. Repeated words share a recording. Coverage is independent of difficulty classifications. Tests require every vocabulary item to have exactly one matching audio; new words or changed readings must receive a corresponding clip.

Identity and reading must both match `src/data/pronunciations.ts`; alternative readings are never silently substituted. Simplified spellings are explicitly matched to the same word and reading (for example 火じ → 火事 and 一ぴき → 一匹). Each recording's source spelling is listed in CREDITS.txt. An unrelated homophone is not used as a substitute. Repeated words and future quizzes share the same item ID and lookup.

- **108 human recordings:** [Tofugu and WaniKani](https://github.com/tofugu/japanese-vocabulary-pronunciation-audio), under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The source mixes a native male professional (Tokyo accent) and a native female amateur (Kansai accent); individual speaker identity is not specified per file. The MP3s are unmodified, with shortened filenames. Tests verify upstream Git blob hashes.
- **124 synthesized recordings:** [VOICEVOX Nemo](https://voicevox.hiroshiba.jp/nemo/), voice 女声1 (CV: 亜咲比 凛), speaker 10005, engine 0.26.0 and core 0.17.0. These WAVs are subject to the [Nemo terms](https://voicevox.hiroshiba.jp/nemo/term/), including attribution and the prohibition on machine-learning use; the human recordings' CC BY-SA license does not apply to these files. They were generated locally once and checked against the collection's kana readings. 七色 explicitly uses なないろ with Tokyo accent [2], correcting the engine's default ななしょく. 山みち explicitly uses やまみち with Tokyo accent [2], and 空ばこ uses a single からばこ phrase. 竹林 and 木の上 explicitly retain the source readings たけばやし and きのうえ. Standard spoken long-vowel spellings are documented without changing the canonical readings. Exact synthesis queries, voice settings, and pronunciation references are saved in `public/audio/generation.json`; tests protect the spoken readings and generated file checksums.

#### Sentence audio

All **480 sentences** of the kanji modals have a generated MP3 in `public/audio/sentences/`, with the same VOICEVOX Nemo voice as the synthesized vocabulary and the same **IA** marker. Each file is named after its kanji and place (`4e00-s1.mp3` is the first simple sentence of 一; `4e00-a4.mp3`, the last advanced one), so the sentences JSON needs no extra field and the page derives the URL. They are 32 kbps mono MP3s of about 11 KB each, 5.3 MB in total; nothing downloads until a button is pressed. On phones the sentence and its reading keep the full width and the button sits beside the translation.

`npm run audio:sentences` (after `python3 -m pip install lameenc`) downloads the pinned engine for macOS on Apple Silicon into `tmp/voicevox-nemo/`, checks its SHA-256, runs it with a private user folder and regenerates only new or changed sentences; the output is deterministic. Before synthesizing anything, it checks that the engine would read every sentence as its kana reading and stops otherwise. Words the engine misreads are fixed in a reviewed list inside the script: a user dictionary with reading and accent (日本 as «nihon», こん虫, でん車, はは…), reusing the accent of the word’s own audio when there is one, and two text replacements (日本人, 描きます). `npm run check:content` fails if a sentence lacks its audio, if an audio was generated from a different text or reading, or if a file is left over or altered. `sentences/generation.json` records the text, the spoken kana with accents and the SHA-256 of each file.

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

The app fetches **one `collection.json` on startup**, relative to its deployment URL, through the normal HTTP cache: it reuses the request preloaded by `index.html` and revalidates with the server's ETag. GitHub Pages sends `Cache-Control: max-age=600`, so returning visitors can see a previous copy for up to 10 minutes after a deploy. Content and ratings are not compiled into JavaScript. Replacing that file on the CDN updates both without rebuilding the application, unless it adds characters the font subsets lack (run `npm run fonts` and rebuild; see [AGENTS.md](AGENTS.md)); configure the CDN to revalidate it. Invalid versions, duplicate kanji/words, incomplete content, invalid levels, and broken vocabulary references are rejected with a load error instead of silently using an older copy.

To edit readings or translations, update this JSON and reload the page. Runtime study IDs remain `kanji:<character>` and `word:<written>`. Changing a word's reading makes a mismatched audio unavailable until the corresponding recording is updated.

### Review data changes in Git

1. Edit the relevant definition in **public/collection.json**. Difficulty values are `easy`, `medium`, `hard`, or `null`.
2. Review `git diff -- public/collection.json` before committing. The two-space indentation and stable ordering keep changes readable.
3. Reload the local page to read the updated file. When deploying data changes, publish the updated `collection.json` on the CDN.

Word definitions are shared across rows. The browser reads the source file on every startup (from its HTTP cache when still valid) and does not store or override classifications locally.

## Source notes

The data is transcribed from **80 kanjis x 3 palabras.pdf**, preserving its order, vocabulary, readings, and Spanish translations. The private source PDF is not included in the repository or build.

The seven slots marked `duplicado` are completed from the matching word elsewhere in the PDF: 一年生, 小石, 左右, 右手, 女子, 名人, and 小学校. The apparent katakana カ in カもち is normalized to the intended kanji 力 in 力もち. The wrapped meaning for 立 is joined as “ponerse de pie”. Reviewed exceptions expand 月み → 月見, 川かみ → 川上, 川しも → 川下, きの上 → 木の上 and 休じつ → 休日, plus the existing occurrences of the counter 個, 色 in 音色, and 庭 in 庭木・中庭・校庭. Their readings, translations, difficulties, and audio files are unchanged. Other simplified mixed kanji/kana spellings are retained as supplied.

The 80 main kanji meanings were reviewed on 2026-11-15 against [KANJIDIC2](https://www.edrdg.org/wiki/KANJIDIC_Project.html), database 2026-319, with selected clarifications checked in [KanjiPedia](https://www.kanjipedia.jp/). Additions include 生 as raw/uncooked, 青 as young, 気 as air, 金 as metal, and notes for 本 as a long-object counter and 文 as an old monetary unit. 中 explicitly includes ジュウ for 一日中, verified in KanjiPedia despite its omission from the current KANJIDIC2 entry. Existing vocabulary definitions, ratings, row order, and audio are unchanged.

The KANJIDIC2-derived reading lists and enriched meanings are credited to EDRDG / Jim Breen and distributed under CC BY-SA 4.0. `public/data/CREDITS.txt` includes provenance, editorial criteria, and the refresh procedure; the full license ships alongside it. Credits are available from the information dialog, and every kanji modal links to a source. This adds no runtime dictionary service or extra content fetch.

The vocabulary's Spanish translations were subsequently reviewed: 30 approved wording, accent, and capitalization corrections were applied, retaining all other translations. Japanese spellings, readings, difficulties, and audio were preserved.

Tests read the same canonical JSON and verify its schema, source sequence, vocabulary references, shared definitions, search, row grouping/filtering, stable identities, read-only classifications, and audio coverage. `check:build` verifies the deployed collection, audio files, relative asset URLs, visible readings, the absence of editing controls, and that browser storage is limited to the theme preference. Spanish interface text lives in `src/main.ts` and `src/kanji-ui.ts`; visual styles live in `src/style.css`. `src/lib/kanji-reference.ts` resolves both kinds of kanji and classifies every character without duplicating study content.
