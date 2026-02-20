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
    },

    // ── Silver nitrate tests ───────────────────────────────────────────────────
    // Must precede BaCl2 rules because BaCl2 contains Cl⁻ (would precipitate AgCl).
    {
        id: "qualitative/agno3-chloride",
        // Cl⁻ sources: HCl, NaCl, BaCl2
        matches: (chemicals) =>
            chemicals.includes("AgNO3") &&
            (chemicals.includes("HCl") || chemicals.includes("NaCl") || chemicals.includes("BaCl2")),
        produce() {
            return {
                observation: "Curdy white precipitate of silver chloride (AgCl) forms immediately. Turns grey-purple on exposure to sunlight. Dissolves readily in dilute and concentrated NH₃(aq). Halide confirmed as Cl⁻.",
                newColor: "#f0f0f0",
                precipitate: "AgCl(s) – curdy white ppt; soluble in dil. NH₃(aq)",
                hasPrecipitate: true,
                colorChange: "colourless → white curdy (AgCl)",
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
    },

    // ── Iodine / titration ────────────────────────────────────────────────────
    {
        id: "titration/starch-iodine",
        requires: ["starch", "FA3_oxidiser"],
        produce() {
            return {
                observation: "Dark blue-black colour appears — starch-iodine complex formed. Indicates iodine present.",
                newColor: "#1a1a4a",
                colorChange: "colourless → blue-black (starch-iodine complex)",
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
