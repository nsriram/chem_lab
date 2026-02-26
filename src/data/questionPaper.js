// Each paper follows Cambridge 9701/33 structure: Q1 quantitative, Q2 energetics, Q3 qualitative

export const QUESTION_PAPERS = [

// ─── Paper 1 ── February / March 2024 (real) ─────────────────────────────────
{
    id: "p1",
    title: "9701/33 February/March 2024",
    subtitle: "Paper 3 Advanced Practical Skills 1",
    time: "2 hours",
    marks: 40,
    faMap: {
        "FA 1": "Na2S2O3",
        "FA 2": "HCl",
        "FA 3": "CuSO4",
        "FA 4": "Mg_powder",
        "FA 5": "Na2S2O3",
        "FA 6": "H2SO4",
        "FA 7": "Na2SO3",
        "FA 8": "Cu2O",
    },
    unknownFAs: ["FA 5", "FA 6", "FA 7", "FA 8"],
    questions: [
        {
            id: "Q1", type: "quantitative",
            title: "Question 1 – Rate of Reaction (Thiosulfate Clock)",
            marks: 17,
            context: `The ionic equation for the reaction between sodium thiosulfate and hydrochloric acid is:
S₂O₃²⁻(aq) + 2H⁺(aq) → S(s) + SO₂(aq) + H₂O(l)

The solid sulfur formed causes the reaction mixture to become cloudy and opaque.
You will carry out experiments to investigate the relationship between the concentration of sodium thiosulfate and the rate of reaction.

FA 1 = 0.10 mol dm⁻³ sodium thiosulfate, Na₂S₂O₃
FA 2 = 2.00 mol dm⁻³ hydrochloric acid, HCl
Distilled water`,
            parts: [
                { id: "Q1a", label: "(a) Method & Results Table", marks: 8,
                  instruction: "Prepare a results table with columns for: volume of FA 1, volume of distilled water, reaction time, and relative rate (= 1000/time). Carry out Experiments 1–5. Experiment 1: 25.00 cm³ FA 1 + 10.0 cm³ FA 2. Experiment 2: 12.50 cm³ FA 1 + 12.50 cm³ water + 10.0 cm³ FA 2. Experiments 3–5: vary volume of FA 1 (not less than 12.50 cm³), add water to keep FA 1 + water = 25.00 cm³.",
                  hint: "Fill burette with FA 1; use 25 cm³ measuring cylinder for FA 2. Dry beaker between experiments." },
                { id: "Q1b", label: "(b) Graph", marks: 4,
                  instruction: "Plot a graph of relative rate (y-axis) against volume of FA 1 (x-axis). Do not include the origin. Identify any anomalous point. Draw a line of best fit." },
                { id: "Q1c", label: "(c) Prediction", marks: 2,
                  instruction: "Use your graph to predict the reaction time if 23.50 cm³ FA 1 is used with distilled water. Show clearly on the grid how you determined the relative rate.",
                  calculationGuide: "reaction time = 1000 / (relative rate read from graph)" },
                { id: "Q1d", label: "(d) Effect of not drying the beaker", marks: 1,
                  instruction: "State the effect on the reaction time of not drying the beaker before each of Experiments 2–5. Explain your answer.",
                  answerKey: "Time would be longer. Extra water dilutes the concentration of sodium thiosulfate (FA 1), reducing the rate of reaction." },
                { id: "Q1e", label: "(e)(i) Larger beaker", marks: 1,
                  instruction: "A student repeats Experiment 1 using a 250 cm³ beaker instead of 100 cm³. State whether this statement is correct and explain: 'The student records a longer time because the 250 cm³ beaker is used.'",
                  answerKey: "Correct. The depth of solution is less in the wider beaker, so more sulfur must accumulate before the cross is obscured." },
                { id: "Q1f", label: "(e)(ii) Rate of sulfur production", marks: 1,
                  instruction: "State whether this is correct and explain: 'A longer time is recorded because the rate of production of sulfur is slower.'",
                  answerKey: "Not correct. The concentrations (and thus rate of sulfur production) are unchanged. More sulfur is required to obscure the insert in the wider beaker." },
            ],
        },
        {
            id: "Q2", type: "energetics",
            title: "Question 2 – Enthalpy Change (CuSO₄ + Mg)",
            marks: 10,
            context: `Determine the enthalpy change ΔH for:
CuSO₄(aq) + Mg(s) → Cu(s) + MgSO₄(aq)

FA 3 = 1.0 mol dm⁻³ copper(II) sulfate, CuSO₄
FA 4 = magnesium powder, Mg`,
            parts: [
                { id: "Q2a", label: "(a) Method", marks: 3,
                  instruction: "Use a 50 cm³ measuring cylinder to transfer 50.0 cm³ FA 3 into a polystyrene cup supported in a 250 cm³ beaker. Weigh the stoppered container of FA 4. Record initial temperature of FA 3. Add FA 4, stir constantly. Record maximum temperature. Reweigh container. Calculate mass of FA 4 used and temperature change." },
                { id: "Q2b", label: "(b)(i) Heat energy", marks: 1,
                  instruction: "Calculate the heat energy produced in the reaction.",
                  calculationGuide: "q = 50 × 4.18 × ΔT (J)" },
                { id: "Q2c", label: "(b)(ii) Limiting reagent", marks: 1,
                  instruction: "Determine which reactant (FA 3 or FA 4) is in excess. Show your working.",
                  answerKey: "Amount FA 3 (CuSO₄) = 0.050 × 1.0 = 0.050 mol. Amount FA 4 (Mg) = mass/24.3. FA 3 is typically in excess." },
                { id: "Q2d", label: "(b)(iii) ΔH", marks: 2,
                  instruction: "Calculate ΔH in kJ mol⁻¹. Sign must be negative (exothermic).",
                  calculationGuide: "ΔH = −q / (1000 × n(limiting)) kJ mol⁻¹" },
                { id: "Q2e", label: "(c) Improvement", marks: 3,
                  instruction: "The slow reaction causes heat loss, making the temperature change inaccurate. Describe how to change the method and process results to improve accuracy. Do not change quantities.",
                  answerKey: "Record temperature at regular time intervals before and after adding FA 4. Plot temperature vs time. Extrapolate both lines of best fit to the moment of addition to find the true ΔT." },
            ],
        },
        {
            id: "Q3", type: "qualitative",
            title: "Question 3 – Qualitative Analysis (Sulfur Anions)",
            marks: 13,
            context: `FA 5, FA 6 and FA 7 each contain an anion with sulfur. None of the anions is present in more than one compound.

FA 8 is a solid.`,
            parts: [
                { id: "Q3a", label: "(a) Tests on FA 5, FA 6, FA 7", marks: 5,
                  instruction: "Use 1 cm depth of each solution. Test 1: add a few drops of acidified KMnO₄, leave 2 min. Test 2: add a piece of Mg ribbon. Test 3: add aqueous barium chloride or barium nitrate. Record ALL observations in a table." },
                { id: "Q3b", label: "(b)(i) Identify anions", marks: 2,
                  instruction: "Use your observations to identify the anion formula for FA 5, FA 6, and FA 7.",
                  answerKey: "FA 5: S₂O₃²⁻ | FA 6: SO₄²⁻ | FA 7: SO₃²⁻" },
                { id: "Q3c", label: "(b)(ii) Cation in FA 6", marks: 2,
                  instruction: "Suggest the identity of the cation in FA 6 and carry out a further test to confirm. Record test and observations. State the identity of the cation.",
                  answerKey: "Cation is H⁺. Test: add Na₂CO₃ → effervescence (CO₂ turns limewater milky). Or add litmus indicator → turns red." },
                { id: "Q3d", label: "(c) Ionic equation", marks: 1,
                  instruction: "Write an ionic equation with state symbols for one reaction from Test 2 or Test 3.",
                  answerKey: "Mg(s) + 2H⁺(aq) → Mg²⁺(aq) + H₂(g)  OR  Ba²⁺(aq) + SO₄²⁻(aq) → BaSO₄(s)  OR  Ba²⁺(aq) + SO₃²⁻(aq) → BaSO₃(s)" },
                { id: "Q3e", label: "(d)(i) FA 8 in FA 6", marks: 1,
                  instruction: "Gently warm FA 6. Add FA 8. Filter. Describe the residue and filtrate.",
                  answerKey: "Residue: red-brown/brown solid (Cu). Filtrate: pale blue solution (Cu²⁺ ions formed)." },
                { id: "Q3f", label: "(d)(ii) Filtrate + KI", marks: 1,
                  instruction: "Add an equal volume of aqueous KI to the filtrate. Record observations.",
                  answerKey: "Brown/yellow-brown solution or precipitate (iodine liberated: 2Cu²⁺ + 4I⁻ → 2CuI + I₂)." },
                { id: "Q3g", label: "(d)(iii) + NaOH", marks: 1,
                  instruction: "Add aqueous NaOH to the filtrate from (d)(ii). Record observations.",
                  answerKey: "Pale blue precipitate (Cu(OH)₂) forms, insoluble in excess NaOH." },
            ],
        },
    ],
},

// ─── Paper 2 ── February / March 2025 (real) ─────────────────────────────────
{
    id: "p2",
    title: "9701/33 February/March 2025",
    subtitle: "Paper 3 Advanced Practical Skills 1",
    time: "2 hours",
    marks: 40,
    faMap: {
        "FA 1": "potassium_alum_hydrated",
        "FA 2": "Na2S2O3_titrant",
        "FA 3": "KMnO4_acid",
        "FA 4": "KI",
        "FA 5": "H2SO4",
        "FA 6": "starch",
        "FA 7": "fe3_aq",
    },
    unknownFAs: ["FA 7"],
    questions: [
        {
            id: "Q1", type: "quantitative",
            title: "Question 1 – Water of Crystallisation (Potassium Alum)",
            marks: 11,
            context: `Potassium alum is a hydrated salt containing Al³⁺, K⁺ and SO₄²⁻ ions.
1 mol of hydrated potassium alum contains 12 mol of water of crystallisation.
You will determine the formula of potassium alum by heating until anhydrous.

FA 1 = hydrated potassium alum`,
            parts: [
                { id: "Q1a", label: "(a) Method & Results", marks: 5,
                  instruction: "Weigh crucible + lid. Add all FA 1. Weigh crucible + lid + FA 1. Heat gently 2 min (lid on), then strongly 5 min (lid off). Cool at least 5 min. Reweigh. Heat strongly again 2 min. Cool 5 min. Reweigh. Record all masses in a table with headings: (I) crucible+lid, (II) crucible+lid+FA 1, (III) after first heating, (IV) after second heating, (V) mass of FA 1, mass of residue.",
                  hint: "Constant mass confirms complete dehydration. Two heating cycles required." },
                { id: "Q1b", label: "(b)(i) Amount of H₂O", marks: 1,
                  instruction: "Calculate the amount, in mol, of water of crystallisation lost during thermal decomposition of FA 1.",
                  calculationGuide: "n(H₂O) = (mass FA 1 − mass residue) / 18.0" },
                { id: "Q1c", label: "(b)(ii) Amount of alum", marks: 1,
                  instruction: "Use the information given and your answer to (b)(i) to determine the amount, in mol, of potassium alum used.",
                  calculationGuide: "n(alum) = n(H₂O) / 12" },
                { id: "Q1d", label: "(b)(iii) Mr of anhydrous alum", marks: 1,
                  instruction: "Calculate the relative formula mass, Mr, of anhydrous potassium alum.",
                  calculationGuide: "Mr = mass of residue / n(alum)" },
                { id: "Q1e", label: "(b)(iv) Formula", marks: 1,
                  instruction: "Anhydrous potassium alum contains Al³⁺, K⁺ and SO₄²⁻; 1 mol also contains 1 mol Al³⁺. Use your Mr to suggest the formula. Show working.",
                  answerKey: "AlK(SO₄)₂  [Mr ≈ 258; from 27+39+2×96 = 258]" },
                { id: "Q1f", label: "(c)(i) Percentage error", marks: 1,
                  instruction: "The uncertainty in a single balance reading is 0.01 g. Calculate the maximum percentage error in your measurement of the mass of residue.",
                  calculationGuide: "% error = (2 × 0.01) / mass of residue × 100" },
                { id: "Q1g", label: "(c)(ii) Decomposition argument", marks: 1,
                  instruction: "A student obtains a higher Mr than expected and suggests some anhydrous alum decomposes to Al₂O₃ and K₂O during strong heating. Explain why this suggestion is not correct.",
                  answerKey: "If alum decomposed, mass loss would be greater (both water and oxides lost), so calculated moles of residue would be lower, giving a higher Mr – consistent with observation. But the argument is wrong because Al₂O₃ and K₂O would remain in the crucible, not reduce the residue mass. Hence more mass would be lost, n(water) rises, n(alum) rises, and Mr falls – contradicting the observation." },
            ],
        },
        {
            id: "Q2", type: "quantitative",
            title: "Question 2 – Iodometric Titration (Oxidising Agent)",
            marks: 16,
            context: `Many oxidising agents can oxidise acidified potassium iodide to iodine.
I₂(aq) + 2Na₂S₂O₃(aq) → 2NaI(aq) + Na₂S₄O₆(aq)

FA 2 = sodium thiosulfate (22.00 g Na₂S₂O₃·5H₂O per dm³, Mr = 248.2)
FA 3 = 0.0175 mol dm⁻³ oxidising agent
FA 4 = 0.50 mol dm⁻³ potassium iodide, KI
FA 5 = 1.00 mol dm⁻³ sulfuric acid, H₂SO₄
FA 6 = starch solution`,
            parts: [
                { id: "Q2a", label: "(a) Titration method & results", marks: 7,
                  instruction: "Fill burette with FA 2. Pipette 25.0 cm³ FA 3 into a conical flask. Add 10 cm³ FA 4 (excess, using 10 cm³ measuring cylinder) and 20 cm³ FA 5 (excess, using 25 cm³ measuring cylinder). Titrate with FA 2 until yellow, then add ~10 drops FA 6. Continue to endpoint (blue-black → colourless). Record all burette readings and titres. Carry out as many accurate titrations as needed for consistent results.",
                  hint: "Rough titre first, then 2–3 accurate titres within 0.10 cm³ of each other." },
                { id: "Q2b", label: "(b) Mean titre", marks: 1,
                  instruction: "From your accurate titration results, calculate a suitable mean value. Show clearly how you obtain the mean.",
                  calculationGuide: "Mean = average of consistent titres (within ±0.10 cm³), rounded to 0.01 cm³" },
                { id: "Q2c", label: "(c)(i) Significant figures", marks: 1,
                  instruction: "State the number of significant figures you will use for (c)(ii)–(c)(iv) and justify your choice." },
                { id: "Q2d", label: "(c)(ii) n(Na₂S₂O₃)", marks: 1,
                  instruction: "Calculate the amount, in mol, of sodium thiosulfate in the volume of FA 2 used.",
                  calculationGuide: "n(Na₂S₂O₃) = (22.00/248.2) × (titre/1000)" },
                { id: "Q2e", label: "(c)(iii) n(I₂)", marks: 1,
                  instruction: "Calculate the amount, in mol, of iodine that reacts with the amount of sodium thiosulfate in (c)(ii).",
                  calculationGuide: "n(I₂) = ½ × n(Na₂S₂O₃)" },
                { id: "Q2f", label: "(c)(iv) n(FA 3)", marks: 1,
                  instruction: "Calculate the amount, in mol, of FA 3 used to produce the iodine in (c)(iii).",
                  calculationGuide: "n(FA 3) = 0.0175 × 25.0/1000 = 4.375 × 10⁻⁴ mol" },
                { id: "Q2g", label: "(c)(v) I₂ per mol FA 3", marks: 1,
                  instruction: "Calculate the amount, in mol, of iodine produced per mole of FA 3 reacting with KI. Give answer to 1 d.p.",
                  calculationGuide: "mol I₂ per mol FA 3 = n(I₂) / n(FA 3)" },
                { id: "Q2h", label: "(c)(vi) Change in oxidation state", marks: 2,
                  instruction: "The oxidising agent in FA 3 is a compound of transition metal M. The redox reaction produces M²⁺ ions. Use (c)(v) to calculate the change in oxidation state of M. Show working.",
                  answerKey: "Each mol I₂ produced requires 2e⁻. Change in OS = (c)(v) × 2 electrons per I₂. M changes from (2 + change) to +2." },
                { id: "Q2i", label: "(d) Accuracy of measuring FA 5", marks: 1,
                  instruction: "A student suggests the experiment would be more accurate if FA 5 (sulfuric acid) were measured using a pipette. State whether the student is correct and explain.",
                  answerKey: "The student is incorrect. FA 5 is used in excess, so its exact volume does not affect the result. Using a pipette provides no benefit." },
            ],
        },
        {
            id: "Q3", type: "qualitative",
            title: "Question 3 – Qualitative Analysis (Transition Metal & Ions)",
            marks: 13,
            context: `FA 3 = acidified KMnO₄ (purple solution)
FA 7 is an unknown aqueous solution.

Use 1 cm depth for each test. Use a boiling tube for Test 1 in part (b); test-tubes elsewhere.`,
            parts: [
                { id: "Q3a", label: "(a) Tests on FA 3", marks: 4,
                  instruction: "Use 1 cm depth FA 3. Test 1: add equal volume NaOH, then equal volume Na₂SO₃, shake, then add H₂SO₄. Test 2: add equal volume H₂SO₄ then a spatula of zinc pieces; leave to stand. Test 3: add equal volume H₂O₂. For Test 3, give the formula of the gas formed.",
                  answerKey: "Test 1: NaOH – no change (purple). Na₂SO₃ – turns green then brown ppt. H₂SO₄ – turns colourless. Test 2: purple turns colourless; effervescence. Test 3: effervescence; brown solid; gas relights glowing splint (O₂)." },
                { id: "Q3b", label: "(b)(i) Tests on FA 7", marks: 6,
                  instruction: "Test 1 (boiling tube): add 0.5 cm NaOH, warm carefully, then add aluminium foil. Test 2: add drops of KI (FA 4), then starch (FA 6). Test 3: add pieces of magnesium. Test 4: add drops BaCl₂, then add HCl. Test 5: add drops AgNO₃, then add NH₃(aq). Record all observations." },
                { id: "Q3c", label: "(b)(ii) Identify the four ions", marks: 2,
                  instruction: "Give the formula of each of the four ions in FA 7.",
                  answerKey: "H⁺, NH₄⁺, Fe³⁺, SO₄²⁻" },
                { id: "Q3d", label: "(b)(iii) Ionic equation", marks: 1,
                  instruction: "Give the ionic equation for one reaction in Test 1 or Test 3 of (b)(i). Include state symbols.",
                  answerKey: "Fe³⁺(aq) + 3OH⁻(aq) → Fe(OH)₃(s)  OR  NH₄⁺(aq) + OH⁻(aq) → NH₃(g) + H₂O(l)  OR  Mg(s) + 2H⁺(aq) → Mg²⁺(aq) + H₂(g)" },
            ],
        },
    ],
},

// ─── Paper 3 ── Practice A ────────────────────────────────────────────────────
{
    id: "p3",
    title: "Practice Paper A – Acid-Base Titration",
    subtitle: "Paper 3 Advanced Practical Skills 1 – Practice",
    time: "2 hours",
    marks: 40,
    faMap: {
        "FA 1": "NaOH",
        "FA 2": "HCl",
        "FA 3": "HCl",
        "FA 4": "Mg_ribbon",
        "FA 5": "NaCl",
        "FA 6": "KBr",
        "FA 7": "KI",
        "FA 8": "FeCl3",
    },
    unknownFAs: ["FA 5", "FA 6", "FA 7", "FA 8"],
    questions: [
        {
            id: "Q1", type: "quantitative",
            title: "Question 1 – Acid-Base Titration (NaOH + HCl)",
            marks: 17,
            context: `You will determine the concentration of a solution of hydrochloric acid by titration against a standard solution of sodium hydroxide.

FA 1 = sodium hydroxide, NaOH (exactly 1.000 mol dm⁻³)
FA 2 = hydrochloric acid, HCl (concentration unknown)
Indicator: methyl orange`,
            parts: [
                { id: "Q1a", label: "(a) Titration method", marks: 7,
                  instruction: "Fill the burette with FA 2. Pipette 25.0 cm³ of FA 1 into a conical flask. Add 2–3 drops of methyl orange indicator. Perform a rough titration. Record burette readings. Carry out at least two accurate titrations. Record all readings to 0.05 cm³ in a suitable table.",
                  hint: "Endpoint: yellow (alkaline) → red/orange (acid). Rinse pipette with FA 1 before use." },
                { id: "Q1b", label: "(b) Mean titre", marks: 1,
                  instruction: "Calculate a mean titre from your consistent accurate results. Show working.",
                  calculationGuide: "Select titres within ±0.10 cm³. Mean to 0.01 cm³." },
                { id: "Q1c", label: "(c)(i) n(NaOH)", marks: 1,
                  instruction: "Calculate the amount, in mol, of NaOH in 25.0 cm³ of FA 1.",
                  calculationGuide: "n(NaOH) = 1.000 × 25.0/1000 = 0.0250 mol" },
                { id: "Q1d", label: "(c)(ii) n(HCl)", marks: 1,
                  instruction: "Calculate the amount, in mol, of HCl in the mean titre of FA 2. (NaOH + HCl → NaCl + H₂O, 1:1 ratio)",
                  calculationGuide: "n(HCl) = n(NaOH) = 0.0250 mol" },
                { id: "Q1e", label: "(c)(iii) Concentration of FA 2", marks: 1,
                  instruction: "Calculate the concentration, in mol dm⁻³, of FA 2.",
                  calculationGuide: "c(HCl) = n(HCl) / (mean titre / 1000)" },
                { id: "Q1f", label: "(d) Systematic error", marks: 1,
                  instruction: "State one source of systematic error in this titration and explain how it would affect the calculated concentration of FA 2.",
                  answerKey: "e.g. Pipette not rinsed with FA 1 → dilution → fewer moles NaOH → apparent lower HCl concentration." },
                { id: "Q1g", label: "(e) Indicator choice", marks: 1,
                  instruction: "Suggest why phenolphthalein would be less suitable than methyl orange for this titration.",
                  answerKey: "Phenolphthalein has endpoint at pH 8–10; methyl orange at pH 3–4.4, closer to equivalence point of strong acid–strong base. Either indicator works in practice, but phenolphthalein endpoint occurs slightly before equivalence." },
                { id: "Q1h", label: "(f) Accuracy marks", marks: 4,
                  instruction: "Record all burette readings to 0.05 cm³ precision. Accurate titres should agree within 0.10 cm³." },
            ],
        },
        {
            id: "Q2", type: "energetics",
            title: "Question 2 – Enthalpy of Reaction (Mg + HCl)",
            marks: 10,
            context: `Determine the enthalpy change ΔH for:
Mg(s) + 2HCl(aq) → MgCl₂(aq) + H₂(g)

FA 3 = 2.00 mol dm⁻³ hydrochloric acid, HCl
FA 4 = magnesium ribbon`,
            parts: [
                { id: "Q2a", label: "(a) Method", marks: 3,
                  instruction: "Measure 50.0 cm³ FA 3 into a polystyrene cup. Weigh a piece of magnesium ribbon (FA 4). Record initial temperature of FA 3. Add FA 4. Record maximum temperature. Record temperature until it starts to fall. Calculate ΔT." },
                { id: "Q2b", label: "(b)(i) Heat energy", marks: 1,
                  instruction: "Calculate the heat energy produced. Assume specific heat capacity c = 4.18 J g⁻¹ K⁻¹ and mass of solution = 50 g.",
                  calculationGuide: "q = 50 × 4.18 × ΔT (J)" },
                { id: "Q2c", label: "(b)(ii) Amount of Mg", marks: 1,
                  instruction: "Calculate the amount, in mol, of Mg used. (Ar: Mg = 24.3)",
                  calculationGuide: "n(Mg) = mass / 24.3" },
                { id: "Q2d", label: "(b)(iii) ΔH", marks: 2,
                  instruction: "Calculate ΔH in kJ mol⁻¹. Sign must be negative (exothermic).",
                  calculationGuide: "ΔH = −q / (1000 × n(Mg))" },
                { id: "Q2e", label: "(c) Heat loss", marks: 3,
                  instruction: "Explain why heat loss to the surroundings means your value of ΔH is less negative than the true value. Describe how to correct for heat loss using a temperature–time graph.",
                  answerKey: "Record temperature vs time before and after addition. Extrapolate both lines to time of addition. Use extrapolated ΔT (higher) to correct for heat lost during the experiment." },
            ],
        },
        {
            id: "Q3", type: "qualitative",
            title: "Question 3 – Qualitative Analysis (Halide Ions)",
            marks: 13,
            context: `FA 5, FA 6 and FA 7 each contain a different halide ion.

FA 8 is an aqueous solution.`,
            parts: [
                { id: "Q3a", label: "(a) Tests on FA 5–7 with AgNO₃ and NH₃", marks: 5,
                  instruction: "To 1 cm depth of each FA, add a few drops of AgNO₃ solution, then add aqueous ammonia in excess. Record all observations in a table." },
                { id: "Q3b", label: "(b) Identify halide ions", marks: 2,
                  instruction: "Use your observations to identify the halide ion in FA 5, FA 6 and FA 7.",
                  answerKey: "FA 5: Cl⁻ (white ppt, soluble in NH₃). FA 6: Br⁻ (cream ppt, partially soluble). FA 7: I⁻ (pale yellow ppt, insoluble in NH₃)." },
                { id: "Q3c", label: "(c) Tests on FA 8", marks: 4,
                  instruction: "Use 1 cm depth FA 8. Test 1: add NaOH solution. Test 2: add NH₃(aq). Test 3: add Na₂SO₃ solution. Record all observations." },
                { id: "Q3d", label: "(d) Identify cation in FA 8", marks: 1,
                  instruction: "Identify the cation in FA 8 and write its formula.",
                  answerKey: "Fe³⁺. Red-brown precipitate with both NaOH and NH₃, insoluble in excess. Decolourisation of purple KMnO₄ absent." },
                { id: "Q3e", label: "(e) Ionic equation", marks: 1,
                  instruction: "Write an ionic equation with state symbols for the reaction of FA 8 with NaOH.",
                  answerKey: "Fe³⁺(aq) + 3OH⁻(aq) → Fe(OH)₃(s)" },
            ],
        },
    ],
},

// ─── Paper 4 ── Practice B ────────────────────────────────────────────────────
{
    id: "p4",
    title: "Practice Paper B – Temperature Effect on Rate",
    subtitle: "Paper 3 Advanced Practical Skills 1 – Practice",
    time: "2 hours",
    marks: 40,
    faMap: {
        "FA 1": "Na2S2O3",
        "FA 2": "HCl",
        "FA 3": "CuSO4",
        "FA 4": "Zn_powder",
        "FA 5": "CuSO4",
        "FA 6": "NH4Cl",
        "FA 7": "CaCl2",
        "FA 8": "NaOH",
    },
    unknownFAs: ["FA 5", "FA 6", "FA 7"],
    questions: [
        {
            id: "Q1", type: "quantitative",
            title: "Question 1 – Effect of Temperature on Rate",
            marks: 17,
            context: `You will investigate how temperature affects the rate of reaction between sodium thiosulfate and hydrochloric acid.

FA 1 = 0.10 mol dm⁻³ Na₂S₂O₃
FA 2 = 2.00 mol dm⁻³ HCl`,
            parts: [
                { id: "Q1a", label: "(a) Method & results table", marks: 8,
                  instruction: "Prepare a table including: temperature (°C), reaction time (s), relative rate (1000/time). Warm 25.0 cm³ FA 1 to each target temperature (20, 30, 40, 50, 60 °C) in a water bath. Add 10.0 cm³ FA 2 (pre-warmed to same temperature). Start clock. Stop when mixture becomes opaque. Record time.",
                  hint: "Warm FA 2 separately to prevent premature mixing. Record temperature at moment of mixing." },
                { id: "Q1b", label: "(b) Graph", marks: 4,
                  instruction: "Plot relative rate (y-axis) against temperature (x-axis). Draw a smooth curve of best fit through your points." },
                { id: "Q1c", label: "(c) Prediction", marks: 2,
                  instruction: "Use your graph to predict the relative rate at 35 °C. Hence calculate the reaction time at 35 °C.",
                  calculationGuide: "time = 1000 / relative rate" },
                { id: "Q1d", label: "(d) Rate doubling rule", marks: 1,
                  instruction: "State what happens to the rate of reaction when the temperature increases by 10 °C, and link this to the concept of activation energy.",
                  answerKey: "Rate approximately doubles for every 10 °C rise. Higher temperature → more particles have energy ≥ Eₐ → more successful collisions." },
                { id: "Q1e", label: "(e) Control variable", marks: 1,
                  instruction: "State one variable that must be kept constant during this investigation and explain why.",
                  answerKey: "e.g. Concentration of FA 1 and FA 2 must remain constant; otherwise changes in rate could be due to concentration rather than temperature." },
                { id: "Q1f", label: "(f) Anomalous result", marks: 1,
                  instruction: "Identify a potential source of anomalous results in this experiment and how to minimise it.",
                  answerKey: "Temperature may not be uniform when FA 2 is added; minimise by pre-warming FA 2 in the same water bath." },
            ],
        },
        {
            id: "Q2", type: "energetics",
            title: "Question 2 – Enthalpy of Displacement (Zn + CuSO₄)",
            marks: 10,
            context: `Determine the enthalpy change ΔH for:
Zn(s) + CuSO₄(aq) → Cu(s) + ZnSO₄(aq)

FA 3 = 1.0 mol dm⁻³ CuSO₄
FA 4 = zinc powder`,
            parts: [
                { id: "Q2a", label: "(a) Method", marks: 3,
                  instruction: "Weigh out approximately 0.65 g zinc powder (FA 4). Measure 50.0 cm³ FA 3 into a polystyrene cup. Record initial temperature. Add FA 4 and stir continuously. Record maximum temperature reached." },
                { id: "Q2b", label: "(b)(i) q", marks: 1,
                  instruction: "Calculate heat energy produced, assuming density = 1 g cm⁻³.",
                  calculationGuide: "q = 50 × 4.18 × ΔT" },
                { id: "Q2c", label: "(b)(ii) Limiting reagent", marks: 1,
                  instruction: "Determine which reactant is in excess. (Ar: Zn = 65.4)",
                  answerKey: "n(CuSO₄) = 0.050 mol. n(Zn) = mass/65.4. Zn is typically limiting." },
                { id: "Q2d", label: "(b)(iii) ΔH", marks: 2,
                  instruction: "Calculate ΔH in kJ mol⁻¹.",
                  calculationGuide: "ΔH = −q / (1000 × n(Zn))" },
                { id: "Q2e", label: "(c) Compare to Mg + CuSO₄", marks: 3,
                  instruction: "The enthalpy change for Mg(s) + CuSO₄(aq) is more negative than for Zn(s) + CuSO₄(aq). Explain this in terms of electrode potentials.",
                  answerKey: "Mg has a more negative standard electrode potential than Zn, so Mg displaces Cu more vigorously. Greater difference in E° → larger ΔH of displacement." },
            ],
        },
        {
            id: "Q3", type: "qualitative",
            title: "Question 3 – Qualitative Analysis (Cation Identification)",
            marks: 13,
            context: `FA 5, FA 6 and FA 7 each contain a different cation.
Use the Qualitative analysis notes to identify each cation.

FA 8 = NaOH solution (for further testing)`,
            parts: [
                { id: "Q3a", label: "(a) Tests with NaOH and NH₃", marks: 5,
                  instruction: "Use 1 cm depth of FA 5, FA 6 and FA 7. Test 1: add NaOH dropwise then in excess. Test 2: add NH₃(aq) dropwise then in excess. Record colour of precipitate and solubility in excess for each." },
                { id: "Q3b", label: "(b) Identify cations", marks: 3,
                  instruction: "Identify the cation in each of FA 5, FA 6 and FA 7, giving reasons from your observations." },
                { id: "Q3c", label: "(c) Further confirmatory test", marks: 2,
                  instruction: "Describe a further confirmatory test for one of the cations identified, including the expected observation.",
                  answerKey: "e.g. For Cu²⁺: excess NH₃ gives deep blue solution (tetraamminecopper(II) complex). For Fe³⁺: add KSCN → blood-red solution." },
                { id: "Q3d", label: "(d) Ionic equation", marks: 1,
                  instruction: "Write an ionic equation (with state symbols) for the reaction of one of the cations with NaOH.",
                  answerKey: "e.g. Cu²⁺(aq) + 2OH⁻(aq) → Cu(OH)₂(s)  OR  Fe³⁺(aq) + 3OH⁻(aq) → Fe(OH)₃(s)" },
                { id: "Q3e", label: "(e) Anion test", marks: 2,
                  instruction: "Select one of the solutions you identified in (b). Describe how you would test for the presence of a sulfate anion and state the expected observation.",
                  answerKey: "Add BaCl₂ solution (acidified with dilute HCl). White precipitate of BaSO₄ forms, insoluble in excess dilute HCl." },
            ],
        },
    ],
},

// ─── Paper 5 ── Practice C ────────────────────────────────────────────────────
{
    id: "p5",
    title: "Practice Paper C – Water of Crystallisation",
    subtitle: "Paper 3 Advanced Practical Skills 1 – Practice",
    time: "2 hours",
    marks: 40,
    faMap: {
        "FA 1": "CuSO4",
        "FA 2": "KMnO4_acid",
        "FA 3": "FeSO4",
        "FA 4": "H2SO4",
        "FA 5": "Na2CO3",
        "FA 6": "KNO3",
        "FA 7": "NaCl",
        "FA 8": "CuSO4",
    },
    unknownFAs: ["FA 5", "FA 6", "FA 7", "FA 8"],
    questions: [
        {
            id: "Q1", type: "quantitative",
            title: "Question 1 – Water of Crystallisation (CuSO₄·xH₂O)",
            marks: 11,
            context: `Hydrated copper(II) sulfate decomposes on heating, losing its water of crystallisation:
CuSO₄·xH₂O(s) → CuSO₄(s) + xH₂O(g)

You will determine the value of x.
FA 1 = hydrated copper(II) sulfate, CuSO₄·xH₂O (blue crystals)`,
            parts: [
                { id: "Q1a", label: "(a) Method & Results", marks: 5,
                  instruction: "Weigh an evaporating dish. Add all FA 1. Weigh dish + FA 1. Heat gently on a gauze for 5 min until colour changes to white. Cool. Reweigh. Heat 2 more min. Cool. Reweigh. Record masses: (I) dish, (II) dish + FA 1, (III) after first heating, (IV) after second heating. Calculate mass of FA 1 and mass of anhydrous CuSO₄.",
                  hint: "Continue heating and cooling until two successive masses agree to ±0.02 g." },
                { id: "Q1b", label: "(b)(i) Mass of water", marks: 1,
                  instruction: "Calculate the mass of water of crystallisation lost.",
                  calculationGuide: "mass H₂O = mass FA 1 − mass CuSO₄" },
                { id: "Q1c", label: "(b)(ii) n(H₂O) and n(CuSO₄)", marks: 1,
                  instruction: "Calculate the amount, in mol, of water lost and of anhydrous CuSO₄ formed. (Mr: H₂O = 18.0; CuSO₄ = 159.6)",
                  calculationGuide: "n(H₂O) = mass H₂O / 18.0; n(CuSO₄) = mass CuSO₄ / 159.6" },
                { id: "Q1d", label: "(b)(iii) Value of x", marks: 1,
                  instruction: "Calculate the value of x in CuSO₄·xH₂O. Give your answer to the nearest integer.",
                  calculationGuide: "x = n(H₂O) / n(CuSO₄)" },
                { id: "Q1e", label: "(c)(i) Percentage uncertainty", marks: 1,
                  instruction: "Calculate the maximum percentage uncertainty in the mass of anhydrous CuSO₄, given a balance uncertainty of 0.01 g.",
                  calculationGuide: "% uncertainty = (2 × 0.01 / mass CuSO₄) × 100" },
                { id: "Q1f", label: "(c)(ii) Source of error", marks: 1,
                  instruction: "Suggest why the value of x obtained may be too high, even if heating is sufficient.",
                  answerKey: "If CuSO₄ is not fully dehydrated (colour still blue-tinged), the mass of anhydrous CuSO₄ is too high. Alternatively, if the dish absorbs moisture during cooling, mass appears higher." },
                { id: "Q1g", label: "(c)(iii) Safety", marks: 1,
                  instruction: "State one safety precaution when heating FA 1 and give the reason.",
                  answerKey: "Allow crucible to cool fully before handling to avoid burns. Or: heat gently first to avoid spattering." },
            ],
        },
        {
            id: "Q2", type: "quantitative",
            title: "Question 2 – Redox Titration (KMnO₄ vs Fe²⁺)",
            marks: 16,
            context: `KMnO₄ oxidises Fe²⁺ in acidic solution:
MnO₄⁻(aq) + 5Fe²⁺(aq) + 8H⁺(aq) → Mn²⁺(aq) + 5Fe³⁺(aq) + 4H₂O(l)

FA 2 = 0.0200 mol dm⁻³ KMnO₄
FA 3 = FeSO₄ solution (concentration unknown)
FA 4 = 1.0 mol dm⁻³ H₂SO₄ (to acidify)`,
            parts: [
                { id: "Q2a", label: "(a) Titration", marks: 7,
                  instruction: "Fill burette with FA 2. Pipette 25.0 cm³ FA 3 into conical flask. Add 20 cm³ FA 4. Titrate with FA 2 until a faint permanent pink colour persists. Perform a rough and at least two accurate titrations. Record all burette readings.",
                  hint: "KMnO₄ acts as its own indicator. Endpoint: first faint pink lasting 30 s." },
                { id: "Q2b", label: "(b) Mean titre", marks: 1,
                  instruction: "Calculate a suitable mean from your consistent accurate titres.",
                  calculationGuide: "Mean of titres within ±0.10 cm³" },
                { id: "Q2c", label: "(c)(i) n(KMnO₄)", marks: 1,
                  instruction: "Calculate the amount, in mol, of KMnO₄ in the mean titre.",
                  calculationGuide: "n(KMnO₄) = 0.0200 × titre/1000" },
                { id: "Q2d", label: "(c)(ii) n(Fe²⁺)", marks: 1,
                  instruction: "Calculate the amount, in mol, of Fe²⁺ in 25.0 cm³ of FA 3.",
                  calculationGuide: "n(Fe²⁺) = 5 × n(KMnO₄)" },
                { id: "Q2e", label: "(c)(iii) Concentration of FA 3", marks: 1,
                  instruction: "Calculate the concentration, in mol dm⁻³, of FeSO₄ in FA 3.",
                  calculationGuide: "c(FeSO₄) = n(Fe²⁺) / 0.0250" },
                { id: "Q2f", label: "(d) Why acidify?", marks: 1,
                  instruction: "Explain why dilute H₂SO₄ is added to the conical flask before titrating.",
                  answerKey: "Acidic conditions are required to prevent precipitation of MnO₂ (brown solid). In acid, Mn is fully reduced to Mn²⁺ (colourless). H₂SO₄ preferred over HCl (HCl would be oxidised by KMnO₄)." },
                { id: "Q2g", label: "(e) Fe²⁺ in air", marks: 1,
                  instruction: "Fe²⁺ is readily oxidised to Fe³⁺ by air. State how this would affect the titre value obtained.",
                  answerKey: "Titre would be smaller (less Fe²⁺ present). The calculated concentration of FeSO₄ would appear lower than the actual value." },
                { id: "Q2h", label: "(f) SF and sig fig", marks: 3,
                  instruction: "Give your answer to (c)(iii) to an appropriate number of significant figures. Justify the number chosen." },
            ],
        },
        {
            id: "Q3", type: "qualitative",
            title: "Question 3 – Qualitative Analysis (Anion Identification)",
            marks: 13,
            context: `FA 5, FA 6, FA 7 each contain a different anion.
FA 8 is a solid of unknown composition.`,
            parts: [
                { id: "Q3a", label: "(a) Tests on FA 5–7", marks: 5,
                  instruction: "Test 1: Add dilute HCl to each solution. Test 2: Test any gas produced with limewater. Test 3: Add AgNO₃ solution to each, then add NH₃(aq). Record all observations in a table." },
                { id: "Q3b", label: "(b) Identify anions", marks: 3,
                  instruction: "Use observations to identify the anion in each of FA 5, FA 6 and FA 7.",
                  answerKey: "FA 5: CO₃²⁻ (effervescence with HCl; CO₂ turns limewater milky). FA 6: NO₃⁻ (no reaction with HCl or AgNO₃; confirmed by brown ring test with Fe²⁺/H₂SO₄). FA 7: Cl⁻ (white ppt with AgNO₃, soluble in NH₃)." },
                { id: "Q3c", label: "(c) Tests on FA 8 (solid)", marks: 4,
                  instruction: "Test 1: Heat FA 8 in a hard-glass test tube. Test 2: Dissolve in dilute HCl, test solution with NaOH. Test 3: Test solution with AgNO₃ solution. Record all observations." },
                { id: "Q3d", label: "(d) Identity of FA 8", marks: 1,
                  instruction: "Suggest the identity of FA 8 from your observations. Justify your answer." },
            ],
        },
    ],
},

// ─── Paper 6 ── Practice D ────────────────────────────────────────────────────
{
    id: "p6",
    title: "Practice Paper D – Iodometric Titration",
    subtitle: "Paper 3 Advanced Practical Skills 1 – Practice",
    time: "2 hours",
    marks: 40,
    faMap: {
        "FA 1": "Na2S2O3_titrant",
        "FA 2": "H2O2",
        "FA 3": "KI",
        "FA 4": "H2SO4",
        "FA 5": "starch",
        "FA 6": "NaOH",
        "FA 7": "HCl",
        "FA 8": "CuSO4",
    },
    unknownFAs: ["FA 8"],
    questions: [
        {
            id: "Q1", type: "quantitative",
            title: "Question 1 – Iodometric Titration (H₂O₂ + KI)",
            marks: 16,
            context: `Hydrogen peroxide oxidises iodide ions in acidic solution:
H₂O₂(aq) + 2KI(aq) + H₂SO₄(aq) → I₂(aq) + K₂SO₄(aq) + 2H₂O(l)
The iodine produced is titrated with sodium thiosulfate.

FA 1 = Na₂S₂O₃ (22.00 g Na₂S₂O₃·5H₂O per dm³)
FA 2 = H₂O₂ solution (concentration unknown)
FA 3 = 0.50 mol dm⁻³ KI
FA 4 = 1.00 mol dm⁻³ H₂SO₄
FA 5 = starch solution`,
            parts: [
                { id: "Q1a", label: "(a) Titration", marks: 7,
                  instruction: "Fill burette with FA 1. Pipette 25.0 cm³ FA 2 into conical flask. Add 10 cm³ FA 3 and 10 cm³ FA 4. Titrate FA 1 into the brown/yellow solution until pale yellow, then add 10 drops FA 5. Continue to endpoint (blue → colourless). Record all readings. Carry out rough and two accurate titrations." },
                { id: "Q1b", label: "(b) Mean titre", marks: 1,
                  instruction: "Determine a mean titre from consistent accurate readings.", },
                { id: "Q1c", label: "(c)(i) n(Na₂S₂O₃)", marks: 1,
                  instruction: "Calculate the amount, in mol, of Na₂S₂O₃ in the mean titre.",
                  calculationGuide: "n(Na₂S₂O₃) = (22.00/248.2) × titre/1000" },
                { id: "Q1d", label: "(c)(ii) n(I₂)", marks: 1,
                  instruction: "Calculate n(I₂) produced.",
                  calculationGuide: "n(I₂) = ½ n(Na₂S₂O₃)" },
                { id: "Q1e", label: "(c)(iii) n(H₂O₂)", marks: 1,
                  instruction: "Calculate the amount, in mol, of H₂O₂ in 25.0 cm³ of FA 2.",
                  calculationGuide: "n(H₂O₂) = n(I₂) (1:1 ratio)" },
                { id: "Q1f", label: "(c)(iv) Concentration of H₂O₂", marks: 1,
                  instruction: "Calculate the concentration, in mol dm⁻³, of FA 2.",
                  calculationGuide: "c(H₂O₂) = n(H₂O₂) / 0.0250" },
                { id: "Q1g", label: "(d) Role of starch", marks: 1,
                  instruction: "Explain why starch is added near the endpoint rather than at the start.",
                  answerKey: "At high [I₂], starch forms a very strong blue-black complex that is slow to decolour, making it difficult to reach a sharp endpoint. Added near endpoint, the colour change is sharper and more precise." },
                { id: "Q1h", label: "(e) Accuracy", marks: 3,
                  instruction: "Record all burette readings. Consistent accurate titres within ±0.10 cm³." },
            ],
        },
        {
            id: "Q2", type: "energetics",
            title: "Question 2 – Enthalpy of Neutralisation",
            marks: 11,
            context: `Determine the enthalpy change of neutralisation for:
NaOH(aq) + HCl(aq) → NaCl(aq) + H₂O(l)

FA 6 = 2.00 mol dm⁻³ NaOH
FA 7 = 2.00 mol dm⁻³ HCl`,
            parts: [
                { id: "Q2a", label: "(a) Method", marks: 3,
                  instruction: "Measure 25.0 cm³ FA 6 into a polystyrene cup. Record initial temperature. Measure 25.0 cm³ FA 7 in a measuring cylinder and record its temperature. Calculate mean initial temperature. Add FA 7 to FA 6, stir, record maximum temperature. Calculate ΔT." },
                { id: "Q2b", label: "(b)(i) Heat energy", marks: 1,
                  instruction: "Calculate the heat energy released. Assume total mass = 50 g, c = 4.18 J g⁻¹ K⁻¹.",
                  calculationGuide: "q = 50 × 4.18 × ΔT (J)" },
                { id: "Q2c", label: "(b)(ii) n(NaOH) reacted", marks: 1,
                  instruction: "Calculate the amount, in mol, of NaOH in 25.0 cm³ of FA 6.",
                  calculationGuide: "n(NaOH) = 2.00 × 25.0/1000 = 0.0500 mol" },
                { id: "Q2d", label: "(b)(iii) ΔH neutralisation", marks: 2,
                  instruction: "Calculate ΔH in kJ mol⁻¹ of water formed. Sign must be negative.",
                  calculationGuide: "ΔH = −q / (1000 × 0.0500)" },
                { id: "Q2e", label: "(c) Literature value", marks: 2,
                  instruction: "The literature value for enthalpy of neutralisation is −57.1 kJ mol⁻¹. Explain why your experimental value is likely to be less negative.",
                  answerKey: "Heat losses to surroundings and to the polystyrene cup mean not all the energy released by neutralisation goes into raising the temperature of the solution. The measured ΔT is smaller than the true value." },
                { id: "Q2f", label: "(d) Weak acid comparison", marks: 2,
                  instruction: "Predict whether the enthalpy of neutralisation of a weak acid (e.g. ethanoic acid) with NaOH would be more or less negative than −57.1 kJ mol⁻¹. Explain.",
                  answerKey: "Less negative. Some energy must be used to dissociate the weak acid (endothermic). The net enthalpy released is therefore smaller." },
            ],
        },
        {
            id: "Q3", type: "qualitative",
            title: "Question 3 – Qualitative Analysis (Mixed Ions)",
            marks: 13,
            context: `FA 8 contains a mixture of ions. You will identify the cation and anion present.
No additional tests should be attempted beyond those listed.`,
            parts: [
                { id: "Q3a", label: "(a) Tests on FA 8", marks: 6,
                  instruction: "Test 1: add NaOH(aq) dropwise then in excess. Test 2: add NH₃(aq) dropwise then in excess. Test 3: add BaCl₂ solution then add dilute HCl. Test 4: add AgNO₃ solution then add NH₃(aq). Record all observations in a table." },
                { id: "Q3b", label: "(b) Identify cation", marks: 2,
                  instruction: "Use your observations from Test 1 and Test 2 to identify the cation in FA 8." },
                { id: "Q3c", label: "(c) Identify anion", marks: 2,
                  instruction: "Use your observations from Tests 3 and 4 to identify the anion in FA 8." },
                { id: "Q3d", label: "(d) Ionic equation", marks: 1,
                  instruction: "Write an ionic equation with state symbols for the reaction that confirms the identity of the anion.",
                  answerKey: "e.g. for SO₄²⁻: Ba²⁺(aq) + SO₄²⁻(aq) → BaSO₄(s)  / for Cl⁻: Ag⁺(aq) + Cl⁻(aq) → AgCl(s)" },
                { id: "Q3e", label: "(e) Formula of FA 8", marks: 2,
                  instruction: "Give the formula of the compound in FA 8 and explain any observations that confirm your identification.",
                  answerKey: "Depends on identified ions. e.g. CuCl₂: pale blue ppt with NaOH (Cu²⁺); white ppt with AgNO₃ soluble in NH₃ (Cl⁻)." },
            ],
        },
    ],
},

// ─── Paper 7 ── Practice E ────────────────────────────────────────────────────
{
    id: "p7",
    title: "Practice Paper E – Thiosulfate Concentration Series",
    subtitle: "Paper 3 Advanced Practical Skills 1 – Practice",
    time: "2 hours",
    marks: 40,
    faMap: {
        "FA 1": "Na2S2O3",
        "FA 2": "HCl",
        "FA 3": "CuSO4",
        "FA 5": "CuSO4",
        "FA 6": "NH4Cl",
        "FA 7": "CaCl2",
    },
    unknownFAs: ["FA 5", "FA 6", "FA 7"],
    questions: [
        {
            id: "Q1", type: "quantitative",
            title: "Question 1 – Rate vs Concentration (6 Experiments)",
            marks: 17,
            context: `Investigate how the volume (and hence concentration) of FA 1 affects the rate of the thiosulfate–acid reaction. Total volume of FA 1 + distilled water = 50.00 cm³ in each experiment. Add 5.0 cm³ FA 2.

FA 1 = 0.10 mol dm⁻³ Na₂S₂O₃
FA 2 = 2.00 mol dm⁻³ HCl`,
            parts: [
                { id: "Q1a", label: "(a) Method & table", marks: 8,
                  instruction: "Prepare a results table. Carry out 6 experiments with FA 1 volumes: 50.00, 40.00, 30.00, 20.00, 15.00, 10.00 cm³. Make up to 50.00 cm³ with distilled water each time. Add 5.0 cm³ FA 2. Record reaction time and relative rate (1000/t)." },
                { id: "Q1b", label: "(b) Graph", marks: 4,
                  instruction: "Plot relative rate vs volume of FA 1. Draw a line of best fit. Do not include origin." },
                { id: "Q1c", label: "(c) Rate law", marks: 2,
                  instruction: "From your graph, deduce whether the rate is directly proportional to the concentration of Na₂S₂O₃. Explain your reasoning.",
                  answerKey: "If graph is linear through origin, rate ∝ [Na₂S₂O₃], i.e. first order with respect to Na₂S₂O₃." },
                { id: "Q1d", label: "(d) Effect of HCl volume", marks: 1,
                  instruction: "Predict what would happen to the reaction time if the volume of FA 2 was doubled, keeping FA 1 volume constant. Explain.",
                  answerKey: "Time would decrease (rate increases). Higher [H⁺] increases the rate of the reaction." },
                { id: "Q1e", label: "(e) Precision", marks: 2,
                  instruction: "Describe how you would ensure consistent precision in measuring time across the 6 experiments.",
                  answerKey: "Use the same method to judge opacity (e.g. same cross/insert, same observer). Start clock immediately on mixing. Only one person should stop the clock." },
            ],
        },
        {
            id: "Q2", type: "energetics",
            title: "Question 2 – Enthalpy Change (Cu + displacement series)",
            marks: 10,
            context: `Compare enthalpy changes for two displacement reactions:
(i) Mg(s) + CuSO₄(aq) → Cu(s) + MgSO₄(aq)
(ii) Zn(s) + CuSO₄(aq) → Cu(s) + ZnSO₄(aq)

FA 3 = 1.0 mol dm⁻³ CuSO₄
FA 4a = magnesium powder;  FA 4b = zinc powder`,
            parts: [
                { id: "Q2a", label: "(a) Method", marks: 3,
                  instruction: "Carry out both experiments using 50.0 cm³ FA 3 and approximately equimolar quantities of FA 4a and FA 4b. Record initial and maximum temperatures in each case." },
                { id: "Q2b", label: "(b) ΔH for each reaction", marks: 4,
                  instruction: "Calculate ΔH (kJ mol⁻¹) for each reaction. Show all working.",
                  calculationGuide: "ΔH = −q / (1000 × n(metal))" },
                { id: "Q2c", label: "(c) Comparison", marks: 3,
                  instruction: "State which reaction releases more energy. Explain this in terms of electrode potentials and reactivity.",
                  answerKey: "Mg reaction releases more energy. Mg has a more negative standard electrode potential (E° = −2.37 V) than Zn (E° = −0.76 V). The greater the difference in E° with Cu (+0.34 V), the more energy is released." },
            ],
        },
        {
            id: "Q3", type: "qualitative",
            title: "Question 3 – Qualitative Analysis (Mixed Cation & Anion)",
            marks: 13,
            context: `FA 5, FA 6 and FA 7 are aqueous solutions each containing a cation.`,
            parts: [
                { id: "Q3a", label: "(a) Tests on FA 5–7", marks: 6,
                  instruction: "Test 1: Add NaOH dropwise then in excess. Test 2: Add NH₃(aq) dropwise then in excess. For FA 6 only: Test 3: warm with NaOH and test gas with damp red litmus. Record all observations." },
                { id: "Q3b", label: "(b) Identify cations", marks: 3,
                  instruction: "Identify the cation in each of FA 5, FA 6 and FA 7. Give reasons.",
                  answerKey: "FA 6: NH₄⁺ (ammonia gas with NaOH turns litmus blue). FA 7: Ca²⁺ or Mg²⁺ (white ppt, insoluble in excess). FA 5: Cu²⁺ (pale blue ppt, soluble in excess NH₃ giving deep blue)." },
                { id: "Q3c", label: "(c) Ionic equations", marks: 2,
                  instruction: "Write ionic equations for: (i) precipitation of cation in FA 5 with NaOH. (ii) ammonium ion with NaOH, producing gas.",
                  answerKey: "(i) Cu²⁺(aq) + 2OH⁻(aq) → Cu(OH)₂(s). (ii) NH₄⁺(aq) + OH⁻(aq) → NH₃(g) + H₂O(l)" },
                { id: "Q3d", label: "(d) Anion tests on FA 5", marks: 2,
                  instruction: "Describe tests to confirm whether FA 5 contains Cl⁻, Br⁻ or I⁻ and give expected observations.",
                  answerKey: "Add AgNO₃; if Cl⁻: white ppt soluble in NH₃. If Br⁻: cream ppt, partially soluble. If I⁻: yellow ppt, insoluble in NH₃." },
            ],
        },
    ],
},

// ─── Paper 8 ── Practice F ────────────────────────────────────────────────────
{
    id: "p8",
    title: "Practice Paper F – Marble Chips Rate & Enthalpy",
    subtitle: "Paper 3 Advanced Practical Skills 1 – Practice",
    time: "2 hours",
    marks: 40,
    faMap: {
        "FA 1": "HCl",
        "FA 3": "Na2CO3",
        "FA 4": "KNO3",
        "FA 5": "NaNO2",
        "FA 6": "NH4Cl",
        "FA 7": "KMnO4_acid",
        "FA 8": "NaOH",
    },
    unknownFAs: ["FA 4", "FA 5", "FA 6"],
    questions: [
        {
            id: "Q1", type: "quantitative",
            title: "Question 1 – Rate of Reaction (Marble + HCl)",
            marks: 17,
            context: `CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + CO₂(g) + H₂O(l)

You will investigate how the surface area of marble chips affects the rate of gas production.
FA 1 = 1.00 mol dm⁻³ HCl
FA 2a = large marble chips; FA 2b = small marble chips; FA 2c = marble powder (same total mass each time)`,
            parts: [
                { id: "Q1a", label: "(a) Method & results", marks: 8,
                  instruction: "Use 50 cm³ FA 1 and 5.0 g of marble in each experiment. Measure CO₂ volume collected over a gas syringe at 30 s intervals for 5 min. Record results in a table: time (s), volume CO₂ (cm³) for each marble form." },
                { id: "Q1b", label: "(b) Graph", marks: 4,
                  instruction: "Plot volume CO₂ (y-axis) vs time (x-axis) for all three experiments on the same axes. Label each curve clearly. Draw smooth curves through the points." },
                { id: "Q1c", label: "(c) Initial rate", marks: 2,
                  instruction: "Calculate the initial rate of each reaction from the gradient of a tangent drawn at t = 0 on your graph.",
                  calculationGuide: "Initial rate = gradient of tangent at t = 0 (cm³ s⁻¹)" },
                { id: "Q1d", label: "(d) Surface area effect", marks: 1,
                  instruction: "State the relationship between surface area and initial rate of reaction. Explain using collision theory.",
                  answerKey: "Increasing surface area increases the rate of reaction. More surface area exposed means more particle–particle collisions per unit time, increasing the frequency of successful collisions." },
                { id: "Q1e", label: "(e) Same final volume", marks: 1,
                  instruction: "Predict whether the final volume of CO₂ collected will be the same or different for the three experiments. Explain.",
                  answerKey: "Same. All use the same mass of CaCO₃ and the same amount of HCl (in excess). The total moles of CO₂ produced depends only on the moles of limiting reagent, not surface area." },
                { id: "Q1f", label: "(f) Further experiment", marks: 1,
                  instruction: "Suggest a further experiment to investigate one other factor affecting the rate of this reaction. State the variable changed and kept constant.",
                  answerKey: "Vary [HCl], keeping mass and size of marble, temperature, and volume constant. OR vary temperature, keeping [HCl] and marble constant." },
            ],
        },
        {
            id: "Q2", type: "energetics",
            title: "Question 2 – Enthalpy of Dissolution (NH₄NO₃)",
            marks: 10,
            context: `Determine the enthalpy of dissolution of ammonium nitrate:
NH₄NO₃(s) → NH₄⁺(aq) + NO₃⁻(aq)

FA 3 = ammonium nitrate, NH₄NO₃ (solid, Mr = 80.0)`,
            parts: [
                { id: "Q2a", label: "(a) Method", marks: 3,
                  instruction: "Measure 100.0 cm³ of distilled water into a polystyrene cup. Record initial temperature. Weigh approximately 2.00 g FA 3. Add FA 3 to water and stir until dissolved. Record minimum temperature (endothermic)." },
                { id: "Q2b", label: "(b)(i) Heat energy", marks: 1,
                  instruction: "Calculate the heat energy absorbed. Assume mass of solution = 102 g, c = 4.18 J g⁻¹ K⁻¹.",
                  calculationGuide: "q = 102 × 4.18 × |ΔT| (J, positive for endothermic)" },
                { id: "Q2c", label: "(b)(ii) n(NH₄NO₃)", marks: 1,
                  instruction: "Calculate the amount, in mol, of NH₄NO₃ dissolved.",
                  calculationGuide: "n = mass / 80.0" },
                { id: "Q2d", label: "(b)(iii) ΔH", marks: 2,
                  instruction: "Calculate ΔH in kJ mol⁻¹. Sign must be positive (endothermic).",
                  calculationGuide: "ΔH = +q / (1000 × n)" },
                { id: "Q2e", label: "(c) Application", marks: 3,
                  instruction: "Ammonium nitrate is used in instant cold packs. Explain why using a polystyrene container rather than a glass beaker gives a more accurate value of ΔH.",
                  answerKey: "Polystyrene is a good thermal insulator; less heat is absorbed by the container, so more of the heat exchange is measured via the temperature change of the solution. Glass absorbs more heat, reducing the observed temperature change and making ΔH less accurate." },
            ],
        },
        {
            id: "Q3", type: "qualitative",
            title: "Question 3 – Qualitative Analysis (Nitrogen Compounds)",
            marks: 13,
            context: `FA 4, FA 5 and FA 6 each contain a nitrogen compound.

FA 7 = acidified KMnO₄
FA 8 = aqueous NaOH`,
            parts: [
                { id: "Q3a", label: "(a) Tests on FA 4–6", marks: 5,
                  instruction: "Test 1: Add NaOH (FA 8), warm gently; test gas with damp red litmus. Test 2: Add acidified KMnO₄ (FA 7). Test 3: Add aluminium foil to FA 8 + solution in boiling tube; warm. Record all observations." },
                { id: "Q3b", label: "(b) Identify ions", marks: 3,
                  instruction: "Identify the nitrogen-containing ion in each of FA 4, FA 5 and FA 6.",
                  answerKey: "NH₄⁺: litmus turns blue on warming with NaOH. NO₂⁻: decolourises acidified KMnO₄; NH₃ on warming with NaOH + Al foil. NO₃⁻: no immediate reaction; NH₃ only with NaOH + Al foil + warming." },
                { id: "Q3c", label: "(c) Test to distinguish NO₂⁻ from NO₃⁻", marks: 2,
                  instruction: "Describe a test that distinguishes NO₂⁻ from NO₃⁻ without using Al foil.",
                  answerKey: "Add acidified KMnO₄. NO₂⁻ decolourises the purple KMnO₄ (it is oxidised by MnO₄⁻). NO₃⁻ does not decolourise KMnO₄." },
                { id: "Q3d", label: "(d) Ionic equation", marks: 1,
                  instruction: "Write an ionic equation for the reaction of NO₂⁻ with acidified KMnO₄.",
                  answerKey: "2MnO₄⁻(aq) + 5NO₂⁻(aq) + 6H⁺(aq) → 2Mn²⁺(aq) + 5NO₃⁻(aq) + 3H₂O(l)" },
                { id: "Q3e", label: "(e) Gas test", marks: 2,
                  instruction: "Describe the test and result for ammonia gas.",
                  answerKey: "Hold damp red litmus paper in the gas. The paper turns blue, confirming NH₃." },
            ],
        },
    ],
},

// ─── Papers 9–20: Condensed Practice Papers ──────────────────────────────────

// Paper 9 – Practice G
{
    id: "p9",
    title: "Practice Paper G – Thiosulfate Clock & Gas Gravimetry",
    subtitle: "Paper 3 Advanced Practical Skills 1 – Practice",
    time: "2 hours", marks: 40,
    faMap: {
        "FA 1": "Na2S2O3",
        "FA 2": "HCl",
        "FA 3": "HCl",
        "FA 4": "CuSO4",
        "FA 5": "H2SO4",
        "FA 6": "Na2SO3",
        "FA 7": "Na2S2O3",
    },
    unknownFAs: ["FA 5", "FA 6", "FA 7"],
    questions: [
        {
            id: "Q1", type: "quantitative",
            title: "Question 1 – Thiosulfate Clock (Variable [HCl])",
            marks: 17,
            context: `Investigate how [HCl] affects the rate of reaction with Na₂S₂O₃. Keep [Na₂S₂O₃] constant at 25.00 cm³ FA 1. Vary FA 2 volume (5–25 cm³); add distilled water to keep total acid + water = 25 cm³.

FA 1 = 0.10 mol dm⁻³ Na₂S₂O₃
FA 2 = 2.00 mol dm⁻³ HCl`,
            parts: [
                { id: "Q1a", label: "(a) Results table & 5 experiments", marks: 8,
                  instruction: "Record: vol FA 2, vol water, time, relative rate. Perform 5 experiments with FA 2 volumes 5.0, 10.0, 15.0, 20.0, 25.0 cm³." },
                { id: "Q1b", label: "(b) Graph", marks: 4,
                  instruction: "Plot relative rate vs vol FA 2. Draw best-fit line." },
                { id: "Q1c", label: "(c) Predict at vol FA 2 = 12.5 cm³", marks: 2,
                  instruction: "Use graph to predict relative rate and hence time at 12.5 cm³ FA 2.",
                  calculationGuide: "time = 1000 / relative rate" },
                { id: "Q1d", label: "(d) HCl order of reaction", marks: 1,
                  instruction: "State what order of reaction with respect to H⁺ your graph suggests. Justify.",
                  answerKey: "First order if graph is linear through origin: rate ∝ [H⁺]." },
                { id: "Q1e", label: "(e) Control variable", marks: 1,
                  instruction: "State one variable kept constant and explain its importance.",
                  answerKey: "Temperature kept constant: temperature affects rate of reaction independently of concentration." },
                { id: "Q1f", label: "(f) Evaluation", marks: 1,
                  instruction: "Describe one limitation of using reaction time as a measure of rate.",
                  answerKey: "The end point (opacity) is subjective; different observers may stop the clock at different points. This introduces random error." },
            ],
        },
        {
            id: "Q2", type: "quantitative",
            title: "Question 2 – Gravimetric Analysis (CO₂ from CaCO₃ + HCl)",
            marks: 10,
            context: `CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂(O(l) + CO₂(g)

FA 3 = excess 2.00 mol dm⁻³ HCl
FA 4 = impure calcium carbonate sample`,
            parts: [
                { id: "Q2a", label: "(a) Method", marks: 3,
                  instruction: "Weigh conical flask + lid + FA 3. Add a known mass (~2 g) of FA 4. React until no further bubbling. Reweigh. Mass loss = mass of CO₂." },
                { id: "Q2b", label: "(b)(i) n(CO₂)", marks: 1,
                  instruction: "Calculate the amount, in mol, of CO₂ produced. (Mr CO₂ = 44.0)",
                  calculationGuide: "n(CO₂) = mass loss / 44.0" },
                { id: "Q2c", label: "(b)(ii) n(CaCO₃)", marks: 1,
                  instruction: "Calculate amount of CaCO₃ that reacted. (1:1 ratio)",
                  calculationGuide: "n(CaCO₃) = n(CO₂)" },
                { id: "Q2d", label: "(b)(iii) % purity", marks: 2,
                  instruction: "Calculate the percentage purity of the CaCO₃ sample. (Mr CaCO₃ = 100.1)",
                  calculationGuide: "% purity = (n(CaCO₃) × 100.1 / mass FA 4) × 100" },
                { id: "Q2e", label: "(c) Uncertainty", marks: 3,
                  instruction: "Explain why weighing before and after may underestimate the CO₂ produced. Suggest how to minimise this error.",
                  answerKey: "CO₂ dissolved in the acid solution is not counted. Use a gas syringe to collect all gas. Alternatively, let reaction finish completely in a closed flask weighed before and after." },
            ],
        },
        {
            id: "Q3", type: "qualitative",
            title: "Question 3 – Qualitative Analysis (Sulfate, Sulfite, Thiosulfate)",
            marks: 13,
            context: `FA 5, FA 6, FA 7 each contain one of: SO₄²⁻, SO₃²⁻, S₂O₃²⁻.
Use reagents: BaCl₂, HCl, acidified KMnO₄, Mg ribbon, AgNO₃, NaOH.`,
            parts: [
                { id: "Q3a", label: "(a) Systematic tests", marks: 5,
                  instruction: "Design and carry out 3 tests that allow you to distinguish between SO₄²⁻, SO₃²⁻ and S₂O₃²⁻. Record all observations in a table." },
                { id: "Q3b", label: "(b) Identify anions", marks: 3,
                  instruction: "Identify the anion in each of FA 5, FA 6 and FA 7.",
                  answerKey: "SO₄²⁻: white ppt with BaCl₂, insoluble in HCl; no reaction with KMnO₄. SO₃²⁻: white ppt with BaCl₂, soluble in HCl; decolourises KMnO₄. S₂O₃²⁻: off-white/yellow ppt slowly with H⁺." },
                { id: "Q3c", label: "(c) Ionic equations for BaCl₂ tests", marks: 2,
                  instruction: "Write ionic equations for (i) SO₄²⁻ + Ba²⁺ and (ii) SO₃²⁻ + Ba²⁺.",
                  answerKey: "(i) Ba²⁺(aq) + SO₄²⁻(aq) → BaSO₄(s). (ii) Ba²⁺(aq) + SO₃²⁻(aq) → BaSO₃(s)." },
                { id: "Q3d", label: "(d) Further test for S₂O₃²⁻", marks: 1,
                  instruction: "Describe a test to confirm the presence of S₂O₃²⁻ and state the expected observation.",
                  answerKey: "Add dilute HCl; pale yellow/off-white precipitate of sulfur forms slowly. Characteristic clouding of the solution." },
                { id: "Q3e", label: "(e) Practical safety", marks: 2,
                  instruction: "State two safety precautions when working with concentrated HCl in the laboratory.",
                  answerKey: "Work in a fume cupboard; wear eye protection; avoid inhaling fumes; use gloves." },
            ],
        },
    ],
},

// Paper 10 – Practice H
{
    id: "p10",
    title: "Practice Paper H – Back-Titration & Enthalpy",
    subtitle: "Paper 3 Advanced Practical Skills 1 – Practice",
    time: "2 hours", marks: 40,
    faMap: {
        "FA 1": "HCl",
        "FA 2": "NaOH",
        "FA 3": "Na2CO3",
        "FA 4": "H2SO4",
        "FA 5": "Zn_powder",
        "FA 6": "FeSO4",
        "FA 7": "FeCl3",
        "FA 8": "CuSO4",
    },
    unknownFAs: ["FA 6", "FA 7", "FA 8"],
    questions: [
        {
            id: "Q1", type: "quantitative",
            title: "Question 1 – Back-Titration (CaCO₃ content of limestone)",
            marks: 17,
            context: `Limestone contains CaCO₃. A known excess of HCl dissolves the CaCO₃; the remaining HCl is titrated with NaOH.
CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + CO₂(g) + H₂O(l)
HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)

FA 1 = 1.000 mol dm⁻³ HCl (exactly 50.0 cm³ used)
FA 2 = 0.500 mol dm⁻³ NaOH
FA 3 = limestone sample (impure CaCO₃)
Indicator: methyl orange`,
            parts: [
                { id: "Q1a", label: "(a) Preparation", marks: 2,
                  instruction: "Weigh approximately 2.50 g FA 3. Add to 50.0 cm³ FA 1 in a beaker. Heat gently until no further effervescence. Cool. Transfer quantitatively to 250 cm³ volumetric flask; make up to mark with distilled water. Stopper and mix." },
                { id: "Q1b", label: "(b) Titration", marks: 7,
                  instruction: "Pipette 25.0 cm³ aliquots from the flask into conical flasks. Add methyl orange indicator. Titrate each aliquot with FA 2 (burette). Record all burette readings for rough and accurate titrations." },
                { id: "Q1c", label: "(c) Mean titre", marks: 1,
                  instruction: "Calculate mean titre of FA 2.",
                  calculationGuide: "Average of consistent titres ±0.10 cm³" },
                { id: "Q1d", label: "(d)(i) n(NaOH)", marks: 1,
                  instruction: "Calculate n(NaOH) in the mean titre.",
                  calculationGuide: "n(NaOH) = 0.500 × titre/1000" },
                { id: "Q1e", label: "(d)(ii) n(HCl) excess in aliquot", marks: 1,
                  instruction: "Calculate n(HCl) unreacted in the 25.0 cm³ aliquot.",
                  calculationGuide: "n(HCl) excess = n(NaOH) (1:1)" },
                { id: "Q1f", label: "(d)(iii) n(HCl) reacted with CaCO₃", marks: 1,
                  instruction: "Calculate n(HCl) that reacted with CaCO₃ in the 250 cm³ flask.",
                  calculationGuide: "n(HCl) total = 1.000×0.0500 = 0.0500. n(HCl) excess in whole flask = n(aliquot excess)×10. n(HCl) reacted = total − excess." },
                { id: "Q1g", label: "(d)(iv) % CaCO₃", marks: 2,
                  instruction: "Calculate the percentage by mass of CaCO₃ in the limestone sample. (Mr CaCO₃ = 100.1)",
                  calculationGuide: "n(CaCO₃) = ½n(HCl reacted). mass CaCO₃ = n×100.1. % = mass/sample×100." },
                { id: "Q1h", label: "(e) Source of error", marks: 2,
                  instruction: "State one source of error in this experiment and explain how it would affect the calculated % CaCO₃.",
                  answerKey: "Not all solution transferred to volumetric flask → n(HCl) remaining appears higher → n(CaCO₃) calculated lower → % CaCO₃ appears lower." },
            ],
        },
        {
            id: "Q2", type: "energetics",
            title: "Question 2 – Enthalpy of Reaction (Zn + H₂SO₄)",
            marks: 10,
            context: `Zn(s) + H₂SO₄(aq) → ZnSO₄(aq) + H₂(g)

FA 4 = 1.00 mol dm⁻³ H₂SO₄
FA 5 = zinc powder`,
            parts: [
                { id: "Q2a", label: "(a) Method", marks: 3,
                  instruction: "Measure 50.0 cm³ FA 4 into a polystyrene cup. Weigh ~0.65 g FA 5. Record initial temperature. Add FA 5, stir continuously. Record maximum temperature." },
                { id: "Q2b", label: "(b)(i) q", marks: 1,
                  instruction: "Calculate heat energy produced.",
                  calculationGuide: "q = 50 × 4.18 × ΔT" },
                { id: "Q2c", label: "(b)(ii) Limiting reagent", marks: 1,
                  instruction: "Determine which reactant is limiting. (Ar Zn = 65.4; n(H₂SO₄) = 0.050 mol)",
                  answerKey: "n(Zn) = mass/65.4 ≈ 0.010 mol. Zn is limiting." },
                { id: "Q2d", label: "(b)(iii) ΔH", marks: 2,
                  instruction: "Calculate ΔH in kJ mol⁻¹.",
                  calculationGuide: "ΔH = −q / (1000 × n(Zn))" },
                { id: "Q2e", label: "(c) Hess's Law", marks: 3,
                  instruction: "The standard enthalpy of formation of ZnSO₄(aq) can be determined via Hess's Law. Describe the additional experiments needed and the calculation cycle.",
                  answerKey: "Measure ΔH for: (i) Zn+H₂SO₄(aq)→ZnSO₄(aq)+H₂. (ii) H₂+½O₂→H₂O. (iii) Zn+½O₂→ZnO. Apply Hess's Law with given standard enthalpy data." },
            ],
        },
        {
            id: "Q3", type: "qualitative",
            title: "Question 3 – Qualitative Analysis (Cations: Fe²⁺, Fe³⁺, Cu²⁺)",
            marks: 13,
            context: `FA 6, FA 7 and FA 8 each contain one of the cations: Fe²⁺, Fe³⁺ or Cu²⁺.
Carry out tests using NaOH, NH₃(aq) and acidified KMnO₄.`,
            parts: [
                { id: "Q3a", label: "(a) Tests", marks: 6,
                  instruction: "Test 1: add NaOH(aq) dropwise then in excess. Test 2: add NH₃(aq) dropwise then in excess. Test 3: add acidified KMnO₄. Record all observations in a table for each FA." },
                { id: "Q3b", label: "(b) Identify cations", marks: 3,
                  instruction: "Use observations to identify the cation in FA 6, FA 7 and FA 8.",
                  answerKey: "Fe²⁺: green ppt (NaOH/NH₃), turns brown in air; decolourises KMnO₄. Fe³⁺: red-brown ppt (both); no reaction with KMnO₄. Cu²⁺: pale blue ppt (NaOH), soluble in excess NH₃ (deep blue)." },
                { id: "Q3c", label: "(c) Oxidation of Fe²⁺", marks: 2,
                  instruction: "Write an ionic equation for the oxidation of Fe²⁺ to Fe³⁺ by acidified KMnO₄.",
                  answerKey: "MnO₄⁻(aq) + 5Fe²⁺(aq) + 8H⁺(aq) → Mn²⁺(aq) + 5Fe³⁺(aq) + 4H₂O(l)" },
                { id: "Q3d", label: "(d) Confirmatory test for Cu²⁺", marks: 2,
                  instruction: "Describe a test to confirm Cu²⁺ is present, beyond the NaOH test. State expected observation.",
                  answerKey: "Add excess NH₃(aq). Pale blue precipitate dissolves to give a deep blue solution (tetraamminecopper(II) complex, [Cu(NH₃)₄]²⁺)." },
            ],
        },
    ],
},

// Papers 11–20: Additional condensed practice papers
...[
    {
        id: "p11", title: "Practice Paper I – Alum Formula & Ion Tests",
        subtitle: "Paper 3 Advanced Practical Skills 1 – Practice",
        time: "2 hours", marks: 40,
        faMap: { "FA 1": "potassium_alum_hydrated", "FA 2": "Na2CO3", "FA 3": "HCl", "FA 4": "FeCl3" },
        unknownFAs: ["FA 4"],
        q1title: "Question 1 – Water of Crystallisation (Iron(II) Sulfate)",
        q1context: "A hydrated iron(II) sulfate sample loses water on heating. Determine the value of x in FeSO₄·xH₂O.\nFA 1 is a hydrated crystalline solid.",
        q1marks: 11,
        q2title: "Question 2 – Acid–Base Titration (Na₂CO₃ + HCl)",
        q2context: "Na₂CO₃(aq) + 2HCl(aq) → 2NaCl(aq) + CO₂(g) + H₂O(l)\nFA 2 = 0.100 mol dm⁻³ sodium carbonate solution; FA 3 = hydrochloric acid (unknown concentration); indicator: methyl orange",
        q2marks: 16,
        q3title: "Question 3 – Qualitative Analysis (Mixed Ion Identification)",
        q3context: "FA 4 is an unknown aqueous solution that may contain multiple ions.\nCarry out systematic tests to identify all cations and anions present.",
        q3marks: 13,
    },
    {
        id: "p12", title: "Practice Paper J – Rate vs Temperature & Enthalpy",
        subtitle: "Paper 3 Advanced Practical Skills 1 – Practice",
        time: "2 hours", marks: 40,
        faMap: { "FA 1": "Na2S2O3", "FA 2": "HCl", "FA 3": "HCl", "FA 4": "NaOH", "FA 5": "KBr", "FA 6": "Na2SO3" },
        unknownFAs: ["FA 5", "FA 6"],
        q1title: "Question 1 – Thiosulfate Clock (Temperature Variation, 5 pts)",
        q1context: "Keep [Na₂S₂O₃] and [HCl] constant. Vary temperature from 15–55 °C in 10 °C steps.\nFA 1 = 0.10 mol dm⁻³ thiosulfate solution; FA 2 = 2.00 mol dm⁻³ acid solution",
        q1marks: 17,
        q2title: "Question 2 – Enthalpy of Neutralisation (Weak Acid)",
        q2context: "CH₃COOH(aq) + NaOH(aq) → CH₃COONa(aq) + H₂O(l)\nFA 3 = 2.00 mol dm⁻³ weak acid solution; FA 4 = 2.00 mol dm⁻³ alkali solution",
        q2marks: 10,
        q3title: "Question 3 – Qualitative Analysis (Halides + Sulfur Anions)",
        q3context: "FA 5 and FA 6 are aqueous solutions each containing an anion.\nFA 5 contains one halide anion; FA 6 contains one sulfur-containing anion.\nUse appropriate reagents to identify each anion.",
        q3marks: 13,
    },
    {
        id: "p13", title: "Practice Paper K – Iodometric Titration (Revisited)",
        subtitle: "Paper 3 Advanced Practical Skills 1 – Practice",
        time: "2 hours", marks: 40,
        faMap: { "FA 1": "Na2S2O3_titrant", "FA 2": "KI", "FA 3": "KI", "FA 4": "H2SO4", "FA 5": "starch", "FA 6": "CuSO4", "FA 7": "Zn", "FA 8": "CuSO4", "FA 9": "FeSO4", "FA 10": "FeCl3" },
        unknownFAs: ["FA 8", "FA 9", "FA 10"],
        q1title: "Question 1 – Iodometric Titration (Determination of KIO₃ purity)",
        q1context: "KIO₃ oxidises I⁻ in acid: IO₃⁻ + 5I⁻ + 6H⁺ → 3I₂ + 3H₂O. Iodine is titrated with sodium thiosulfate.\nFA 1 = sodium thiosulfate solution; FA 2 = impure potassium iodate sample; FA 3 = potassium iodide solution; FA 4 = dilute sulfuric acid; FA 5 = indicator solution",
        q1marks: 16,
        q2title: "Question 2 – Enthalpy of Displacement (Fe + CuSO₄)",
        q2context: "Fe(s) + CuSO₄(aq) → Cu(s) + FeSO₄(aq)\nFA 6 = transition metal salt solution; FA 7 = metal powder",
        q2marks: 11,
        q3title: "Question 3 – Qualitative Analysis (Transition Metal Ions)",
        q3context: "FA 8, FA 9 and FA 10 are aqueous solutions each containing a transition metal cation.\nThe cation in each is one of: Cu²⁺, Fe²⁺, Fe³⁺, Mn²⁺, Cr³⁺.\nCarry out systematic tests to identify the cation in each solution.",
        q3marks: 13,
    },
    {
        id: "p14", title: "Practice Paper L – Gravimetric & Enthalpy Combustion",
        subtitle: "Paper 3 Advanced Practical Skills 1 – Practice",
        time: "2 hours", marks: 40,
        faMap: { "FA 1": "CuSO4", "FA 2": "BaCl2", "FA 3": "HCl", "FA 4": "Na2CO3", "FA 5": "KNO3", "FA 6": "NaCl" },
        unknownFAs: ["FA 4", "FA 5", "FA 6"],
        q1title: "Question 1 – Gravimetric Analysis (BaSO₄ precipitation)",
        q1context: "SO₄²⁻(aq) + Ba²⁺(aq) → BaSO₄(s)\nFA 1 = sulfate-containing solution (unknown concentration); FA 2 = precipitating reagent solution",
        q1marks: 11,
        q2title: "Question 2 – Enthalpy of Combustion (Ethanol)",
        q2context: "CH₃CH₂OH(l) + 3O₂(g) → 2CO₂(g) + 3H₂O(l)\nFA 3 = liquid fuel; use a spirit lamp and calorimeter (copper can + 200 cm³ water)",
        q2marks: 16,
        q3title: "Question 3 – Qualitative Analysis (Carbonate, Nitrate, Sulfate, Chloride)",
        q3context: "FA 4, FA 5 and FA 6 are aqueous solutions.\nEach solution contains one or two anions from the following: CO₃²⁻, NO₃⁻, SO₄²⁻, Cl⁻.\nCarry out systematic tests to identify all anions present in each solution.",
        q3marks: 13,
    },
    {
        id: "p15", title: "Practice Paper M – Comprehensive Rate Investigation",
        subtitle: "Paper 3 Advanced Practical Skills 1 – Practice",
        time: "2 hours", marks: 40,
        faMap: { "FA 1": "Na2S2O3", "FA 2": "HCl", "FA 3": "KNO3", "FA 4": "CaCl2", "FA 5": "BaCl2", "FA 6": "CaCl2" },
        unknownFAs: ["FA 4", "FA 5", "FA 6"],
        q1title: "Question 1 – Thiosulfate Clock (Concentration + Temperature Matrix)",
        q1context: "First set: vary [Na₂S₂O₃] at 25 °C. Second set: vary temperature at fixed [Na₂S₂O₃].\nFA 1 = thiosulfate solution; FA 2 = acid solution",
        q1marks: 17,
        q2title: "Question 2 – Enthalpy of Solution",
        q2context: "An ionic solid dissolves endothermically: solid → cation(aq) + anion(aq), ΔH = +ve\nFA 3 is an ionic solid. Determine ΔH of solution.",
        q2marks: 10,
        q3title: "Question 3 – Qualitative Analysis (Group 2 Cations)",
        q3context: "FA 4, FA 5 and FA 6 each contain one Group 2 cation: Ca²⁺, Sr²⁺ or Ba²⁺.\nUse NaOH(aq), NH₃(aq), dilute H₂SO₄ and flame tests to identify the cation in each solution.",
        q3marks: 13,
    },
    {
        id: "p16", title: "Practice Paper N – KMnO₄ Titration & Qualitative",
        subtitle: "Paper 3 Advanced Practical Skills 1 – Practice",
        time: "2 hours", marks: 40,
        faMap: { "FA 1": "KMnO4_acid", "FA 2": "oxalic_acid", "FA 3": "H2SO4", "FA 4": "H2SO4", "FA 5": "Mg_ribbon", "FA 6": "CuSO4", "FA 7": "FeCl3", "FA 8": "Zn" },
        unknownFAs: ["FA 6", "FA 7", "FA 8"],
        q1title: "Question 1 – KMnO₄ vs Oxalic Acid Titration",
        q1context: "2KMnO₄(aq) + 5H₂C₂O₄(aq) + 3H₂SO₄(aq) → 2MnSO₄(aq) + K₂SO₄(aq) + 10CO₂(g) + 8H₂O(l)\nFA 1 = potassium manganate(VII) solution; FA 2 = dicarboxylic acid solution (unknown concentration); FA 3 = dilute sulfuric acid\nWarm flask to ~60 °C before titrating (slow reaction at room temperature).",
        q1marks: 17,
        q2title: "Question 2 – Enthalpy of Reaction (Mg + H₂SO₄)",
        q2context: "Mg(s) + H₂SO₄(aq) → MgSO₄(aq) + H₂(g)\nFA 4 = acid solution; FA 5 = metal in ribbon form",
        q2marks: 10,
        q3title: "Question 3 – Qualitative Analysis (Transition Metals + Anions)",
        q3context: "FA 6, FA 7 and FA 8 are aqueous solutions each containing a transition metal cation and an anion.\nCarry out systematic tests to identify the cation and anion in each solution.",
        q3marks: 13,
    },
    {
        id: "p17", title: "Practice Paper O – Na₂CO₃ Titration & Halide QA",
        subtitle: "Paper 3 Advanced Practical Skills 1 – Practice",
        time: "2 hours", marks: 40,
        faMap: { "FA 1": "Na2CO3", "FA 2": "HCl", "FA 3": "CuSO4", "FA 4": "Mg_powder", "FA 5": "NaCl", "FA 6": "KBr", "FA 7": "KI" },
        unknownFAs: ["FA 5", "FA 6", "FA 7"],
        q1title: "Question 1 – Acid-Base Titration (Na₂CO₃ vs HCl, two-stage)",
        q1context: "First endpoint (phenolphthalein): Na₂CO₃ + HCl → NaHCO₃ + NaCl\nSecond endpoint (methyl orange): NaHCO₃ + HCl → NaCl + CO₂ + H₂O\nFA 1 = carbonate solution; FA 2 = acid solution (unknown concentration)",
        q1marks: 17,
        q2title: "Question 2 – Enthalpy of Displacement (Mg + CuSO₄, extended)",
        q2context: "Mg(s) + CuSO₄(aq) → Cu(s) + MgSO₄(aq)\nRepeat experiment 3 times with different masses of Mg. Plot ΔT vs mass Mg.\nFA 3 = transition metal salt solution; FA 4 = reactive metal powder",
        q2marks: 10,
        q3title: "Question 3 – Qualitative Analysis (Halide + Sulfur Anion Pairs)",
        q3context: "FA 5, FA 6 and FA 7 are aqueous solutions. Each solution contains one halide anion and one sulfur-containing anion.\nDesign and carry out tests to identify both anions in each solution.",
        q3marks: 13,
    },
    {
        id: "p18", title: "Practice Paper P – Alum Revisited & Comprehensive QA",
        subtitle: "Paper 3 Advanced Practical Skills 1 – Practice",
        time: "2 hours", marks: 40,
        faMap: { "FA 1": "potassium_alum_hydrated", "FA 2": "Na2S2O3_titrant", "FA 3": "H2O2", "FA 4": "KI", "FA 5": "starch", "FA 6": "CaCl2", "FA 7": "CuSO4", "FA 8": "NaCl", "FA 9": "NH4Cl" },
        unknownFAs: ["FA 6", "FA 7", "FA 8", "FA 9"],
        q1title: "Question 1 – Water of Crystallisation",
        q1context: "A hydrated salt loses water on heating: salt·nH₂O(s) → anhydrous salt(s) + nH₂O(g)\nFA 1 is a white crystalline hydrated solid. Determine the value of n.",
        q1marks: 11,
        q2title: "Question 2 – Iodometric Titration",
        q2context: "An oxidising agent reacts with KI to liberate I₂, which is titrated with Na₂S₂O₃.\nFA 2 = sodium thiosulfate solution; FA 3 = oxidising agent solution (unknown); FA 4 = potassium iodide solution; FA 5 = indicator solution",
        q2marks: 16,
        q3title: "Question 3 – Qualitative Analysis (s-block and p-block Cations)",
        q3context: "FA 6, FA 7, FA 8 and FA 9 are aqueous solutions each containing a cation.\nThe cation in each is one of: Al³⁺, Zn²⁺, Mg²⁺, Ca²⁺, NH₄⁺, Cu²⁺.\nUse systematic tests with NaOH(aq) and NH₃(aq) to identify the cation in each solution.",
        q3marks: 13,
    },
    {
        id: "p19", title: "Practice Paper Q – Mixed Quantitative & QA",
        subtitle: "Paper 3 Advanced Practical Skills 1 – Practice",
        time: "2 hours", marks: 40,
        faMap: { "FA 1": "Na2S2O3", "FA 2": "HCl", "FA 3": "CuSO4", "FA 4": "Mg_powder", "FA 5": "CuSO4" },
        unknownFAs: ["FA 5"],
        q1title: "Question 1 – Thiosulfate Clock (6-Point Concentration Series)",
        q1context: "Full investigation: vary thiosulfate volume from 5.00 to 30.00 cm³, keeping total volume = 35 cm³ (distilled water added). Use 5.0 cm³ acid each time.\nFA 1 = thiosulfate solution; FA 2 = acid solution",
        q1marks: 17,
        q2title: "Question 2 – Enthalpy of Displacement (polystyrene calorimeter)",
        q2context: "Full quantitative investigation of ΔH using improved technique with temperature-time graph.\nFA 3 = solution of a metal salt; FA 4 = more reactive metal powder",
        q2marks: 10,
        q3title: "Question 3 – Qualitative Analysis (Mixed Cation and Anion Identification)",
        q3context: "FA 5 is an unknown aqueous solution containing three or more ions.\nThe ions present are from the following pool: NH₄⁺, Fe²⁺, Cu²⁺, Cl⁻, Br⁻, SO₄²⁻.\nCarry out tests to identify all ions present.",
        q3marks: 13,
    },
    {
        id: "p20", title: "Practice Paper R – Redox Titration & Comprehensive",
        subtitle: "Paper 3 Advanced Practical Skills 1 – Practice",
        time: "2 hours", marks: 40,
        faMap: { "FA 1": "KMnO4_acid", "FA 2": "FeSO4", "FA 3": "NaOH", "FA 4": "HCl", "FA 5": "CuSO4" },
        unknownFAs: ["FA 5"],
        q1title: "Question 1 – Redox Titration (KMnO₄ vs Fe²⁺, purity determination)",
        q1context: "MnO₄⁻ + 5Fe²⁺ + 8H⁺ → Mn²⁺ + 5Fe³⁺ + 4H₂O\nFA 1 = potassium manganate(VII) solution; FA 2 = impure hydrated iron(II) salt dissolved in dilute acid",
        q1marks: 17,
        q2title: "Question 2 – Enthalpy of Neutralisation",
        q2context: "Strong alkali + strong acid → salt + water\nFA 3 = alkali solution; FA 4 = acid solution",
        q2marks: 10,
        q3title: "Question 3 – Qualitative Analysis (Complete Unknown)",
        q3context: "FA 5 is an unknown aqueous solution that may contain up to four ions.\nYou have access to: NaOH(aq), NH₃(aq), BaCl₂(aq), AgNO₃(aq), dilute HCl, acidified KMnO₄.\nCarry out systematic tests to identify all cations and anions present.",
        q3marks: 13,
    },
].map(p => ({
    id: p.id,
    title: p.title,
    subtitle: p.subtitle,
    time: p.time,
    marks: p.marks,
    faMap: p.faMap ?? {},
    unknownFAs: p.unknownFAs ?? [],
    questions: [
        {
            id: "Q1", type: "quantitative",
            title: p.q1title, marks: p.q1marks,
            context: p.q1context,
            parts: [
                { id: "Q1a", label: "(a) Method & Results table", marks: Math.ceil(p.q1marks * 0.47),
                  instruction: "Read through the whole method. Prepare a suitable results table. Carry out the experiment as described. Record all raw data with appropriate precision and units.",
                  hint: "Show precision of apparatus in recorded data (e.g. burette to 0.05 cm³, balance to 0.01 g, thermometer to 0.5 °C)." },
                { id: "Q1b", label: "(b) Calculations", marks: Math.floor(p.q1marks * 0.30),
                  instruction: "Show all working. Give answers to an appropriate number of significant figures with correct units.",
                  calculationGuide: "Check each step: mol = conc × vol/1000; Mr calculations; percentage calculations as required." },
                { id: "Q1c", label: "(c) Evaluation & error analysis", marks: Math.floor(p.q1marks * 0.23),
                  instruction: "Calculate the percentage uncertainty in the key measurement. Identify one source of systematic error and explain how it affects the result.",
                  answerKey: "% uncertainty = (absolute uncertainty / measured value) × 100. Systematic error: consider incomplete reaction, heat loss, indicator error, or apparatus precision." },
            ],
        },
        {
            id: "Q2", type: "energetics",
            title: p.q2title, marks: p.q2marks,
            context: p.q2context,
            parts: [
                { id: "Q2a", label: "(a) Method & Results", marks: 3,
                  instruction: "Carry out the experiment. Record all masses and temperatures with appropriate precision. Show the precision of the apparatus used.",
                  hint: "Temperature to nearest 0.5 °C; balance to 2 d.p." },
                { id: "Q2b", label: "(b) Calculations: q and ΔH", marks: 4,
                  instruction: "Calculate q = mcΔT (J). Identify the limiting reagent. Calculate ΔH in kJ mol⁻¹ with correct sign.",
                  calculationGuide: "q = mass × 4.18 × ΔT; ΔH = ±q/(1000 × n(limiting reactant))" },
                { id: "Q2c", label: "(c) Accuracy & improvement", marks: 3,
                  instruction: "Explain why your value may differ from the true value of ΔH. Describe a method improvement to reduce heat loss error.",
                  answerKey: "Heat losses to surroundings and calorimeter reduce ΔT below true value. Plot temperature vs time, extrapolate to time of mixing to obtain true ΔT_max." },
            ],
        },
        {
            id: "Q3", type: "qualitative",
            title: p.q3title, marks: p.q3marks,
            context: p.q3context,
            parts: [
                { id: "Q3a", label: "(a) Systematic tests", marks: 6,
                  instruction: "Carry out appropriate tests using the reagents available. Record ALL observations (colour changes, precipitate formation, gas evolution) in a clearly organised table. Where no change is observed, write 'no change'." },
                { id: "Q3b", label: "(b) Identify ions", marks: 4,
                  instruction: "Use your observations to identify the ions present in each solution. Give the formula of each ion identified and justify from your observations.",
                  answerKey: "Refer to Qualitative Analysis notes. Match observations to expected results: precipitate colour + solubility in excess NaOH/NH₃ identifies cations; BaCl₂, AgNO₃ tests identify anions." },
                { id: "Q3c", label: "(c) Ionic equations", marks: 2,
                  instruction: "Write ionic equations (with state symbols) for two of the reactions you observed.",
                  answerKey: "Select two clear observations and write balanced ionic equations with (aq), (s), (g), (l) state symbols." },
                { id: "Q3d", label: "(d) Further test", marks: 1,
                  instruction: "Suggest one further test to confirm the identity of one ion. State expected observation.",
                  answerKey: "Choose any ion identified and suggest a confirmatory test not already carried out. e.g. flame test for Group 1/2 cations; KSCN for Fe³⁺; excess NH₃ for Cu²⁺." },
            ],
        },
    ],
})),

// ─── Paper p_m21 ── February / March 2021 (real) ─────────────────────────────
{
    id: "p_m21",
    title: "9701/33 February/March 2021",
    subtitle: "Paper 3 Advanced Practical Skills 1",
    time: "2 hours",
    marks: 40,
    faMap: {
        "FA 1": "H2SO4",
        "FA 2": "NaHCO3",
        "FA 3": "NaHCO3_aq",
        "FA 4": "NaHCO3",
        "FA 5": "Na2CO3",
        "FA 6": "NH4Cl_solid",
        "FA 7": "NH4I",
        "FA 8": "BaCl2",
    },
    unknownFAs: ["FA 2", "FA 3", "FA 4", "FA 6", "FA 7", "FA 8"],
    questions: [
        {
            id: "Q1", type: "quantitative",
            title: "Question 1 – Titration to Identify a Group 1 Metal",
            marks: 16,
            context: `A Group 1 metal M forms a hydrogencarbonate salt MHCO₃. You will determine the relative formula mass, Mr, of MHCO₃ and hence identify M.

FA 1 = 0.0550 mol dm⁻³ sulfuric acid, H₂SO₄
FA 2 = solid MHCO₃ (Group 1 metal hydrogencarbonate; unknown)
FA 3 = solution prepared by dissolving FA 2 in distilled water and making up to 250 cm³
Indicator: bromophenol blue

Reaction: 2MHCO₃(aq) + H₂SO₄(aq) → M₂SO₄(aq) + 2H₂O(l) + 2CO₂(g)`,
            parts: [
                { id: "Q1a", label: "(a)(i) Method & Results Table", marks: 7,
                  instruction: "Weigh ~2.0 g FA 2. Dissolve completely in distilled water, transfer to a 250 cm³ volumetric flask, make up to the mark with distilled water → FA 3. Fill burette with FA 1 (H₂SO₄). Pipette 25.0 cm³ FA 3 into a conical flask; add 2–3 drops bromophenol blue. Perform rough titration then at least two accurate titrations. Record all burette readings to 0.05 cm³ in a suitable table.",
                  hint: "Endpoint: blue/green (alkaline MHCO₃) → yellow (acid in excess). Rinse and fill burette carefully." },
                { id: "Q1b", label: "(a)(ii) Mean titre", marks: 1,
                  instruction: "Calculate a suitable mean titre from your accurate consistent results. Show working.",
                  calculationGuide: "Select titres within ±0.10 cm³. Mean to 0.01 cm³." },
                { id: "Q1c", label: "(b)(i) n(H₂SO₄)", marks: 1,
                  instruction: "Calculate the amount, in mol, of H₂SO₄ in the mean titre volume of FA 1.",
                  calculationGuide: "n(H₂SO₄) = 0.0550 × (mean titre / 1000)" },
                { id: "Q1d", label: "(b)(ii) n(MHCO₃) in 25.0 cm³", marks: 1,
                  instruction: "Use the equation to find the amount, in mol, of MHCO₃ that reacted with the H₂SO₄ in (b)(i). (2MHCO₃ : 1H₂SO₄)",
                  calculationGuide: "n(MHCO₃) = 2 × n(H₂SO₄)" },
                { id: "Q1e", label: "(b)(iii) n(MHCO₃) in 250 cm³", marks: 1,
                  instruction: "Calculate the amount, in mol, of MHCO₃ in the full 250 cm³ solution.",
                  calculationGuide: "n(MHCO₃) in 250 cm³ = n(MHCO₃) in 25 cm³ × 10" },
                { id: "Q1f", label: "(b)(iv) Mr of MHCO₃", marks: 1,
                  instruction: "Calculate the relative formula mass, Mr, of MHCO₃. (Use your recorded mass of FA 2.)",
                  calculationGuide: "Mr = mass of FA 2 / n(MHCO₃) in 250 cm³" },
                { id: "Q1g", label: "(b)(v) Identify M and MHCO₃", marks: 1,
                  instruction: "Use your Mr to identify M (the Group 1 metal) and state the formula of MHCO₃. Show reasoning. Relative atomic masses: Li=6.9, Na=23.0, K=39.1, Rb=85.5, Cs=132.9. (Mr MHCO₃ = Ar(M) + 1 + 12 + 48 = Ar(M) + 61)",
                  answerKey: "MHCO₃ has Mr = Ar(M) + 61. If M = Na: Mr = 23+61 = 84. If M = K: Mr = 39.1+61 = 100.1. Identify M from calculated Mr." },
                { id: "Q1h", label: "(c)(i) Percentage error in mass", marks: 1,
                  instruction: "The uncertainty in a single balance reading is ±0.01 g. Calculate the maximum percentage error in the mass of FA 2 used.",
                  calculationGuide: "% error = (2 × 0.01) / mass of FA 2 × 100" },
                { id: "Q1i", label: "(c)(ii) Burette vs pipette accuracy", marks: 2,
                  instruction: "A student suggests that a more accurate value of Mr would be obtained if both FA 1 (H₂SO₄) and FA 3 (MHCO₃ solution) were measured using a pipette. State whether this would improve accuracy and explain why.",
                  answerKey: "Partially correct. Measuring FA 3 with a pipette would be accurate (pipette more precise than burette for fixed volumes). However FA 1 (H₂SO₄) must be from a burette because variable volumes are added to find the endpoint. A burette is appropriate for the titrant (FA 1); a pipette is appropriate for the aliquot (FA 3)." },
            ],
        },
        {
            id: "Q2", type: "energetics",
            title: "Question 2 – Thermal Decomposition of MHCO₃",
            marks: 12,
            context: `The hydrogencarbonate FA 4 (same compound as FA 2) undergoes thermal decomposition:
2MHCO₃(s) → M₂CO₃(s) + CO₂(g) + H₂O(g)

The residue after heating is FA 5 (the carbonate M₂CO₃).

FA 4 = solid MHCO₃ (same as FA 2)
FA 5 = residue (metal carbonate M₂CO₃) after heating FA 4`,
            parts: [
                { id: "Q2a", label: "(a) Method & Results Table", marks: 4,
                  instruction: "Weigh a clean, dry crucible with lid. Add approximately 2.0 g FA 4. Reweigh crucible + lid + FA 4. Heat strongly for 5 minutes (lid on). Cool completely (at least 5 min). Reweigh. Heat again for 3 minutes. Cool. Reweigh. Record masses: (I) crucible+lid, (II) crucible+lid+FA 4, (III) after 1st heating, (IV) after 2nd heating.",
                  hint: "Two heating cycles ensure constant mass. Mass(IV)−Mass(I) = residue. Mass(II)−Mass(IV) = mass loss." },
                { id: "Q2b", label: "(b)(i) Mass of FA 4 and mass loss", marks: 1,
                  instruction: "Calculate the mass of FA 4 used and the total mass loss on heating.",
                  calculationGuide: "mass FA 4 = (II) − (I); mass loss = (II) − (IV)" },
                { id: "Q2c", label: "(b)(ii) n(CO₂) and n(H₂O) evolved", marks: 1,
                  instruction: "From the stoichiometry 2MHCO₃ → M₂CO₃ + CO₂ + H₂O, the mass loss = mass of CO₂ + mass of H₂O per 2 mol MHCO₃. Use your mass loss to calculate n(MHCO₃). (Mr of CO₂ = 44.0; Mr of H₂O = 18.0; combined = 62.0 per 2 mol MHCO₃).",
                  calculationGuide: "n(MHCO₃) = (2 × mass loss) / 62.0" },
                { id: "Q2d", label: "(b)(iii) Mr of MHCO₃ from thermal method", marks: 1,
                  instruction: "Calculate Mr of MHCO₃ using the thermal decomposition data.",
                  calculationGuide: "Mr = mass of FA 4 / n(MHCO₃)" },
                { id: "Q2e", label: "(c) Test on FA 5 with dilute HCl", marks: 2,
                  instruction: "Add a small amount of FA 5 (residue M₂CO₃) to a test-tube. Add dilute HCl (1 cm depth). Record your observations.",
                  answerKey: "Vigorous effervescence. Colourless, odourless gas evolved. Turns limewater milky — confirms CO₂. M₂CO₃(s) + 2HCl(aq) → 2MCl(aq) + H₂O(l) + CO₂(g). Confirms carbonate anion CO₃²⁻ in residue." },
                { id: "Q2f", label: "(d) Identify M from both methods", marks: 1,
                  instruction: "Compare your Mr values from Q1 (titration method) and Q2 (thermal method). Identify M and state whether the two values are consistent.",
                  answerKey: "Both Mr values should identify the same Group 1 metal (e.g. Mr ≈ 84 → M = Na; Mr ≈ 100 → M = K). Comment on agreement/disagreement and sources of error in each method." },
                { id: "Q2g", label: "(e) Evaluation of methods", marks: 2,
                  instruction: "Suggest which method (titration in Q1 or thermal decomposition in Q2) gives a more accurate value of Mr. Give reasons based on sources of error in each method.",
                  answerKey: "Titration method: main error is balance (% error in mass). Thermal method: main error is incomplete decomposition or hygroscopic residue absorbing moisture. Titration may be more accurate if burette readings are precise. Accept any well-reasoned comparison." },
            ],
        },
        {
            id: "Q3", type: "qualitative",
            title: "Question 3 – Qualitative Analysis (Ammonium Salts and BaCl₂)",
            marks: 12,
            context: `FA 6 is a solid. FA 7 and FA 8 are aqueous solutions.

Reagents available: acidified KMnO₄, starch solution, AgNO₃, NH₃(aq), NaOH(aq), Al foil, dilute H₂SO₄, distilled water, bromophenol blue indicator, limewater.

Use 1 cm depth of solutions for each test unless stated otherwise.`,
            parts: [
                { id: "Q3a", label: "(a) Test on FA 6 (solid, heating)", marks: 3,
                  instruction: "Place a small spatula of FA 6 in a dry test-tube. Heat gently, then strongly. Hold damp red litmus paper in the vapour above. Record all observations (colour, physical change, gas tests).",
                  answerKey: "White solid sublimes completely on heating — no coloured residue. White solid rings/smoke visible near top of tube. White smoke has pungent smell. Damp red litmus paper turns blue (NH₃ vapour near top), then blue litmus turns red (HCl vapour above). Confirms NH₄Cl: sublimation with NH₃+HCl. FA 6 = NH₄Cl." },
                { id: "Q3b", label: "(b) Tests on FA 7 and FA 8", marks: 7,
                  instruction: "Carry out the following tests. Record ALL observations in a results table with columns for Test, FA 7, FA 8.\n\nTest 1: Add 2–3 drops acidified KMnO₄, then add 2–3 drops starch solution.\nTest 2: Add 2–3 drops AgNO₃, then add NH₃(aq) dropwise; note if precipitate dissolves.\nTest 3: Add NaOH(aq) dropwise at room temperature (cold); record precipitate.\nTest 4: Add NaOH(aq), warm gently; hold damp red litmus paper in vapour.\nTest 5: Add 2–3 drops dilute H₂SO₄; record observation.",
                  hint: "For Test 1, the combination of KMnO₄ (oxidant) + starch is used together to detect I⁻. For Test 2, a pale yellow precipitate insoluble in NH₃ confirms I⁻ (AgI)." },
                { id: "Q3c", label: "(c) Identify anions in FA 7 and FA 8", marks: 2,
                  instruction: "Use your observations from (b) to identify the anions in FA 7 and FA 8. Give the formula of each anion and justify from your observations.",
                  answerKey: "FA 7 = NH₄I:\n• Test 1: KMnO₄ decolourised (I⁻ reduces MnO₄⁻ → I₂ formed), starch turns blue-black (I₂). Anion = I⁻.\n• Test 2: Pale yellow ppt (AgI) insoluble in NH₃. Confirms I⁻.\n• Test 4: NH₃ evolved on warming (NH₄⁺). Cation = NH₄⁺.\n• Test 5: No visible change (I⁻ not oxidised by dilute H₂SO₄).\n\nFA 8 = BaCl₂:\n• Test 2: White/curdy ppt (AgCl) partially soluble in dilute NH₃. Anion = Cl⁻.\n• Test 3: White ppt (Ba(OH)₂) insoluble in excess NaOH. Cation = Ba²⁺.\n• Test 5: White ppt (BaSO₄) insoluble in acid. SO₄²⁻ from H₂SO₄ precipitates Ba²⁺." },
            ],
        },
    ],
},

// ─── Paper p_m22 ── February / March 2022 (real) ─────────────────────────────
{
    id: "p_m22",
    title: "9701/33 February/March 2022",
    subtitle: "Paper 3 Advanced Practical Skills 1",
    time: "2 hours",
    marks: 40,
    faMap: {
        "FA 1": "NaOH",
        "FA 2": "H2SO4",
        "FA 3": "Na2SO3",
        "FA 4": "I2_solution",
        "FA 5": "Na2S2O3_std",
        "FA 6": "starch",
        "FA 7": "Na2S2O3",
        "FA 8": "AlNH4SO4_aq",
    },
    unknownFAs: ["FA 7", "FA 8"],
    questions: [
        {
            id: "Q1", type: "energetics",
            title: "Question 1 – Thermometric Titration (NaOH + H₂SO₄)",
            marks: 12,
            context: `A thermometric titration measures temperature change as acid is added to alkali. The temperature vs volume graph gives the equivalence point by intersection of two best-fit lines.

FA 1 = 1.90 mol dm⁻³ sodium hydroxide, NaOH (measure 25.0 cm³ into polystyrene cup)
FA 2 = dilute sulfuric acid, H₂SO₄ (concentration unknown; in burette)

Reaction: 2NaOH(aq) + H₂SO₄(aq) → Na₂SO₄(aq) + 2H₂O(l)   ΔH = −57.6 kJ mol⁻¹ (theoretical)`,
            parts: [
                { id: "Q1a", label: "(a) Method & Results Table", marks: 5,
                  instruction: "Measure exactly 25.0 cm³ FA 1 into a polystyrene cup in a 250 cm³ beaker. Record initial temperature (T₀) to 0.1°C. Fill burette with FA 2. Add 5.0 cm³ FA 2, stir gently, record temperature. Repeat, adding 5.0 cm³ portions up to 45.0 cm³ total. Record results in a table: Vol FA 2 added (cm³) | Temperature (°C).",
                  hint: "Stir gently and consistently between readings. Record temperature ~30 s after each addition. Keep polystyrene cup still to minimise heat loss." },
                { id: "Q1b", label: "(b) Graph and equivalence point", marks: 3,
                  instruction: "Plot temperature (y-axis) against volume of FA 2 added (x-axis). Draw two straight lines of best fit — one for the rising portion (before equivalence) and one for the falling/level portion (after equivalence). Extrapolate both lines and read off the volume of FA 2 at the intersection — this is the equivalence volume, V_eq.",
                  calculationGuide: "V_eq from graph: volume FA 2 that exactly neutralises 25.0 cm³ FA 1." },
                { id: "Q1c", label: "(c)(i) Concentration of FA 2", marks: 2,
                  instruction: "Calculate the concentration of FA 2 (H₂SO₄). Use: n(NaOH) = 1.90 × 25.0/1000; n(H₂SO₄) = ½ × n(NaOH); c(H₂SO₄) = n(H₂SO₄) / (V_eq/1000).",
                  calculationGuide: "c(H₂SO₄) = (1.90 × 25.0 × 10⁻³ × 0.5) / (V_eq × 10⁻³)" },
                { id: "Q1d", label: "(c)(ii) ΔH of neutralisation", marks: 1,
                  instruction: "Use the maximum temperature rise ΔT from your graph to calculate ΔH (kJ mol⁻¹). Assume total mass = total volume × 1.00 g/cm³; specific heat = 4.18 J g⁻¹ K⁻¹.",
                  calculationGuide: "q = m × 4.18 × ΔT (J); n(H₂O) = n(NaOH) = 0.0475 mol; ΔH = −q / (1000 × n(H₂O)) kJ mol⁻¹" },
                { id: "Q1e", label: "(d) % error and explanation", marks: 1,
                  instruction: "Calculate the percentage difference between your ΔH and the theoretical value (−57.6 kJ mol⁻¹). Suggest one reason why the experimental value is less negative than the theoretical.",
                  answerKey: "% difference = |ΔH_exp − (−57.6)| / 57.6 × 100. Reasons for less negative: heat loss to surroundings/polystyrene cup; heat absorbed by thermometer; not accounting for heat capacity of cup/thermometer; incorrect extrapolation." },
            ],
        },
        {
            id: "Q2", type: "quantitative",
            title: "Question 2 – Water of Crystallisation (Na₂SO₃·xH₂O via Iodometry)",
            marks: 15,
            context: `Sodium sulfite can be crystallised as Na₂SO₃·xH₂O. The reaction with iodine is:
Na₂SO₃(aq) + I₂(aq) + H₂O(l) → Na₂SO₄(aq) + 2HI(aq)

Excess I₂ is back-titrated with Na₂S₂O₃:
I₂(aq) + 2Na₂S₂O₃(aq) → 2NaI(aq) + Na₂S₄O₆(aq)

FA 3 = solution of Na₂SO₃·xH₂O (31.50 g dm⁻³; made from hydrated salt)
FA 4 = 0.100 mol dm⁻³ iodine solution, I₂(aq)
FA 5 = 0.100 mol dm⁻³ sodium thiosulfate, Na₂S₂O₃
FA 6 = starch solution (indicator)`,
            parts: [
                { id: "Q2a", label: "(a) Titration method & results", marks: 6,
                  instruction: "Fill burette with FA 5 (Na₂S₂O₃). Pipette 25.0 cm³ FA 3 into a conical flask. Add 25.0 cm³ FA 4 (I₂ solution) from a measuring cylinder — excess I₂. Titrate immediately with FA 5. When the solution turns pale yellow, add ~10 drops FA 6 (starch) — blue-black appears. Continue dropwise until blue-black JUST disappears permanently (endpoint). Record all burette readings. Carry out at least 2 accurate titrations.",
                  hint: "The I₂ oxidises SO₃²⁻ immediately. Titrate excess I₂ with Na₂S₂O₃. Add starch near endpoint only (when pale yellow) for a sharp colour change." },
                { id: "Q2b", label: "(b) Mean titre", marks: 1,
                  instruction: "Calculate a suitable mean titre from consistent accurate results. Show working.",
                  calculationGuide: "Select titres within ±0.10 cm³. Mean to 0.01 cm³." },
                { id: "Q2c", label: "(c)(i) n(Na₂S₂O₃) in mean titre", marks: 1,
                  instruction: "Calculate the amount, in mol, of Na₂S₂O₃ in the mean titre volume.",
                  calculationGuide: "n(Na₂S₂O₃) = 0.100 × (mean titre / 1000)" },
                { id: "Q2d", label: "(c)(ii) n(I₂) consumed by Na₂S₂O₃", marks: 1,
                  instruction: "Calculate the amount of excess I₂ that reacted with Na₂S₂O₃ in (c)(i). (1 mol I₂ reacts with 2 mol Na₂S₂O₃)",
                  calculationGuide: "n(I₂) excess = ½ × n(Na₂S₂O₃)" },
                { id: "Q2e", label: "(c)(iii) n(I₂) that reacted with Na₂SO₃", marks: 1,
                  instruction: "Calculate n(I₂) that reacted with the Na₂SO₃ in the 25.0 cm³ aliquot. Total I₂ added = 25.0 × 0.100/1000 mol.",
                  calculationGuide: "n(I₂) reacted = (0.100 × 25.0/1000) − n(I₂) excess" },
                { id: "Q2f", label: "(c)(iv) n(Na₂SO₃) and molar mass", marks: 2,
                  instruction: "Calculate n(Na₂SO₃) in 25.0 cm³ FA 3. (1 mol Na₂SO₃ reacts with 1 mol I₂). Then calculate the molar mass of Na₂SO₃·xH₂O from the concentration (31.50 g dm⁻³) and n(Na₂SO₃) per dm³.",
                  calculationGuide: "n(Na₂SO₃) = n(I₂ reacted); n per dm³ = n per 25cm³ × 40; Mr = 31.50 / n per dm³" },
                { id: "Q2g", label: "(c)(v) Value of x", marks: 2,
                  instruction: "Calculate x in Na₂SO₃·xH₂O. (Mr of Na₂SO₃ = 126.0; Mr of H₂O = 18.0)",
                  calculationGuide: "x = (Mr calculated − 126.0) / 18.0; round x to nearest integer" },
                { id: "Q2h", label: "(d) Role of Na₂CO₃", marks: 1,
                  instruction: "A student suggests that adding Na₂CO₃ to the flask before adding I₂ would make the titration more accurate. Explain why Na₂CO₃ is added.",
                  answerKey: "Na₂CO₃ (alkali) neutralises HI produced during the reaction. HI in acid conditions can reverse-react with the product Na₂SO₄ or catalyse side reactions. Buffering the solution at pH ~8 ensures complete, forward reaction and prevents oxidation of SO₃²⁻ by dissolved O₂." },
            ],
        },
        {
            id: "Q3", type: "qualitative",
            title: "Question 3 – Qualitative Analysis (Na₂S₂O₃ and Alum)",
            marks: 13,
            context: `FA 7 and FA 8 are aqueous solutions. Each contains a different set of ions.

Reagents available: dilute HCl, BaCl₂(aq), KMnO₄(aq) (acidified), FeCl₃(aq), NaOH(aq), NH₃(aq), AgNO₃(aq), starch.

Use 1 cm depth of each solution for each test.`,
            parts: [
                { id: "Q3a", label: "(a) Anion tests — FA 7 and FA 8", marks: 5,
                  instruction: "Carry out the following tests on both FA 7 and FA 8. Record ALL observations in a results table.\n\nTest 1 (anion): Add dilute HCl, then BaCl₂ solution. Record precipitate colour and note if it dissolves in HCl.\nTest 2 (reducing anion): Add a few drops acidified KMnO₄.\nTest 3 (thiosulfate vs other): Add a few drops FeCl₃ solution. Note colour change.",
                  hint: "Test 1: BaSO₄ (white, insoluble in HCl) confirms SO₄²⁻; pale yellow ppt (BaS₂O₃) with S₂O₃²⁻ does not dissolve in HCl. Test 2: KMnO₄ decolourised by S₂O₃²⁻ or SO₃²⁻; stays purple for SO₄²⁻. Test 3: FeCl₃ decolourised by S₂O₃²⁻; no change with SO₄²⁻." },
                { id: "Q3b", label: "(b)(i) Identify anions", marks: 2,
                  instruction: "Use your observations to identify the anion in FA 7 and in FA 8. Give ion formula and justify each.",
                  answerKey: "FA 7 = Na₂S₂O₃: Test 1 → pale yellow ppt with BaCl₂/HCl (BaS₂O₃); Test 2 → decolourises KMnO₄ (S₂O₃²⁻ is reducing); Test 3 → decolourises FeCl₃ (confirms S₂O₃²⁻). Anion = S₂O₃²⁻.\n\nFA 8 = AlNH₄(SO₄)₂ (alum): Test 1 → white ppt BaSO₄ insoluble in HCl; Test 2 → KMnO₄ stays purple (SO₄²⁻ not reducing); Test 3 → FeCl₃ no change. Anion = SO₄²⁻." },
                { id: "Q3c", label: "(b)(ii) Cation tests on FA 8", marks: 4,
                  instruction: "Carry out the following cation tests on FA 8 only. Record observations.\n\nTest 4: Add NaOH dropwise to 1 cm FA 8; note precipitate. Continue adding excess NaOH — note if ppt dissolves. Warm the tube and hold damp red litmus in vapour.\nTest 5: Add NH₃(aq) dropwise to fresh 1 cm FA 8; note precipitate. Continue adding excess NH₃ — note if ppt dissolves.",
                  answerKey: "Test 4 (NaOH): White gelatinous ppt forms (Al(OH)₃). Dissolves in excess NaOH → colourless [Al(OH)₄]⁻ (amphoteric). On warming: pungent NH₃ evolved, damp red litmus turns blue (confirms NH₄⁺). Cations: Al³⁺ + NH₄⁺.\nTest 5 (NH₃): White gelatinous ppt (Al(OH)₃) forms. Insoluble in excess NH₃. Confirms Al³⁺ (contrast Cu²⁺ which gives deep blue with excess NH₃)." },
                { id: "Q3d", label: "(c) Ionic equations", marks: 2,
                  instruction: "Write ionic equations with state symbols for:\n(i) Al³⁺ dissolving in excess NaOH.\n(ii) NH₄⁺ reacting with NaOH on warming.",
                  answerKey: "(i) Al(OH)₃(s) + OH⁻(aq) → [Al(OH)₄]⁻(aq)\n(ii) NH₄⁺(aq) + OH⁻(aq) → NH₃(g) + H₂O(l)" },
            ],
        },
    ],
},

// ─── Paper p_m23 ── February / March 2023 (real) ─────────────────────────────
{
    id: "p_m23",
    title: "9701/33 February/March 2023",
    subtitle: "Paper 3 Advanced Practical Skills 1",
    time: "2 hours",
    marks: 40,
    faMap: {
        "FA 1": "basic_zinc_carbonate",
        "FA 2": "HCl",
        "FA 3": "NaOH",
        "FA 4": "bromophenol_blue",
        "FA 5": "CuCO3",
        "FA 6": "HCl",
    },
    unknownFAs: ["FA 1", "FA 5"],
    questions: [
        {
            id: "Q1", type: "quantitative",
            title: "Question 1 – Thermal Decomposition of Basic Zinc Carbonate",
            marks: 10,
            context: `Basic zinc carbonate has formula ZnCO₃·2Zn(OH)₂·xH₂O, where x is to be determined.

Thermal decomposition: ZnCO₃·2Zn(OH)₂·xH₂O(s) → 3ZnO(s) + CO₂(g) + (x+2)H₂O(g)

FA 1 = basic zinc carbonate (solid; unknown x)
Mr(ZnO) = 81.4; Mr(ZnCO₃·2Zn(OH)₂) = 324.2`,
            parts: [
                { id: "Q1a", label: "(a) Method & Results Table", marks: 5,
                  instruction: "Weigh a clean, dry crucible. Add approximately 3.0 g FA 1. Reweigh. Heat strongly for 5 minutes (lid on for first 2 min, then off). Cool completely (at least 5 min). Reweigh. Heat again 3 minutes, cool, reweigh. Record: (I) mass of crucible, (II) crucible + FA 1, (III) after 1st heating, (IV) after 2nd heating.",
                  hint: "Heat to constant mass ensures complete decomposition. ZnO is white when cool but yellow when hot — this is normal." },
                { id: "Q1b", label: "(b)(i) n(ZnO) in residue", marks: 1,
                  instruction: "Calculate the amount, in mol, of ZnO in the residue after heating to constant mass.",
                  calculationGuide: "mass of residue = (IV) − (I); n(ZnO) = mass of residue / 81.4" },
                { id: "Q1c", label: "(b)(ii) n(ZnCO₃·2Zn(OH)₂·xH₂O)", marks: 1,
                  instruction: "Use the stoichiometry (1 mol compound → 3 mol ZnO) to find n(compound).",
                  calculationGuide: "n(compound) = n(ZnO) / 3" },
                { id: "Q1d", label: "(b)(iii) Mr of compound", marks: 1,
                  instruction: "Calculate the relative formula mass, Mr, of ZnCO₃·2Zn(OH)₂·xH₂O.",
                  calculationGuide: "Mr = mass of FA 1 / n(compound)" },
                { id: "Q1e", label: "(b)(iv) Value of x", marks: 2,
                  instruction: "Calculate x. (Mr(ZnCO₃·2Zn(OH)₂) = 324.2; Mr(H₂O) = 18.0)",
                  calculationGuide: "x = (Mr − 324.2) / 18.0; round to nearest integer" },
            ],
        },
        {
            id: "Q2", type: "quantitative",
            title: "Question 2 – Back-Titration to Determine Mr of Basic Zinc Carbonate",
            marks: 17,
            context: `3.52 g FA 1 was dissolved in 100 cm³ of 2.00 mol dm⁻³ HCl (excess). This was diluted to exactly 1.00 dm³ → FA 2 solution.

Reaction: ZnCO₃·2Zn(OH)₂·xH₂O + 6HCl → 3ZnCl₂ + CO₂ + (x+5)H₂O

FA 2 = solution of excess HCl (diluted to 1.00 dm³) — in conical flask (25.0 cm³ aliquots)
FA 3 = 0.150 mol dm⁻³ NaOH — in burette
FA 4 = bromophenol blue indicator`,
            parts: [
                { id: "Q2a", label: "(a) Titration method & results", marks: 7,
                  instruction: "Fill burette with FA 3 (NaOH). Pipette 25.0 cm³ FA 2 into conical flask; add 2–3 drops FA 4 (bromophenol blue). Perform rough titration (acid in flask → yellow; add alkali until green). Then carry out at least two accurate titrations. Record all burette readings to 0.05 cm³ in a suitable table.",
                  hint: "FA 2 is acidic (excess HCl). Indicator starts yellow; endpoint = green (pH ≈ 4.5). Don't overshoot to blue (over-titrated). Rinse conical flask (not pipette) with distilled water between titrations." },
                { id: "Q2b", label: "(b) Mean titre", marks: 1,
                  instruction: "Calculate a suitable mean titre. Show working.",
                  calculationGuide: "Select consistent titres within ±0.10 cm³. Mean to 0.01 cm³." },
                { id: "Q2c", label: "(c)(i) n(NaOH) in mean titre", marks: 1,
                  instruction: "Calculate the amount, in mol, of NaOH in the mean titre.",
                  calculationGuide: "n(NaOH) = 0.150 × (mean titre / 1000)" },
                { id: "Q2d", label: "(c)(ii) n(HCl) in 25.0 cm³ FA 2", marks: 1,
                  instruction: "Calculate the amount of HCl in 25.0 cm³ FA 2. (NaOH + HCl → NaCl + H₂O, 1:1)",
                  calculationGuide: "n(HCl) in 25 cm³ = n(NaOH)" },
                { id: "Q2e", label: "(c)(iii) n(HCl) in 1.00 dm³ FA 2", marks: 1,
                  instruction: "Calculate the amount of HCl in the full 1.00 dm³ FA 2 solution.",
                  calculationGuide: "n(HCl) in 1 dm³ = n(HCl) in 25 cm³ × 40" },
                { id: "Q2f", label: "(c)(iv) n(HCl) that reacted with FA 1", marks: 1,
                  instruction: "Calculate the amount of HCl that reacted with FA 1. Total HCl = 2.00 × 0.100 = 0.200 mol.",
                  calculationGuide: "n(HCl) reacted = 0.200 − n(HCl) in 1 dm³ FA 2" },
                { id: "Q2g", label: "(c)(v) n(FA 1 compound) and Mr", marks: 2,
                  instruction: "Use the ratio (1 mol compound reacts with 6 mol HCl) to find n(FA 1). Then calculate Mr.",
                  calculationGuide: "n(compound) = n(HCl reacted) / 6; Mr = 3.52 / n(compound)" },
                { id: "Q2h", label: "(d) Effect of higher NaOH concentration", marks: 2,
                  instruction: "A student repeats the back-titration using FA 3 of higher concentration. State and explain the effect on the calculated Mr.",
                  answerKey: "Higher [NaOH]: more NaOH needed per cm³ → smaller titre to neutralise same amount of HCl. n(NaOH) per titre = c × V (larger c gives more n for same V) → apparent n(HCl) in FA 2 is larger → apparent n(HCl) reacted is smaller → apparent n(compound) is smaller → calculated Mr = 3.52/n(compound) is larger. Effect: Mr would be calculated as larger (overestimate)." },
                { id: "Q2i", label: "(e) Percentage error in titre", marks: 1,
                  instruction: "The uncertainty in reading a burette is ±0.05 cm³. A titre is the difference of two readings. Calculate the maximum percentage error in the mean titre if the mean titre is 18.50 cm³.",
                  calculationGuide: "% error = (2 × 0.05) / 18.50 × 100 = 0.54%" },
            ],
        },
        {
            id: "Q3", type: "qualitative",
            title: "Question 3 – Qualitative Analysis (CuCO₃ and HCl)",
            marks: 13,
            context: `FA 5 is a solid. FA 6 is an aqueous solution.

Reagents available: limewater, Mg ribbon, NaOH(aq), NH₃(aq), AgNO₃(aq), Al foil, distilled water.

Use 1 cm depth of solutions for each test.`,
            parts: [
                { id: "Q3a", label: "(a) Test on FA 5 (heating)", marks: 3,
                  instruction: "Place a small spatula of FA 5 in a dry boiling tube. Connect delivery tube dipping into limewater. Heat strongly. Record all observations — note changes to the solid, limewater, and any water condensation.",
                  answerKey: "Green solid turns black on heating. Water condensation on cooler parts of tube. Limewater turns milky (CO₂ evolved). Confirms: green CuCO₃ → black CuO + CO₂ + (if water of crystallisation: water). Equation: CuCO₃(s) → CuO(s) + CO₂(g). Colour change: green → black; limewater milky." },
                { id: "Q3b", label: "(b)(i) FA 6 + Mg ribbon", marks: 2,
                  instruction: "Add 2 cm depth FA 6 to a test-tube. Add a small piece of Mg ribbon. Record observations including any gas test.",
                  answerKey: "Vigorous effervescence. Mg ribbon dissolves. Colourless gas evolved — pops with lighted splint (H₂). Confirms FA 6 contains H⁺ (acid). FA 6 is HCl. Mg(s) + 2HCl(aq) → MgCl₂(aq) + H₂(g)." },
                { id: "Q3c", label: "(b)(ii) FA 5 + FA 6, then cation tests", marks: 5,
                  instruction: "Add 2 cm depth FA 6 to a test-tube. Add a small spatula of FA 5. Record observations (call this solution FA 7). Then carry out tests on FA 7:\n(A) Add NaOH dropwise. Note precipitate. Add excess NaOH.\n(B) Add NH₃(aq) dropwise. Note precipitate. Add excess NH₃.",
                  answerKey: "FA 5 + FA 6: Green solid dissolves with effervescence (CO₂ — limewater milky). Blue/turquoise solution forms (CuCl₂). CuCO₃ + 2HCl → CuCl₂ + H₂O + CO₂.\n\nTest A (NaOH): Pale blue precipitate Cu(OH)₂ forms. Insoluble in excess NaOH. Confirms Cu²⁺.\nTest B (NH₃): Pale blue precipitate forms. Dissolves in excess NH₃ → deep blue [Cu(NH₃)₄]²⁺ complex. Confirms Cu²⁺." },
                { id: "Q3d", label: "(c)(i) Anion in FA 6 (AgNO₃ test)", marks: 2,
                  instruction: "Add a few drops of AgNO₃ to 1 cm FA 6. Note precipitate. Then add NH₃(aq). Note whether precipitate dissolves.",
                  answerKey: "Curdy white precipitate forms (AgCl). Dissolves readily in dilute NH₃(aq) to give colourless [Ag(NH₃)₂]⁺. Confirms Cl⁻ anion in FA 6. FA 6 is HCl." },
                { id: "Q3e", label: "(c)(ii) Ionic equation for Cu²⁺ + NH₃", marks: 1,
                  instruction: "Write the ionic equation (with state symbols) for the reaction of Cu²⁺ with excess NH₃(aq) to form the tetraamine complex.",
                  answerKey: "Cu²⁺(aq) + 4NH₃(aq) → [Cu(NH₃)₄]²⁺(aq)" },
            ],
        },
    ],
},

];

// Backward compatibility: keep QUESTION_PAPER pointing to the 2024 paper
export const QUESTION_PAPER = QUESTION_PAPERS[0];
