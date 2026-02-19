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

    // ── Energetics ────────────────────────────────────────────────────────────
    {
        id: "energetics/cuso4-mg",
        requires: ["CuSO4", "Mg_powder"],
        produce(vessel) {
            const contents = vessel.contents || [];
            const cu = contents.find(c => c.chemical === "CuSO4");
            const mg = contents.find(c => c.chemical === "Mg_powder");
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

    // ── Redox ─────────────────────────────────────────────────────────────────
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

    // ── Precipitation ─────────────────────────────────────────────────────────
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
        // OR-logic: BaCl2 + sulfate source (H2SO4 or SO4²⁻ from CuSO4)
        id: "qualitative/bacl2-sulfate",
        matches: (chemicals) =>
            chemicals.includes("BaCl2") &&
            (chemicals.includes("H2SO4") || chemicals.includes("CuSO4")),
        produce() {
            return {
                observation: "White precipitate forms immediately. Insoluble in excess dilute HCl. BaSO₄ confirmed.",
                newColor: "#f8f8f8",
                precipitate: "BaSO₄ – white ppt, insoluble in dilute HCl",
                hasPrecipitate: true,
            };
        },
    },
    {
        id: "qualitative/bacl2-sulfite",
        requires: ["BaCl2", "Na2SO3"],
        produce() {
            return {
                observation: "White precipitate forms. Soluble in excess dilute strong acid (BaSO₃ dissolves in HCl).",
                newColor: "#f5f5f5",
                precipitate: "BaSO₃ – white ppt, soluble in dilute HCl",
                hasPrecipitate: true,
            };
        },
    },
    {
        id: "qualitative/naoh-cuso4",
        requires: ["NaOH", "CuSO4"],
        produce() {
            return {
                observation: "Pale blue precipitate forms. Insoluble in excess NaOH. Cu(OH)₂(s).",
                newColor: "#b8d4e8",
                precipitate: "Cu(OH)₂ – pale blue ppt, insoluble in excess",
                hasPrecipitate: true,
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
                observation: "Vigorous effervescence. Mg dissolves. Gas pops with lighted splint (H₂). Solution warms.",
                gas: "H₂ – pops with lighted splint",
                colorChange: "colourless (effervescence)",
            };
        },
    },

    // ── Iodine / titration ────────────────────────────────────────────────────
    {
        id: "titration/starch-iodine",
        requires: ["starch", "FA3_oxidiser"],
        produce() {
            return {
                observation: "Dark blue-black colour appears indicating iodine present.",
                newColor: "#1a1a4a",
                colorChange: "colourless → blue-black (starch-iodine)",
            };
        },
    },
    {
        id: "titration/thiosulfate-titrant-fa3",
        requires: ["Na2S2O3_titrant", "FA3_oxidiser"],
        produce() {
            return {
                observation: "Yellow-brown iodine colour fades. Near endpoint add starch → blue-black. At endpoint blue-black disappears to colourless.",
                colorChange: "yellow-brown → (blue-black with starch) → colourless at endpoint",
            };
        },
    },
    {
        id: "titration/h2o2-fa3",
        requires: ["H2O2", "FA3_oxidiser"],
        produce() {
            return {
                observation: "Effervescence. Gas relights glowing splint (O₂). FA3 oxidised H₂O₂ or FA3 reduced by H₂O₂.",
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
                observation: `White crystalline solid loses water. On first heating: sizzling and bubbling as water escapes. After strong heating: white powdery anhydrous residue (~${residueMass}g). Mass loss = ${(mass - parseFloat(residueMass)).toFixed(2)}g (= water of crystallisation).`,
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
