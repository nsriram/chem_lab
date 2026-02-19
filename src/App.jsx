import {useState, useEffect, useRef, useCallback} from "react";

// ============================================================
// CHEMISTRY ENGINE - reactions, observations, state
// ============================================================

const CHEMICALS = {
    "Na2S2O3": {label: "Sodium Thiosulfate (0.10 mol/dm³)", type: "solution", color: "#e8f4f8", category: "solution"},
    "HCl": {label: "Hydrochloric Acid (2.00 mol/dm³)", type: "solution", color: "#fff9e6", category: "acid"},
    "CuSO4": {label: "Copper(II) Sulfate (1.0 mol/dm³)", type: "solution", color: "#b3d9ff", category: "solution"},
    "Mg_powder": {label: "Magnesium Powder", type: "solid", color: "#e8e8e8", category: "solid"},
    "Mg_ribbon": {label: "Magnesium Ribbon", type: "solid", color: "#e0e0e0", category: "solid"},
    "KMnO4_acid": {label: "Acidified KMnO₄", type: "solution", color: "#8b1a8b", category: "reagent"},
    "BaCl2": {label: "Barium Chloride", type: "solution", color: "#f5f5f5", category: "reagent"},
    "NaOH": {label: "Sodium Hydroxide", type: "solution", color: "#f0f8f0", category: "reagent"},
    "AgNO3": {label: "Silver Nitrate", type: "solution", color: "#fafafa", category: "reagent"},
    "NH3_aq": {label: "Aqueous Ammonia", type: "solution", color: "#f5ffe0", category: "reagent"},
    "Na2SO3": {label: "Sodium Sulfite", type: "solution", color: "#f0f5e8", category: "solution"},
    "H2SO4": {label: "Sulfuric Acid (1.00 mol/dm³)", type: "solution", color: "#fff9e0", category: "acid"},
    "KI": {label: "Potassium Iodide (0.50 mol/dm³)", type: "solution", color: "#fafafa", category: "reagent"},
    "Na2S2O3_titrant": {
        label: "Sodium Thiosulfate (22.00g/dm³)",
        type: "solution",
        color: "#e8f8f8",
        category: "titrant"
    },
    "starch": {label: "Starch Solution", type: "solution", color: "#fffff0", category: "indicator"},
    "distilled_water": {label: "Distilled Water", type: "solution", color: "#f0f8ff", category: "solution"},
    "FA3_oxidiser": {
        label: "FA 3 – Oxidising Agent (0.0175 mol/dm³)",
        type: "solution",
        color: "#ffe4b5",
        category: "solution"
    },
    "H2O2": {label: "Hydrogen Peroxide", type: "solution", color: "#f0fff0", category: "reagent"},
    "limewater": {label: "Limewater", type: "solution", color: "#f8fff8", category: "reagent"},
    "Zn": {label: "Zinc (small pieces)", type: "solid", color: "#ddd", category: "solid"},
    "potassium_alum_hydrated": {
        label: "Potassium Alum (hydrated, FA 1)",
        type: "solid",
        color: "#fff5e0",
        category: "solid"
    },
};

const EQUIPMENT = {
    "burette": {label: "Burette (50 cm³)", icon: "🧪"},
    "pipette_25": {label: "Pipette (25.0 cm³)", icon: "💉"},
    "measuring_cylinder_10": {label: "Measuring Cylinder (10 cm³)", icon: "📏"},
    "measuring_cylinder_25": {label: "Measuring Cylinder (25 cm³)", icon: "📐"},
    "conical_flask": {label: "Conical Flask (250 cm³)", icon: "⚗️"},
    "beaker_100": {label: "Beaker (100 cm³)", icon: "🫙"},
    "beaker_250": {label: "Beaker (250 cm³)", icon: "🫗"},
    "test_tube": {label: "Test-tube", icon: "🧫"},
    "boiling_tube": {label: "Boiling Tube", icon: "🔬"},
    "crucible": {label: "Crucible + Lid", icon: "🏺"},
    "thermometer": {label: "Thermometer", icon: "🌡️"},
    "stop_clock": {label: "Stop-clock", icon: "⏱️"},
    "balance": {label: "Balance (2 d.p.)", icon: "⚖️"},
    "bunsen": {label: "Bunsen Burner", icon: "🔥"},
    "stirring_rod": {label: "Stirring Rod", icon: "🥢"},
    "filter_paper": {label: "Filter Paper + Funnel", icon: "🫧"},
    "dropper": {label: "Dropper / Teat Pipette", icon: "💧"},
    "splint": {label: "Lighted Splint", icon: "🕯️"},
    "litmus_red": {label: "Damp Red Litmus Paper", icon: "📄"},
};

// Reaction logic
function simulateReaction(vessel, action, params = {}) {
    const contents = vessel.contents || [];
    const chemicals = contents.map(c => c.chemical);
    const result = {observation: null, colorChange: null, precipitate: null, gas: null, newColor: vessel.color, hasPrecipitate: false};

// Thiosulfate + HCl -> cloudiness
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
                colorChange: "clear → cloudy/opaque yellow-white"
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
            colorChange: "blue → colourless + red-brown solid"
        };
    }

// KMnO4 + Na2S2O3
    if (chemicals.includes("KMnO4_acid") && chemicals.includes("Na2S2O3")) {
        return {
            ...result,
            observation: "Purple KMnO₄ decolourised immediately to colourless. S₂O₃²⁻ reduces MnO₄⁻.",
            newColor: "#f5f5f5",
            colorChange: "purple → colourless"
        };
    }

// KMnO4 + Na2SO3
    if (chemicals.includes("KMnO4_acid") && chemicals.includes("Na2SO3")) {
        return {
            ...result,
            observation: "Purple KMnO₄ decolourised to colourless. SO₃²⁻ reduces MnO₄⁻.",
            newColor: "#f5f5f5",
            colorChange: "purple → colourless"
        };
    }

// BaCl2 + Na2SO4 or Na2SO3
    if (chemicals.includes("BaCl2") && chemicals.includes("Na2S2O3")) {
        return {
            ...result,
            observation: "No precipitate observed immediately. On standing with H⁺, off-white/pale yellow precipitate forms slowly.",
            precipitate: "off-white/pale yellow ppt slowly",
            hasPrecipitate: true
        };
    }
    if (chemicals.includes("BaCl2") && (chemicals.includes("H2SO4") || chemicals.includes("CuSO4"))) {
        return {
            ...result,
            observation: "White precipitate forms immediately. Insoluble in excess dilute HCl. BaSO₄ confirmed.",
            newColor: "#f8f8f8",
            precipitate: "BaSO₄ – white ppt, insoluble in dilute HCl",
            hasPrecipitate: true
        };
    }
    if (chemicals.includes("BaCl2") && chemicals.includes("Na2SO3")) {
        return {
            ...result,
            observation: "White precipitate forms. Soluble in excess dilute strong acid (BaSO₃ dissolves in HCl).",
            newColor: "#f5f5f5",
            precipitate: "BaSO₃ – white ppt, soluble in dilute HCl",
            hasPrecipitate: true
        };
    }

// Mg + HCl or H2SO4
    if ((chemicals.includes("Mg_powder") || chemicals.includes("Mg_ribbon")) && (chemicals.includes("HCl") || chemicals.includes("H2SO4"))) {
        return {
            ...result,
            observation: "Vigorous effervescence. Mg dissolves. Gas pops with lighted splint (H₂). Solution warms.",
            gas: "H₂ – pops with lighted splint",
            colorChange: "colourless (effervescence)"
        };
    }

// NaOH + CuSO4
    if (chemicals.includes("NaOH") && chemicals.includes("CuSO4")) {
        return {
            ...result,
            observation: "Pale blue precipitate forms. Insoluble in excess NaOH. Cu(OH)₂(s).",
            newColor: "#b8d4e8",
            precipitate: "Cu(OH)₂ – pale blue ppt, insoluble in excess",
            hasPrecipitate: true
        };
    }

// Starch + iodine indicator
    if (chemicals.includes("starch") && chemicals.includes("FA3_oxidiser")) {
        return {
            ...result,
            observation: "Dark blue-black colour appears indicating iodine present.",
            newColor: "#1a1a4a",
            colorChange: "colourless → blue-black (starch-iodine)"
        };
    }

// Titration: Na2S2O3 titrant + FA3_oxidiser (iodometric)
    if (chemicals.includes("Na2S2O3_titrant") && chemicals.includes("FA3_oxidiser")) {
        return {
            ...result,
            observation: "Yellow-brown iodine colour fades. Near endpoint add starch → blue-black. At endpoint blue-black disappears to colourless.",
            colorChange: "yellow-brown → (blue-black with starch) → colourless at endpoint"
        };
    }

// H2O2 + KMnO4
    if (chemicals.includes("H2O2") && chemicals.includes("FA3_oxidiser")) {
        return {
            ...result,
            observation: "Effervescence. Gas relights glowing splint (O₂). FA3 oxidised H₂O₂ or FA3 reduced by H₂O₂.",
            gas: "O₂ – relights glowing splint"
        };
    }

// Heating crucible with potassium alum
    if (chemicals.includes("potassium_alum_hydrated") && action === "heat") {
        const mass = contents.find(c => c.chemical === "potassium_alum_hydrated")?.mass || 5;
        const residueMass = (mass * 258.2 / 474.4).toFixed(2);
        return {
            ...result,
            observation: `White crystalline solid loses water. On first heating: sizzling and bubbling as water escapes. After strong heating: white powdery anhydrous residue (~${residueMass}g). Mass loss = ${(mass - parseFloat(residueMass)).toFixed(2)}g (= water of crystallisation).`,
            colorChange: "white crystals → white powder (anhydrous)"
        };
    }

    if (action === "heat" && contents.length > 0) {
        return {...result, observation: "Solution/mixture warms. Temperature increases."};
    }
    if (action === "stir" && contents.length > 0) {
        return {...result, observation: "Contents mixed thoroughly. No visible change."};
    }
    if (action === "filter") {
        return {
            ...result,
            observation: "Filtration complete. Residue collected on filter paper. Filtrate collected in receiving vessel."
        };
    }
    return {
        ...result,
        observation: contents.length === 0 ? "Vessel is empty." : "No reaction observed. Note all observations."
    };
}

// ============================================================
// QUESTION PAPER DATA
// ============================================================
const QUESTION_PAPER = {
    title: "Cambridge International AS & A Level Chemistry 9701/33",
    subtitle: "Paper 3 Advanced Practical Skills 1 – Practice Simulation",
    time: "2 hours",
    marks: 40,
    questions: [
        {
            id: "Q1",
            type: "quantitative",
            title: "Question 1 – Rate of Reaction (Thiosulfate Clock)",
            marks: 17,
            context: `The ionic equation for the reaction between sodium thiosulfate and hydrochloric acid is:
S₂O₃²⁻(aq) + 2H⁺(aq) → S(s) + SO₂(aq) + H₂O(l)

The solid sulfur formed causes the reaction mixture to become cloudy. You will investigate the relationship between the concentration of sodium thiosulfate and the rate of reaction.

FA 1 = 0.10 mol/dm³ sodium thiosulfate (Na₂S₂O₃)
FA 2 = 2.00 mol/dm³ hydrochloric acid (HCl)`,
            parts: [
                {
                    id: "Q1a",
                    label: "(a) Experiment 1",
                    instruction: "Transfer 25.00 cm³ of FA 1 into a 100 cm³ beaker. Add 10.0 cm³ FA 2. Start stop-clock. Stop when mixture becomes opaque. Record reaction time.",
                    requiredActions: ["add_Na2S2O3_25", "add_HCl_10", "start_clock", "record_time"],
                    marks: 2,
                    hint: "Use burette for FA 1, measuring cylinder for FA 2"
                },
                {
                    id: "Q1b",
                    label: "(b) Experiment 2",
                    instruction: "Transfer 12.50 cm³ of FA 1 + 12.50 cm³ distilled water into beaker. Add 10.0 cm³ FA 2. Record reaction time.",
                    requiredActions: ["add_Na2S2O3_12.5", "add_water_12.5", "add_HCl_10", "record_time"],
                    marks: 2
                },
                {
                    id: "Q1c",
                    label: "(c) Experiments 3–5",
                    instruction: "Carry out 3 further experiments with different volumes of FA 1 (not less than 12.50 cm³). Add distilled water to keep total volume of FA 1 + water = 25.00 cm³.",
                    marks: 4
                },
                {
                    id: "Q1d",
                    label: "(d) Graph",
                    instruction: "Plot relative rate (= 1000/time) on y-axis vs volume of FA 1 on x-axis. Draw line of best fit. From graph, predict reaction time for 23.50 cm³ FA 1.",
                    marks: 6
                },
                {
                    id: "Q1e",
                    label: "(e) Analysis",
                    instruction: "State the effect on reaction time of NOT drying the beaker before each experiment. Explain your answer.",
                    marks: 1,
                    answerKey: "Time would be longer. Extra water dilutes the concentration of sodium thiosulfate (FA 1), reducing the rate of reaction."
                },
                {
                    id: "Q1f",
                    label: "(f) Evaluation",
                    instruction: "A student repeats Experiment 1 using a 250 cm³ beaker instead of 100 cm³. Is the statement correct: 'A longer time is recorded because the rate of sulfur production is slower'? Explain.",
                    marks: 1,
                    answerKey: "The student is NOT correct. The rate of production of sulfur is the same (concentrations unchanged). The time is longer because the depth of solution is less in the wider beaker, so more sulfur must accumulate to obscure the insert."
                }
            ]
        },
        {
            id: "Q2",
            type: "energetics",
            title: "Question 2 – Enthalpy Change (CuSO₄ + Mg)",
            marks: 10,
            context: `Determine the enthalpy change ΔH for:
CuSO₄(aq) + Mg(s) → Cu(s) + MgSO₄(aq)

FA 3 = 1.0 mol/dm³ copper(II) sulfate, CuSO₄
FA 4 = magnesium powder, Mg`,
            parts: [
                {
                    id: "Q2a",
                    label: "(a) Experiment",
                    instruction: "Transfer 50.0 cm³ FA 3 into polystyrene cup. Weigh FA 4 container. Measure initial temperature of FA 3. Add FA 4 and stir constantly. Record maximum temperature. Reweigh container.",
                    requiredActions: ["measure_50cm3_CuSO4", "weigh_Mg", "record_temp_initial", "add_Mg", "stir", "record_temp_max"],
                    marks: 3
                },
                {
                    id: "Q2b",
                    label: "(b)(i) Heat energy",
                    instruction: "Calculate heat energy produced: q = mcΔT using m = 50 g, c = 4.18 J g⁻¹ K⁻¹",
                    marks: 1,
                    calculationGuide: "q = 50 × 4.18 × ΔT (J)"
                },
                {
                    id: "Q2c",
                    label: "(b)(ii) Excess reactant",
                    instruction: "Determine which reactant (FA 3 or FA 4) is in excess. Show working. [Mg: Mr = 24.3; CuSO4: 0.05 dm³ × 1.0 mol/dm³ = 0.050 mol]",
                    marks: 1,
                    answerKey: "Amount FA 3 (CuSO₄) = 0.05 × 1.0 = 0.050 mol. Amount FA 4 (Mg) = mass/24.3. FA 3 (CuSO₄) is typically in excess."
                },
                {
                    id: "Q2d",
                    label: "(b)(iii) ΔH",
                    instruction: "Calculate ΔH in kJ mol⁻¹. Use limiting reagent moles. Sign must be negative (exothermic).",
                    marks: 2,
                    calculationGuide: "ΔH = −q / (1000 × n) kJ/mol (negative)"
                },
                {
                    id: "Q2e",
                    label: "(c) Improvement",
                    instruction: "Describe how to improve accuracy of ΔH by addressing heat loss. Include method changes and graph processing.",
                    marks: 3,
                    answerKey: "Record temperature at regular intervals before addition (to establish baseline). Add Mg at known time. Record temperature at regular intervals after addition. Plot temperature vs time. Extrapolate both lines back to time of addition to find true ΔT_max."
                }
            ]
        },
        {
            id: "Q3",
            type: "qualitative",
            title: "Question 3 – Qualitative Analysis",
            marks: 13,
            context: `FA 5, FA 6 and FA 7 each contain an anion with sulfur. None of the anions is present in more than one compound. None of the solutions contains a cation listed in the QA notes.

FA 5 = Na₂S₂O₃ (sodium thiosulfate)
FA 6 = H₂SO₄ (sulfuric acid)  
FA 7 = Na₂SO₃ (sodium sulfite)
FA 8 = Cu₂O (copper(I) oxide, solid)`,
            parts: [
                {
                    id: "Q3a",
                    label: "(a) Table 3.1 – Tests on FA 5, FA 6, FA 7",
                    instruction: "For each solution use 1 cm depth. Perform Test 1: add acidified KMnO₄ then leave 2 min. Test 2: add Mg ribbon. Test 3: add BaCl₂. Record ALL observations.",
                    marks: 5,
                    expectedObservations: {
                        "FA5_test1": "Purple KMnO₄ turns colourless/decolourised. After 2 min: off-white/pale yellow precipitate slowly forms.",
                        "FA5_test2": "No change (no effervescence, no reaction).",
                        "FA5_test3": "Off-white/pale yellow precipitate forms slowly.",
                        "FA6_test1": "No change. Purple colour persists (SO₄²⁻ does not reduce KMnO₄).",
                        "FA6_test2": "Vigorous effervescence. Mg dissolves. Gas pops with lighted splint (H₂).",
                        "FA6_test3": "White precipitate forms (BaSO₄). Insoluble in excess dilute HCl.",
                        "FA7_test1": "Purple KMnO₄ decolourised. White precipitate on standing.",
                        "FA7_test2": "No effervescence (no H⁺).",
                        "FA7_test3": "White precipitate (BaSO₃). Soluble in excess dilute HCl."
                    }
                },
                {
                    id: "Q3b",
                    label: "(b)(i) Identify anions",
                    instruction: "Use your observations to identify the anion formula for FA 5, FA 6, FA 7.",
                    marks: 2,
                    answerKey: "FA 5: S₂O₃²⁻ | FA 6: SO₄²⁻ | FA 7: SO₃²⁻"
                },
                {
                    id: "Q3c",
                    label: "(b)(ii) Cation in FA 6",
                    instruction: "Suggest the cation in FA 6 and carry out a further test to confirm. Record test and observations.",
                    marks: 2,
                    answerKey: "Cation is H⁺. Test: add Na₂CO₃ → effervescence (CO₂), or add indicator (e.g. litmus → red). Na₂CO₃ gives CO₂ which turns limewater white."
                },
                {
                    id: "Q3d",
                    label: "(c) Ionic equation",
                    instruction: "Write an ionic equation with state symbols for one reaction from Test 2 or Test 3.",
                    marks: 1,
                    answerKey: "Mg(s) + 2H⁺(aq) → Mg²⁺(aq) + H₂(g)  OR  Ba²⁺(aq) + SO₄²⁻(aq) → BaSO₄(s)  OR  Ba²⁺(aq) + SO₃²⁻(aq) → BaSO₃(s)"
                },
                {
                    id: "Q3e",
                    label: "(d)(i) FA 8 in FA 6",
                    instruction: "Gently warm FA 6. Add FA 8. Filter. Describe residue and filtrate.",
                    marks: 1,
                    answerKey: "Residue: red-brown/brown solid (Cu). Filtrate: pale blue solution (Cu²⁺ ions formed)."
                },
                {
                    id: "Q3f",
                    label: "(d)(ii) Filtrate + KI",
                    instruction: "Add equal volume KI to filtrate. Record observations.",
                    marks: 1,
                    answerKey: "Brown/yellow-brown/orange-brown precipitate or solution darkens (iodine liberated: 2Cu²⁺ + 4I⁻ → 2CuI + I₂)."
                },
                {
                    id: "Q3g",
                    label: "(d)(iii) + NaOH",
                    instruction: "Add NaOH to filtrate from (d)(ii). Record observations.",
                    marks: 1,
                    answerKey: "Pale blue precipitate (Cu(OH)₂) forms. Insoluble in excess NaOH."
                }
            ]
        }
    ]
};

// ============================================================
// EVALUATION ENGINE
// ============================================================
function evaluateLog(actionLog) {
    const score = {Q1: 0, Q2: 0, Q3: 0, total: 0, maxMarks: 40, feedback: []};

    const has = (keyword) => actionLog.some(a =>
        JSON.stringify(a).toLowerCase().includes(keyword.toLowerCase())
    );
    const hasAll = (...keywords) => keywords.every(k => has(k));
    const count = (keyword) => actionLog.filter(a =>
        JSON.stringify(a).toLowerCase().includes(keyword.toLowerCase())
    ).length;

// Q1 Scoring
    let q1 = 0;
    if (has("na2s2o3") && has("hcl")) {
        q1 += 2;
        score.feedback.push("✅ Q1: Thiosulfate + HCl reaction performed");
    } else score.feedback.push("❌ Q1: Did not mix Na₂S₂O₃ with HCl");
    if (has("stop_clock") || has("time")) {
        q1 += 1;
        score.feedback.push("✅ Q1: Timing recorded");
    } else score.feedback.push("❌ Q1: No timing recorded");
    if (has("distilled_water")) {
        q1 += 1;
        score.feedback.push("✅ Q1: Distilled water used for dilution");
    }
    if (count("hcl") >= 3) {
        q1 += 2;
        score.feedback.push("✅ Q1: Multiple experiments performed");
    } else score.feedback.push("⚠️ Q1: Fewer than 3 repeat experiments");
    if (has("graph") || has("rate") || has("1000")) {
        q1 += 2;
        score.feedback.push("✅ Q1: Rate calculations noted");
    }
    score.Q1 = Math.min(q1, 14);

// Q2 Scoring
    let q2 = 0;
    if (has("cuso4") && has("mg")) {
        q2 += 2;
        score.feedback.push("✅ Q2: CuSO₄ + Mg reaction performed");
    } else score.feedback.push("❌ Q2: CuSO₄ + Mg not mixed");
    if (has("thermometer") || has("temperature") || has("temp")) {
        q2 += 1;
        score.feedback.push("✅ Q2: Temperature measured");
    } else score.feedback.push("❌ Q2: Temperature not recorded");
    if (has("balance") || has("mass") || has("weigh")) {
        q2 += 1;
        score.feedback.push("✅ Q2: Mass of Mg recorded");
    }
    if (has("stir")) {
        q2 += 1;
        score.feedback.push("✅ Q2: Mixture stirred");
    }
    if (has("delta") || has("enthalpy") || has("kj")) {
        q2 += 2;
        score.feedback.push("✅ Q2: ΔH calculation attempted");
    }
    score.Q2 = Math.min(q2, 10);

// Q3 Scoring
    let q3 = 0;
    if (has("kmno4") || has("kmno4_acid")) {
        q3 += 2;
        score.feedback.push("✅ Q3: KMnO₄ test performed");
    } else score.feedback.push("❌ Q3: Acidified KMnO₄ not used");
    if (has("bacl2")) {
        q3 += 1;
        score.feedback.push("✅ Q3: BaCl₂ test performed");
    } else score.feedback.push("❌ Q3: BaCl₂ test not done");
    if (has("mg_ribbon") || (has("mg") && has("fa"))) {
        q3 += 1;
        score.feedback.push("✅ Q3: Mg ribbon test done");
    }
    if (has("naoh")) {
        q3 += 1;
        score.feedback.push("✅ Q3: NaOH test performed");
    }
    if (has("s2o3") || has("thiosulfate")) {
        q3 += 1;
        score.feedback.push("✅ Q3: Thiosulfate anion identified");
    }
    if (has("so4") || has("sulfate")) {
        q3 += 1;
        score.feedback.push("✅ Q3: Sulfate anion identified");
    }
    if (has("so3") || has("sulfite")) {
        q3 += 1;
        score.feedback.push("✅ Q3: Sulfite anion identified");
    }
    score.Q3 = Math.min(q3, 13);

    score.total = score.Q1 + score.Q2 + score.Q3;
    const grade = score.total >= 32 ? "A*" : score.total >= 28 ? "A" : score.total >= 24 ? "B" : score.total >= 20 ? "C" : score.total >= 16 ? "D" : "U";
    score.grade = grade;

    return score;
}

// ============================================================
// MAIN APP COMPONENT
// ============================================================
export default function ChemLabApp() {
    const [activeTab, setActiveTab] = useState("paper"); // paper | lab | evaluate
    const [vessels, setVessels] = useState([]);
    const [selectedVessel, setSelectedVessel] = useState(null);
    const [actionLog, setActionLog] = useState([]);
    const [logHistory, setLogHistory] = useState([[]]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [lastObservation, setLastObservation] = useState("");
    const [studentNotes, setStudentNotes] = useState("");
    const [showEvaluation, setShowEvaluation] = useState(false);
    const [evaluation, setEvaluation] = useState(null);
    const [selectedChemical, setSelectedChemical] = useState("");
    const [selectedEquipment, setSelectedEquipment] = useState("");
    const [addVolume, setAddVolume] = useState(10);
    const [addMass, setAddMass] = useState(1);
    const [isRunning, setIsRunning] = useState(false);
    const [clockTime, setClockTime] = useState(0);
    const [clockRunning, setClockRunning] = useState(false);
    const [bureteReading, setBuretteReading] = useState(0);
    const [expandedQ, setExpandedQ] = useState("Q1");
    const [transferDestId, setTransferDestId] = useState(null);
    const [transferAmount, setTransferAmount] = useState(10);
    const clockRef = useRef(null);

// Stop-clock logic
    useEffect(() => {
        if (clockRunning) {
            clockRef.current = setInterval(() => setClockTime(t => t + 1), 1000);
        } else {
            clearInterval(clockRef.current);
        }
        return () => clearInterval(clockRef.current);
    }, [clockRunning]);

    const pushLog = useCallback((entry) => {
        const newLog = [...actionLog, {...entry, timestamp: new Date().toLocaleTimeString()}];
        setActionLog(newLog);
        const newHistory = logHistory.slice(0, historyIndex + 1);
        newHistory.push(newLog);
        setLogHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [actionLog, logHistory, historyIndex]);

    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(i => i - 1);
            setActionLog(logHistory[historyIndex - 1]);
        }
    };
    const redo = () => {
        if (historyIndex < logHistory.length - 1) {
            setHistoryIndex(i => i + 1);
            setActionLog(logHistory[historyIndex + 1]);
        }
    };

    const createVessel = (equipmentId) => {
        const eq = EQUIPMENT[equipmentId];
        const newVessel = {
            id: Date.now(),
            type: equipmentId,
            label: eq.label,
            icon: eq.icon,
            contents: [],
            color: "#f0f8ff",
            observations: [],
            temp: 22,
        };
        setVessels(v => [...v, newVessel]);
        pushLog({action: "equipment_selected", equipment: eq.label, details: `Added ${eq.label} to bench`});
    };

    const addChemicalToVessel = () => {
        if (!selectedVessel || !selectedChemical) return;
        const chem = CHEMICALS[selectedChemical];
        if (!chem) return;

        const amount = chem.type === "solid" ? {mass: addMass} : {volume: addVolume};
        const amountStr = chem.type === "solid" ? `${addMass}g` : `${addVolume} cm³`;

        setVessels(vs => vs.map(v => {
            if (v.id !== selectedVessel) return v;
            const existing = v.contents.find(c => c.chemical === selectedChemical);
            let newContents;
            if (existing) {
                newContents = v.contents.map(c => c.chemical === selectedChemical
                    ? {...c, volume: (c.volume || 0) + (amount.volume || 0), mass: (c.mass || 0) + (amount.mass || 0)}
                    : c
                );
            } else {
                newContents = [...v.contents, {chemical: selectedChemical, label: chem.label, ...amount}];
            }
            // Check reaction
            const tempVessel = {...v, contents: newContents};
            const rxn = simulateReaction(tempVessel, "add");
            if (rxn.observation) setLastObservation(`[${v.label}] Added ${amountStr} ${chem.label}: ${rxn.observation}`);
            return {
                ...v,
                contents: newContents,
                color: rxn.newColor || v.color,
                hasPrecipitate: v.hasPrecipitate || rxn.hasPrecipitate,
                precipitateLabel: rxn.precipitate || v.precipitateLabel,
                observations: rxn.observation ? [...v.observations, rxn.observation] : v.observations,
                temp: rxn.tempChange ? v.temp + rxn.tempChange : v.temp,
                reactionTime: rxn.reactionTime || v.reactionTime,
            };
        }));

        pushLog({
            action: "add_chemical",
            chemical: selectedChemical,
            amount: amountStr,
            vessel: vessels.find(v => v.id === selectedVessel)?.label,
            details: `Added ${amountStr} of ${chem.label}`
        });
    };

    const performAction = (action) => {
        if (!selectedVessel) {
            setLastObservation("⚠️ Please select a vessel first!");
            return;
        }
        const vessel = vessels.find(v => v.id === selectedVessel);
        if (!vessel) return;

        let obs = "";
        if (action === "heat") {
            const rxn = simulateReaction(vessel, "heat");
            obs = rxn.observation;
            setVessels(vs => vs.map(v => v.id === selectedVessel
                ? {...v, temp: Math.min(v.temp + 15, 100), observations: [...v.observations, obs]}
                : v
            ));
        } else if (action === "stir") {
            obs = "Stirred vigorously. Contents well mixed.";
            const rxn = simulateReaction(vessel, "stir");
            obs = rxn.observation || obs;
        } else if (action === "filter") {
            const solidContents = vessel.contents.filter(c => CHEMICALS[c.chemical]?.type === "solid");
            const liquidContents = vessel.contents.filter(c => CHEMICALS[c.chemical]?.type !== "solid");
            const hasSolid = solidContents.length > 0 || vessel.hasPrecipitate;

            if (hasSolid) {
                const residueLabel = vessel.precipitateLabel
                    ? `Residue: ${vessel.precipitateLabel}`
                    : "Solid residue on filter paper";
                const filtrateVessel = {
                    id: Date.now() + 1,
                    type: "beaker_100",
                    label: `Beaker (100 cm³) [Filtrate from ${vessel.label}]`,
                    icon: "🫙",
                    contents: liquidContents,
                    color: "#e8f4f8",
                    observations: [`Filtrate collected from ${vessel.label}`],
                    temp: vessel.temp,
                    hasPrecipitate: false,
                };
                setVessels(vs => [
                    ...vs.map(v => v.id === selectedVessel
                        ? {...v, contents: solidContents, hasPrecipitate: false, color: "#e8e8e8",
                            observations: [...v.observations, residueLabel]}
                        : v),
                    filtrateVessel,
                ]);
                obs = `Filter complete. ${residueLabel}. Filtrate collected in new beaker.`;
            } else {
                obs = "Solution filtered through filter paper. No solid residue observed.";
            }
        } else if (action === "start_clock") {
            setClockRunning(true);
            obs = "⏱ Stop-clock started.";
        } else if (action === "stop_clock") {
            setClockRunning(false);
            obs = `⏱ Stop-clock stopped at ${clockTime}s. ` + (vessel.reactionTime ? `Expected reaction time ~${vessel.reactionTime}s.` : "");
        } else if (action === "measure_temp") {
            obs = `🌡 Temperature of contents: ${vessel.temp}°C`;
        } else if (action === "weigh") {
            const totalMass = vessel.contents.filter(c => CHEMICALS[c.chemical]?.type === "solid").reduce((s, c) => s + (c.mass || 0), 0);
            obs = `⚖️ Mass of solid contents: ${totalMass.toFixed(2)}g`;
        } else if (action === "test_gas_splint") {
            const hasGas = vessel.observations.some(o => o.includes("H₂") || o.includes("pops"));
            obs = hasGas ? "🕯️ Gas pops with lighted splint → Hydrogen confirmed!" : "🕯️ Gas does not pop with splint.";
        } else if (action === "test_gas_glowing") {
            const hasO2 = vessel.observations.some(o => o.includes("O₂") || o.includes("relights"));
            obs = hasO2 ? "🕯️ Glowing splint relights → Oxygen confirmed!" : "🕯️ Glowing splint does not relight.";
        } else if (action === "test_litmus") {
            const hasNH3 = vessel.observations.some(o => o.includes("NH₃") || o.includes("ammonia"));
            obs = hasNH3 ? "📄 Damp red litmus turns blue → Ammonia confirmed!" : "📄 Litmus does not change colour.";
        }

        setLastObservation(`[${vessel.label}] ${action.replace(/_/g, ' ')}: ${obs}`);
        // filter already called setVessels internally; all other actions need it
        if (action !== "filter" && action !== "heat") {
            setVessels(vs => vs.map(v => v.id === selectedVessel && obs
                ? {...v, observations: [...v.observations, obs]}
                : v
            ));
        }
        pushLog({action, vessel: vessel.label, observation: obs, details: obs});
    };

    const transferContents = () => {
        const sourceVessel = vessels.find(v => v.id === selectedVessel);
        const destVessel = vessels.find(v => v.id === transferDestId);
        if (!sourceVessel || !destVessel) return;

        const totalVolume = sourceVessel.contents.reduce((s, c) => s + (c.volume || 0), 0);
        const fraction = totalVolume > 0
            ? Math.min(transferAmount / totalVolume, 1)
            : 1;

        setVessels(vs => vs.map(v => {
            if (v.id === selectedVessel) {
                const newContents = sourceVessel.contents
                    .map(c => ({
                        ...c,
                        volume: c.volume != null ? +(c.volume * (1 - fraction)).toFixed(2) : undefined,
                        mass:   c.mass   != null ? +(c.mass   * (1 - fraction)).toFixed(3) : undefined,
                    }))
                    .filter(c => (c.volume ?? 0) > 0.005 || (c.mass ?? 0) > 0.001);
                return {...v, contents: newContents};
            }
            if (v.id === transferDestId) {
                const transferred = sourceVessel.contents.map(c => ({
                    ...c,
                    volume: c.volume != null ? +(c.volume * fraction).toFixed(2) : undefined,
                    mass:   c.mass   != null ? +(c.mass   * fraction).toFixed(3) : undefined,
                }));
                let merged = [...v.contents];
                transferred.forEach(tc => {
                    const existing = merged.find(c => c.chemical === tc.chemical);
                    if (existing) {
                        merged = merged.map(c => c.chemical === tc.chemical
                            ? {...c,
                                volume: c.volume != null ? +((c.volume||0) + (tc.volume||0)).toFixed(2) : undefined,
                                mass:   c.mass   != null ? +((c.mass  ||0) + (tc.mass  ||0)).toFixed(3) : undefined,
                              }
                            : c);
                    } else {
                        merged.push(tc);
                    }
                });
                const tempVessel = {...v, contents: merged};
                const rxn = simulateReaction(tempVessel, "add");
                const obs = `Transfer from ${sourceVessel.label}: ${rxn.observation}`;
                if (rxn.observation) setLastObservation(`[${v.label}] ${obs}`);
                return {
                    ...v,
                    contents: merged,
                    color: rxn.newColor || v.color,
                    observations: rxn.observation ? [...v.observations, obs] : v.observations,
                    temp: rxn.tempChange ? v.temp + rxn.tempChange : v.temp,
                };
            }
            return v;
        }));

        pushLog({
            action: "transfer",
            vessel: sourceVessel.label,
            details: `Transferred ${transferAmount} cm³ from ${sourceVessel.label} → ${destVessel.label}`,
        });
    };

    const runEvaluation = () => {
        const result = evaluateLog(actionLog);
        setEvaluation(result);
        setActiveTab("evaluate");
    };

    const clearBench = () => {
        setVessels([]);
        setSelectedVessel(null);
        setLastObservation("");
    };

// ======================= RENDER =======================
    return (
        <div style={{
            fontFamily: "'Crimson Text', Georgia, serif",
            background: "linear-gradient(135deg, #0a1628 0%, #1a2d4a 50%, #0f2035 100%)",
            minHeight: "100vh",
            color: "#e8dcc8",
        }}>
            {/* Google Fonts */}
            <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;600&family=Playfair+Display:wght@700;900&display=swap');
    
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #0a1628; }
    ::-webkit-scrollbar-thumb { background: #2a5a8a; border-radius: 3px; }

    .tab-btn { 
      background: transparent; border: 1px solid #2a5a8a; color: #8ab4d4;
      padding: 8px 20px; cursor: pointer; transition: all 0.2s;
      font-family: 'Crimson Text', serif; font-size: 15px; letter-spacing: 0.5px;
    }
    .tab-btn:hover { background: #1a3a5a; color: #c8e0f4; }
    .tab-btn.active { background: #1a4a7a; color: #e8f4ff; border-color: #4a9adf; }

    .vessel-card {
      background: rgba(255,255,255,0.05); border: 1px solid #2a4a6a;
      border-radius: 8px; padding: 12px; cursor: pointer; transition: all 0.2s;
      margin-bottom: 8px;
    }
    .vessel-card:hover { border-color: #4a9adf; background: rgba(74,154,223,0.1); }
    .vessel-card.selected { border-color: #4af; background: rgba(68,170,255,0.15); box-shadow: 0 0 12px rgba(68,170,255,0.3); }

    .chem-btn {
      background: rgba(255,255,255,0.06); border: 1px solid #2a4a6a;
      color: #c8dce8; padding: 6px 10px; cursor: pointer; transition: all 0.15s;
      font-size: 12px; border-radius: 4px; text-align: left; width: 100%;
      font-family: 'Crimson Text', serif;
    }
    .chem-btn:hover { background: rgba(74,154,223,0.2); border-color: #4a9adf; }
    .chem-btn.selected { background: rgba(74,154,223,0.3); border-color: #7ac; }

    .action-btn {
      background: linear-gradient(135deg, #1a3a5a, #1a4a6a);
      border: 1px solid #3a6a9a; color: #c8e4f8; padding: 8px 14px;
      cursor: pointer; border-radius: 6px; font-size: 13px; transition: all 0.2s;
      font-family: 'Crimson Text', serif;
    }
    .action-btn:hover { background: linear-gradient(135deg, #2a4a6a, #2a5a7a); transform: translateY(-1px); }
    .action-btn:active { transform: translateY(0); }
    .action-btn.danger { background: linear-gradient(135deg, #5a1a1a, #7a2a2a); border-color: #9a3a3a; }
    .action-btn.success { background: linear-gradient(135deg, #1a5a2a, #1a6a3a); border-color: #2a9a4a; }

    .obs-box {
      background: rgba(0,0,0,0.3); border: 1px solid #2a5a3a;
      border-radius: 6px; padding: 12px; font-family: 'JetBrains Mono', monospace;
      font-size: 12px; color: #a8d8b8; line-height: 1.6; white-space: pre-wrap;
    }

    .log-entry {
      border-bottom: 1px solid rgba(42,90,138,0.3);
      padding: 6px 0; font-size: 12px; font-family: 'JetBrains Mono', monospace;
    }
    .log-entry:last-child { border-bottom: none; }

    select, input[type=number], textarea {
      background: rgba(0,0,0,0.4); border: 1px solid #2a5a8a;
      color: #c8dce8; padding: 6px 10px; border-radius: 4px;
      font-family: 'Crimson Text', serif; font-size: 14px;
    }
    select:focus, input:focus, textarea:focus { outline: none; border-color: #4a9adf; }
    option { background: #0a1628; }

    .q-card {
      background: rgba(255,255,255,0.03); border: 1px solid #2a4a6a;
      border-radius: 10px; margin-bottom: 16px; overflow: hidden;
    }
    .q-header {
      background: linear-gradient(90deg, rgba(26,58,90,0.8), transparent);
      padding: 14px 18px; cursor: pointer; display: flex; justify-content: space-between;
      align-items: center;
    }
    .q-body { padding: 18px; }

    .score-bar {
      height: 20px; background: rgba(0,0,0,0.3); border-radius: 10px; overflow: hidden;
    }
    .score-fill {
      height: 100%; border-radius: 10px; transition: width 1s ease;
      background: linear-gradient(90deg, #2a8a4a, #4adf7a);
    }

    .vessel-visual {
      width: 60px; height: 80px; margin: 0 auto 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 36px; position: relative;
    }
    .vessel-liquid {
      position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%);
      width: 40px; height: 20px; border-radius: 0 0 8px 8px;
      transition: background 0.5s;
    }
  `}</style>

            {/* Header */}
            <div style={{
                background: "rgba(0,0,0,0.4)",
                borderBottom: "1px solid #1a3a5a",
                padding: "16px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <div>
                    <div style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 22,
                        fontWeight: 900,
                        color: "#c8e8ff",
                        letterSpacing: "1px"
                    }}>
                        ⚗️ Cambridge Chemistry Lab Simulator
                    </div>
                    <div style={{fontSize: 12, color: "#6a9abf", letterSpacing: "2px", textTransform: "uppercase"}}>
                        AS & A Level · 9701/33 · Advanced Practical Skills
                    </div>
                </div>
                <div style={{display: "flex", gap: 8, alignItems: "center"}}>
                    <div style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 18,
                        color: clockRunning ? "#4adf7a" : "#8ab4d4",
                        background: "rgba(0,0,0,0.4)",
                        padding: "6px 14px",
                        borderRadius: 6,
                        border: `1px solid ${clockRunning ? "#2a8a4a" : "#2a5a8a"}`
                    }}>
                        ⏱ {String(Math.floor(clockTime / 60)).padStart(2, '0')}:{String(clockTime % 60).padStart(2, '0')}
                    </div>
                    <button className="action-btn" style={{fontSize: 11}} onClick={undo} disabled={historyIndex === 0}>↩
                        Undo
                    </button>
                    <button className="action-btn" style={{fontSize: 11}} onClick={redo}
                            disabled={historyIndex >= logHistory.length - 1}>↪ Redo
                    </button>
                </div>
            </div>

            {/* Tab Bar */}
            <div style={{display: "flex", gap: 2, padding: "12px 24px 0", borderBottom: "1px solid #1a3a5a"}}>
                {[["paper", "📋 Question Paper"], ["lab", "🧪 Laboratory"], ["evaluate", "📊 Evaluate"]].map(([id, label]) => (
                    <button key={id} className={`tab-btn ${activeTab === id ? 'active' : ''}`}
                            onClick={() => setActiveTab(id)}>{label}</button>
                ))}
                <div style={{flex: 1}}/>
                <button className="action-btn success" style={{marginBottom: 4}} onClick={runEvaluation}>
                    🎓 Submit & Evaluate
                </button>
            </div>

            {/* ================== QUESTION PAPER TAB ================== */}
            {activeTab === "paper" && (
                <div style={{padding: "24px", maxWidth: 900, margin: "0 auto"}}>
                    <div style={{
                        textAlign: "center",
                        marginBottom: 28,
                        padding: "20px",
                        background: "rgba(0,0,0,0.3)",
                        borderRadius: 10,
                        border: "1px solid #2a4a6a"
                    }}>
                        <div style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 20,
                            color: "#c8e8ff",
                            marginBottom: 4
                        }}>{QUESTION_PAPER.title}</div>
                        <div style={{color: "#8ab4d4", marginBottom: 8}}>{QUESTION_PAPER.subtitle}</div>
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 24,
                            fontSize: 13,
                            color: "#6a9abf"
                        }}>
                            <span>⏰ {QUESTION_PAPER.time}</span>
                            <span>📝 {QUESTION_PAPER.marks} marks</span>
                            <span>📖 Answer all questions</span>
                        </div>
                    </div>

                    <div style={{
                        background: "rgba(180,120,40,0.1)",
                        border: "1px solid #8a6a2a",
                        borderRadius: 8,
                        padding: "10px 16px",
                        marginBottom: 20,
                        fontSize: 13,
                        color: "#d4b86a"
                    }}>
                        ⚠️ <strong>Instructions:</strong> Answer all questions. Show precision of apparatus in recorded
                        data. Show working in calculations. Use the Laboratory tab to perform experiments. Your actions
                        are logged and evaluated.
                    </div>

                    {QUESTION_PAPER.questions.map(q => (
                        <div key={q.id} className="q-card">
                            <div className="q-header" onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}>
                                <div>
                                    <span style={{
                                        fontFamily: "'Playfair Display', serif",
                                        fontSize: 17,
                                        color: "#c8e8ff"
                                    }}>{q.title}</span>
                                    <span style={{
                                        marginLeft: 12,
                                        fontSize: 12,
                                        color: "#6a9abf"
                                    }}>[{q.marks} marks]</span>
                                </div>
                                <span style={{color: "#4a9adf"}}>{expandedQ === q.id ? "▲" : "▼"}</span>
                            </div>
                            {expandedQ === q.id && (
                                <div className="q-body">
                                    <div style={{
                                        background: "rgba(0,0,0,0.2)",
                                        borderRadius: 6,
                                        padding: "12px 16px",
                                        marginBottom: 16,
                                        fontSize: 14,
                                        lineHeight: 1.7,
                                        color: "#a8c8e0",
                                        borderLeft: "3px solid #2a6a9a",
                                        whiteSpace: "pre-line"
                                    }}>
                                        {q.context}
                                    </div>
                                    {q.parts.map(part => (
                                        <div key={part.id} style={{
                                            marginBottom: 16,
                                            padding: "12px 16px",
                                            background: "rgba(255,255,255,0.02)",
                                            borderRadius: 6,
                                            border: "1px solid #1a3a5a"
                                        }}>
                                            <div style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                marginBottom: 8
                                            }}>
                                                <strong style={{
                                                    color: "#c8e8ff",
                                                    fontFamily: "'Playfair Display', serif"
                                                }}>{part.label}</strong>
                                                <span style={{
                                                    fontSize: 12,
                                                    color: "#4a9adf",
                                                    fontFamily: "'JetBrains Mono', monospace"
                                                }}>[{part.marks} mark{part.marks > 1 ? 's' : ''}]</span>
                                            </div>
                                            <div style={{
                                                fontSize: 14,
                                                color: "#a8c8e0",
                                                lineHeight: 1.7,
                                                marginBottom: 10
                                            }}>{part.instruction}</div>
                                            {part.hint &&
                                                <div style={{fontSize: 12, color: "#8a7a4a", fontStyle: "italic"}}>💡
                                                    Hint: {part.hint}</div>}
                                            {part.answerKey && (
                                                <details style={{marginTop: 8}}>
                                                    <summary
                                                        style={{fontSize: 12, color: "#4a9adf", cursor: "pointer"}}>📖
                                                        Show mark scheme answer
                                                    </summary>
                                                    <div style={{
                                                        marginTop: 6,
                                                        padding: "8px 12px",
                                                        background: "rgba(0,80,0,0.15)",
                                                        borderRadius: 4,
                                                        fontSize: 13,
                                                        color: "#8ad8a8",
                                                        border: "1px solid #2a5a3a"
                                                    }}>
                                                        {part.answerKey}
                                                    </div>
                                                </details>
                                            )}
                                            {part.calculationGuide && (
                                                <div style={{
                                                    marginTop: 6,
                                                    padding: "6px 10px",
                                                    background: "rgba(0,0,80,0.2)",
                                                    borderRadius: 4,
                                                    fontSize: 12,
                                                    color: "#8ab4d8",
                                                    fontFamily: "'JetBrains Mono', monospace"
                                                }}>
                                                    Formula: {part.calculationGuide}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Student Notes */}
                    <div style={{
                        marginTop: 20,
                        padding: 20,
                        background: "rgba(0,0,0,0.2)",
                        borderRadius: 10,
                        border: "1px solid #2a4a6a"
                    }}>
                        <div style={{fontFamily: "'Playfair Display', serif", marginBottom: 10, color: "#c8e8ff"}}>📝
                            Student Answer Booklet
                        </div>
                        <textarea
                            value={studentNotes}
                            onChange={e => setStudentNotes(e.target.value)}
                            placeholder="Write your observations, calculations, and conclusions here..."
                            style={{
                                width: "100%",
                                minHeight: 200,
                                resize: "vertical",
                                lineHeight: 1.7,
                                boxSizing: "border-box"
                            }}
                        />
                    </div>
                </div>
            )}

            {/* ================== LAB TAB ================== */}
            {activeTab === "lab" && (
                <div style={{display: "flex", height: "calc(100vh - 130px)", overflow: "hidden"}}>
                    {/* Left Panel: Equipment + Chemicals */}
                    <div style={{
                        width: 240,
                        borderRight: "1px solid #1a3a5a",
                        overflow: "auto",
                        padding: 12,
                        flexShrink: 0
                    }}>
                        <div style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 14,
                            color: "#8ab4d4",
                            marginBottom: 10,
                            letterSpacing: 1
                        }}>EQUIPMENT
                        </div>
                        {Object.entries(EQUIPMENT).map(([id, eq]) => (
                            <button key={id} className="chem-btn" style={{marginBottom: 4}}
                                    onClick={() => createVessel(id)}>
                                {eq.icon} {eq.label}
                            </button>
                        ))}

                        <div style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 14,
                            color: "#8ab4d4",
                            margin: "16px 0 10px",
                            letterSpacing: 1
                        }}>CHEMICALS
                        </div>
                        {Object.entries(CHEMICALS).map(([id, chem]) => (
                            <button
                                key={id}
                                className={`chem-btn ${selectedChemical === id ? 'selected' : ''}`}
                                style={{marginBottom: 3}}
                                onClick={() => setSelectedChemical(selectedChemical === id ? "" : id)}
                            >
                                <div style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: 2,
                                    background: chem.color,
                                    border: "1px solid #888",
                                    display: "inline-block",
                                    marginRight: 6,
                                    verticalAlign: "middle"
                                }}></div>
                                {chem.label}
                            </button>
                        ))}
                    </div>

                    {/* Center: Bench */}
                    <div style={{flex: 1, overflow: "auto", padding: 20}}>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 16
                        }}>
                            <div style={{fontFamily: "'Playfair Display', serif", color: "#c8e8ff", fontSize: 16}}>🧪
                                Laboratory Bench
                            </div>
                            <div style={{display: "flex", gap: 8}}>
                                <button className="action-btn danger" style={{fontSize: 11}} onClick={clearBench}>🗑
                                    Clear Bench
                                </button>
                            </div>
                        </div>

                        {vessels.length === 0 && (
                            <div style={{
                                textAlign: "center",
                                color: "#3a6a9a",
                                padding: 60,
                                border: "2px dashed #1a3a5a",
                                borderRadius: 12
                            }}>
                                <div style={{fontSize: 40, marginBottom: 12}}>⚗️</div>
                                <div style={{fontFamily: "'Playfair Display', serif", fontSize: 18}}>Select equipment
                                    from the left panel
                                </div>
                                <div style={{fontSize: 13, marginTop: 8, color: "#2a5a7a"}}>Click any item to add it to
                                    your bench
                                </div>
                            </div>
                        )}

                        <div style={{display: "flex", flexWrap: "wrap", gap: 12}}>
                            {vessels.map(vessel => (
                                <div
                                    key={vessel.id}
                                    className={`vessel-card ${selectedVessel === vessel.id ? 'selected' : ''}`}
                                    style={{width: 180, position: "relative"}}
                                    onClick={() => setSelectedVessel(vessel.id)}
                                >
                                    <div style={{textAlign: "center"}}>
                                        <div style={{fontSize: 40}}>{vessel.icon}</div>
                                        <div style={{
                                            fontSize: 12,
                                            color: "#8ab4d4",
                                            marginBottom: 4
                                        }}>{vessel.label}</div>
                                    </div>
                                    {vessel.temp !== 22 && (
                                        <div style={{
                                            fontSize: 11,
                                            color: "#df9a4a",
                                            textAlign: "center"
                                        }}>🌡 {vessel.temp}°C</div>
                                    )}
                                    {vessel.contents.length > 0 && (
                                        <div style={{marginTop: 8}}>
                                            {vessel.contents.map((c, i) => (
                                                <div key={i} style={{
                                                    fontSize: 11,
                                                    color: "#8ab4d4",
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    padding: "2px 0",
                                                    borderBottom: "1px solid rgba(42,90,138,0.2)"
                                                }}>
                                                    <span style={{
                                                        maxWidth: 130,
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap"
                                                    }}>{CHEMICALS[c.chemical]?.label || c.chemical}</span>
                                                    <span style={{
                                                        color: "#4a9adf",
                                                        fontFamily: "'JetBrains Mono', monospace",
                                                        fontSize: 10
                                                    }}>
                        {c.volume ? `${c.volume}cm³` : c.mass ? `${c.mass}g` : ""}
                      </span>
                                                </div>
                                            ))}
                                            <div style={{
                                                marginTop: 8,
                                                height: 16,
                                                borderRadius: 4,
                                                background: vessel.color,
                                                border: "1px solid rgba(255,255,255,0.1)"
                                            }}></div>
                                        </div>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setVessels(vs => vs.filter(v => v.id !== vessel.id));
                                            if (selectedVessel === vessel.id) setSelectedVessel(null);
                                        }}
                                        style={{
                                            position: "absolute",
                                            top: 4,
                                            right: 4,
                                            background: "rgba(90,30,30,0.5)",
                                            border: "none",
                                            color: "#df8080",
                                            cursor: "pointer",
                                            borderRadius: 4,
                                            width: 18,
                                            height: 18,
                                            fontSize: 10,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                    >×
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Observation Box */}
                        {lastObservation && (
                            <div style={{marginTop: 20}}>
                                <div style={{
                                    fontSize: 13,
                                    color: "#8ab4d4",
                                    marginBottom: 6,
                                    fontFamily: "'Playfair Display', serif"
                                }}>🔬 Latest Observation
                                </div>
                                <div className="obs-box">{lastObservation}</div>
                            </div>
                        )}

                        {/* Selected vessel observations */}
                        {selectedVessel && vessels.find(v => v.id === selectedVessel)?.observations.length > 0 && (
                            <div style={{marginTop: 16}}>
                                <div style={{
                                    fontSize: 13,
                                    color: "#8ab4d4",
                                    marginBottom: 6,
                                    fontFamily: "'Playfair Display', serif"
                                }}>
                                    📋 All observations for: {vessels.find(v => v.id === selectedVessel)?.label}
                                </div>
                                <div className="obs-box">
                                    {vessels.find(v => v.id === selectedVessel)?.observations.map((obs, i) => (
                                        <div key={i} style={{marginBottom: 6}}>• {obs}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Actions */}
                    <div style={{
                        width: 260,
                        borderLeft: "1px solid #1a3a5a",
                        overflow: "auto",
                        padding: 12,
                        flexShrink: 0
                    }}>
                        <div style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 14,
                            color: "#8ab4d4",
                            marginBottom: 10,
                            letterSpacing: 1
                        }}>ADD TO VESSEL
                        </div>

                        {selectedVessel ? (
                            <div style={{
                                background: "rgba(0,0,0,0.2)",
                                borderRadius: 6,
                                padding: "10px",
                                marginBottom: 12,
                                border: "1px solid #2a5a8a",
                                fontSize: 12,
                                color: "#4adf7a"
                            }}>
                                Selected: {vessels.find(v => v.id === selectedVessel)?.label || "–"}
                            </div>
                        ) : (
                            <div style={{
                                fontSize: 12,
                                color: "#6a4a2a",
                                marginBottom: 12,
                                padding: "8px 10px",
                                background: "rgba(90,60,0,0.2)",
                                borderRadius: 6
                            }}>
                                ⚠️ Click a vessel on the bench first
                            </div>
                        )}

                        <div style={{marginBottom: 8}}>
                            <div style={{fontSize: 11, color: "#6a9abf", marginBottom: 4}}>Selected Chemical:</div>
                            <div style={{fontSize: 12, color: "#c8e8ff", minHeight: 20}}>
                                {selectedChemical ? CHEMICALS[selectedChemical]?.label : "–"}
                            </div>
                        </div>

                        {selectedChemical && CHEMICALS[selectedChemical]?.type === "solution" && (
                            <div style={{marginBottom: 8}}>
                                <div style={{fontSize: 11, color: "#6a9abf", marginBottom: 4}}>Volume (cm³):</div>
                                <input type="number" value={addVolume}
                                       onChange={e => setAddVolume(parseFloat(e.target.value))} min={0.1} max={100}
                                       step={0.5} style={{width: "100%", boxSizing: "border-box"}}/>
                            </div>
                        )}
                        {selectedChemical && CHEMICALS[selectedChemical]?.type === "solid" && (
                            <div style={{marginBottom: 8}}>
                                <div style={{fontSize: 11, color: "#6a9abf", marginBottom: 4}}>Mass (g):</div>
                                <input type="number" value={addMass}
                                       onChange={e => setAddMass(parseFloat(e.target.value))} min={0.01} max={50}
                                       step={0.01} style={{width: "100%", boxSizing: "border-box"}}/>
                            </div>
                        )}

                        <button className="action-btn" style={{
                            width: "100%",
                            marginBottom: 16,
                            background: "linear-gradient(135deg,#1a4a6a,#1a6a9a)"
                        }}
                                onClick={addChemicalToVessel} disabled={!selectedVessel || !selectedChemical}>
                            + Add to Vessel
                        </button>

                        <div style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 13,
                            color: "#8ab4d4",
                            marginBottom: 10,
                            letterSpacing: 1
                        }}>ACTIONS
                        </div>
                        <div style={{display: "flex", flexDirection: "column", gap: 6}}>
                            {[
                                ["heat", "🔥 Heat"],
                                ["stir", "🥢 Stir"],
                                ["filter", "🫧 Filter"],
                                ["measure_temp", "🌡️ Measure Temperature"],
                                ["weigh", "⚖️ Weigh Contents"],
                                ["test_gas_splint", "🕯️ Test Gas (Splint)"],
                                ["test_gas_glowing", "🕯️ Test Gas (Glowing)"],
                                ["test_litmus", "📄 Test Gas (Litmus)"],
                            ].map(([action, label]) => (
                                <button key={action} className="action-btn" style={{textAlign: "left"}}
                                        onClick={() => performAction(action)}>
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div style={{marginTop: 12, borderTop: "1px solid #1a3a5a", paddingTop: 12}}>
                            <div style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: 13,
                                color: "#8ab4d4",
                                marginBottom: 8
                            }}>TRANSFER CONTENTS
                            </div>
                            <div style={{fontSize: 11, color: "#6a9abf", marginBottom: 4}}>
                                From: <span style={{color: "#4adf7a"}}>
                                    {selectedVessel ? vessels.find(v => v.id === selectedVessel)?.label : "–"}
                                </span>
                            </div>
                            <div style={{fontSize: 11, color: "#6a9abf", marginBottom: 4}}>To:</div>
                            <select
                                value={transferDestId ?? ""}
                                onChange={e => setTransferDestId(+e.target.value || null)}
                                style={{width: "100%", boxSizing: "border-box", marginBottom: 6}}
                            >
                                <option value="">— select vessel —</option>
                                {vessels
                                    .filter(v => v.id !== selectedVessel)
                                    .map(v => (
                                        <option key={v.id} value={v.id}>{v.icon} {v.label}</option>
                                    ))
                                }
                            </select>
                            <div style={{fontSize: 11, color: "#6a9abf", marginBottom: 4}}>Volume to transfer (cm³):</div>
                            <input
                                type="number"
                                value={transferAmount}
                                onChange={e => setTransferAmount(parseFloat(e.target.value))}
                                min={0.1} max={500} step={0.5}
                                style={{width: "100%", boxSizing: "border-box", marginBottom: 6}}
                            />
                            <button
                                className="action-btn"
                                style={{width: "100%", background: "linear-gradient(135deg,#2a4a1a,#3a6a2a)"}}
                                onClick={transferContents}
                                disabled={!selectedVessel || !transferDestId}
                            >
                                ↗ Transfer
                            </button>
                        </div>

                        <div style={{marginTop: 12, borderTop: "1px solid #1a3a5a", paddingTop: 12}}>
                            <div style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: 13,
                                color: "#8ab4d4",
                                marginBottom: 8
                            }}>STOP-CLOCK
                            </div>
                            <div style={{display: "flex", gap: 6}}>
                                <button className="action-btn success" style={{flex: 1}}
                                        onClick={() => performAction("start_clock")}>▶ Start
                                </button>
                                <button className="action-btn danger" style={{flex: 1}}
                                        onClick={() => performAction("stop_clock")}>■ Stop
                                </button>
                            </div>
                            <button className="action-btn" style={{width: "100%", marginTop: 6}}
                                    onClick={() => setClockTime(0)}>↺ Reset
                            </button>
                        </div>

                        {/* Burette Simulator */}
                        <div style={{marginTop: 12, borderTop: "1px solid #1a3a5a", paddingTop: 12}}>
                            <div style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: 13,
                                color: "#8ab4d4",
                                marginBottom: 8
                            }}>BURETTE READING
                            </div>
                            <input type="number" value={bureteReading}
                                   onChange={e => setBuretteReading(parseFloat(e.target.value))}
                                   min={0} max={50} step={0.05} style={{width: "100%", boxSizing: "border-box"}}/>
                            <div style={{
                                fontSize: 11,
                                color: "#6a9abf",
                                marginTop: 4
                            }}>Reading: {bureteReading.toFixed(2)} cm³
                            </div>
                            <button className="action-btn" style={{width: "100%", marginTop: 6}}
                                    onClick={() => pushLog({
                                        action: "burette_reading",
                                        value: bureteReading,
                                        details: `Burette reading recorded: ${bureteReading.toFixed(2)} cm³`
                                    })}>
                                📌 Record Reading
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================== EVALUATE TAB ================== */}
            {activeTab === "evaluate" && (
                <div style={{padding: 24, maxWidth: 900, margin: "0 auto"}}>
                    {!evaluation ? (
                        <div style={{textAlign: "center", padding: 60}}>
                            <div style={{fontSize: 48, marginBottom: 16}}>📊</div>
                            <div style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: 20,
                                color: "#c8e8ff",
                                marginBottom: 12
                            }}>Ready to Evaluate
                            </div>
                            <div style={{color: "#8ab4d4", marginBottom: 24}}>Click "Submit & Evaluate" to receive your
                                assessment
                            </div>
                            <button className="action-btn success" style={{fontSize: 16, padding: "12px 32px"}}
                                    onClick={runEvaluation}>
                                🎓 Submit & Evaluate Now
                            </button>
                        </div>
                    ) : (
                        <div>
                            {/* Score Summary */}
                            <div style={{
                                background: "linear-gradient(135deg, rgba(26,58,90,0.8), rgba(26,74,90,0.8))",
                                borderRadius: 12,
                                padding: 24,
                                marginBottom: 24,
                                border: "1px solid #2a6a9a",
                                textAlign: "center"
                            }}>
                                <div style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: 28,
                                    color: "#c8e8ff",
                                    marginBottom: 8
                                }}>
                                    Your Result: {evaluation.grade}
                                </div>
                                <div style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: 42,
                                    color: "#4adf7a",
                                    marginBottom: 12
                                }}>
                                    {evaluation.total} / {evaluation.maxMarks}
                                </div>
                                <div className="score-bar" style={{maxWidth: 400, margin: "0 auto"}}>
                                    <div className="score-fill"
                                         style={{width: `${(evaluation.total / evaluation.maxMarks) * 100}%`}}></div>
                                </div>
                                <div style={{marginTop: 8, fontSize: 13, color: "#8ab4d4"}}>
                                    {Math.round((evaluation.total / evaluation.maxMarks) * 100)}%
                                    · {evaluation.total >= 28 ? "Distinction" : evaluation.total >= 20 ? "Merit" : "Needs improvement"}
                                </div>
                            </div>

                            {/* Section Breakdown */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1fr",
                                gap: 16,
                                marginBottom: 24
                            }}>
                                {[["Q1 – Rate of Reaction", evaluation.Q1, 14], ["Q2 – Enthalpy", evaluation.Q2, 10], ["Q3 – Qualitative", evaluation.Q3, 13]].map(([label, score, max]) => (
                                    <div key={label} style={{
                                        background: "rgba(0,0,0,0.3)",
                                        borderRadius: 8,
                                        padding: 16,
                                        border: "1px solid #2a4a6a",
                                        textAlign: "center"
                                    }}>
                                        <div style={{fontSize: 13, color: "#8ab4d4", marginBottom: 8}}>{label}</div>
                                        <div style={{
                                            fontFamily: "'JetBrains Mono', monospace",
                                            fontSize: 28,
                                            color: score >= max * 0.7 ? "#4adf7a" : score >= max * 0.5 ? "#df9a4a" : "#df4a4a"
                                        }}>
                                            {score}/{max}
                                        </div>
                                        <div className="score-bar" style={{marginTop: 8}}>
                                            <div className="score-fill" style={{
                                                width: `${(score / max) * 100}%`,
                                                background: score >= max * 0.7 ? "linear-gradient(90deg,#2a8a4a,#4adf7a)" : score >= max * 0.5 ? "linear-gradient(90deg,#8a6a1a,#dfaa4a)" : "linear-gradient(90deg,#8a1a1a,#df4a4a)"
                                            }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Feedback */}
                            <div style={{
                                background: "rgba(0,0,0,0.2)",
                                borderRadius: 10,
                                padding: 20,
                                border: "1px solid #2a4a6a",
                                marginBottom: 20
                            }}>
                                <div style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: 16,
                                    color: "#c8e8ff",
                                    marginBottom: 14
                                }}>📋 Detailed Feedback
                                </div>
                                {evaluation.feedback.map((f, i) => (
                                    <div key={i} style={{
                                        padding: "6px 10px",
                                        marginBottom: 4,
                                        borderRadius: 4,
                                        background: f.startsWith("✅") ? "rgba(0,80,0,0.15)" : f.startsWith("⚠️") ? "rgba(80,60,0,0.15)" : "rgba(80,0,0,0.15)",
                                        fontSize: 13,
                                        color: f.startsWith("✅") ? "#8ad8a8" : f.startsWith("⚠️") ? "#d4b86a" : "#d48a8a"
                                    }}>
                                        {f}
                                    </div>
                                ))}
                            </div>

                            {/* Action Log */}
                            <div style={{
                                background: "rgba(0,0,0,0.2)",
                                borderRadius: 10,
                                padding: 20,
                                border: "1px solid #2a4a6a"
                            }}>
                                <div style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: 16,
                                    color: "#c8e8ff",
                                    marginBottom: 14
                                }}>
                                    🗒 Complete Action Log ({actionLog.length} actions)
                                </div>
                                <div style={{maxHeight: 300, overflow: "auto"}}>
                                    {actionLog.length === 0 ? (
                                        <div style={{color: "#3a6a9a", fontSize: 13}}>No actions recorded yet. Go to the
                                            Laboratory tab to start experimenting.</div>
                                    ) : actionLog.map((entry, i) => (
                                        <div key={i} className="log-entry">
                                            <span style={{color: "#4a7a9a"}}>{entry.timestamp}</span>
                                            {" · "}
                                            <span style={{color: "#4a9adf"}}>{entry.action}</span>
                                            {entry.vessel && <span style={{color: "#8ab4d4"}}> [{entry.vessel}]</span>}
                                            {" · "}
                                            <span style={{color: "#a8c8a8"}}>{entry.details}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Student Notes Review */}
                            {studentNotes && (
                                <div style={{
                                    marginTop: 20,
                                    background: "rgba(0,0,0,0.2)",
                                    borderRadius: 10,
                                    padding: 20,
                                    border: "1px solid #2a4a6a"
                                }}>
                                    <div style={{
                                        fontFamily: "'Playfair Display', serif",
                                        fontSize: 16,
                                        color: "#c8e8ff",
                                        marginBottom: 14
                                    }}>📝 Your Written Answers
                                    </div>
                                    <div style={{
                                        whiteSpace: "pre-wrap",
                                        fontSize: 14,
                                        color: "#a8c8e0",
                                        lineHeight: 1.7
                                    }}>{studentNotes}</div>
                                </div>
                            )}

                            <div style={{marginTop: 20, display: "flex", gap: 12}}>
                                <button className="action-btn" onClick={() => {
                                    setEvaluation(null);
                                    setActiveTab("paper");
                                }}>← Back to Question Paper
                                </button>
                                <button className="action-btn" onClick={() => {
                                    setActionLog([]);
                                    setLogHistory([[]]);
                                    setHistoryIndex(0);
                                    setVessels([]);
                                    setSelectedVessel(null);
                                    setStudentNotes("");
                                    setEvaluation(null);
                                    setActiveTab("paper");
                                }}>
                                    🔄 Start Fresh
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
