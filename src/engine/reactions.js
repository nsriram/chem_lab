export function simulateReaction(vessel, action, params = {}) {
    const contents = vessel.contents || [];
    const chemicals = contents.map(c => c.chemical);
    const result = {
        observation: null,
        colorChange: null,
        precipitate: null,
        gas: null,
        newColor: vessel.color,
        hasPrecipitate: false,
    };

    // Thiosulfate + HCl → cloudiness
    if (chemicals.includes("Na2S2O3") && chemicals.includes("HCl")) {
        const thio = contents.find(c => c.chemical === "Na2S2O3");
        const acid = contents.find(c => c.chemical === "HCl");
        if (thio && acid) {
            const concentration = (thio.volume / (thio.volume + acid.volume)) * 0.10;
            const time = Math.round(200 / concentration + Math.random() * 20 - 10);
            return {
                ...result,
                observation: `Solution turns cloudy/opaque after ~${time}s. Pale yellow sulfur precipitate forms. Faint smell of SO₂.`,
                reactionTime: time,
                newColor: "#f5f0dc",
                precipitate: "S(s) – pale yellow solid",
                hasPrecipitate: true,
                gas: "SO₂ (faint)",
                colorChange: "clear → cloudy/opaque yellow-white",
            };
        }
    }

    // CuSO4 + Mg
    if (chemicals.includes("CuSO4") && chemicals.includes("Mg_powder")) {
        const cu = contents.find(c => c.chemical === "CuSO4");
        const mg = contents.find(c => c.chemical === "Mg_powder");
        const molesCu = (cu?.volume || 0) * 0.001 * 1.0;
        const molesMg = (mg?.mass || 0) / 24.3;
        const limitingMoles = Math.min(molesCu, molesMg);
        const deltaT = Math.round((limitingMoles * 350000) / (50 * 4.18));
        const maxTemp = 22 + deltaT;
        return {
            ...result,
            observation: `Vigorous reaction. Solution turns from blue to colourless/pale. Red-brown copper metal deposits. Temperature rises to ~${maxTemp}°C (ΔT ≈ ${deltaT}°C).`,
            newColor: "#c8a882",
            precipitate: "Cu(s) – red-brown solid",
            hasPrecipitate: true,
            tempChange: deltaT,
            colorChange: "blue → colourless + red-brown solid",
        };
    }

    // KMnO4 + Na2S2O3
    if (chemicals.includes("KMnO4_acid") && chemicals.includes("Na2S2O3")) {
        return {
            ...result,
            observation: "Purple KMnO₄ decolourised immediately to colourless. S₂O₃²⁻ reduces MnO₄⁻.",
            newColor: "#f5f5f5",
            colorChange: "purple → colourless",
        };
    }

    // KMnO4 + Na2SO3
    if (chemicals.includes("KMnO4_acid") && chemicals.includes("Na2SO3")) {
        return {
            ...result,
            observation: "Purple KMnO₄ decolourised to colourless. SO₃²⁻ reduces MnO₄⁻.",
            newColor: "#f5f5f5",
            colorChange: "purple → colourless",
        };
    }

    // BaCl2 + Na2S2O3
    if (chemicals.includes("BaCl2") && chemicals.includes("Na2S2O3")) {
        return {
            ...result,
            observation: "No precipitate observed immediately. On standing with H⁺, off-white/pale yellow precipitate forms slowly.",
            precipitate: "off-white/pale yellow ppt slowly",
            hasPrecipitate: true,
        };
    }

    // BaCl2 + H2SO4 / CuSO4
    if (chemicals.includes("BaCl2") && (chemicals.includes("H2SO4") || chemicals.includes("CuSO4"))) {
        return {
            ...result,
            observation: "White precipitate forms immediately. Insoluble in excess dilute HCl. BaSO₄ confirmed.",
            newColor: "#f8f8f8",
            precipitate: "BaSO₄ – white ppt, insoluble in dilute HCl",
            hasPrecipitate: true,
        };
    }

    // BaCl2 + Na2SO3
    if (chemicals.includes("BaCl2") && chemicals.includes("Na2SO3")) {
        return {
            ...result,
            observation: "White precipitate forms. Soluble in excess dilute strong acid (BaSO₃ dissolves in HCl).",
            newColor: "#f5f5f5",
            precipitate: "BaSO₃ – white ppt, soluble in dilute HCl",
            hasPrecipitate: true,
        };
    }

    // Mg + acid
    if (
        (chemicals.includes("Mg_powder") || chemicals.includes("Mg_ribbon")) &&
        (chemicals.includes("HCl") || chemicals.includes("H2SO4"))
    ) {
        return {
            ...result,
            observation: "Vigorous effervescence. Mg dissolves. Gas pops with lighted splint (H₂). Solution warms.",
            gas: "H₂ – pops with lighted splint",
            colorChange: "colourless (effervescence)",
        };
    }

    // NaOH + CuSO4
    if (chemicals.includes("NaOH") && chemicals.includes("CuSO4")) {
        return {
            ...result,
            observation: "Pale blue precipitate forms. Insoluble in excess NaOH. Cu(OH)₂(s).",
            newColor: "#b8d4e8",
            precipitate: "Cu(OH)₂ – pale blue ppt, insoluble in excess",
            hasPrecipitate: true,
        };
    }

    // Starch + iodine
    if (chemicals.includes("starch") && chemicals.includes("FA3_oxidiser")) {
        return {
            ...result,
            observation: "Dark blue-black colour appears indicating iodine present.",
            newColor: "#1a1a4a",
            colorChange: "colourless → blue-black (starch-iodine)",
        };
    }

    // Iodometric titration: Na2S2O3 titrant + FA3_oxidiser
    if (chemicals.includes("Na2S2O3_titrant") && chemicals.includes("FA3_oxidiser")) {
        return {
            ...result,
            observation: "Yellow-brown iodine colour fades. Near endpoint add starch → blue-black. At endpoint blue-black disappears to colourless.",
            colorChange: "yellow-brown → (blue-black with starch) → colourless at endpoint",
        };
    }

    // H2O2 + FA3_oxidiser
    if (chemicals.includes("H2O2") && chemicals.includes("FA3_oxidiser")) {
        return {
            ...result,
            observation: "Effervescence. Gas relights glowing splint (O₂). FA3 oxidised H₂O₂ or FA3 reduced by H₂O₂.",
            gas: "O₂ – relights glowing splint",
        };
    }

    // Heating potassium alum
    if (chemicals.includes("potassium_alum_hydrated") && action === "heat") {
        const mass = contents.find(c => c.chemical === "potassium_alum_hydrated")?.mass || 5;
        const residueMass = (mass * 258.2 / 474.4).toFixed(2);
        return {
            ...result,
            observation: `White crystalline solid loses water. On first heating: sizzling and bubbling as water escapes. After strong heating: white powdery anhydrous residue (~${residueMass}g). Mass loss = ${(mass - parseFloat(residueMass)).toFixed(2)}g (= water of crystallisation).`,
            colorChange: "white crystals → white powder (anhydrous)",
        };
    }

    // Generic fallbacks
    if (action === "heat"   && contents.length > 0) return { ...result, observation: "Solution/mixture warms. Temperature increases." };
    if (action === "stir"   && contents.length > 0) return { ...result, observation: "Contents mixed thoroughly. No visible change." };
    if (action === "filter")                         return { ...result, observation: "Filtration complete. Residue collected on filter paper. Filtrate collected in receiving vessel." };

    return {
        ...result,
        observation: contents.length === 0 ? "Vessel is empty." : "No reaction observed. Note all observations.",
    };
}
