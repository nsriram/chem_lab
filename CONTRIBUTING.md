# Contributing

Thank you for your interest in contributing to the Cambridge Chemistry Lab Simulator! Contributions of all kinds are welcome — bug fixes, new question papers, additional reaction rules, UI improvements, and translations.

---

## Ways to contribute

| Type | Examples |
|---|---|
| **Question papers** | Add a past paper that isn't in the bank yet |
| **Reaction rules** | Add a missing chemical reaction or improve an observation description |
| **New chemicals** | Add a reagent needed for a specific paper |
| **Bug fixes** | Fix an incorrect reaction observation, scoring error, or UI glitch |
| **Translations** | Improve or add a language in `src/data/i18n.js` |
| **Tests** | Improve coverage for the evaluation engine or reaction rules |
| **Accessibility** | Keyboard navigation, screen reader support, colour contrast |

---

## Getting started

### 1. Fork and clone

```bash
git clone https://github.com/nsriram/chem_lab.git
cd chem_lab
npm install
npm run dev    # http://localhost:5173
```

### 2. Create a branch

```bash
git checkout -b feat/my-feature   # for new features
git checkout -b fix/my-bug        # for bug fixes
```

Use descriptive names: `feat/add-2020-paper`, `fix/bacl2-naoh-reaction`, `i18n/french-translations`.

### 3. Make your changes

See the sections below for guidance on the most common contribution types.

### 4. Test your changes

```bash
npm test           # must pass before opening a PR
npm run build      # must build cleanly
```

### 5. Open a pull request

Push your branch and open a PR against `main`. Fill in the PR description explaining what changed and why.

---

## Adding a question paper

Papers live in `src/data/questionPaper.js`. Each entry in the `QUESTION_PAPERS` array follows the structure documented in [DESIGN.md](DESIGN.md#question-paper-format).

Checklist for a new paper:

- [ ] `id` is unique (e.g. `"p_m20"` for Feb/Mar 2020).
- [ ] `faMap` maps every `"FA N"` label to a chemical ID from `src/data/chemicals.js`.
- [ ] `unknownFAs` lists only the labels the student must identify (not known reagents like indicators).
- [ ] All question `type` values are one of `"quantitative"`, `"energetics"`, or `"qualitative"`.
- [ ] Question and part `marks` values sum correctly.
- [ ] `answerKey` fields do not reveal the identity of unknown FAs in the question `context` text.
- [ ] Update the count in `src/__tests__/questionPaper.test.js` (the `"contains exactly N papers"` test).

---

## Adding a reaction rule

Reaction rules live in `src/engine/reaction-rules.js`. Do **not** edit `reactions.js`.

Append a new entry to the `REACTION_RULES` array in the appropriate group. See [DESIGN.md](DESIGN.md#adding-a-new-reaction) for the full schema.

Tips:

- Check that no existing rule already covers your combination (rules are first-match-wins).
- If your rule should only fire for a specific action (e.g. heating), set `actionFilter: "heat"`.
- Always provide a `blind()` function that omits chemical names — this is used when the FA is unknown to the student.
- Extend a `matches` function rather than adding a duplicate rule when the same chemistry applies to multiple chemical IDs (e.g. both `KI` and `NH4I` supply `I⁻`).
- Add a test case in `src/__tests__/reactions.test.js`.

---

## Adding a new chemical

Chemicals live in `src/data/chemicals.js`. Add a new key to the `CHEMICALS` object:

```js
"MyChemical": {
    label:    "My Chemical (0.10 mol/dm³)",  // shown in the palette
    type:     "solution",                    // "solution" or "solid"
    color:    "#f5f5f0",                     // hex colour for the vessel
    category: "reagent",                     // see categories below
},
```

Categories: `"solution"`, `"acid"`, `"reagent"`, `"indicator"`, `"titrant"`, `"solid"`.

---

## Adding or improving a translation

Translations live in `src/data/i18n.js` as a nested object keyed by language code. To add a string:

1. Add the key to the English (`en`) block first.
2. Add the translated value to every other language block (`ta`, `hi`, `es`, `zh`).
3. If you are only confident in one language, add `// TODO: translate` comments for the others.

To add a new language, add a new top-level key (e.g. `"fr"`) and copy the `en` block as a starting point.

---

## Code style

- Plain JavaScript — no TypeScript.
- React function components only (no class components, no `React.memo`).
- No additional dependencies without prior discussion.
- Keep components under ~200 lines where possible; split into helpers if needed.
- Do not add docstrings or comments to unchanged code.
- Run `npm run lint` before pushing — ESLint is configured with the project's ruleset.

---

## Commit messages

Follow the conventional-commits pattern used in this repo:

```
feat(scope): add something new
fix(scope): correct a bug
test(scope): add or update tests
i18n(scope): translation changes
docs: update documentation
```

Examples: `feat(lab): add CuCO3 thermal decomposition rule`, `fix(evaluation): correct iodometric scoring`.

---

## Reporting bugs

Open an issue and include:

- Which paper and question you were working on.
- What you did (steps to reproduce).
- What you expected to see.
- What actually happened (screenshot or console error helps).

---

## Code of Conduct

Be kind and constructive. This project is aimed at students preparing for real exams — accuracy and clarity matter.