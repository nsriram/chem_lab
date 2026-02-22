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
        requires: ["KMnO4_acid", "KI"],
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
        requires: ["FeCl3", "KI"],
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
        requires: ["FeCl3", "NaOH"],
        produce() {
            return {
                observation: "Rust-brown/red-brown precipitate of iron(III) hydroxide Fe(OH)₃ forms immediately. Insoluble in excess NaOH. Confirms Fe³⁺. Does NOT dissolve in excess (distinction from Al³⁺).",
                newColor: "#b05a10",
                precipitate: "Fe(OH)₃(s) – rust-brown ppt, insoluble in excess NaOH",
                hasPrecipitate: true,
                colorChange: "orange-brown → rust-brown precipitate (Fe(OH)₃)",
            };
        },
        blind() {
            return {
                observation: "Rust-brown/red-brown precipitate forms immediately. Insoluble in excess NaOH. Does NOT dissolve in excess.",
                precipitate: "Rust-brown precipitate, insoluble in excess NaOH",
                colorChange: "→ rust-brown precipitate",
            };
        },
    },
    {
        id: "qualitative/fecl3-nh3",
        requires: ["FeCl3", "NH3_aq"],
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
        requires: ["AgNO3", "KI"],
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
        requires: ["Na2CO3", "FeCl3"],
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
        // SO4²⁻ sources: H2SO4, CuSO4, FeSO4
        matches: (chemicals) =>
            chemicals.includes("BaCl2") &&
            (chemicals.includes("H2SO4") || chemicals.includes("CuSO4") || chemicals.includes("FeSO4")),
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
        // – KI + any oxidant that liberates I₂: KMnO4_acid, H2O2, CuSO4, FeCl3
        matches: (chemicals) =>
            chemicals.includes("starch") && (
                chemicals.includes("FA3_oxidiser") ||
                (chemicals.includes("KI") && (
                    chemicals.includes("KMnO4_acid") ||
                    chemicals.includes("H2O2") ||
                    chemicals.includes("CuSO4") ||
                    chemicals.includes("FeCl3")
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
        id: "titration/thiosulfate-titrant-fa3",
        requires: ["Na2S2O3_titrant", "FA3_oxidiser"],
        produce() {
            return {
                observation: "Yellow-brown iodine colour fades as Na₂S₂O₃ reduces I₂. Near endpoint: add starch → blue-black. At endpoint: blue-black disappears → colourless.",
                colorChange: "yellow-brown → (blue-black with starch) → colourless at endpoint",
            };
        },
        blind() {
            return {
                observation: "Yellow-brown colour fades. Near endpoint: add starch → blue-black. At endpoint: blue-black disappears → colourless.",
                colorChange: "yellow-brown → (blue-black with starch) → colourless at endpoint",
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
