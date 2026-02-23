# Design & Architecture

This document describes how the Cambridge Chemistry Lab Simulator is built — the component tree, data flow, engine design, and the key decisions behind them.

---

## Overview

The app is a single-page React application with no client-side router. Navigation is driven by a tab variable held in component state. There is no backend — all logic runs in the browser and state is persisted to `localStorage`.

```
Browser
└── App.jsx            ← root layout, tab switching, language provider
    ├── LabTab          ← virtual bench (vessels, chemicals, actions)
    ├── FreeLabTab      ← open-ended lab without a set paper
    ├── PaperTab        ← question paper viewer + per-part answer boxes
    ├── DataTab         ← results tables and scatter graphs
    └── EvaluateTab     ← mark-scheme feedback + PDF export
```

---

## Tech stack

| Concern | Choice |
|---|---|
| UI framework | React 19 (no router, no state library) |
| Build tool | Vite 7 |
| Styling | Plain CSS — single `index.css`, BEM-adjacent class names |
| PDF export | jsPDF 4 (client-side, no server round-trip) |
| Tests | Vitest 3 + jsdom |
| Container | Docker — nginx:1.27-alpine serves the static build |
| Hosting | Render.com free tier, Docker runtime |

---

## Component tree

### `App.jsx`
- Owns the active tab (`lab | paper | data | evaluate | freelab`).
- Wraps the whole tree in `LangContext.Provider` so any component can call `useLang()` for translations.
- Renders the header (paper selector, New Session button, language switcher) and delegates to the active tab component.
- Passes the single `chemLab` state object and its handlers down as props.

### `LabTab.jsx`
- Renders the vessel grid, the chemical/equipment palette, and the action toolbar.
- Reads `vessels`, `selectedVessel`, `selectedChemical`, and `actionLog` from props.
- Calls handlers (`onAddChemical`, `onAction`, `onSelectVessel`, …) on user interaction.
- Unknown FAs from the current paper's `faMap` are shown with placeholder labels in the palette so students don't see the chemical names.
- Observation panel streams the latest reaction result from the engine.

### `FreeLabTab.jsx`
- Identical bench layout to `LabTab` but without a paper constraint.
- All chemicals are visible by name.
- Includes an in-app guidance report (`freeLabReport.js`) explaining what each chemical is used for.

### `PaperTab.jsx`
- Displays the selected paper's questions in Cambridge exam style.
- Each question part has an answer box (`ChemTextInput` / `ChemCell`).
- Answer state is stored per `part.id` in `partAnswers` (managed by `useChemLab`).
- Tables and graphs from the Data tab can be attached to a part's answer via an inline picker.

### `DataTab.jsx`
- Two sub-panels: **Tables** and **Graphs**.
- Tables: resizable columns, multi-line headers (`ChemCell` — auto-growing textarea), add/remove rows and columns.
- Graphs: `GraphPlot.jsx` renders an SVG scatter plot. Students click to place data points; axes auto-scale; a best-fit line can be toggled.

### `EvaluateTab.jsx`
- Shows a score summary card, per-section breakdown bars, and criterion-level pass/partial/fail chips.
- Displays the student's written answers alongside the question text for self-review.
- Calls `exportReportPDF()` from `utils/export.js` to generate a download.

### `GraphPlot.jsx`
- Pure presentational SVG graph component.
- Props: `points`, `axisLabels`, `showBestFit`.
- Best-fit line calculated with ordinary least squares inside the component.

### `ChemTextInput.jsx`
- Thin wrapper around `<textarea>` that auto-grows with content.
- Used for answer boxes. Accepts an optional `style` override for use in table header cells.

---

## State management — `useChemLab.js`

All app state lives in a single custom hook. Components receive slices of state and named handlers as props — there is no context for lab state (intentional: keeps data flow explicit).

### State shape

```js
{
  vessels:        [],          // array of { id, name, type, contents[], color, … }
  selectedVessel: null,        // id of the active vessel
  selectedChemical: null,      // id of the chemical/equipment to add next
  actionLog:      [],          // { timestamp, action, vessel, details }
  partAnswers:    {},          // { [partId]: { text, tables[], graphs[] } }
  tables:         [],          // standalone data tables
  graphs:         [],          // standalone graphs
  evaluation:     null,        // result object from evaluation engine
  currentPaper:   PAPERS[0],   // the active question paper
  tab:            "lab",       // active UI tab
}
```

### Persistence

`useEffect` serialises the full state to `localStorage` key `chemlab_v1` on every change. On mount, stored state is deserialised and merged with defaults (new keys added in later versions get default values).

### Key handlers

| Handler | What it does |
|---|---|
| `handleAddChemical(vesselId, chemicalId, params)` | Adds a chemical to a vessel, runs reaction simulation, appends to action log |
| `handleAction(vesselId, actionType, params)` | Performs heat/stir/filter/weigh/measure on a vessel, logs it |
| `handleTransfer(fromId, toId, volume)` | Moves contents between vessels |
| `runEvaluation()` | Calls the evaluation engine with the current action log, answers, and paper |
| `handleNewSession()` | Resets state, clears localStorage |

---

## Reaction engine — `engine/reactions.js` + `engine/reaction-rules.js`

### How a reaction is resolved

1. `simulateReaction(vessel, action, params)` is called with the current vessel state.
2. It extracts the set of chemical IDs in the vessel.
3. It iterates `REACTION_RULES` in order — **first match wins**.
4. A rule matches if:
   - `requires` — all listed chemical IDs are present, AND
   - `actionFilter` — the current action type matches (or is absent), AND
   - `matches(chemicals, vessel, action)` — custom predicate returns true (overrides `requires` when present).
5. The matching rule's `produce(vessel, action, params)` returns a `ReactionResult`:
   ```js
   { observation, newColor, precipitate, hasPrecipitate, gas, colorChange, tempChange, reactionTime }
   ```
6. If the paper lists this vessel's FA as an unknown, `blind(vessel)` is called instead to strip chemical names from the observation text.

### Rule file structure

`reaction-rules.js` is a pure data file — no React, no imports. Rules are grouped by type:

- **Kinetics** — thiosulfate clock (time calculation from concentration)
- **Energetics** — displacement reactions with ΔT calculation
- **Iodometric titration** — volume-aware endpoint colour progression (deep brown → yellow-brown → pale yellow → blue-black with starch → colourless)
- **Redox** — KMnO₄ oxidations, Fe³⁺/KI, H₂O₂
- **Qualitative** — cation precipitates (NaOH, NH₃), anion tests (BaCl₂, AgNO₃), acid/gas reactions
- **Thermal** — heating/decomposition reactions
- **Titration indicators** — phenolphthalein, methyl orange, bromophenol blue (volume-aware colour states)
- **Fallbacks** — catch-all heat/stir/filter observations

### Adding a new reaction

Append one object to `REACTION_RULES` in `reaction-rules.js`. Do not edit `reactions.js`. Example:

```js
{
  id: "qualitative/my-new-reaction",
  requires: ["ChemicalA", "ChemicalB"],
  // actionFilter: "heat",   // optional: only fires on this action
  produce(vessel) {
    return {
      observation: "White precipitate forms immediately.",
      precipitate: "White ppt",
      hasPrecipitate: true,
      newColor: "#f0f0f0",
    };
  },
  blind() {
    // Called when the FA label is unknown to the student.
    return { observation: "White precipitate forms." };
  },
}
```

---

## Evaluation engine — `engine/evaluation.js`

`evaluateLog(actionLog, partAnswers, paper)` returns:

```js
{
  total,      // number
  maxMarks,   // number
  grade,      // "Distinction" | "Merit" | "Pass" | "Needs Improvement"
  sections,   // [{ label, score, max, criteria: [{ text, marks, status }] }]
  feedback,   // string summary
}
```

Each section maps to one question in the paper. The rubric for each section is determined by the question's `type` field:

| `type` | Criteria checked |
|---|---|
| `quantitative` | Pipette / burette use, titre count, mean titre, moles calculation, precision, indicator presence |
| `energetics` | Temperature measurements, stirring, reagent mixing, q = mcΔT, ΔH, sign |
| `qualitative` | Tests performed (NaOH, BaCl₂, AgNO₃, KMnO₄), diversity, gas tests, observations recorded, ionic equation attempted |

The engine inspects the `actionLog` (list of lab actions) and `partAnswers` (student's written responses). Each criterion is awarded `"pass"`, `"partial"`, or `"fail"` status.

---

## Data flow diagram

```
User action (click)
        │
        ▼
  Component handler prop
        │
        ▼
  useChemLab.js  ──── localStorage ────▶ persisted state
        │
        ├──▶ simulateReaction(vessel, action)
        │           │
        │           ▼
        │     reaction-rules.js  (first-match-wins)
        │           │
        │           ▼
        │     ReactionResult { observation, newColor, … }
        │
        ├──▶ actionLog.push(entry)
        │
        └──▶ setState(…) ──▶ React re-render
```

---

## Internationalisation — `LangContext.jsx` + `data/i18n.js`

- `LangContext` provides `{ lang, setLang, t }` to all components via React context.
- `t(key)` looks up a translation string from `i18n.js` for the current language.
- Supported languages: `en`, `ta` (Tamil), `hi` (Hindi), `es` (Spanish), `zh` (Chinese).
- All UI strings (labels, placeholders, button text, evaluation feedback) are keyed.
- Chemical names and reaction observations are kept in English (as in the real Cambridge papers).

---

## Question paper format

Each paper in `data/questionPaper.js` follows this shape:

```js
{
  id: "p_m24",
  title: "9701/33 February/March 2024",
  subtitle: "Paper 3 Advanced Practical Skills 1",
  time: "2 hours",
  marks: 40,
  faMap: {
    "FA 1": "Na2S2O3",   // maps FA label → chemical ID
    "FA 2": "HCl",
    …
  },
  unknownFAs: ["FA 5", "FA 6", "FA 7", "FA 8"],  // labels hidden from student
  questions: [
    {
      id: "Q1", type: "quantitative",
      title: "Question 1 – …",
      marks: 17,
      context: "…",   // printed above the parts
      parts: [
        { id: "Q1a", label: "(a)", marks: 3,
          instruction: "…",
          hint: "…",           // optional coaching hint
          calculationGuide: "…", // optional formula reminder
          answerKey: "…"        // mark-scheme answer (shown after submit)
        },
        …
      ],
    },
    …
  ],
}
```

---

## Testing

Tests live in `src/__tests__/` and cover the pure-logic modules only (no DOM rendering):

| File | Coverage |
|---|---|
| `reactions.test.js` | `simulateReaction` output for ~40 chemical combinations |
| `evaluation.test.js` | Rubric scoring for all question types, edge cases, grade boundaries |
| `questionPaper.test.js` | Structure, field presence, mark totals, and ID uniqueness for all 23 papers |

Run with:

```bash
npm test            # single run
npm run test:watch  # watch mode
npm run test:ui     # Vitest browser UI
```

---

## Deployment

The app is containerised with a two-stage Dockerfile:

1. **Build stage** — `node:20-alpine` installs dependencies and runs `vite build`.
2. **Serve stage** — `nginx:1.27-alpine` serves the static `dist/` directory.

Render.com injects `$PORT=10000` at runtime; the container uses `envsubst` to inject this into `nginx.conf` before starting. The `render.yaml` blueprint in the repo root configures a free-tier web service.