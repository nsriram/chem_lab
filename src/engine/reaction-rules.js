// Declarative reaction rule registry.
// Rules are evaluated in order — first match wins.
// To add a reaction: append one entry to this array. Do not touch reactions.js.
//
// Rule schema:
//   id           string   — unique label, used for debugging
//   requires     string[] — AND match: all chemical IDs must be present (simple path)
//   matches      fn       — (chemicals, vessel, action) => bool
//                           overrides requires when present; use for OR logic
//   actionFilter string   — optional: rule only fires on this action type
//   produce      fn       — (vessel, action, params) => partial ReactionResult

// ─── Titration endpoint helper ────────────────────────────────────────────────
// Calculates acid and base equivalents (in mmol) present in a vessel so that
// indicator rules can determine the colour at each 1 cm³ addition step.
// Note: mmol = C(mol/dm³) × V(cm³)  because 1 dm³ = 1000 cm³.
const _ACID_CONC  = { HCl: 2.00, H2SO4: 1.00, oxalic_acid: 0.05 };
const _BASE_CONC  = { NaOH: 1.00, Na2CO3: 1.00, NH3_aq: 1.00, NaHCO3: 0.20, NaHCO3_aq: 0.20 };
const _ACID_EQUIV = { H2SO4: 2 };   // diprotic: 2 H⁺ per molecule
const _BASE_EQUIV = { Na2CO3: 2 };  // dibasic:  2 OH⁻ equivalents per molecule

function _titrationBalance(vessel) {
    let acidMmol = 0, baseMmol = 0;
    for (const c of vessel.contents || []) {
        const vol = c.volume || 0;
        if (_ACID_CONC[c.chemical] !== undefined)
            acidMmol += vol * _ACID_CONC[c.chemical] * (_ACID_EQUIV[c.chemical] || 1);
        if (_BASE_CONC[c.chemical] !== undefined)
            baseMmol += vol * _BASE_CONC[c.chemical] * (_BASE_EQUIV[c.chemical] || 1);
    }
    // excess > 0 → base in excess; excess < 0 → acid in excess
    return { acidMmol, baseMmol, excess: baseMmol - acidMmol };
}

// ─── Iodometric titration helper ─────────────────────────────────────────────
// Tracks how much I₂ the oxidant generates (via KI) and how much Na₂S₂O₃ has
// consumed it so far. Used by titration/iodometric for progressive colour changes.
// mmol = C(mol/dm³) × V(cm³)
const _IODO_OXID = {
    KMnO4_acid:   { conc: 0.0175, i2PerMol: 2.5 },  // 2MnO₄⁻ + 10I⁻ → 5I₂
    FA3_oxidiser: { conc: 0.0175, i2PerMol: 2.5 },  // same stoichiometry
    H2O2:         { conc: 0.100,  i2PerMol: 1.0 },  // H₂O₂ + 2I⁻ + 2H⁺ → I₂
    CuSO4:        { conc: 1.000,  i2PerMol: 0.5 },  // 2Cu²⁺ + 4I⁻ → 2CuI + I₂
    FeCl3:        { conc: 0.500,  i2PerMol: 0.5 },  // 2Fe³⁺ + 2I⁻ → 2Fe²⁺ + I₂
    fe3_aq:       { conc: 0.500,  i2PerMol: 0.5 },  // same Fe³⁺ stoichiometry (ammonium iron(III) sulfate)
    I2_solution:  { conc: 0.100,  i2PerMol: 1.0 },  // I₂ itself — direct oxidant; 1 mol I₂ per mol
};
const _S2O3_CONC = 22.00 / 248.2;  // 0.0886 mol/dm³ for Na₂S₂O₃·5H₂O (Mr = 248.2)

function _iodometricBalance(vessel) {
    let i2Mmol = 0, thioMmol = 0;
    for (const c of vessel.contents || []) {
        const vol = c.volume || 0;
        const ox = _IODO_OXID[c.chemical];
        if (ox) i2Mmol += vol * ox.conc * ox.i2PerMol;
        if (c.chemical === 'Na2S2O3_titrant') thioMmol += vol * _S2O3_CONC;
        if (c.chemical === 'Na2S2O3_std')     thioMmol += vol * 0.100;  // 0.100 mol/dm³ standard
    }
    // I₂ + 2Na₂S₂O₃ → 2NaI + Na₂S₄O₆  (1 mol I₂ consumed per 2 mol Na₂S₂O₃)
    const i2Consumed  = thioMmol / 2;
    const i2Remaining = Math.max(0, i2Mmol - i2Consumed);
    const i2Fraction  = i2Mmol > 0 ? (i2Remaining / i2Mmol) : 0;
    return { i2Mmol, thioMmol, i2Remaining, i2Fraction };
}

export const REACTION_RULES = [

    // ── Kinetics ──────────────────────────────────────────────────────────────
    {
        id: "kinetics/thiosulfate-hcl",
        requires: ["Na2S2O3", "HCl"],
        produce(vessel) {
            const contents = vessel.contents || [];
            const thio = contents.find(c => c.chemical === "Na2S2O3");
            const acid = contents.find(c => c.chemical === "HCl");
            const concentration = (thio.volume / (thio.volume + acid.volume)) * 0.10;
            const time = Math.round(200 / concentration + Math.random() * 20 - 10);
            return {
                observation: `Solution turns cloudy/opaque after ~${time}s. Pale yellow sulfur precipitate forms. Faint smell of SO₂.`,
                reactionTime: time,
                newColor: "#f5f0dc",
                precipitate: "S(s) – pale yellow solid",
                hasPrecipitate: true,
                gas: "SO₂ (faint)",
                colorChange: "clear → cloudy/opaque yellow-white",
            };
        },
        blind(vessel) {
            const contents = vessel.contents || [];
            const thio = contents.find(c => c.chemical === "Na2S2O3");
            const acid = contents.find(c => c.chemical === "HCl");
            const concentration = (thio.volume / (thio.volume + acid.volume)) * 0.10;
            const time = Math.round(200 / concentration + Math.random() * 20 - 10);
            return {
                observation: `Solution turns cloudy/opaque after ~${time}s. Pale yellow solid precipitate forms. Faint pungent smell.`,
                reactionTime: time,
                precipitate: "Pale yellow solid precipitate",
                gas: "Pungent gas (faint)",
            };
        },
    },

    // ── Energetics / displacement ──────────────────────────────────────────────
    {
        id: "energetics/cuso4-mg",
        // Mg_powder OR Mg_ribbon — same displacement chemistry
        matches: (chemicals) =>
            chemicals.includes("CuSO4") &&
            (chemicals.includes("Mg_powder") || chemicals.includes("Mg_ribbon")),
        produce(vessel) {
            const contents = vessel.contents || [];
            const cu = contents.find(c => c.chemical === "CuSO4");
            const mg = contents.find(c => c.chemical === "Mg_powder")
                    || contents.find(c => c.chemical === "Mg_ribbon");
            const molesCu = (cu?.volume || 0) * 0.001 * 1.0;
            const molesMg = (mg?.mass || 0) / 24.3;
            const limitingMoles = Math.min(molesCu, molesMg);
            const deltaT = Math.round((limitingMoles * 350000) / (50 * 4.18));
            const maxTemp = 22 + deltaT;
            return {
                observation: `Vigorous reaction. Solution turns from blue to colourless/pale. Red-brown copper metal deposits. Temperature rises to ~${maxTemp}°C (ΔT ≈ ${deltaT}°C).`,
                newColor: "#c8a882",
                precipitate: "Cu(s) – red-brown solid",
                hasPrecipitate: true,
                tempChange: deltaT,
                colorChange: "blue → colourless + red-brown solid",
            };
        },
        blind(vessel) {
            const contents = vessel.contents || [];
            const cu = contents.find(c => c.chemical === "CuSO4");
            const mg = contents.find(c => c.chemical === "Mg_powder")
                    || contents.find(c => c.chemical === "Mg_ribbon");
            const molesCu = (cu?.volume || 0) * 0.001 * 1.0;
            const molesMg = (mg?.mass || 0) / 24.3;
            const limitingMoles = Math.min(molesCu, molesMg);
            const deltaT = Math.round((limitingMoles * 350000) / (50 * 4.18));
            const maxTemp = 22 + deltaT;
            return {
                observation: `Vigorous reaction. Coloured solution becomes pale/colourless. Red-brown solid deposits. Temperature rises to ~${maxTemp}°C (ΔT ≈ ${deltaT}°C).`,
                precipitate: "Red-brown solid",
                colorChange: "coloured solution → pale + red-brown solid",
            };
        },
    },
    {
        id: "energetics/zn-cuso4",
        // Zn (pieces) OR Zn_powder — both displace Cu from CuSO4
        matches: (chemicals) =>
            (chemicals.includes("Zn") || chemicals.includes("Zn_powder")) &&
            chemicals.includes("CuSO4"),
        produce() {
            return {
                observation: "Blue CuSO₄ solution slowly decolourises. Pink/red copper metal deposits on zinc. Less vigorous than Mg displacement. Slight temperature rise.",
                newColor: "#d4b896",
                precipitate: "Cu(s) – pink/red-brown solid",
                hasPrecipitate: true,
                colorChange: "blue → colourless + red-brown Cu deposits",
            };
        },
        blind() {
            return {
                observation: "Coloured solution slowly fades. Pink/red-brown solid deposits on the metal. Slight temperature rise.",
                precipitate: "Pink/red-brown solid",
                colorChange: "coloured solution → pale + pink/red-brown solid deposits",
            };
        },
    },

    // ── Iodometric titration ───────────────────────────────────────────────────
    // MUST precede redox/kmno4-ki and redox/ki-* rules — the volume-aware rule
    // fires first whenever Na₂S₂O₃ titrant is present alongside an oxidant + KI.
    // Colour stages: deep brown → yellow-brown → pale yellow (add starch) →
    //                blue-black (with starch) → colourless ✓ ENDPOINT.
    {
        id: "titration/iodometric",
        matches: (chemicals) =>
            (chemicals.includes("Na2S2O3_titrant") || chemicals.includes("Na2S2O3_std")) &&
            (
                // classic: KI + oxidant → I₂, then titrate with Na₂S₂O₃
                (chemicals.includes("KI") &&
                 (chemicals.includes("KMnO4_acid") || chemicals.includes("FA3_oxidiser") ||
                  chemicals.includes("H2O2") || chemicals.includes("CuSO4") ||
                  chemicals.includes("FeCl3") || chemicals.includes("fe3_aq"))) ||
                // direct: I₂ solution titrated with Na₂S₂O₃ (2022-paper style)
                chemicals.includes("I2_solution")
            ),
        produce(vessel) {
            const { i2Remaining, i2Fraction } = _iodometricBalance(vessel);
            const chems = (vessel.contents || []).map(c => c.chemical);
            const hasStarch = chems.includes("starch");

            if (i2Fraction > 0.4) {
                return {
                    observation: `Deep brown solution — I₂ present (${i2Remaining.toFixed(3)} mmol remaining, ${(i2Fraction*100).toFixed(0)}% of I₂ unconsumed). Continue adding Na₂S₂O₃ from burette.`,
                    newColor: "#6a3a08",
                    colorChange: "deep brown (I₂ in large excess)",
                };
            }
            if (i2Fraction > 0.1) {
                return {
                    observation: `Yellow-brown, fading — I₂ being consumed (${i2Remaining.toFixed(3)} mmol remaining, ${(100*(1-i2Fraction)).toFixed(0)}% consumed). Continue titrating steadily.`,
                    newColor: "#b89020",
                    colorChange: "deep brown → yellow-brown (I₂ fading)",
                };
            }
            if (i2Fraction > 0.01) {
                if (hasStarch) {
                    return {
                        observation: `⚠️ NEAR ENDPOINT — blue-black (starch-iodine complex; ${i2Remaining.toFixed(3)} mmol I₂ remaining). Add Na₂S₂O₃ DROPWISE — one drop at a time — until blue-black just disappears permanently.`,
                        newColor: "#12122a",
                        colorChange: "yellow-brown → blue-black with starch (add dropwise!)",
                    };
                }
                return {
                    observation: `⚠️ NEAR ENDPOINT — pale YELLOW (${i2Remaining.toFixed(3)} mmol I₂ remaining). Add ~10 drops starch indicator NOW for a sharp endpoint, then continue titrating dropwise.`,
                    newColor: "#d8c830",
                    colorChange: "brown → pale yellow (near endpoint — add starch now!)",
                };
            }
            // At/past endpoint
            if (hasStarch) {
                return {
                    observation: `✓ ENDPOINT — blue-black DISAPPEARS → COLOURLESS. All I₂ consumed by Na₂S₂O₃ (I₂ + 2Na₂S₂O₃ → 2NaI + Na₂S₄O₆). Record burette reading.`,
                    newColor: "#f5f5f5",
                    colorChange: "blue-black → colourless ✓ ENDPOINT",
                };
            }
            return {
                observation: `✓ ENDPOINT — solution is pale straw/YELLOW → nearly colourless. All I₂ consumed. Record burette reading. (Tip: for a sharper endpoint add starch when near pale yellow.)`,
                newColor: "#fafae8",
                colorChange: "pale yellow → colourless/straw ✓ ENDPOINT",
            };
        },
        blind(vessel) {
            const { i2Fraction } = _iodometricBalance(vessel);
            const chems = (vessel.contents || []).map(c => c.chemical);
            const hasStarch = chems.includes("starch");
            if (i2Fraction > 0.4)
                return { observation: "Deep brown. Continue adding titrant from burette." };
            if (i2Fraction > 0.1)
                return { observation: "Yellow-brown (fading). Continue titrating." };
            if (i2Fraction > 0.01 && !hasStarch)
                return { observation: "⚠️ Pale yellow. Near endpoint — add starch now, then add dropwise." };
            if (i2Fraction > 0.01 && hasStarch)
                return { observation: "⚠️ Blue-black (starch). Near endpoint — add titrant dropwise." };
            return hasStarch
                ? { observation: "✓ Blue-black → colourless. ENDPOINT. Record burette reading." }
                : { observation: "✓ Pale straw/colourless. ENDPOINT. Record burette reading." };
        },
    },

    // ── Redox (KMnO4 — extended) ───────────────────────────────────────────────
    {
        id: "redox/kmno4-thiosulfate",
        requires: ["KMnO4_acid", "Na2S2O3"],
        produce() {
            return {
                observation: "Purple KMnO₄ decolourised immediately to colourless. S₂O₃²⁻ reduces MnO₄⁻.",
                newColor: "#f5f5f5",
                colorChange: "purple → colourless",
            };
        },
        blind() {
            return {
                observation: "Purple solution decolourised immediately to colourless.",
                colorChange: "purple → colourless",
            };
        },
    },
    {
        id: "redox/kmno4-sulfite",
        requires: ["KMnO4_acid", "Na2SO3"],
        produce() {
            return {
                observation: "Purple KMnO₄ decolourised to colourless. SO₃²⁻ reduces MnO₄⁻.",
                newColor: "#f5f5f5",
                colorChange: "purple → colourless",
            };
        },
        blind() {
            return {
                observation: "Purple solution decolourised to colourless.",
                colorChange: "purple → colourless",
            };
        },
    },
    {
        id: "redox/kmno4-feso4",
        requires: ["KMnO4_acid", "FeSO4"],
        produce() {
            return {
                observation: "Purple KMnO₄ rapidly decolourised. Fe²⁺ oxidised to Fe³⁺ (MnO₄⁻ → Mn²⁺). Solution turns pale yellow-orange from Fe³⁺ ions.",
                newColor: "#d4a060",
                colorChange: "purple → pale yellow-orange (Fe³⁺ formed)",
            };
        },
        blind() {
            return {
                observation: "Purple solution rapidly decolourised. Resulting solution is pale yellow-orange.",
                colorChange: "purple → pale yellow-orange",
            };
        },
    },
    {
        id: "redox/kmno4-h2o2",
        requires: ["KMnO4_acid", "H2O2"],
        produce() {
            return {
                observation: "Purple KMnO₄ rapidly decolourised. H₂O₂ acts as reductant. Effervescence — O₂ gas evolved (relights glowing splint).",
                newColor: "#f5f5f5",
                colorChange: "purple → colourless",
                gas: "O₂ – relights glowing splint",
            };
        },
        blind() {
            return {
                observation: "Purple solution rapidly decolourised. Effervescence — colourless gas evolved (relights glowing splint).",
                gas: "Colourless gas; relights glowing splint",
            };
        },
    },
    {
        id: "redox/kmno4-ki",
        // NH4I also contains I⁻ — same oxidation by KMnO₄
        matches: (chemicals) =>
            chemicals.includes("KMnO4_acid") &&
            (chemicals.includes("KI") || chemicals.includes("NH4I")),
        produce() {
            return {
                observation: "I⁻ oxidised to I₂ by MnO₄⁻. Solution turns deep yellow-brown (I₂). Add starch to confirm — turns blue-black. KMnO₄ purple consumed.",
                newColor: "#6a4a10",
                colorChange: "purple → yellow-brown (I₂ liberated)",
            };
        },
        blind() {
            return {
                observation: "Purple solution fades. Resulting solution turns deep yellow-brown. Add starch → blue-black colour appears.",
                colorChange: "purple → yellow-brown",
            };
        },
    },
    {
        id: "redox/kmno4-oxalic",
        requires: ["KMnO4_acid", "oxalic_acid"],
        produce() {
            return {
                observation: "Purple KMnO₄ decolourised slowly at room temperature, rapidly on warming. CO₂ effervescence. Classic autocatalytic reaction — accelerates as Mn²⁺ builds up.",
                newColor: "#f5f5f5",
                colorChange: "purple → colourless",
                gas: "CO₂",
            };
        },
        blind() {
            return {
                observation: "Purple solution decolourised slowly at room temperature, rapidly on warming. Effervescence of colourless, odourless gas. Reaction rate accelerates on its own.",
                gas: "Colourless, odourless gas",
            };
        },
    },
    {
        id: "redox/ki-h2o2",
        requires: ["KI", "H2O2"],
        produce() {
            return {
                observation: "H₂O₂ oxidises I⁻ to I₂. Solution turns yellow-brown. Add starch solution → turns blue-black, confirming I₂ present.",
                newColor: "#9a7020",
                colorChange: "colourless → yellow-brown (I₂)",
            };
        },
        blind() {
            return {
                observation: "Solution turns yellow-brown. Add starch solution → turns blue-black.",
                colorChange: "colourless → yellow-brown",
            };
        },
    },
    {
        id: "redox/ki-cuso4",
        requires: ["KI", "CuSO4"],
        produce() {
            return {
                observation: "Cu²⁺ oxidises I⁻ to I₂. Cream/buff precipitate of copper(I) iodide (CuI) forms. Solution turns yellow-brown from I₂. Add starch → blue-black.",
                newColor: "#9a8060",
                precipitate: "CuI(s) – cream/buff ppt",
                hasPrecipitate: true,
                colorChange: "blue → yellow-brown (CuI ppt + I₂ in solution)",
            };
        },
        blind() {
            return {
                observation: "Cream/buff precipitate forms. Solution turns yellow-brown. Add starch → blue-black colour appears.",
                precipitate: "Cream/buff solid precipitate",
                colorChange: "coloured solution → cream ppt + yellow-brown solution",
            };
        },
    },

    // ── Fe³⁺ oxidises I⁻ (FeCl3 + KI) ───────────────────────────────────────
    // MUST precede fecl3-naoh so the I⁻ test fires before a plain NaOH test.
    {
        id: "redox/fecl3-ki",
        matches: (chemicals) => chemicals.includes("KI") && (chemicals.includes("FeCl3") || chemicals.includes("fe3_aq")),
        produce() {
            return {
                observation: "Fe³⁺ oxidises I⁻ to I₂. Solution turns deep yellow-brown (I₂ formed). Fe³⁺ reduced to Fe²⁺ (pale green). Add starch → blue-black confirms I₂. Key test: Fe³⁺ oxidises I⁻ but Fe²⁺ does NOT — use to distinguish FeSO₄ from FeCl₃.",
                newColor: "#8a6010",
                colorChange: "orange-brown → deep yellow-brown (I₂ liberated; Fe³⁺ → Fe²⁺)",
            };
        },
        blind() {
            return {
                observation: "Solution turns deep yellow-brown. Add starch → blue-black colour confirms presence of an oxidising species in the unknown. Fading of original colour.",
                colorChange: "coloured solution → deep yellow-brown; starch → blue-black",
            };
        },
    },

    // ── Fe³⁺ cation tests (FeCl3) ─────────────────────────────────────────────
    // Must precede naoh-cuso4 and nh3-cuso4 rules.
    {
        id: "qualitative/fecl3-naoh",
        matches: (chemicals) =>
            chemicals.includes("NaOH") && (chemicals.includes("FeCl3") || chemicals.includes("fe3_aq")),
        produce(vessel) {
            const isAmmoniumIron = (vessel.contents || []).some(c => c.chemical === "fe3_aq");
            return {
                observation: isAmmoniumIron
                    ? "Rust-brown/red-brown precipitate of iron(III) hydroxide Fe(OH)₃ forms immediately. Insoluble in excess NaOH. On warming, pungent ammonia gas (NH₃) evolves — turns damp red litmus paper blue. Confirms both Fe³⁺ (rust-brown ppt) and NH₄⁺ (NH₃ on warming). Does NOT dissolve in excess."
                    : "Rust-brown/red-brown precipitate of iron(III) hydroxide Fe(OH)₃ forms immediately. Insoluble in excess NaOH. Confirms Fe³⁺. Does NOT dissolve in excess (distinction from Al³⁺).",
                newColor: "#b05a10",
                precipitate: "Fe(OH)₃(s) – rust-brown ppt, insoluble in excess NaOH",
                hasPrecipitate: true,
                colorChange: "orange-brown → rust-brown precipitate (Fe(OH)₃)",
                ...(isAmmoniumIron && { gas: "NH₃ – pungent; turns damp red litmus blue (on warming)" }),
            };
        },
        blind() {
            return {
                observation: "Rust-brown/red-brown precipitate forms immediately. Insoluble in excess NaOH. Does NOT dissolve in excess. On warming, pungent gas evolved — turns damp red litmus blue.",
                precipitate: "Rust-brown precipitate, insoluble in excess NaOH",
                colorChange: "→ rust-brown precipitate",
            };
        },
    },
    {
        id: "qualitative/fecl3-nh3",
        matches: (chemicals) =>
            chemicals.includes("NH3_aq") && (chemicals.includes("FeCl3") || chemicals.includes("fe3_aq")),
        produce() {
            return {
                observation: "Rust-brown precipitate of Fe(OH)₃ forms. Insoluble in excess NH₃(aq) — key distinction from Cu²⁺ (which dissolves in excess NH₃ to form deep blue complex).",
                newColor: "#b05a10",
                precipitate: "Fe(OH)₃(s) – rust-brown ppt, insoluble in excess NH₃",
                hasPrecipitate: true,
                colorChange: "orange-brown → rust-brown precipitate (Fe(OH)₃)",
            };
        },
        blind() {
            return {
                observation: "Rust-brown precipitate forms. Insoluble in excess NH₃(aq).",
                precipitate: "Rust-brown precipitate, insoluble in excess NH₃",
                colorChange: "→ rust-brown precipitate",
            };
        },
    },

    // ── NH4⁺ cation test (NH4Cl) ──────────────────────────────────────────────
    {
        id: "qualitative/nh4cl-naoh-heat",
        requires: ["NH4Cl", "NaOH"],
        actionFilter: "heat",
        produce() {
            return {
                observation: "On warming with NaOH: pungent smell of ammonia (NH₃). Damp red litmus paper held in vapour turns blue. NH₄⁺ + OH⁻ → NH₃(g) + H₂O. Confirms ammonium ion NH₄⁺.",
                gas: "NH₃ – pungent gas; turns damp red litmus blue",
                colorChange: "no visible change in solution (gas evolved)",
            };
        },
        blind() {
            return {
                observation: "On warming: pungent smell. Damp red litmus paper held in vapour turns blue. No visible change to solution.",
                gas: "Pungent gas; turns damp red litmus blue",
                colorChange: "no visible change in solution (gas evolved)",
            };
        },
    },
    {
        id: "qualitative/nh4cl-naoh",
        requires: ["NH4Cl", "NaOH"],
        produce() {
            return {
                observation: "No precipitate at room temperature. On warming, pungent ammonia gas evolved — turns damp red litmus blue. Confirms NH₄⁺. No colour change to solution.",
                colorChange: "no visible change (NH₃ gas on warming)",
            };
        },
        blind() {
            return {
                observation: "No precipitate at room temperature. On warming, pungent gas evolved — turns damp red litmus blue. No colour change to solution.",
                colorChange: "no visible change (pungent gas on warming)",
            };
        },
    },

    // ── Ca²⁺ tests (CaCl2) ────────────────────────────────────────────────────
    {
        id: "qualitative/cacl2-naoh",
        requires: ["CaCl2", "NaOH"],
        produce() {
            return {
                observation: "Slight white precipitate of Ca(OH)₂ (lime) forms — may appear milky rather than a distinct ppt. Ca(OH)₂ is slightly soluble so precipitate dissolves partially. Insoluble in excess NaOH. Confirms Ca²⁺.",
                newColor: "#f0f0ee",
                precipitate: "Ca(OH)₂(s) – faint white milky ppt (slightly soluble)",
                hasPrecipitate: true,
                colorChange: "colourless → faint milky white (Ca(OH)₂)",
            };
        },
        blind() {
            return {
                observation: "Slight white precipitate forms — may appear milky rather than a distinct ppt. Slightly soluble so precipitate may partially dissolve. Insoluble in excess NaOH.",
                precipitate: "Faint white milky precipitate (slightly soluble)",
                colorChange: "colourless → faint milky white",
            };
        },
    },
    {
        id: "qualitative/cacl2-na2co3",
        requires: ["CaCl2", "Na2CO3"],
        produce() {
            return {
                observation: "White precipitate of calcium carbonate (CaCO₃) forms immediately. Dissolves with effervescence in dilute hydrochloric acid. Ca²⁺ confirmed.",
                newColor: "#f0f0f0",
                precipitate: "CaCO₃(s) – white ppt; dissolves in dilute HCl with CO₂ effervescence",
                hasPrecipitate: true,
                colorChange: "colourless → milky white (CaCO₃)",
            };
        },
        blind() {
            return {
                observation: "White precipitate forms immediately. Dissolves with effervescence in dilute hydrochloric acid.",
                precipitate: "White precipitate; dissolves in dilute HCl with effervescence",
                colorChange: "colourless → white precipitate",
            };
        },
    },

    // ── Cu₂O + acid ───────────────────────────────────────────────────────────
    {
        id: "qualitative/cu2o-h2so4",
        matches: (chemicals) =>
            chemicals.includes("Cu2O") &&
            (chemicals.includes("H2SO4") || chemicals.includes("HCl")),
        produce() {
            return {
                observation: "Cu₂O dissolves in warm acid. Disproportionation: Cu⁺ → Cu⁰ + Cu²⁺. Residue: red-brown copper metal. Filtrate: pale blue solution (CuSO₄/CuCl₂, Cu²⁺ ions). Filter to separate. Filtrate tests positive with NaOH (pale blue Cu(OH)₂ ppt).",
                newColor: "#b3d9ff",
                precipitate: "Cu(s) – red-brown metallic residue from disproportionation",
                hasPrecipitate: true,
                colorChange: "red solid → red-brown Cu residue + pale blue Cu²⁺ filtrate",
            };
        },
        blind() {
            return {
                observation: "Solid dissolves in warm acid. Residue: red-brown metal. Filtrate: pale blue solution. Filter to separate. Filtrate tests positive with NaOH (pale blue precipitate).",
                precipitate: "Red-brown solid metallic residue",
                colorChange: "solid → red-brown residue + pale blue filtrate",
            };
        },
    },

    // ── NO₂⁻ redox ────────────────────────────────────────────────────────────
    {
        id: "redox/kmno4-kbr",
        requires: ["KMnO4_acid", "KBr"],
        produce() {
            return {
                observation: "Purple KMnO₄ slowly decolourises. Br⁻ oxidised to Br₂. Solution turns orange-brown (Br₂). Less rapid than with I⁻ — reducing power: I⁻ > Br⁻ > Cl⁻. Add organic solvent (e.g. cyclohexane) → orange-brown organic layer confirms Br₂. Confirms Br⁻.",
                newColor: "#c87820",
                colorChange: "purple → orange-brown (Br₂ liberated; Br⁻ confirmed)",
            };
        },
        blind() {
            return {
                observation: "Purple solution slowly decolourises. Solution turns orange-brown. If organic solvent added → orange-brown organic layer forms.",
                colorChange: "purple → orange-brown",
            };
        },
    },
    {
        id: "redox/kmno4-nano2",
        requires: ["KMnO4_acid", "NaNO2"],
        produce() {
            return {
                observation: "Purple KMnO₄ rapidly decolourised. NO₂⁻ is oxidised to NO₃⁻. MnO₄⁻ reduced to Mn²⁺. Confirms reducing nitrite (NO₂⁻) — not shown by nitrate (NO₃⁻).",
                newColor: "#f5f5f5",
                colorChange: "purple → colourless (NO₂⁻ reduces KMnO₄; NO₃⁻ does not)",
            };
        },
        blind() {
            return {
                observation: "Purple solution rapidly decolourised.",
                colorChange: "purple → colourless",
            };
        },
    },

    // ── Silver nitrate tests ───────────────────────────────────────────────────
    // Must precede BaCl2 rules because BaCl2 contains Cl⁻ (would precipitate AgCl).
    {
        id: "qualitative/agno3-chloride",
        // Cl⁻ sources: HCl, NaCl, BaCl2, FeCl3, NH4Cl, CaCl2
        matches: (chemicals) =>
            chemicals.includes("AgNO3") &&
            (chemicals.includes("HCl") || chemicals.includes("NaCl") ||
             chemicals.includes("BaCl2") || chemicals.includes("FeCl3") ||
             chemicals.includes("NH4Cl") || chemicals.includes("CaCl2")),
        produce() {
            return {
                observation: "Curdy white precipitate of silver chloride (AgCl) forms immediately. Turns grey-purple on exposure to sunlight. Dissolves readily in dilute and concentrated NH₃(aq). Halide confirmed as Cl⁻.",
                newColor: "#f0f0f0",
                precipitate: "AgCl(s) – curdy white ppt; soluble in dil. NH₃(aq)",
                hasPrecipitate: true,
                colorChange: "colourless → white curdy (AgCl)",
            };
        },
        blind() {
            return {
                observation: "Curdy white precipitate forms immediately. Turns grey-purple on exposure to sunlight. Dissolves readily in dilute and concentrated NH₃(aq).",
                precipitate: "Curdy white precipitate; soluble in dilute NH₃(aq)",
                colorChange: "colourless → white curdy precipitate",
            };
        },
    },
    {
        id: "qualitative/agno3-fe3aq",
        // fe3_aq contains SO₄²⁻ but no Cl⁻/Br⁻/I⁻ — no AgX halide precipitate
        matches: (chemicals) =>
            chemicals.includes("AgNO3") && chemicals.includes("fe3_aq"),
        produce() {
            return {
                observation: "No curdy white precipitate of AgCl forms. Confirms absence of Cl⁻, Br⁻ and I⁻. Any slight turbidity (Ag₂SO₄, partially soluble) dissolves on addition of NH₃(aq). The AgNO₃ test is negative for halides.",
                newColor: "#c46008",
                colorChange: "orange-brown → no significant change (no halide precipitate)",
            };
        },
        blind() {
            return {
                observation: "No curdy precipitate forms with AgNO₃. Any slight turbidity dissolves on adding NH₃(aq). Confirms no Cl⁻, Br⁻ or I⁻ present.",
                colorChange: "no significant change (no halide precipitate)",
            };
        },
    },
    {
        id: "qualitative/agno3-bromide",
        requires: ["AgNO3", "KBr"],
        produce() {
            return {
                observation: "Cream/pale cream precipitate of silver bromide (AgBr) forms immediately. Insoluble in dilute NH₃; dissolves only in concentrated NH₃(aq). Halide confirmed as Br⁻.",
                newColor: "#fffae0",
                precipitate: "AgBr(s) – cream ppt; insoluble in dil. NH₃; dissolves in conc. NH₃",
                hasPrecipitate: true,
                colorChange: "colourless → cream (AgBr)",
            };
        },
        blind() {
            return {
                observation: "Cream/pale cream precipitate forms immediately. Insoluble in dilute NH₃; dissolves only in concentrated NH₃(aq).",
                precipitate: "Cream precipitate; insoluble in dilute NH₃; dissolves in conc. NH₃",
                colorChange: "colourless → cream precipitate",
            };
        },
    },
    {
        id: "qualitative/agno3-iodide",
        // NH4I also gives AgI pale yellow ppt insoluble in NH₃
        matches: (chemicals) =>
            chemicals.includes("AgNO3") &&
            (chemicals.includes("KI") || chemicals.includes("NH4I")),
        produce() {
            return {
                observation: "Pale yellow precipitate of silver iodide (AgI) forms immediately. Insoluble in both dilute and concentrated NH₃(aq). Halide confirmed as I⁻.",
                newColor: "#ffffa0",
                precipitate: "AgI(s) – pale yellow ppt; insoluble in NH₃ (any concentration)",
                hasPrecipitate: true,
                colorChange: "colourless → pale yellow (AgI)",
            };
        },
        blind() {
            return {
                observation: "Pale yellow precipitate forms immediately. Insoluble in both dilute and concentrated NH₃(aq).",
                precipitate: "Pale yellow precipitate; insoluble in NH₃ (any concentration)",
                colorChange: "colourless → pale yellow precipitate",
            };
        },
    },
    {
        id: "qualitative/agno3-sulfate",
        requires: ["AgNO3", "H2SO4"],
        produce() {
            return {
                observation: "White/off-white precipitate of silver sulfate (Ag₂SO₄) — less dense/curdy than AgCl. Slightly soluble in water. Soluble in excess dilute H₂SO₄.",
                newColor: "#f8f8f0",
                precipitate: "Ag₂SO₄(s) – white ppt (slightly soluble)",
                hasPrecipitate: true,
            };
        },
        blind() {
            return {
                observation: "White/off-white precipitate forms — less dense/curdy than some silver precipitates. Slightly soluble in water. Soluble in excess dilute acid.",
                precipitate: "White precipitate (slightly soluble)",
            };
        },
    },
    {
        id: "qualitative/agno3-carbonate",
        requires: ["AgNO3", "Na2CO3"],
        produce() {
            return {
                observation: "Pale yellow/cream precipitate of silver carbonate (Ag₂CO₃) forms. Soluble in dilute nitric acid.",
                newColor: "#fffacc",
                precipitate: "Ag₂CO₃(s) – pale yellow ppt; soluble in dil. HNO₃",
                hasPrecipitate: true,
                colorChange: "colourless → pale yellow (Ag₂CO₃)",
            };
        },
        blind() {
            return {
                observation: "Pale yellow/cream precipitate forms. Soluble in dilute nitric acid.",
                precipitate: "Pale yellow precipitate; soluble in dilute HNO₃",
                colorChange: "colourless → pale yellow precipitate",
            };
        },
    },
    {
        id: "qualitative/agno3-sulfite",
        requires: ["AgNO3", "Na2SO3"],
        produce() {
            return {
                observation: "White precipitate of silver sulfite (Ag₂SO₃) forms. Darkens to brown/black on standing as Ag₂S forms.",
                newColor: "#c0b8a8",
                precipitate: "Ag₂SO₃(s) – white ppt; darkens to Ag₂S on standing",
                hasPrecipitate: true,
            };
        },
        blind() {
            return {
                observation: "White precipitate forms. Darkens to brown/black on standing.",
                precipitate: "White precipitate; darkens to brown/black on standing",
            };
        },
    },
    {
        id: "qualitative/agno3-thiosulfate",
        requires: ["AgNO3", "Na2S2O3"],
        produce() {
            return {
                observation: "White precipitate of Ag₂S₂O₃ forms immediately. Rapidly turns yellow then dark brown-black as Ag₂S forms — the basis of photographic fixing chemistry.",
                newColor: "#5a3a20",
                precipitate: "Ag₂S₂O₃ → Ag₂S – white → brown-black ppt",
                hasPrecipitate: true,
                colorChange: "white → yellow → dark brown-black (Ag₂S)",
            };
        },
        blind() {
            return {
                observation: "White precipitate forms immediately. Rapidly turns yellow then dark brown-black on standing.",
                precipitate: "White → brown-black precipitate (darkens rapidly)",
                colorChange: "white → yellow → dark brown-black",
            };
        },
    },
    {
        id: "qualitative/agno3-naoh",
        requires: ["AgNO3", "NaOH"],
        produce() {
            return {
                observation: "Dark brown precipitate of silver oxide (Ag₂O) forms. (AgOH is unstable and rapidly dehydrates to Ag₂O.) Soluble in excess NH₃(aq).",
                newColor: "#6b4f3a",
                precipitate: "Ag₂O(s) – dark brown ppt",
                hasPrecipitate: true,
                colorChange: "colourless → dark brown (Ag₂O)",
            };
        },
        blind() {
            return {
                observation: "Dark brown precipitate forms. Soluble in excess NH₃(aq).",
                precipitate: "Dark brown precipitate",
                colorChange: "colourless → dark brown precipitate",
            };
        },
    },
    {
        id: "qualitative/agno3-nh3",
        requires: ["AgNO3", "NH3_aq"],
        produce() {
            return {
                observation: "Pale brown precipitate (Ag₂O) forms with small amount of NH₃, then dissolves in excess NH₃ giving colourless diamminesilver(I) complex [Ag(NH₃)₂]⁺ — Tollens' reagent. No persistent precipitate in excess.",
                newColor: "#f5f5f5",
                colorChange: "colourless → pale brown → colourless [Ag(NH₃)₂]⁺ (Tollens')",
            };
        },
        blind() {
            return {
                observation: "Pale brown precipitate forms with small amount of reagent, then dissolves in excess giving a colourless solution. No persistent precipitate in excess.",
                colorChange: "colourless → pale brown → colourless in excess",
            };
        },
    },

    // ── Na2CO3 + FeCl3 (hydrolysis — ppt + CO2) ──────────────────────────────
    // Carbonate does NOT precipitate iron carbonate: Fe³⁺ hydrolyses preferentially.
    // MUST be placed before acid-carbonate and bacl2-carbonate rules.
    {
        id: "qualitative/na2co3-fecl3",
        matches: (chemicals) =>
            chemicals.includes("Na2CO3") && (chemicals.includes("FeCl3") || chemicals.includes("fe3_aq")),
        produce() {
            return {
                observation: "Rust-brown/red-brown precipitate forms immediately. CO₂ effervescence. Fe³⁺ is hydrolysed by CO₃²⁻ to give Fe(OH)₃(s) — not FeCO₃. 2FeCl₃ + 3Na₂CO₃ + 3H₂O → 2Fe(OH)₃↓ + 3CO₂↑ + 6NaCl. The brown ppt distinguishes Fe³⁺ from Ca²⁺ (white ppt) and Cu²⁺ (blue-green ppt).",
                newColor: "#b05a10",
                precipitate: "Fe(OH)₃(s) – rust-brown ppt (hydrolysis, not FeCO₃)",
                hasPrecipitate: true,
                gas: "CO₂ (effervescence)",
                colorChange: "orange-brown → rust-brown precipitate + effervescence",
            };
        },
        blind() {
            return {
                observation: "Rust-brown precipitate forms immediately with effervescence. CO₂ gas evolved.",
                precipitate: "Rust-brown precipitate",
                gas: "Effervescence (CO₂)",
                colorChange: "coloured solution → rust-brown precipitate + effervescence",
            };
        },
    },

    // ── NaNO2 + acid → brown fumes ────────────────────────────────────────────
    {
        id: "qualitative/nano2-acid",
        matches: (chemicals) =>
            chemicals.includes("NaNO2") &&
            (chemicals.includes("HCl") || chemicals.includes("H2SO4")),
        produce() {
            return {
                observation: "Brown/reddish-brown fumes of NO₂ evolved. Pale blue/colourless NO also formed. Solution turns pale blue then colourless. 3HNO₂ → HNO₃ + 2NO↑ + H₂O (disproportionation). Acidified solution is unstable. Dangerous — fumes are toxic (hood required).",
                gas: "NO₂ (brown fumes) + NO (colourless); toxic",
                colorChange: "colourless → pale blue → colourless (with brown fumes above solution)",
            };
        },
        blind() {
            return {
                observation: "Brown fumes evolved on adding acid. Solution becomes unstable and colourless. Fumes are toxic.",
                gas: "Brown fumes; toxic",
                colorChange: "colourless (brown fumes above solution)",
            };
        },
    },

    // ── Acid + anion → gas evolution ──────────────────────────────────────────
    // Before BaCl2 rules: acid decomposes carbonates/sulfites before Ba²⁺ can precipitate them.
    {
        id: "qualitative/acid-carbonate",
        matches: (chemicals) =>
            chemicals.includes("Na2CO3") &&
            (chemicals.includes("HCl") || chemicals.includes("H2SO4")),
        produce() {
            return {
                observation: "Vigorous effervescence. Colourless, odourless CO₂ gas evolved. Turns limewater milky white. Carbonate confirmed: CO₃²⁻ + 2H⁺ → H₂O + CO₂.",
                gas: "CO₂ – turns limewater milky",
                colorChange: "effervescence (CO₂)",
            };
        },
        blind() {
            return {
                observation: "Vigorous effervescence. Colourless, odourless gas evolved. Turns limewater milky white.",
                gas: "Colourless, odourless gas; turns limewater milky",
                colorChange: "effervescence",
            };
        },
    },
    {
        id: "qualitative/acid-sulfite",
        matches: (chemicals) =>
            chemicals.includes("Na2SO3") &&
            (chemicals.includes("HCl") || chemicals.includes("H2SO4")),
        produce() {
            return {
                observation: "Effervescence of pungent/choking sulfur dioxide (SO₂). Turns damp red litmus blue then bleaches it. Decolourises acidified KMnO₄ solution. SO₃²⁻ + 2H⁺ → H₂O + SO₂.",
                gas: "SO₂ – pungent choking gas; turns damp litmus red then bleaches",
                colorChange: "effervescence (SO₂)",
            };
        },
        blind() {
            return {
                observation: "Effervescence of pungent/choking gas. Turns damp litmus paper then bleaches it. Decolourises acidified KMnO₄ solution.",
                gas: "Pungent, choking gas; turns damp litmus paper then bleaches",
                colorChange: "effervescence (pungent gas)",
            };
        },
    },

    // ── BaCl2 precipitation tests ──────────────────────────────────────────────
    {
        id: "qualitative/bacl2-thiosulfate",
        requires: ["BaCl2", "Na2S2O3"],
        produce() {
            return {
                observation: "No precipitate observed immediately. On standing with H⁺, off-white/pale yellow precipitate forms slowly.",
                precipitate: "off-white/pale yellow ppt slowly",
                hasPrecipitate: true,
            };
        },
        // Observation already describes only physical phenomena — no blind needed.
    },
    {
        id: "qualitative/bacl2-sulfate",
        // SO4²⁻ sources: H2SO4, CuSO4, FeSO4, fe3_aq, AlNH4SO4_aq (alum)
        matches: (chemicals) =>
            chemicals.includes("BaCl2") &&
            (chemicals.includes("H2SO4") || chemicals.includes("CuSO4") ||
             chemicals.includes("FeSO4") || chemicals.includes("fe3_aq") ||
             chemicals.includes("AlNH4SO4_aq")),
        produce() {
            return {
                observation: "White precipitate of barium sulfate (BaSO₄) forms immediately. Insoluble in excess dilute HCl. Sulfate ion confirmed.",
                newColor: "#f8f8f8",
                precipitate: "BaSO₄(s) – white ppt, insoluble in dilute HCl",
                hasPrecipitate: true,
            };
        },
        blind() {
            return {
                observation: "White precipitate forms immediately. Insoluble in excess dilute HCl.",
                precipitate: "White precipitate, insoluble in dilute HCl",
            };
        },
    },
    {
        id: "qualitative/bacl2-sulfite",
        requires: ["BaCl2", "Na2SO3"],
        produce() {
            return {
                observation: "White precipitate of barium sulfite (BaSO₃) forms. Soluble in excess dilute strong acid — distinguishes SO₃²⁻ from SO₄²⁻.",
                newColor: "#f5f5f5",
                precipitate: "BaSO₃(s) – white ppt, soluble in dilute HCl",
                hasPrecipitate: true,
            };
        },
        blind() {
            return {
                observation: "White precipitate forms. Soluble in excess dilute strong acid.",
                precipitate: "White precipitate, soluble in dilute HCl",
            };
        },
    },
    {
        id: "qualitative/bacl2-carbonate",
        requires: ["BaCl2", "Na2CO3"],
        produce() {
            return {
                observation: "White precipitate of barium carbonate (BaCO₃) forms. Soluble in dilute hydrochloric acid with effervescence — distinguishes CO₃²⁻ from SO₄²⁻ (which is insoluble in HCl).",
                newColor: "#f8f8f8",
                precipitate: "BaCO₃(s) – white ppt, soluble in dilute HCl (with CO₂)",
                hasPrecipitate: true,
            };
        },
        blind() {
            return {
                observation: "White precipitate forms. Soluble in dilute hydrochloric acid with effervescence.",
                precipitate: "White precipitate, soluble in dilute HCl (with effervescence)",
            };
        },
    },

    // ── NaOH cation tests ──────────────────────────────────────────────────────
    {
        id: "qualitative/naoh-cuso4",
        requires: ["NaOH", "CuSO4"],
        produce() {
            return {
                observation: "Pale blue precipitate of copper(II) hydroxide Cu(OH)₂ forms. Insoluble in excess NaOH.",
                newColor: "#b8d4e8",
                precipitate: "Cu(OH)₂(s) – pale blue ppt, insoluble in excess NaOH",
                hasPrecipitate: true,
            };
        },
        blind() {
            return {
                observation: "Pale blue precipitate forms. Insoluble in excess NaOH.",
                precipitate: "Pale blue precipitate, insoluble in excess NaOH",
            };
        },
    },
    {
        id: "qualitative/naoh-feso4",
        requires: ["NaOH", "FeSO4"],
        produce() {
            return {
                observation: "Dirty green/dark green precipitate of iron(II) hydroxide Fe(OH)₂ forms. Insoluble in excess NaOH. Darkens to rusty red-brown on standing (air oxidation: Fe(OH)₂ → Fe(OH)₃).",
                newColor: "#6a8a5a",
                precipitate: "Fe(OH)₂(s) – dirty green ppt (→ rust-brown on standing in air)",
                hasPrecipitate: true,
                colorChange: "pale green → dirty green ppt (→ rust-brown on air exposure)",
            };
        },
        blind() {
            return {
                observation: "Dirty green/dark green precipitate forms. Insoluble in excess NaOH. Darkens to rusty red-brown on standing in air.",
                precipitate: "Dirty green precipitate (→ rust-brown on standing in air)",
                colorChange: "pale green → dirty green precipitate",
            };
        },
    },
    // ── Acid-base indicator endpoint rules ────────────────────────────────────
    // MUST precede naoh-neutralise (first match wins).
    // Fire whenever the indicator is in the vessel alongside any acid or base.
    // The produce() function calculates the current acid/base balance and returns
    // the correct colour + observation at each 1 cm³ addition step.
    {
        id: "titration/phenolphthalein",
        matches: (chemicals) =>
            chemicals.includes("phenolphthalein") &&
            (chemicals.includes("HCl") || chemicals.includes("H2SO4") ||
             chemicals.includes("NaOH") || chemicals.includes("Na2CO3") ||
             chemicals.includes("NH3_aq")),
        produce(vessel) {
            const { acidMmol, baseMmol, excess } = _titrationBalance(vessel);
            const contents = vessel.contents || [];
            const hasCarbonate = contents.some(c => c.chemical === "Na2CO3");
            const co2Note = hasCarbonate ? " (CO₂ effervescence may be observed as HCl reacts with Na₂CO₃)" : "";

            // Only indicator + acid, no base yet
            if (baseMmol === 0 && acidMmol > 0) {
                return {
                    observation: `Phenolphthalein indicator added. Solution is COLOURLESS in acidic conditions (pH < 8.2).${co2Note} Add alkali from burette to begin titration.`,
                    newColor: "#fff0f8",
                    colorChange: "colourless (acidic, pH < 8.2)",
                };
            }
            // Only indicator + base, no acid yet
            if (acidMmol === 0 && baseMmol > 0) {
                return {
                    observation: "Phenolphthalein indicator in alkaline solution: permanent PINK. No acid present. Add acid to begin titration.",
                    newColor: "#ffb0d0",
                    colorChange: "pink (alkaline, pH > 8.2)",
                };
            }
            // Both acid and base present — calculate balance
            if (excess < -2.0) {
                return {
                    observation: `Acid in large excess (acid: ${acidMmol.toFixed(1)} mmol, base: ${baseMmol.toFixed(1)} mmol). Phenolphthalein COLOURLESS. Continue adding alkali from burette.${co2Note}`,
                    newColor: "#fff0f8",
                    colorChange: "colourless (still acidic)",
                };
            }
            if (excess < 0) {
                return {
                    observation: `⚠️ NEAR ENDPOINT — acid excess only ${Math.abs(excess).toFixed(1)} mmol. Faint pink appears then fades on swirling. Add alkali DROPWISE now.${co2Note}`,
                    newColor: "#ffe0f0",
                    colorChange: "colourless → faint pink that fades (add dropwise!)",
                };
            }
            if (excess <= 1.0) {
                return {
                    observation: `✓ ENDPOINT REACHED — pale permanent PINK. Base excess only ${excess.toFixed(1)} mmol (≈ half-drop equivalence). Record burette reading now.`,
                    newColor: "#ffb0d0",
                    colorChange: "colourless → permanent pale pink ✓ ENDPOINT",
                };
            }
            return {
                observation: `Over-titrated — ${excess.toFixed(1)} mmol excess alkali. Phenolphthalein DEEP PINK/MAGENTA. Endpoint was already passed. Repeat titration.`,
                newColor: "#e060a0",
                colorChange: "deep pink/magenta (over-titrated — excess alkali)",
            };
        },
        blind(vessel) {
            const { acidMmol, baseMmol, excess } = _titrationBalance(vessel);
            if (baseMmol === 0 && acidMmol > 0)
                return { observation: "Indicator added. Solution colourless. Add alkali from burette." };
            if (acidMmol === 0 && baseMmol > 0)
                return { observation: "Indicator in alkaline solution: permanent pink. No acid present." };
            if (excess < -2.0)
                return { observation: "Colourless. Still acidic. Continue adding alkali." };
            if (excess < 0)
                return { observation: "⚠️ Faint pink appears then fades. NEAR ENDPOINT — add dropwise." };
            if (excess <= 1.0)
                return { observation: "✓ Pale permanent PINK — ENDPOINT reached. Record burette reading." };
            return { observation: "Deep pink/magenta — over-titrated. Repeat with fresh solution." };
        },
    },
    {
        id: "titration/methyl-orange",
        matches: (chemicals) =>
            chemicals.includes("methyl_orange") &&
            (chemicals.includes("HCl") || chemicals.includes("H2SO4") ||
             chemicals.includes("NaOH") || chemicals.includes("Na2CO3") ||
             chemicals.includes("NH3_aq")),
        produce(vessel) {
            const { acidMmol, baseMmol, excess } = _titrationBalance(vessel);
            const contents = vessel.contents || [];
            const hasCarbonate = contents.some(c => c.chemical === "Na2CO3");
            const co2Note = hasCarbonate ? " CO₂ effervescence occurs as HCl reacts with Na₂CO₃ — this is normal." : "";

            if (baseMmol === 0 && acidMmol > 0) {
                return {
                    observation: `Methyl orange indicator added. Solution is RED in acidic conditions (pH < 3.1).${co2Note} Add alkali from burette to begin titration. Endpoint colour = ORANGE (not yellow).`,
                    newColor: "#cc2200",
                    colorChange: "red (strongly acidic, pH < 3.1)",
                };
            }
            if (acidMmol === 0 && baseMmol > 0) {
                return {
                    observation: "Methyl orange in alkaline solution: YELLOW (pH > 4.4). Add acid to begin titration.",
                    newColor: "#ddaa00",
                    colorChange: "yellow (alkaline, pH > 4.4)",
                };
            }
            if (excess < -2.0) {
                return {
                    observation: `Acid in large excess (acid: ${acidMmol.toFixed(1)} mmol, base: ${baseMmol.toFixed(1)} mmol). Methyl orange RED. Continue adding alkali.${co2Note}`,
                    newColor: "#cc2200",
                    colorChange: "red (strongly acidic)",
                };
            }
            if (excess < 0) {
                return {
                    observation: `⚠️ NEAR ENDPOINT — turning from RED to ORANGE. Acid excess only ${Math.abs(excess).toFixed(1)} mmol. Add alkali DROPWISE. Endpoint is ORANGE (permanent), not yellow.${co2Note}`,
                    newColor: "#dd6600",
                    colorChange: "red → orange (near endpoint — add dropwise!)",
                };
            }
            if (excess <= 1.0) {
                return {
                    observation: `✓ ENDPOINT REACHED — solution is ORANGE (pH ≈ 4.0). Base excess ${excess.toFixed(1)} mmol. Record burette reading. Note: methyl orange endpoint for strong acid/Na₂CO₃ titrations.`,
                    newColor: "#cc6600",
                    colorChange: "red → orange ✓ ENDPOINT (pH ≈ 4.0)",
                };
            }
            return {
                observation: `Over-titrated — ${excess.toFixed(1)} mmol excess alkali. Methyl orange YELLOW (pH > 4.4). Endpoint was at orange. Repeat titration.`,
                newColor: "#ddaa00",
                colorChange: "orange → yellow (over-titrated)",
            };
        },
        blind(vessel) {
            const { acidMmol, baseMmol, excess } = _titrationBalance(vessel);
            if (baseMmol === 0 && acidMmol > 0)
                return { observation: "Red (strongly acidic). Add alkali from burette. Endpoint colour = orange." };
            if (acidMmol === 0 && baseMmol > 0)
                return { observation: "Yellow (alkaline). Add acid to begin titration." };
            if (excess < -2.0)
                return { observation: "Red. Still strongly acidic. Continue adding alkali." };
            if (excess < 0)
                return { observation: "⚠️ Turning orange. NEAR ENDPOINT — add dropwise now." };
            if (excess <= 1.0)
                return { observation: "✓ ORANGE — ENDPOINT reached. Record burette reading." };
            return { observation: "Yellow — over-titrated (too much alkali). Repeat titration." };
        },
    },

    {
        id: "qualitative/naoh-neutralise",
        // NaOH + acid → salt + water (neutralisation, no visible change)
        matches: (chemicals) =>
            chemicals.includes("NaOH") &&
            (chemicals.includes("HCl") || chemicals.includes("H2SO4")),
        produce() {
            return {
                observation: "Acid-base neutralisation. No visible change (both solutions colourless). Solution warms slightly — reaction is exothermic. pH approaches 7.",
                colorChange: "no visible change (neutralisation; slight temperature rise)",
            };
        },
    },

    // ── NH3(aq) cation tests ───────────────────────────────────────────────────
    {
        id: "qualitative/nh3-cuso4",
        requires: ["NH3_aq", "CuSO4"],
        produce() {
            return {
                observation: "Pale blue precipitate of Cu(OH)₂ forms initially. Dissolves in excess NH₃(aq) to give a deep royal blue solution of tetraamminecopper(II) [Cu(NH₃)₄]²⁺.",
                newColor: "#1a4a9a",
                precipitate: "Cu(OH)₂ initially (pale blue ppt) → dissolves in excess NH₃",
                hasPrecipitate: false,
                colorChange: "blue → pale blue ppt → deep royal blue solution in excess NH₃",
            };
        },
        blind() {
            return {
                observation: "Pale blue precipitate forms initially. Dissolves in excess NH₃(aq) to give a deep royal blue solution.",
                precipitate: "Pale blue precipitate initially → dissolves in excess NH₃",
                colorChange: "coloured solution → pale blue ppt → deep royal blue in excess",
            };
        },
    },
    {
        id: "qualitative/nh3-feso4",
        requires: ["NH3_aq", "FeSO4"],
        produce() {
            return {
                observation: "Dirty green/dark green precipitate of Fe(OH)₂ forms. Insoluble in excess NH₃ (key distinction from Cu²⁺). Darkens to rust-brown on standing.",
                newColor: "#6a8a5a",
                precipitate: "Fe(OH)₂(s) – dirty green ppt, insoluble in excess NH₃",
                hasPrecipitate: true,
                colorChange: "pale green → dirty green ppt",
            };
        },
        blind() {
            return {
                observation: "Dirty green/dark green precipitate forms. Insoluble in excess NH₃. Darkens to rust-brown on standing.",
                precipitate: "Dirty green precipitate, insoluble in excess NH₃",
                colorChange: "pale green → dirty green precipitate",
            };
        },
    },

    // ── Aluminium + alkali (amphoteric — MUST precede mg-acid / zn-acid) ────────
    {
        id: "qualitative/al-naoh",
        matches: (chemicals) =>
            chemicals.includes("Al_foil") && chemicals.includes("NaOH"),
        produce() {
            return {
                observation: "Al dissolves vigorously in NaOH(aq). Steady then vigorous effervescence. H₂ gas evolved — pops with lighted splint. Solution warms. Tetrahydroxoaluminate [Al(OH)₄]⁻ (aluminate) formed in solution. DISTINCTIVE: very few metals dissolve in alkali (Al is amphoteric).",
                gas: "H₂ – pops with lighted splint",
                colorChange: "colourless solution (Al dissolves vigorously in NaOH)",
                tempChange: 8,
            };
        },
        blind() {
            return {
                observation: "Metal dissolves vigorously in NaOH(aq). Steady effervescence. Colourless gas evolved — pops with lighted splint. Solution warms. Unusual behaviour: dissolves in alkali.",
                gas: "Colourless gas; pops with lighted splint",
                colorChange: "colourless solution (metal dissolves in NaOH)",
            };
        },
    },

    // ── Aluminium + acid ──────────────────────────────────────────────────────
    {
        id: "qualitative/al-acid",
        matches: (chemicals) =>
            chemicals.includes("Al_foil") &&
            (chemicals.includes("HCl") || chemicals.includes("H2SO4")),
        produce() {
            return {
                observation: "Aluminium foil dissolves in acid with steady effervescence. H₂ gas evolved — pops with lighted splint. Solution warms. Colourless Al³⁺ solution (AlCl₃ or Al₂(SO₄)₃) forms. Foil gradually disappears.",
                gas: "H₂ – pops with lighted splint",
                colorChange: "colourless (effervescence; Al dissolving)",
                tempChange: 10,
            };
        },
        blind() {
            return {
                observation: "Metal dissolves in acid with steady effervescence. Colourless gas evolved — pops with lighted splint. Solution warms. Metal gradually disappears.",
                gas: "Colourless gas; pops with lighted splint",
                colorChange: "colourless (effervescence; metal dissolving)",
            };
        },
    },

    // ── Aluminium + CuSO4 (displacement) ─────────────────────────────────────
    {
        id: "energetics/al-cuso4",
        matches: (chemicals) =>
            chemicals.includes("Al_foil") && chemicals.includes("CuSO4"),
        produce() {
            const deltaT = 12;
            return {
                observation: `Blue CuSO₄ solution slowly decolourises. Red/brown copper metal deposits on aluminium foil surface. Al displaces Cu (Al higher in reactivity series). Temperature rises ~${deltaT}°C. Reaction eventually slows as Cu coating inhibits further contact.`,
                newColor: "#d4b896",
                precipitate: "Cu(s) – red/brown metallic coating on Al",
                hasPrecipitate: true,
                tempChange: deltaT,
                colorChange: "blue → colourless + red-brown Cu deposits on Al",
            };
        },
        blind() {
            return {
                observation: "Blue solution slowly fades. Red/brown solid deposits on the metal surface. Temperature rises. Reaction slows as solid coating forms on the metal.",
                precipitate: "Red/brown metallic solid on surface",
                colorChange: "blue → colourless + red-brown deposits on metal",
            };
        },
    },

    // ── Mg + Fe³⁺ acidic solution (fe3_aq) ────────────────────────────────────
    // fe3_aq is acidic (H⁺ from Fe³⁺ hydrolysis) and Fe³⁺ itself is an oxidant.
    // Mg + 2H⁺ → Mg²⁺ + H₂(g) AND Mg + 2Fe³⁺ → Mg²⁺ + 2Fe²⁺
    // MUST precede qualitative/mg-acid so this fires when fe3_aq is present.
    {
        id: "qualitative/mg-fe3",
        matches: (chemicals) =>
            (chemicals.includes("Mg_powder") || chemicals.includes("Mg_ribbon")) &&
            chemicals.includes("fe3_aq"),
        produce() {
            return {
                observation: "Effervescence observed — hydrogen gas (H₂) evolved; pops with lighted splint. Mg reacts with H⁺ present in the acidic iron(III) solution: Mg(s) + 2H⁺(aq) → Mg²⁺(aq) + H₂(g). Fe³⁺ also oxidises Mg: Mg + 2Fe³⁺ → Mg²⁺ + 2Fe²⁺. Solution colour changes from orange-rust to pale green/yellow (Fe³⁺ → Fe²⁺) as Mg dissolves.",
                gas: "H₂ – pops with lighted splint",
                newColor: "#8ab86a",
                colorChange: "orange-rust → pale green/yellow (Fe²⁺; Mg dissolves)",
            };
        },
        blind() {
            return {
                observation: "Effervescence observed — colourless gas evolved; pops with lighted splint. Solid dissolves. Solution colour changes to paler shade. Confirms H⁺ and/or oxidising cation present.",
                gas: "Colourless gas; pops with lighted splint",
                colorChange: "coloured solution → paler; solid dissolves",
            };
        },
    },

    // ── Mg + acid (OR-logic on both sides) ────────────────────────────────────
    {
        id: "qualitative/mg-acid",
        matches: (chemicals) =>
            (chemicals.includes("Mg_powder") || chemicals.includes("Mg_ribbon")) &&
            (chemicals.includes("HCl") || chemicals.includes("H2SO4")),
        produce() {
            return {
                observation: "Vigorous effervescence. Mg dissolves rapidly. Hydrogen gas evolved — pops with lighted splint (H₂). Solution warms noticeably.",
                gas: "H₂ – pops with lighted splint",
                colorChange: "colourless (vigorous effervescence)",
            };
        },
        blind() {
            return {
                observation: "Vigorous effervescence. Solid dissolves rapidly. Colourless gas evolved — pops with lighted splint. Solution warms noticeably.",
                gas: "Colourless gas; pops with lighted splint",
                colorChange: "colourless (vigorous effervescence)",
            };
        },
    },

    // ── Zn + NaOH (amphoteric — MUST precede zn-acid) ────────────────────────
    {
        id: "qualitative/zn-naoh",
        matches: (chemicals) =>
            (chemicals.includes("Zn") || chemicals.includes("Zn_powder")) &&
            chemicals.includes("NaOH"),
        produce() {
            return {
                observation: "Zinc dissolves in NaOH(aq) — amphoteric behaviour. Effervescence; H₂ gas evolved (pops with lighted splint). Colourless tetrahydroxozincate [Zn(OH)₄]²⁻ (zincate) forms. Reaction is less vigorous than Al + NaOH. Zn_powder reacts faster (larger surface area). DISTINCTIVE: Zn and Al both dissolve in NaOH; Mg does not.",
                gas: "H₂ – pops with lighted splint",
                colorChange: "colourless (Zn dissolves; effervescence)",
                tempChange: 5,
            };
        },
        blind() {
            return {
                observation: "Metal dissolves in NaOH(aq). Effervescence; colourless gas evolved (pops with lighted splint). Reaction occurs slowly; powder form reacts faster. Amphoteric behaviour.",
                gas: "Colourless gas; pops with lighted splint",
                colorChange: "colourless (metal dissolves in NaOH; effervescence)",
            };
        },
    },

    // ── Zn + acid ─────────────────────────────────────────────────────────────
    {
        id: "qualitative/zn-acid",
        matches: (chemicals) =>
            (chemicals.includes("Zn") || chemicals.includes("Zn_powder")) &&
            (chemicals.includes("HCl") || chemicals.includes("H2SO4")),
        produce() {
            return {
                observation: "Zinc dissolves with steady effervescence. Hydrogen gas evolved — pops with lighted splint (H₂). Zn_powder reacts faster (greater surface area). Solution warms.",
                gas: "H₂ – pops with lighted splint",
                colorChange: "colourless (effervescence; Zn dissolving)",
            };
        },
        blind() {
            return {
                observation: "Solid dissolves with steady effervescence. Colourless gas evolved — pops with lighted splint. Solution warms.",
                gas: "Colourless gas; pops with lighted splint",
                colorChange: "colourless (effervescence)",
            };
        },
    },

    // ── Carbonate precipitation ────────────────────────────────────────────────
    {
        id: "qualitative/na2co3-cuso4",
        requires: ["Na2CO3", "CuSO4"],
        produce() {
            return {
                observation: "Blue-green precipitate of basic copper carbonate (Cu₂(OH)₂CO₃) forms. Blue Cu²⁺ solution fades as copper is precipitated.",
                newColor: "#4a9a7a",
                precipitate: "Cu₂(OH)₂CO₃(s) – blue-green ppt",
                hasPrecipitate: true,
                colorChange: "blue → blue-green precipitate",
            };
        },
        blind() {
            return {
                observation: "Blue-green precipitate forms. Coloured solution fades as solid precipitates.",
                precipitate: "Blue-green precipitate",
                colorChange: "coloured solution → blue-green precipitate",
            };
        },
    },
    {
        id: "qualitative/na2co3-feso4",
        requires: ["Na2CO3", "FeSO4"],
        produce() {
            return {
                observation: "Pale green/white precipitate of iron(II) carbonate (FeCO₃) forms. Slight effervescence may be visible.",
                newColor: "#c8d8b8",
                precipitate: "FeCO₃(s) – pale green/white ppt",
                hasPrecipitate: true,
                colorChange: "pale green solution → pale green precipitate",
            };
        },
        blind() {
            return {
                observation: "Pale green/white precipitate forms. Slight effervescence may be visible.",
                precipitate: "Pale green/white precipitate",
                colorChange: "pale green solution → pale green precipitate",
            };
        },
    },
    {
        id: "qualitative/limewater-carbonate",
        requires: ["limewater", "Na2CO3"],
        produce() {
            return {
                observation: "Limewater turns milky white. Calcium carbonate (CaCO₃) precipitates. Positive test for CO₃²⁻ / CO₂.",
                newColor: "#f0f0f0",
                precipitate: "CaCO₃(s) – white milky ppt",
                hasPrecipitate: true,
                colorChange: "clear → milky white (positive carbonate/CO₂ test)",
            };
        },
        blind() {
            return {
                observation: "Limewater turns milky white. White precipitate forms.",
                precipitate: "White milky precipitate",
                colorChange: "clear → milky white",
            };
        },
    },

    // ── Iodine / titration ────────────────────────────────────────────────────
    {
        id: "titration/starch-iodine",
        // Fires whenever starch is present AND I₂ has been (or can be) generated:
        // – FA3_oxidiser (iodate/IO₃⁻ source)
        // – KI or NH4I + any oxidant that liberates I₂
        // – I2_solution directly
        matches: (chemicals) =>
            chemicals.includes("starch") && (
                chemicals.includes("FA3_oxidiser") ||
                chemicals.includes("I2_solution") ||
                ((chemicals.includes("KI") || chemicals.includes("NH4I")) && (
                    chemicals.includes("KMnO4_acid") ||
                    chemicals.includes("H2O2") ||
                    chemicals.includes("CuSO4") ||
                    chemicals.includes("FeCl3") ||
                    chemicals.includes("fe3_aq")
                ))
            ),
        produce() {
            return {
                observation: "Dark blue-black colour appears — starch-iodine complex formed. Confirms I₂ present in solution.",
                newColor: "#1a1a4a",
                colorChange: "colourless/yellow-brown → deep blue-black (starch-iodine complex)",
            };
        },
        blind() {
            return {
                observation: "Dark blue-black colour appears on adding starch.",
                colorChange: "colourless/yellow-brown → deep blue-black",
            };
        },
    },
    {
        id: "titration/h2o2-fa3",
        requires: ["H2O2", "FA3_oxidiser"],
        produce() {
            return {
                observation: "Effervescence. Gas relights glowing splint (O₂). FA3 oxidises H₂O₂, or H₂O₂ reduces FA3 depending on concentrations.",
                gas: "O₂ – relights glowing splint",
            };
        },
    },

    // ── KNO3 thermal decomposition ────────────────────────────────────────────
    {
        id: "thermal/kno3-heat",
        requires: ["KNO3"],
        actionFilter: "heat",
        produce() {
            return {
                observation: "KNO₃ melts to a colourless liquid on heating (~334°C). On strong heating: decomposes to potassium nitrite (KNO₂) and oxygen (O₂). 2KNO₃ → 2KNO₂ + O₂. Glowing splint relit by evolved O₂. Molten KNO₃ is a powerful oxidiser. Group 1 nitrates decompose to nitrite + O₂ (unlike Group 2 nitrates which go to oxide + NO₂ + O₂).",
                gas: "O₂ – relights glowing splint",
                colorChange: "white crystalline solid → colourless melt → white KNO₂ residue",
            };
        },
        blind() {
            return {
                observation: "Solid melts to colourless liquid on heating. On stronger heating: colourless gas evolved that relights glowing splint.",
                gas: "Colourless gas; relights glowing splint",
                colorChange: "white solid → colourless melt",
            };
        },
    },

    // ── Thermal ───────────────────────────────────────────────────────────────
    {
        id: "thermal/potassium-alum-heat",
        requires: ["potassium_alum_hydrated"],
        actionFilter: "heat",
        produce(vessel) {
            const contents = vessel.contents || [];
            const mass = contents.find(c => c.chemical === "potassium_alum_hydrated")?.mass || 5;
            const residueMass = (mass * 258.2 / 474.4).toFixed(2);
            return {
                observation: `White crystalline solid loses water on heating. Sizzling and bubbling as water escapes. After strong heating: white powdery anhydrous residue (~${residueMass}g). Mass loss = ${(mass - parseFloat(residueMass)).toFixed(2)}g (= water of crystallisation).`,
                colorChange: "white crystals → white powder (anhydrous)",
            };
        },
    },

    // ── NH4Cl solid — sublimation on heating ──────────────────────────────────
    {
        id: "qualitative/nh4cl-solid-heat",
        requires: ["NH4Cl_solid"],
        actionFilter: "heat",
        produce() {
            return {
                observation: "NH₄Cl sublimes completely — no liquid residue. White smoke (mixture of NH₃ + HCl vapours) fills the tube. White crystalline rings form near the cooler upper part of the tube. Damp red litmus near tube mouth turns blue (NH₃); damp blue litmus further up turns red (HCl). NH₄Cl(s) ⇌ NH₃(g) + HCl(g). Confirms ammonium salt by sublimation. Dissolve the white ring back in water → re-forms NH₄Cl. NH₄⁺ confirmed: no fixed residue, sublimation is diagnostic.",
                gas: "NH₃ + HCl (white smoke; sublimation)",
                colorChange: "white solid → white smoke + white ring of crystals near top of tube; no residue",
            };
        },
        blind() {
            return {
                observation: "Solid sublimes on heating — white smoke fills tube. White crystalline ring forms in cooler part. Pungent smell. Damp litmus at tube mouth turns blue (NH₃); damp litmus further up turns red (HCl). No liquid or coloured residue. Sublimation is diagnostic for NH₄Cl.",
                gas: "White smoke (two pungent gases); sublimation",
                colorChange: "white solid → white smoke + white ring of crystals; no residue",
            };
        },
    },

    // ── NH4I cation/anion tests ────────────────────────────────────────────────
    {
        id: "qualitative/nh4i-naoh-heat",
        requires: ["NH4I", "NaOH"],
        actionFilter: "heat",
        produce() {
            return {
                observation: "On warming with NaOH: pungent ammonia gas (NH₃) evolved — damp red litmus paper held in vapour turns blue. No precipitate. NH₄⁺ + OH⁻ → NH₃(g) + H₂O. Confirms NH₄⁺. Cold NaOH gives no precipitate (I⁻ not precipitated by NaOH).",
                gas: "NH₃ – pungent; turns damp red litmus blue (on warming)",
                colorChange: "no visible change in solution (NH₃ gas evolved on warming)",
            };
        },
        blind() {
            return {
                observation: "On warming: pungent smell. Damp red litmus paper turns blue. No visible change to solution.",
                gas: "Pungent gas; turns damp red litmus blue",
                colorChange: "no visible change (pungent gas on warming)",
            };
        },
    },
    {
        id: "qualitative/nh4i-naoh",
        requires: ["NH4I", "NaOH"],
        produce() {
            return {
                observation: "No precipitate at room temperature — I⁻ is NOT precipitated by NaOH. On warming: pungent ammonia evolved — turns damp red litmus blue (NH₄⁺ confirmed). No colour change in solution. Contrast: Fe³⁺ gives rust-brown ppt; Cu²⁺ gives pale blue ppt.",
                colorChange: "no visible change (no ppt; NH₃ gas on warming)",
            };
        },
        blind() {
            return {
                observation: "No precipitate at room temperature. On warming, pungent gas evolved — turns damp red litmus blue. No colour change to solution.",
                colorChange: "no visible change (pungent gas on warming)",
            };
        },
    },
    {
        id: "qualitative/nh4i-acid",
        matches: (chemicals) =>
            chemicals.includes("NH4I") &&
            (chemicals.includes("HCl") || chemicals.includes("H2SO4")),
        produce() {
            return {
                observation: "No visible reaction — no precipitate, no gas, no colour change. NH₄I is stable in dilute acid. I⁻ is not oxidised by dilute H₂SO₄ or HCl (concentrated H₂SO₄ would oxidise I⁻ → I₂). NH₄⁺ is not displaced as NH₃ by acid.",
                colorChange: "no visible change (NH₄I stable in dilute acid)",
            };
        },
        blind() {
            return {
                observation: "No visible change. No precipitate, no gas evolved. Confirms no easily reducible/oxidisable groups reactive under these conditions.",
                colorChange: "no visible change",
            };
        },
    },

    // ── CuCO₃ reactions ────────────────────────────────────────────────────────
    // MUST precede qualitative/acid-carbonate (which requires Na2CO3 specifically).
    {
        id: "qualitative/cuco3-acid",
        matches: (chemicals) =>
            chemicals.includes("CuCO3") &&
            (chemicals.includes("HCl") || chemicals.includes("H2SO4")),
        produce() {
            return {
                observation: "Green CuCO₃ solid dissolves in acid with vigorous effervescence. CO₂ evolved — turns limewater milky. Blue/turquoise CuCl₂ (with HCl) or pale blue CuSO₄ (with H₂SO₄) solution forms. CuCO₃(s) + 2HCl(aq) → CuCl₂(aq) + H₂O(l) + CO₂(g). Test solution with NaOH → pale blue Cu(OH)₂ ppt (confirms Cu²⁺); with NH₃ (excess) → deep blue [Cu(NH₃)₄]²⁺.",
                newColor: "#2a88c0",
                gas: "CO₂ – turns limewater milky",
                colorChange: "green solid dissolves → blue/turquoise solution + CO₂ effervescence",
            };
        },
        blind() {
            return {
                observation: "Coloured solid dissolves in acid with vigorous effervescence. Colourless gas evolved — turns limewater milky. Coloured (blue/turquoise) solution forms.",
                gas: "Colourless gas; turns limewater milky",
                colorChange: "coloured solid → blue/turquoise solution + effervescence",
            };
        },
    },
    {
        id: "thermal/cuco3-heat",
        requires: ["CuCO3"],
        actionFilter: "heat",
        produce() {
            return {
                observation: "Green CuCO₃ powder turns black on heating. Black CuO residue remains. Water vapour condenses on cooler parts of tube. CO₂ evolved — turns limewater milky. CuCO₃(s) → CuO(s) + CO₂(g). Confirms CO₃²⁻ (limewater test) and Cu²⁺ (green → black CuO). Black CuO dissolves in dilute HCl → blue solution (Cu²⁺).",
                gas: "CO₂ – turns limewater milky",
                colorChange: "green solid → black solid (CuO) + CO₂ + water condensation",
            };
        },
        blind() {
            return {
                observation: "Solid changes colour on heating. Water condensation visible on cooler part of tube. Colourless gas evolved — turns limewater milky. Coloured solid residue remains.",
                gas: "Colourless gas; turns limewater milky",
                colorChange: "coloured solid changes colour on heating; water condensation",
            };
        },
    },

    // ── Na₂S₂O₃ + FeCl₃ → decolourisation ────────────────────────────────────
    // MUST precede qualitative/fecl3-naoh and qualitative/fecl3-nh3.
    {
        id: "qualitative/na2s2o3-fecl3",
        matches: (chemicals) =>
            chemicals.includes("Na2S2O3") &&
            (chemicals.includes("FeCl3") || chemicals.includes("fe3_aq")),
        produce() {
            return {
                observation: "Orange-brown FeCl₃ solution decolourises immediately to colourless/very pale. S₂O₃²⁻ reduces Fe³⁺ to Fe²⁺: 2Fe³⁺ + S₂O₃²⁻ → 2Fe²⁺ + S₄O₆²⁻ (tetrathionate). Distinctive: thiosulfate decolourises FeCl₃; sulfate (SO₄²⁻) does NOT — key test to distinguish S₂O₃²⁻ from SO₄²⁻.",
                newColor: "#f0f0f0",
                colorChange: "orange-brown (FeCl₃) → colourless (Fe³⁺ reduced to Fe²⁺ by S₂O₃²⁻)",
            };
        },
        blind() {
            return {
                observation: "Orange-brown solution decolourises/turns colourless on adding the reagent. Confirms a reducing anion (S₂O₃²⁻). Contrast: SO₄²⁻ gives no change with FeCl₃.",
                colorChange: "orange-brown → colourless (decolourisation confirms reducing anion)",
            };
        },
    },

    // ── AlNH4SO4_aq (alum) cation tests ──────────────────────────────────────
    {
        id: "qualitative/alnh4so4-naoh",
        requires: ["AlNH4SO4_aq", "NaOH"],
        produce() {
            return {
                observation: "White gelatinous precipitate of Al(OH)₃ forms immediately. Al³⁺ + 3OH⁻ → Al(OH)₃(s). Dissolves in excess NaOH → colourless [Al(OH)₄]⁻ (aluminate; amphoteric). On warming: pungent NH₃ evolved — turns damp red litmus blue. NH₄⁺ + OH⁻ → NH₃ + H₂O. Confirms Al³⁺ (white ppt soluble in excess NaOH) and NH₄⁺ (NH₃ on warming).",
                newColor: "#f0f0f5",
                precipitate: "Al(OH)₃(s) – white gelatinous ppt, soluble in excess NaOH",
                hasPrecipitate: true,
                gas: "NH₃ – pungent (on warming); turns damp red litmus blue",
                colorChange: "colourless → white gelatinous ppt → colourless [Al(OH)₄]⁻ in excess",
            };
        },
        blind() {
            return {
                observation: "White gelatinous precipitate forms. Dissolves in excess NaOH. On warming: pungent gas evolved — turns damp red litmus blue. Confirms amphoteric cation (Al³⁺) and NH₄⁺.",
                precipitate: "White gelatinous precipitate; soluble in excess NaOH",
                gas: "Pungent gas on warming; turns damp red litmus blue",
                colorChange: "colourless → white ppt → colourless (excess NaOH); NH₃ on warming",
            };
        },
    },
    {
        id: "qualitative/alnh4so4-nh3",
        requires: ["AlNH4SO4_aq", "NH3_aq"],
        produce() {
            return {
                observation: "White gelatinous precipitate of Al(OH)₃ forms. Al³⁺ + 3NH₃ + 3H₂O → Al(OH)₃(s) + 3NH₄⁺. Insoluble in excess NH₃(aq) — key distinction from Cu²⁺ (which gives deep blue [Cu(NH₃)₄]²⁺ complex in excess NH₃). Confirms Al³⁺.",
                newColor: "#f0f0f5",
                precipitate: "Al(OH)₃(s) – white gelatinous ppt, insoluble in excess NH₃",
                hasPrecipitate: true,
                colorChange: "colourless → white gelatinous precipitate (insoluble in excess NH₃)",
            };
        },
        blind() {
            return {
                observation: "White gelatinous precipitate forms. Insoluble in excess NH₃. Distinct from Cu²⁺ (which gives deep blue in excess NH₃).",
                precipitate: "White gelatinous precipitate; insoluble in excess NH₃",
                colorChange: "colourless → white gelatinous precipitate",
            };
        },
    },
    {
        id: "qualitative/fecl3-alum-no-reaction",
        requires: ["AlNH4SO4_aq", "FeCl3"],
        produce() {
            return {
                observation: "No significant reaction — orange-brown FeCl₃ colour unchanged. Alum (SO₄²⁻, Al³⁺, NH₄⁺) contains no reducing agent; none of these ions reduce Fe³⁺. Contrast: Na₂S₂O₃ immediately decolourises FeCl₃. This negative result helps identify SO₄²⁻ vs S₂O₃²⁻.",
                newColor: "#c46008",
                colorChange: "orange-brown — no change (SO₄²⁻ does not react with Fe³⁺)",
            };
        },
        blind() {
            return {
                observation: "No significant change in colour. Confirms absence of reducing anion (S₂O₃²⁻ would decolourise FeCl₃; SO₄²⁻ does not).",
                colorChange: "no significant change",
            };
        },
    },
    {
        id: "qualitative/kmno4-alum-no-reaction",
        matches: (chemicals) =>
            chemicals.includes("KMnO4_acid") && chemicals.includes("AlNH4SO4_aq") &&
            !chemicals.includes("KI") && !chemicals.includes("Na2S2O3") &&
            !chemicals.includes("Na2SO3") && !chemicals.includes("FeSO4") &&
            !chemicals.includes("H2O2") && !chemicals.includes("oxalic_acid"),
        produce() {
            return {
                observation: "No reaction — KMnO₄ remains purple. SO₄²⁻ cannot reduce MnO₄⁻. Expected negative result: alum contains only SO₄²⁻, Al³⁺, NH₄⁺ — none are reducing agents. Contrast: S₂O₃²⁻, SO₃²⁻, Fe²⁺, and H₂O₂ all decolourise KMnO₄. This confirms anion is SO₄²⁻ (not SO₃²⁻ or S₂O₃²⁻).",
                newColor: "#9b10c8",
                colorChange: "purple (no change — SO₄²⁻ is not a reducing agent)",
            };
        },
        blind() {
            return {
                observation: "Purple colour remains — no decolourisation. Confirms absence of reducing agent (S₂O₃²⁻ or SO₃²⁻ would decolourise KMnO₄).",
                colorChange: "purple (no change)",
            };
        },
    },

    // ── Cr³⁺ cation tests (Cr_aq) ─────────────────────────────────────────────
    {
        id: "qualitative/cr3-naoh",
        requires: ["Cr_aq", "NaOH"],
        produce() {
            return {
                observation: "Grey-green precipitate of Cr(OH)₃ forms immediately. Cr³⁺ + 3OH⁻ → Cr(OH)₃(s). Dissolves in excess NaOH → dark green [Cr(OH)₄]⁻ or [Cr(OH)₆]³⁻ solution (amphoteric). No NH₃ on warming. Distinguishes Cr³⁺ from Fe³⁺ (rust-brown ppt insoluble in excess NaOH) and Al³⁺ (white ppt soluble in excess NaOH → colourless).",
                newColor: "#3a6a3a",
                precipitate: "Cr(OH)₃(s) – grey-green ppt, soluble in excess NaOH → dark green",
                hasPrecipitate: true,
                colorChange: "green → grey-green ppt → dark green solution in excess NaOH",
            };
        },
        blind() {
            return {
                observation: "Grey-green precipitate forms. Dissolves in excess NaOH giving dark green solution. No NH₃ on warming. Amphoteric behaviour.",
                precipitate: "Grey-green precipitate; soluble in excess NaOH (dark green solution)",
                colorChange: "grey-green ppt → dark green (excess NaOH)",
            };
        },
    },
    {
        id: "qualitative/cr3-nh3",
        requires: ["Cr_aq", "NH3_aq"],
        produce() {
            return {
                observation: "Grey-green precipitate of Cr(OH)₃ forms. Insoluble in excess NH₃(aq) — distinguishes Cr³⁺ from Cu²⁺ (deep blue complex with excess NH₃). Confirms Cr³⁺. Cr(OH)₃ is a gelatinous grey-green solid.",
                newColor: "#4a7a4a",
                precipitate: "Cr(OH)₃(s) – grey-green ppt, insoluble in excess NH₃",
                hasPrecipitate: true,
                colorChange: "green solution → grey-green precipitate (insoluble in excess NH₃)",
            };
        },
        blind() {
            return {
                observation: "Grey-green precipitate forms. Insoluble in excess NH₃(aq).",
                precipitate: "Grey-green precipitate; insoluble in excess NH₃",
                colorChange: "grey-green precipitate forms",
            };
        },
    },

    // ── Mn²⁺ cation tests (MnSO4) ─────────────────────────────────────────────
    {
        id: "qualitative/mn2-naoh",
        requires: ["MnSO4", "NaOH"],
        produce() {
            return {
                observation: "Off-white/flesh-coloured precipitate of Mn(OH)₂ forms immediately. Insoluble in excess NaOH. Mn²⁺ + 2OH⁻ → Mn(OH)₂(s). Turns pale brown then dark brown on standing in air — Mn(OH)₂ oxidised to MnO₂·xH₂O by atmospheric O₂. Colour change is diagnostic: off-white → brown on air exposure.",
                newColor: "#c8a878",
                precipitate: "Mn(OH)₂(s) – off-white/cream ppt → brown MnO₂ on standing in air",
                hasPrecipitate: true,
                colorChange: "pale pink → off-white ppt → brown (air oxidation of Mn(OH)₂ → MnO₂)",
            };
        },
        blind() {
            return {
                observation: "Off-white/cream precipitate forms immediately. Insoluble in excess NaOH. Rapidly turns brown on standing in air (oxidation by atmospheric O₂).",
                precipitate: "Off-white precipitate → brown on standing; insoluble in excess NaOH",
                colorChange: "off-white ppt → brown (air oxidation)",
            };
        },
    },
    {
        id: "qualitative/mn2-nh3",
        requires: ["MnSO4", "NH3_aq"],
        produce() {
            return {
                observation: "Off-white/cream precipitate of Mn(OH)₂ forms. Insoluble in excess NH₃(aq). Turns brown on standing in air. Similar to NaOH test — both give off-white ppt insoluble in excess. Confirms Mn²⁺.",
                newColor: "#c8a878",
                precipitate: "Mn(OH)₂(s) – off-white ppt → brown on standing; insoluble in excess NH₃",
                hasPrecipitate: true,
                colorChange: "pale pink → off-white ppt → brown (air oxidation)",
            };
        },
        blind() {
            return {
                observation: "Off-white/cream precipitate forms. Insoluble in excess NH₃. Turns brown on standing in air.",
                precipitate: "Off-white precipitate → brown on standing; insoluble in excess NH₃",
                colorChange: "off-white ppt → brown",
            };
        },
    },

    // ── Ba²⁺ + NaOH → Ba(OH)₂ precipitate ────────────────────────────────────
    {
        id: "qualitative/bacl2-naoh",
        requires: ["BaCl2", "NaOH"],
        produce() {
            return {
                observation: "White precipitate of barium hydroxide Ba(OH)₂ forms. Slightly soluble but precipitates at moderate concentrations. Insoluble in excess NaOH. Ba²⁺ + 2OH⁻ → Ba(OH)₂(s). On warming: no ammonia evolved (confirms absence of NH₄⁺). Distinguishes Ba²⁺: NaOH gives white ppt; contrast Cu²⁺ (pale blue ppt), Fe³⁺ (rust-brown ppt), Al³⁺ (white ppt soluble in excess).",
                newColor: "#f0f0ee",
                precipitate: "Ba(OH)₂(s) – white ppt, slightly soluble; insoluble in excess NaOH",
                hasPrecipitate: true,
                colorChange: "colourless → white precipitate (Ba(OH)₂; insoluble in excess NaOH)",
            };
        },
        blind() {
            return {
                observation: "White precipitate forms. Insoluble in excess NaOH. No ammonia on warming. Slightly soluble so precipitate may be faint at low concentrations.",
                precipitate: "White precipitate; insoluble in excess NaOH",
                colorChange: "colourless → white precipitate",
            };
        },
    },

    // ── NaHCO₃ reactions ───────────────────────────────────────────────────────
    {
        id: "qualitative/nahco3-acid",
        matches: (chemicals) =>
            (chemicals.includes("NaHCO3") || chemicals.includes("NaHCO3_aq")) &&
            (chemicals.includes("HCl") || chemicals.includes("H2SO4")),
        produce() {
            return {
                observation: "Vigorous effervescence — CO₂ gas evolved immediately. Turns limewater milky. 2MHCO₃(aq) + H₂SO₄(aq) → M₂SO₄(aq) + 2H₂O(l) + 2CO₂(g). Colourless solution remains. Bromophenol blue indicator turns yellow at endpoint (acid in excess).",
                gas: "CO₂ – turns limewater milky",
                colorChange: "effervescence (CO₂) on adding acid to bicarbonate",
            };
        },
        blind() {
            return {
                observation: "Vigorous effervescence. Colourless gas evolved — turns limewater milky.",
                gas: "Colourless, odourless gas; turns limewater milky",
                colorChange: "effervescence",
            };
        },
    },
    {
        id: "thermal/nahco3-heat",
        matches: (chemicals) =>
            chemicals.includes("NaHCO3") || chemicals.includes("NaHCO3_aq"),
        actionFilter: "heat",
        produce() {
            return {
                observation: "On strong heating: white Na₂CO₃ residue remains. CO₂ evolved — turns limewater milky. Water vapour condenses on cooler parts. 2NaHCO₃(s) → Na₂CO₃(s) + H₂O(g) + CO₂(g). Mass loss calculated to find Mr of MHCO₃. Residue (Na₂CO₃) tested with dilute HCl → effervescence (CO₂) confirms carbonate. Heating to constant mass gives complete decomposition.",
                gas: "CO₂ – turns limewater milky (+ water vapour condensation)",
                colorChange: "white solid → white Na₂CO₃ residue + CO₂ + water condensation",
            };
        },
        blind() {
            return {
                observation: "White solid decomposes on heating. White residue remains. CO₂ evolved — turns limewater milky. Water condensation. Residue reacts with dilute acid with effervescence.",
                gas: "Colourless gas; turns limewater milky",
                colorChange: "white solid → white residue (thermal decomposition)",
            };
        },
    },

    // ── Basic zinc carbonate reactions ─────────────────────────────────────────
    {
        id: "thermal/basic-zinc-carbonate-heat",
        requires: ["basic_zinc_carbonate"],
        actionFilter: "heat",
        produce(vessel) {
            const contents = vessel.contents || [];
            const mass = contents.find(c => c.chemical === "basic_zinc_carbonate")?.mass || 3.0;
            // ZnCO₃·2Zn(OH)₂·xH₂O → 3ZnO + CO₂ + (x+2)H₂O; Mr ≈ 360 for x=1
            const residueMass = (mass * 244.2 / 360).toFixed(2);
            return {
                observation: `White/cream solid heated strongly. White ZnO residue (~${residueMass}g). Yellow when hot, white on cooling. CO₂ evolved — turns limewater milky. Water vapour condenses. ZnCO₃·2Zn(OH)₂·xH₂O(s) → 3ZnO(s) + CO₂(g) + (x+2)H₂O(g). Use: n(ZnO) = residue/81.4; n(compound) = n(ZnO)/3; Mr = mass/n(compound). Calculate x from Mr − 324.2)/18.`,
                gas: "CO₂ – turns limewater milky (+ water vapour)",
                colorChange: "white/cream solid → white ZnO residue (yellow hot, white cold) + CO₂ + water condensation",
            };
        },
        blind() {
            return {
                observation: "White/cream solid heated strongly. White residue remains (yellow when hot, white on cooling). Colourless gas evolved — turns limewater milky. Water condensation on cooler parts.",
                gas: "Colourless gas; turns limewater milky",
                colorChange: "white solid → white residue (thermal decomposition)",
            };
        },
    },
    {
        id: "qualitative/basic-zinc-carbonate-acid",
        matches: (chemicals) =>
            chemicals.includes("basic_zinc_carbonate") &&
            (chemicals.includes("HCl") || chemicals.includes("H2SO4")),
        produce() {
            return {
                observation: "Basic zinc carbonate dissolves in acid with effervescence. CO₂ evolved — turns limewater milky. Colourless Zn²⁺ solution forms. ZnCO₃·2Zn(OH)₂·xH₂O + 6HCl → 3ZnCl₂ + CO₂ + (x+5)H₂O. Test solution with NaOH → white Zn(OH)₂ ppt soluble in excess NaOH (amphoteric Zn²⁺).",
                gas: "CO₂ – turns limewater milky",
                colorChange: "white solid dissolves → colourless solution + CO₂ effervescence",
            };
        },
        blind() {
            return {
                observation: "Solid dissolves in acid with effervescence. Colourless gas evolved — turns limewater milky. Colourless solution forms.",
                gas: "Colourless gas; turns limewater milky",
                colorChange: "white solid dissolves → colourless solution + effervescence",
            };
        },
    },

    // ── I₂ solution (direct I₂) reactions ─────────────────────────────────────
    {
        id: "qualitative/i2-starch",
        requires: ["I2_solution", "starch"],
        produce() {
            return {
                observation: "Deep blue-black colour immediately — starch-iodine complex formed. Confirms I₂ present in solution. Decolourises on heating (complex breaks down); returns blue-black on cooling.",
                newColor: "#0a0a2a",
                colorChange: "brown (I₂) → deep blue-black (starch-iodine complex)",
            };
        },
        blind() {
            return {
                observation: "Deep blue-black colour forms immediately on adding starch to the brown solution. Confirms I₂ present.",
                colorChange: "brown → deep blue-black (starch-iodine)",
            };
        },
    },
    {
        id: "qualitative/i2-sulfite",
        requires: ["I2_solution", "Na2SO3"],
        produce() {
            return {
                observation: "Brown I₂ solution decolourises as Na₂SO₃ reduces I₂. Na₂SO₃ + I₂ + H₂O → Na₂SO₄ + 2HI. If Na₂SO₃ in excess: solution colourless (all I₂ consumed). If I₂ in excess: yellow-brown from remaining I₂ — add starch → blue-black. This reaction is the basis for iodometric determination of Na₂SO₃·xH₂O water of crystallisation.",
                newColor: "#f5f5f5",
                colorChange: "brown (I₂) → colourless (SO₃²⁻ reduces I₂) [yellow-brown if I₂ excess]",
            };
        },
        blind() {
            return {
                observation: "Brown solution decolourises on adding the reagent. Confirms a reducing anion. Add starch to check for remaining I₂.",
                colorChange: "brown → colourless/pale (reducing anion present)",
            };
        },
    },

    // ── Bromophenol blue indicator ─────────────────────────────────────────────
    // For MHCO₃ + H₂SO₄ titrations (2021-style). Yellow < pH 3; green at pH 3–4.5;
    // blue > pH 4.5. Starts blue in alkaline MHCO₃ flask; add acid → green endpoint.
    // MUST precede qualitative/naoh-neutralise and qualitative/nahco3-acid.
    {
        id: "titration/bromophenol-blue",
        matches: (chemicals) =>
            chemicals.includes("bromophenol_blue") &&
            (chemicals.includes("HCl") || chemicals.includes("H2SO4") ||
             chemicals.includes("NaOH") || chemicals.includes("Na2CO3") ||
             chemicals.includes("NaHCO3") || chemicals.includes("NaHCO3_aq")),
        produce(vessel) {
            const { acidMmol, baseMmol, excess } = _titrationBalance(vessel);
            if (baseMmol === 0 && acidMmol > 0) {
                return {
                    observation: "Bromophenol blue in acid — YELLOW (pH < 3). Add alkali from burette. Endpoint: yellow → green/blue-green.",
                    newColor: "#ddaa00",
                    colorChange: "yellow (acidic, pH < 3)",
                };
            }
            if (acidMmol === 0 && baseMmol > 0) {
                return {
                    observation: "Bromophenol blue in alkaline solution — BLUE (pH > 4.5). Add acid from burette. Endpoint colour: yellow-green or green.",
                    newColor: "#4040c0",
                    colorChange: "blue (alkaline, pH > 4.5)",
                };
            }
            if (excess < -2.0) {
                return {
                    observation: `Acid in large excess (acid: ${acidMmol.toFixed(1)} mmol, base: ${baseMmol.toFixed(1)} mmol). Bromophenol blue YELLOW. Continue adding base.`,
                    newColor: "#ddaa00",
                    colorChange: "yellow (acid in large excess)",
                };
            }
            if (excess < 0) {
                return {
                    observation: `⚠️ NEAR ENDPOINT — YELLOW-GREEN, fading. Base excess: ${Math.abs(excess).toFixed(1)} mmol. Add alkali DROPWISE.`,
                    newColor: "#88aa20",
                    colorChange: "yellow → yellow-green (near endpoint — add dropwise!)",
                };
            }
            if (excess <= 1.0) {
                return {
                    observation: `✓ ENDPOINT REACHED — GREEN/BLUE-GREEN (pH ≈ 4.5). Base excess only ${excess.toFixed(1)} mmol. Record burette reading.`,
                    newColor: "#3a8a40",
                    colorChange: "yellow → green ✓ ENDPOINT (pH ≈ 4.5)",
                };
            }
            return {
                observation: `Over-titrated — ${excess.toFixed(1)} mmol excess base. Bromophenol blue BLUE. Endpoint was green. Repeat titration.`,
                newColor: "#4040c0",
                colorChange: "green → blue (over-titrated)",
            };
        },
        blind(vessel) {
            const { acidMmol, baseMmol, excess } = _titrationBalance(vessel);
            if (baseMmol === 0 && acidMmol > 0)
                return { observation: "Yellow (acidic). Add alkali from burette. Endpoint: yellow → green." };
            if (acidMmol === 0 && baseMmol > 0)
                return { observation: "Blue (alkaline). Add acid from burette. Endpoint: blue → green." };
            if (excess < -2.0)
                return { observation: "Yellow. Acid in excess. Continue adding alkali." };
            if (excess < 0)
                return { observation: "⚠️ Yellow-green. NEAR ENDPOINT — add alkali dropwise." };
            if (excess <= 1.0)
                return { observation: "✓ GREEN — ENDPOINT. Record burette reading." };
            return { observation: "Blue — over-titrated (too much alkali). Repeat titration." };
        },
    },

    // ── Fallbacks (last — matched only when no specific rule fires) ────────────
    {
        id: "fallback/heat",
        actionFilter: "heat",
        matches: (_chemicals, vessel) => (vessel.contents || []).length > 0,
        produce() {
            return { observation: "Solution/mixture warms. Temperature increases." };
        },
    },
    {
        id: "fallback/stir",
        actionFilter: "stir",
        matches: (_chemicals, vessel) => (vessel.contents || []).length > 0,
        produce() {
            return { observation: "Contents mixed thoroughly. No visible change." };
        },
    },
    {
        id: "fallback/filter",
        actionFilter: "filter",
        produce() {
            return { observation: "Filtration complete. Residue collected on filter paper. Filtrate collected in receiving vessel." };
        },
    },
];
