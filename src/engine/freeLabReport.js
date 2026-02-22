/**
 * Free Lab Guidance Report Engine
 * Generates narrative, improvement-focused guidance — no marks, no grades.
 *
 * generateGuidanceReport(experiment, actionLog) → report object
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

function countAction(log, action) {
    return log.filter(a => a.action === action).length;
}

function usedChem(log, ...ids) {
    return ids.some(id => log.some(a => a.chemical === id));
}

function vesselUsed(log, keyword) {
    return log.some(a => (a.vessel || '').toLowerCase().includes(keyword.toLowerCase()));
}

function uniqueChems(log) {
    return [...new Set(log.filter(a => a.chemical).map(a => a.chemical))];
}

const REAGENT_IDS = ['NaOH', 'AgNO3', 'BaCl2', 'NH3_aq', 'KMnO4_acid', 'Na2CO3', 'HCl', 'H2SO4', 'limewater'];
function uniqueReagents(log) {
    return uniqueChems(log).filter(id => REAGENT_IDS.includes(id));
}

function strength(text) { return { type: 'strength', text }; }
function imp(text, severity = 'suggested') { return { type: 'improve', severity, text }; }
// severity: 'essential' | 'recommended' | 'suggested'


// ── Titration ────────────────────────────────────────────────────────────────

function titrationReport(log) {
    const addCount = log.filter(a => a.action === 'add_chemical').length;
    const usedBurette = vesselUsed(log, 'burette');
    const usedPipette = vesselUsed(log, 'pipette');
    const usedConical = vesselUsed(log, 'conical');
    const hasIndicator = usedChem(log, 'starch', 'phenolphthalein', 'methyl_orange');
    const transferCount = countAction(log, 'transfer');
    const chemicals = uniqueChems(log);

    const strengths = [];
    const improvements = [];

    if (usedBurette) strengths.push(strength('You used a burette — the correct instrument for dispensing the titrant precisely (readings to ±0.05 cm³).'));
    if (usedPipette || transferCount >= 1) strengths.push(strength('You transferred solution between vessels — for titrations a 25.00 cm³ pipette delivers an accurate fixed volume of analyte.'));
    if (usedConical) strengths.push(strength('You used a conical flask for the titration — its tapered neck reduces splashing and makes continuous swirling easy.'));
    if (hasIndicator) strengths.push(strength('Indicator was added — this is essential for detecting the endpoint when the colour change occurs permanently.'));
    if (addCount >= 6) strengths.push(strength(`You made approximately ${Math.floor(addCount / 2)} titration cycles — repeating is essential for concordant results.`));
    if (chemicals.length >= 3) strengths.push(strength(`You worked with ${chemicals.length} different chemicals, showing a thorough approach.`));

    if (!usedBurette) improvements.push(imp('Use a burette (not a measuring cylinder) for the titrant. A burette delivers to ±0.05 cm³ and is essential for accurate titrations.', 'essential'));
    if (!usedPipette && transferCount === 0) improvements.push(imp('Use a 25.00 cm³ pipette to deliver the analyte into the conical flask — a measuring cylinder is not sufficiently accurate for quantitative titrations.', 'essential'));
    if (!hasIndicator) improvements.push(imp('Always add an indicator before titrating: methyl orange for strong acid/weak base; phenolphthalein for weak acid/strong base; starch for iodometric titrations.', 'essential'));
    if (addCount < 3) improvements.push(imp('Aim for at least three titrations — one rough (to find the approximate endpoint), then two accurate (concordant) results within ±0.10 cm³ of each other.', 'essential'));
    if (!usedConical) improvements.push(imp('Use a conical flask for the analyte — it is easier to swirl without splashing, which is important near the endpoint.', 'suggested'));
    improvements.push(imp('Record all burette readings to 2 decimal places ending in 0 or 5 (e.g. 23.45 or 23.50 cm³). This reflects the ±0.05 cm³ precision of the burette.', 'recommended'));
    improvements.push(imp('Rinse the burette with the titrant (not just distilled water) before filling — residual water dilutes the titrant and reduces accuracy.', 'recommended'));
    improvements.push(imp('Consider placing a white tile under the conical flask to make the endpoint colour change easier to see clearly.', 'suggested'));

    const summary = `You performed ${addCount} chemical addition${addCount !== 1 ? 's' : ''}${chemicals.length > 0 ? ` using ${chemicals.join(', ')}` : ''}. ${usedBurette ? 'A burette was used for the titrant.' : 'No burette was recorded — this is the most important piece of apparatus for a titration.'} ${hasIndicator ? 'An indicator was added to detect the endpoint.' : 'No indicator was added — without one, the endpoint cannot be detected.'} ${addCount >= 4 ? 'Multiple addition cycles suggest you were working towards concordant results.' : 'More repetitions would improve reliability.'}`;

    const protocol = [
        'Rinse the burette with the titrant solution, fill to just above 0.00 cm³, then run down to exactly 0.00 cm³. Record the initial reading.',
        'Rinse the pipette with the analyte. Use it to transfer exactly 25.00 cm³ of analyte into a clean conical flask.',
        'Add 2–3 drops of indicator (e.g. methyl orange turns red at endpoint; phenolphthalein turns colourless).',
        'Perform a rough titration: run in the titrant quickly until the endpoint colour change. Record the rough titre.',
        'Refill the burette to 0.00 cm³. Repeat carefully, adding the last 2 cm³ drop by drop.',
        'Record the titre (final − initial burette reading) to 2 d.p., ending in 0 or 5.',
        'Repeat until two concordant titres (within ±0.10 cm³) are obtained. Calculate the mean concordant titre.',
        'Calculate n = c × V/1000 for the titrant. Apply the stoichiometric mole ratio to find the unknown concentration.',
    ];

    const tips = [
        'The "half-drop" technique: near the endpoint, open the tap just enough to form half a drop, then wash it into the flask with a wash bottle.',
        'Swirling the flask continuously prevents localised excess of titrant, which can cause you to miss or overshoot the endpoint.',
        'Distilled water added to rinse the sides of the flask does not affect accuracy — the number of moles of analyte stays the same.',
        'If you overshoot, the run is not wasted — use it as the rough titration to set up the accurate ones.',
        'Concordant results within ±0.10 cm³ are the standard. If you cannot achieve concordance, investigate contamination or a technique issue.',
    ];

    return { summary, strengths, improvements, protocol, tips };
}


// ── Qualitative Analysis ──────────────────────────────────────────────────────

function qualitativeReport(log) {
    const addCount = log.filter(a => a.action === 'add_chemical').length;
    const chemicals = uniqueChems(log);
    const reagents = uniqueReagents(log);
    const hasNaOH    = usedChem(log, 'NaOH');
    const hasAgNO3   = usedChem(log, 'AgNO3');
    const hasBaCl2   = usedChem(log, 'BaCl2');
    const hasNH3     = usedChem(log, 'NH3_aq');
    const hasKMnO4   = usedChem(log, 'KMnO4_acid');
    const hasHCl     = usedChem(log, 'HCl', 'H2SO4');
    const gasTest    = log.some(a => ['test_gas_splint', 'test_gas_glowing', 'test_litmus'].includes(a.action));
    const hasObs     = log.some(a => a.observation && a.observation.length > 10);

    const strengths = [];
    const improvements = [];

    if (hasNaOH)   strengths.push(strength('You used NaOH — the primary cation test. Each transition metal and Group II cation gives a characteristic precipitate colour.'));
    if (hasAgNO3)  strengths.push(strength('AgNO₃ was used — the standard halide test. Precipitate colour and solubility in NH₃(aq) identifies Cl⁻, Br⁻, or I⁻.'));
    if (hasBaCl2)  strengths.push(strength('BaCl₂ was used — the sulfate/sulfite test. White precipitate insoluble in dilute HCl confirms SO₄²⁻.'));
    if (hasNH3)    strengths.push(strength('NH₃(aq) was used alongside NaOH — comparing the two is key (Cu²⁺ dissolves to deep blue complex in excess NH₃ but not in excess NaOH).'));
    if (hasKMnO4)  strengths.push(strength('Acidified KMnO₄ was tested — decolourisation identifies reducing species (Fe²⁺, SO₃²⁻, S₂O₃²⁻, I⁻, Br⁻).'));
    if (gasTest)   strengths.push(strength('A gas test was performed — an important step when a reaction produces a gas (H₂ pops a lighted splint; NH₃ turns damp red litmus blue; O₂ relights a glowing splint).'));
    if (reagents.length >= 4) strengths.push(strength(`You used ${reagents.length} different reagents — a systematic approach with multiple tests is necessary to identify ions confidently.`));
    if (hasObs)    strengths.push(strength('Observations were recorded in the action log — always note the exact colour, texture, and behaviour of precipitates or gases.'));

    if (!hasNaOH)   improvements.push(imp('Add NaOH(aq) to each unknown — the first and most important cation test. Note precipitate colour: pale blue (Cu²⁺), dirty green (Fe²⁺), rust-brown (Fe³⁺), white gelatinous (Al³⁺, Zn²⁺, Ca²⁺).', 'essential'));
    if (!hasAgNO3)  improvements.push(imp('Add AgNO₃(aq) then dilute NH₃(aq) to identify halide ions: curdy white (Cl⁻), cream (Br⁻), pale yellow (I⁻). Solubility in dilute NH₃ confirms which halide.', 'essential'));
    if (reagents.length < 3) improvements.push(imp('A systematic analysis uses at least 4–5 reagents to test both cations and anions. Identifying one ion alone is not enough — you need both cation and anion to name the salt.', 'essential'));
    if (!hasBaCl2)  improvements.push(imp('Add BaCl₂(aq) then acidify with dilute HCl: white precipitate insoluble in HCl = SO₄²⁻; white precipitate soluble in HCl (with effervescence) = SO₃²⁻ or CO₃²⁻.', 'recommended'));
    if (!hasNH3)    improvements.push(imp('Add NH₃(aq) to a fresh portion of unknown alongside NaOH — the key distinction is whether the precipitate dissolves in excess NH₃ (Cu²⁺ → deep blue complex; Al³⁺, Fe³⁺, Fe²⁺ do not dissolve).', 'recommended'));
    if (!hasKMnO4)  improvements.push(imp('Test with acidified KMnO₄ — rapid decolourisation indicates a reducing agent is present (Fe²⁺, SO₃²⁻, S₂O₃²⁻, I⁻). No decolourisation is also a useful negative result.', 'recommended'));
    if (!hasHCl)    improvements.push(imp('Add dilute HCl as an initial screen — effervescence identifies CO₃²⁻ (CO₂) or SO₃²⁻ (SO₂, pungent). No reaction narrows down the anion possibilities significantly.', 'recommended'));
    if (!gasTest)   improvements.push(imp('Perform gas tests when a gas is produced: lighted splint (H₂ pops), glowing splint (O₂ relights), damp red litmus in vapour (NH₃ turns it blue).', 'suggested'));

    const summary = `You performed ${addCount} test${addCount !== 1 ? 's' : ''} using ${chemicals.length > 0 ? chemicals.join(', ') : 'various chemicals'}. ${reagents.length} standard reagent${reagents.length !== 1 ? 's' : ''} ${reagents.length > 0 ? 'were' : 'was'} used. ${hasNaOH && hasAgNO3 ? 'Both the primary cation test (NaOH) and the halide test (AgNO₃) were performed.' : !hasNaOH ? 'The primary cation test (NaOH) was not recorded.' : 'The halide anion test (AgNO₃) was not recorded.'} ${gasTest ? 'Gas tests were also conducted.' : ''}`;

    const protocol = [
        'Observe the unknown first: colour, clarity, any smell, physical state.',
        'Test with dilute HCl: effervescence → CO₃²⁻ (CO₂, odourless) or SO₃²⁻ (SO₂, pungent). No reaction → continue.',
        'Add a few drops of NaOH(aq): pale blue ppt (Cu²⁺), dirty green/turns rusty (Fe²⁺), rust-brown instantly (Fe³⁺), white gelatinous (Al³⁺ / Zn²⁺ / Ca²⁺).',
        'Add excess NaOH: if ppt dissolves → amphoteric cation (Al³⁺ or Zn²⁺). Warm with NaOH → pungent gas turns litmus blue → NH₄⁺.',
        'Add NH₃(aq) to a fresh portion: pale blue ppt dissolving in excess → Cu²⁺ confirmed (deep blue complex).',
        'Add BaCl₂(aq), then acidify with dilute HCl: insoluble white ppt → SO₄²⁻; soluble with gas → SO₃²⁻ or CO₃²⁻.',
        'Add AgNO₃(aq): curdy white (Cl⁻), cream (Br⁻), pale yellow (I⁻). Solubility in dilute NH₃: Cl⁻ dissolves; Br⁻ partly; I⁻ insoluble.',
        'Add acidified KMnO₄: rapid decolourisation → reducing agent present.',
        'Tabulate all observations and draw conclusions for both cation and anion.',
    ];

    const tips = [
        'Work in small quantities (1–2 cm³) so you have enough unknown for multiple tests.',
        'Record exactly what you see — "white precipitate" is not enough; describe it as "curdy white", "gelatinous white", or "fine crystalline".',
        'The solubility of a precipitate in excess reagent is often the key discriminator — always add excess and observe.',
        'Fe(OH)₂ (dirty green) slowly turns rust-brown in air — observe and record immediately after addition.',
        'A clear negative result ("no precipitate formed") is as valuable as a positive one — record it explicitly.',
        'Work systematically: cations first (NaOH, NH₃), then anions (HCl, BaCl₂, AgNO₃) for a structured analysis.',
    ];

    return { summary, strengths, improvements, protocol, tips };
}


// ── Energetics ───────────────────────────────────────────────────────────────

function energeticsReport(log) {
    const weighCount = countAction(log, 'weigh');
    const tempCount  = countAction(log, 'measure_temp');
    const stirCount  = countAction(log, 'stir');
    const addCount   = log.filter(a => a.action === 'add_chemical').length;
    const chemicals  = uniqueChems(log);
    const usedPoly   = vesselUsed(log, 'polystyrene');

    const strengths = [];
    const improvements = [];

    if (weighCount >= 1) strengths.push(strength(`Mass was measured (${weighCount} weighing${weighCount > 1 ? 's' : ''}) — accurate mass is essential for calculating moles and therefore ΔH.`));
    if (tempCount >= 2)  strengths.push(strength(`Temperature was recorded ${tempCount} times — measuring both the initial temperature and the maximum (or minimum for endothermic) is necessary for ΔT.`));
    if (stirCount >= 1)  strengths.push(strength('Stirring was used — this ensures even heat distribution and a more accurate maximum temperature reading.'));
    if (usedPoly)        strengths.push(strength('A polystyrene cup was used — excellent choice for minimising heat loss to surroundings, giving a more accurate ΔH value.'));
    if (addCount >= 2)   strengths.push(strength('Both reactants were combined — good, this is the core step of the experiment.'));

    if (weighCount === 0) improvements.push(imp('Weigh the solid (or measure solution volume accurately) before the reaction. Without accurate mass you cannot calculate moles or ΔH (kJ mol⁻¹).', 'essential'));
    if (tempCount < 2)   improvements.push(imp('Record temperature at least twice: once before mixing (T₁, initial) and again at the maximum or minimum temperature (T₂). ΔT = T₂ − T₁.', 'essential'));
    if (addCount < 2)    improvements.push(imp('Ensure both reactants are added to the vessel — no reaction means no temperature change to measure.', 'essential'));
    if (stirCount === 0) improvements.push(imp('Always stir the mixture after adding the solid/solution. This ensures the temperature is uniform and that you record the true maximum temperature.', 'recommended'));
    if (!usedPoly)       improvements.push(imp('Use a polystyrene cup inside a beaker for insulation — glass beakers conduct heat away, causing you to underestimate the temperature change (and therefore ΔH).', 'recommended'));
    improvements.push(imp('Record temperature every 30 s for 2 min before mixing (to establish a baseline), then every 30 s after mixing until the temperature begins to fall. Extrapolate back to find the true ΔT.', 'recommended'));
    improvements.push(imp('Calculate q = mcΔT (m = mass of solution in g; c = 4.18 J g⁻¹ K⁻¹; ΔT in K). Then ΔH = −q ÷ n (kJ mol⁻¹), where n = moles of limiting reagent.', 'suggested'));

    const summary = `You performed an energetics experiment${chemicals.length > 0 ? ` using ${chemicals.join(', ')}` : ''}. ${weighCount > 0 ? `Mass was recorded ${weighCount} time${weighCount > 1 ? 's' : ''}.` : 'No mass measurement was recorded.'} ${tempCount > 0 ? `Temperature was measured ${tempCount} time${tempCount > 1 ? 's' : ''}.` : 'No temperature readings were recorded.'} ${usedPoly ? 'A polystyrene cup was used for insulation.' : 'A polystyrene cup was not used — heat loss may have affected accuracy.'}`;

    const protocol = [
        'Weigh the solid to ±0.01 g (or measure the solution volume accurately with a pipette or measuring cylinder).',
        'Measure 25.0 cm³ of the solution into a polystyrene cup sitting inside a beaker.',
        'Record the temperature of the solution every 30 s for 2 min — this gives the baseline temperature T₁.',
        'Add the solid (or second solution) and stir immediately. Continue recording the temperature every 30 s.',
        'Record the maximum temperature T₂ (exothermic) or minimum T₃ (endothermic). Calculate ΔT = |T₂ − T₁|.',
        'Calculate q = mcΔT. Use m = total mass of solution in grams; c = 4.18 J g⁻¹ K⁻¹.',
        'Calculate n = moles of limiting reagent from its mass (÷ Mr) or from c × V ÷ 1000.',
        'Calculate ΔH = −q ÷ n, in kJ mol⁻¹ (divide q by 1000 to convert J → kJ).',
        'Comment on errors: heat loss through the cup, incomplete reaction, assumption that solution density ≈ 1 g cm⁻³.',
    ];

    const tips = [
        'For exothermic reactions ΔH is negative; for endothermic ΔH is positive.',
        'Extrapolate the temperature–time graph back to the moment of mixing to estimate the true maximum temperature.',
        'Using excess of one reactant ensures the other is the limiting reagent — always base ΔH on the limiting reagent.',
        'Repeat the experiment at least twice and calculate a mean ΔH to improve reliability.',
        'A lid on the polystyrene cup further reduces heat loss — make a small hole for the thermometer.',
    ];

    return { summary, strengths, improvements, protocol, tips };
}


// ── Rate of Reaction ──────────────────────────────────────────────────────────

function rateReport(log) {
    const startCount = countAction(log, 'start_clock');
    const stopCount  = countAction(log, 'stop_clock');
    const addCount   = log.filter(a => a.action === 'add_chemical').length;
    const chemicals  = uniqueChems(log);
    const usedWater  = usedChem(log, 'distilled_water');

    const strengths = [];
    const improvements = [];

    if (startCount >= 1 && stopCount >= 1) strengths.push(strength(`The stop-clock was started and stopped ${stopCount} time${stopCount > 1 ? 's' : ''} — timing is the core measurement for rate experiments.`));
    if (stopCount >= 5) strengths.push(strength(`You completed ${stopCount} timed experiments — good; at least 5 data points are needed to draw a meaningful rate graph.`));
    if (usedWater)      strengths.push(strength('Distilled water was used — this suggests you were varying concentration while keeping total volume constant, which is correct experimental design.'));
    if (addCount >= 4)  strengths.push(strength('Multiple chemical additions were recorded — suggesting you varied a condition (e.g. concentration) across experiments.'));

    if (stopCount === 0)  improvements.push(imp('Use the stop-clock to time each experiment. Rate = 1000/t (or 1/t) — without timing you have no rate data.', 'essential'));
    if (stopCount < 5)    improvements.push(imp(`You need at least 5 data points to plot a meaningful rate graph. Aim for ${Math.max(0, 5 - stopCount)} more timed run${5 - stopCount > 1 ? 's' : ''}.`, stopCount < 2 ? 'essential' : 'recommended'));
    if (!usedWater)       improvements.push(imp('Use distilled water to dilute your reactant solutions to different concentrations, keeping the total volume constant across all experiments.', 'recommended'));
    improvements.push(imp('Record your results in a table: volume of reactant (cm³), total volume (cm³), concentration (mol dm⁻³), time (s), rate = 1000/t (s⁻¹).', 'recommended'));
    improvements.push(imp('Plot rate (1000/t) on the y-axis against concentration on the x-axis. A straight line through the origin indicates the reaction is first order with respect to that reactant.', 'suggested'));
    improvements.push(imp('Keep all other variables constant (temperature, same endpoint criterion) — only vary the one factor you are investigating.', 'recommended'));

    const summary = `You performed ${stopCount} timed run${stopCount !== 1 ? 's' : ''} with ${addCount} chemical addition${addCount !== 1 ? 's' : ''}${chemicals.length > 0 ? ` using ${chemicals.join(', ')}` : ''}. ${usedWater ? 'Distilled water was used, suggesting concentration was being varied.' : 'Concentration variation was not recorded.'} ${stopCount >= 5 ? 'A sufficient number of data points were collected for a rate graph.' : 'More runs are needed for reliable rate analysis.'}`;

    const protocol = [
        'Prepare solutions of the reactant at 5 different concentrations using a burette/measuring cylinder and distilled water (keep total volume constant, e.g. always 50 cm³).',
        'Record the volume of reactant and total volume for each experiment in a results table.',
        'Add both reactants together and start the stop-clock immediately.',
        'Define a clear, reproducible endpoint (e.g. when the cross first disappears for the thiosulfate clock).',
        'Stop the clock at the endpoint. Record the time in seconds.',
        'Repeat each concentration at least once to check reproducibility.',
        'Calculate rate = 1000/t for each experiment. Tabulate all results.',
        'Plot rate vs concentration. Determine the order of reaction from the shape of the graph (linear through origin = first order).',
    ];

    const tips = [
        'For the thiosulfate clock, keep the flask still and view from directly above — the cross disappears as seen from above.',
        'Work from most dilute to most concentrated — this reduces errors from residual solution in equipment.',
        'If two times for the same concentration differ by more than 10%, repeat that experiment.',
        'Room temperature affects reaction rate — note the temperature and perform all experiments at the same temperature.',
        'A curved graph of rate vs concentration suggests the reaction is not first order — it may be second order or show more complex kinetics.',
    ];

    return { summary, strengths, improvements, protocol, tips };
}


// ── Thermal Decomposition ─────────────────────────────────────────────────────

function thermalReport(log) {
    const heatCount  = countAction(log, 'heat');
    const weighCount = countAction(log, 'weigh');
    const chemicals  = uniqueChems(log);
    const usedCrucible = vesselUsed(log, 'crucible');

    const strengths = [];
    const improvements = [];

    if (weighCount >= 3)   strengths.push(strength(`Mass was recorded ${weighCount} times — recording the mass before, during, and after heating is essential for finding the loss on ignition.`));
    if (heatCount >= 2)    strengths.push(strength(`You heated the sample ${heatCount} times — repeated heating and weighing is how you verify constant mass (confirming all water has been driven off).`));
    if (usedCrucible)      strengths.push(strength('A crucible was used — the correct vessel for strong heating; crucibles withstand the temperatures needed to drive off water of crystallisation.'));

    if (weighCount < 3)   improvements.push(imp(`Record mass at least 3 times: (1) empty crucible, (2) crucible + hydrated salt before heating, (3) crucible + anhydrous residue after heating to constant mass. You recorded ${weighCount} — add ${Math.max(0, 3 - weighCount)} more.`, 'essential'));
    if (heatCount < 2)    improvements.push(imp('Heat to constant mass — after the first heating, cool and reweigh. If mass is still changing, heat again. Repeat until two consecutive masses agree to within 0.01 g.', 'essential'));
    if (!usedCrucible)    improvements.push(imp('Use a crucible for heating solids to high temperature — it is designed to withstand strong heating on a clay triangle over a Bunsen burner.', 'essential'));
    improvements.push(imp('Allow the crucible to cool in a desiccator before weighing — a warm crucible creates convection currents that cause incorrect balance readings.', 'recommended'));
    improvements.push(imp('Calculate: mass of water lost = (mass before heating) − (mass after heating to constant mass). Then moles of water = mass ÷ 18. Moles of anhydrous salt from its mass and Mr. Ratio gives x in M·xH₂O.', 'suggested'));

    const summary = `You performed a thermal decomposition experiment${chemicals.length > 0 ? ` involving ${chemicals.join(', ')}` : ''}. The sample was heated ${heatCount} time${heatCount !== 1 ? 's' : ''} and weighed ${weighCount} time${weighCount !== 1 ? 's' : ''}. ${heatCount >= 2 ? 'Repeated heating suggests you were working towards constant mass.' : 'Heating only once is not sufficient — constant mass must be confirmed by repeated heating and weighing.'}`;

    const protocol = [
        'Weigh the clean, dry crucible (+ lid) on a balance reading to ±0.01 g. Record this as m₁.',
        'Add approximately 2–3 g of the hydrated salt to the crucible. Weigh again: record as m₂. Mass of hydrated salt = m₂ − m₁.',
        'Place the crucible on a clay triangle on a tripod. Heat gently for 2 min, then strongly for a further 5 min.',
        'Allow to cool in a desiccator for at least 5 min. Weigh the crucible + residue: record as m₃.',
        'Return to the heat for a further 2 min. Cool in desiccator and reweigh: record as m₄.',
        'If m₄ = m₃ (within 0.01 g), constant mass is reached. If not, heat again until consecutive masses agree.',
        'Calculate mass of water lost = m₂ − m₄(final). Calculate mass of anhydrous salt = m₄(final) − m₁.',
        'Find moles of water (÷ 18) and moles of anhydrous salt (÷ Mr of anhydrous formula). The integer ratio gives x.',
    ];

    const tips = [
        'Keep the lid slightly ajar during heating to allow water vapour to escape without losing solid.',
        'Cool in a desiccator to prevent the anhydrous salt reabsorbing atmospheric moisture before weighing.',
        'If the ratio gives a non-integer (e.g. 4.8 instead of 5), check for errors before rounding — within ~0.3 of an integer is acceptable.',
        'If the salt decomposes or discolours rather than just losing water, note this — the method may not be straightforward.',
        'The mass loss divided by 18 gives moles of water. Always double-check with the formula mass of the anhydrous compound.',
    ];

    return { summary, strengths, improvements, protocol, tips };
}


// ── General / Open ────────────────────────────────────────────────────────────

function generalReport(log) {
    const addCount  = log.filter(a => a.action === 'add_chemical').length;
    const chemicals = uniqueChems(log);
    const weighCount = countAction(log, 'weigh');
    const tempCount  = countAction(log, 'measure_temp');
    const heatCount  = countAction(log, 'heat');
    const stirCount  = countAction(log, 'stir');
    const hasObs     = log.some(a => a.observation && a.observation.length > 10);

    const strengths = [];
    const improvements = [];

    if (addCount >= 2)    strengths.push(strength(`${addCount} chemical additions were made — the experiment was actively performed.`));
    if (chemicals.length >= 3) strengths.push(strength(`${chemicals.length} different chemicals were used, showing a varied approach.`));
    if (hasObs)           strengths.push(strength('Observations were generated and logged — always note colour changes, precipitate formation, gas evolution, and temperature changes.'));
    if (weighCount >= 1)  strengths.push(strength('Mass was measured — quantitative data is always more valuable than qualitative observations alone.'));
    if (tempCount >= 1)   strengths.push(strength('Temperature was measured — this can be used to calculate heat changes if needed.'));

    if (addCount === 0)                                  improvements.push(imp('No chemicals were added in the lab. Start by adding your reactants to appropriate vessels on the lab bench.', 'essential'));
    if (!hasObs)                                         improvements.push(imp('Record your observations as you go — note colour changes, precipitate formation, gas evolution, and temperature changes.', 'essential'));
    if (stirCount === 0 && heatCount === 0 && weighCount === 0 && tempCount === 0)
        improvements.push(imp('Perform additional actions on your chemicals: stir, heat, weigh, or measure temperature depending on your experiment type.', 'recommended'));
    improvements.push(imp('Write down your expected observations before starting — this helps you notice unexpected results during the experiment.', 'suggested'));
    improvements.push(imp('Use the Data tab to record results in a table or graph — systematic data recording is a key practical skill assessed in Cambridge exams.', 'suggested'));

    const quantitative = [weighCount > 0 && 'weighing', tempCount > 0 && 'temperature measurement', heatCount > 0 && 'heating', stirCount > 0 && 'stirring'].filter(Boolean);
    const summary = `You performed ${addCount} chemical addition${addCount !== 1 ? 's' : ''}${chemicals.length > 0 ? ` using ${chemicals.join(', ')}` : ''}. ${hasObs ? 'Observations were recorded.' : 'No significant observations were logged.'} The experiment involved ${quantitative.length > 0 ? quantitative.join(', ') : 'no quantitative measurements'}.`;

    const protocol = [
        'Define your aim clearly: what are you trying to find out or demonstrate?',
        'List the chemicals and equipment you will need, and note why each is chosen.',
        'Set up all equipment before starting — label all vessels.',
        'Add chemicals in the correct order and in appropriate amounts.',
        'Observe and record everything: colour, precipitate, gas, temperature, smell (if safe to do so).',
        'Record quantitative data (masses, volumes, temperatures) to the precision of your instrument.',
        'Repeat at least once for reliability.',
        'Draw conclusions directly from your observations, not from what you expected to see.',
    ];

    const tips = [
        'Safety first — check COSHH data for all chemicals before starting.',
        'Label all vessels clearly to avoid confusing solutions.',
        'Use small test volumes (1–2 cm³) for qualitative tests to conserve the unknown.',
        'A control (blank test with distilled water) helps confirm observations are due to the chemical, not contamination.',
        'Record negative results ("no precipitate", "no colour change") explicitly — they are as informative as positive ones.',
    ];

    return { summary, strengths, improvements, protocol, tips };
}


// ── Main export ───────────────────────────────────────────────────────────────

export const CATEGORY_LABELS = {
    titration:  'Titration',
    qualitative: 'Qualitative Analysis / Salt Analysis',
    energetics:  'Energetics / Calorimetry',
    rate:        'Rate of Reaction / Kinetics',
    thermal:     'Thermal Decomposition / Water of Crystallisation',
    general:     'Open Experiment',
};

export function generateGuidanceReport(experiment, actionLog) {
    const { title, category = 'general', goal = '' } = experiment;

    let cat;
    switch (category) {
        case 'titration':   cat = titrationReport(actionLog);   break;
        case 'qualitative': cat = qualitativeReport(actionLog); break;
        case 'energetics':  cat = energeticsReport(actionLog);  break;
        case 'rate':        cat = rateReport(actionLog);        break;
        case 'thermal':     cat = thermalReport(actionLog);     break;
        default:            cat = generalReport(actionLog);     break;
    }

    return {
        title:         title || 'Open Experiment',
        category,
        categoryLabel: CATEGORY_LABELS[category] || 'Open Experiment',
        goal,
        generatedAt:   new Date().toLocaleString(),
        actionsCount:  actionLog.length,
        chemicalsUsed: uniqueChems(actionLog),
        summary:       cat.summary,
        strengths:     cat.strengths,
        improvements:  cat.improvements,
        protocol:      cat.protocol,
        tips:          cat.tips,
    };
}