# Cambridge Chemistry Lab Simulator

[![CI](https://github.com/nsriram/chem_lab/actions/workflows/ci.yml/badge.svg)](https://github.com/nsriram/chem_lab/actions/workflows/ci.yml)

An interactive browser-based practical chemistry simulator for Cambridge A-Level 9701/33 (Advanced Practical Skills). Students can perform virtual experiments, record observations, answer questions, and receive automated mark-scheme feedback — all without any physical equipment.

**Live demo:** https://cambridge-chem-lab.onrender.com/

---

## Features

- **20 past-paper questions** spanning Paper 3 sessions from 2014–2025 (rates, titrations, crystallisation, energetics, qualitative analysis)
- **Virtual lab bench** — add chemicals, heat, stir, filter, weigh, measure temperature with realistic simulated reactions and colour changes
- **Measurement precision hints** — live feedback when burette readings aren't to 0.05 cm³, balance to 0.01 g, thermometer to 0.5 °C
- **Data & graphing tab** — record results tables and plot scatter graphs
- **Student answer booklet** — rich-text notes panel mirrors the real exam booklet
- **Automated evaluation** — paper-aware rubric engine scores each question section and provides criterion-level pass/partial/fail feedback
- **Export & print** — download session JSON, action log CSV, notes TXT, or open a formatted print-ready report
- **localStorage persistence** — session state survives page refreshes

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19 + Vite 7 |
| Styling | Plain CSS (no framework) |
| State | Custom hook (`useChemLab`) |
| Testing | Vitest 3 + jsdom |
| Containerisation | Docker (nginx:1.27-alpine) |
| Deployment | Render.com (free tier, Docker runtime) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Local development

```bash
git clone <repo-url>
cd chem_lab
npm install
npm run dev        # http://localhost:5173
```

### Run tests

```bash
npm test           # run once
npm run test:watch # watch mode
npm run test:ui    # Vitest browser UI
```

### Production build

```bash
npm run build      # outputs to dist/
npm run preview    # serve the build locally
```

### Docker

```bash
docker build -t chem-lab .
docker run -p 10000:10000 chem-lab
# open http://localhost:10000
```

---

## Project Structure

```
src/
├── App.jsx                  # Root layout, tab routing
├── hooks/
│   └── useChemLab.js        # All state & action handlers
├── components/
│   ├── LabTab.jsx           # Virtual bench (vessels, chemicals, actions)
│   ├── DataTab.jsx          # Results tables & graphs
│   ├── PaperTab.jsx         # Question paper viewer + answer booklet
│   └── EvaluateTab.jsx      # Mark-scheme feedback + export panel
├── engine/
│   ├── reactions.js         # Simulated chemical reactions
│   └── evaluation.js        # Paper-aware rubric scoring
├── data/
│   ├── questionPaper.js     # 20 Cambridge 9701/33 papers
│   ├── chemicals.js         # Chemical reagent catalogue
│   └── equipment.js         # Lab equipment definitions
└── utils/
    └── export.js            # CSV / JSON / TXT / print helpers
```

---

## Evaluation Engine

`evaluateLog(actionLog, studentNotes, paper)` scores three question types:

| Type | Rubric |
|---|---|
| `quantitative` (rate/clock) | Clock usage, experiment count, distilled water, table, rate calculation, graph, volume precision |
| `quantitative` (titration) | Addition count, indicator, titre values, mean titre, moles, burette precision |
| `quantitative` (crystallisation) | Heating to constant mass, weighing count, water-of-crystallisation, Mr, mass precision |
| `energetics` | Mass, two temperatures, stirring, reagents mixed, q = mcΔT, ΔH, precision |
| `qualitative` | NaOH / BaCl₂ / AgNO₃ / KMnO₄ tests, test diversity, gas tests, observations, ionic equations |

Returns `{ total, maxMarks, grade, sections, feedback }`.

---

## Deployment (Render.com)

The app is containerised with a two-stage Dockerfile:

1. **Build stage** — `node:20-alpine` runs `npm ci && npm run build`
2. **Serve stage** — `nginx:1.27-alpine` serves the static `dist/` directory

Render injects `$PORT=10000` at runtime; the container uses `envsubst` to write this into the nginx config before starting.

To deploy your own instance:

1. Fork the repo and connect it to Render.
2. Set **Runtime: Docker** in the Render service settings.
3. The `render.yaml` manifest is already configured for a free-tier web service.

---

## Running Tests

Tests live in `src/__tests__/` and cover the pure logic modules:

| File | What is tested |
|---|---|
| `export.test.js` | `buildCSV` and `buildNotesTxt` formatting |
| `evaluation.test.js` | Rubric scoring for all five question types |
| `reactions.test.js` | `simulateReaction` for key chemical reactions |
| `questionPaper.test.js` | Structure and integrity of all 20 papers |

```bash
npm test
```
