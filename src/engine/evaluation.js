// Evaluation engine – paper-aware, section-by-section scoring
// evaluateLog(actionLog, studentNotes, paper) → { total, maxMarks, grade, sections, feedback }

// ─── Helpers ────────────────────────────────────────────────────────────────

function has(log, keyword) {
    const kw = keyword.toLowerCase();
    return log.some(a => JSON.stringify(a).toLowerCase().includes(kw));
}

function hasChemical(log, chemId) {
    return log.some(a => a.chemical === chemId);
}

function countAction(log, action) {
    return log.filter(a => a.action === action).length;
}

function notesMatch(notes, ...patterns) {
    return patterns.some(p =>
        typeof p === "string"
            ? notes.toLowerCase().includes(p.toLowerCase())
            : p.test(notes)
    );
}

function crit(status, text, marks) {
    // status: "pass" | "partial" | "warn" | "fail"
    return { status, text, marks };
}

function gradeFromPct(pct) {
    if (pct >= 0.88) return "A*";
    if (pct >= 0.78) return "A";
    if (pct >= 0.68) return "B";
    if (pct >= 0.58) return "C";
    if (pct >= 0.48) return "D";
    return "U";
}

// ─── Q1 Scoring ─────────────────────────────────────────────────────────────

function scoreRateClock(log, notes, q) {
    const criteria = [];

    // Core reagents
    const hasThio = hasChemical(log, "Na2S2O3");
    const hasAcid = hasChemical(log, "HCl");
    criteria.push(crit(
        hasThio && hasAcid ? "pass" : "fail",
        hasThio && hasAcid
            ? "✅ Mixed Na₂S₂O₃ with HCl – core reaction performed"
            : "❌ Did not add both Na₂S₂O₃ (FA 1) and HCl (FA 2)",
        hasThio && hasAcid ? 2 : 0
    ));

    // Clock usage
    const started = countAction(log, "start_clock");
    const stopped = countAction(log, "stop_clock");
    criteria.push(crit(
        started > 0 && stopped > 0 ? "pass" : started > 0 ? "partial" : "fail",
        started > 0 && stopped > 0
            ? `✅ Stop-clock started and stopped (${stopped} timed run${stopped > 1 ? "s" : ""})`
            : started > 0 ? "⚠️ Clock started but never stopped" : "❌ Stop-clock not used",
        started > 0 && stopped > 0 ? 2 : started > 0 ? 1 : 0
    ));

    // Multiple experiments
    const expts = stopped;
    criteria.push(crit(
        expts >= 5 ? "pass" : expts >= 3 ? "partial" : "fail",
        expts >= 5 ? `✅ ${expts} experiments performed (5 required for full marks)`
                   : expts >= 3 ? `⚠️ Only ${expts}/5 experiments performed`
                   : `❌ Fewer than 3 experiments performed (${expts} found)`,
        expts >= 5 ? 3 : expts >= 3 ? 2 : expts >= 1 ? 1 : 0
    ));

    // Dilution with distilled water
    const usedWater = hasChemical(log, "distilled_water");
    criteria.push(crit(
        usedWater ? "pass" : "warn",
        usedWater
            ? "✅ Distilled water used to vary concentration"
            : "⚠️ No distilled water added (needed to maintain constant total volume)",
        usedWater ? 2 : 0
    ));

    // Data table
    const hasTable = log.some(a => a.action === "add_table" || (a.details || "").includes("table"));
    criteria.push(crit(
        hasTable ? "pass" : "warn",
        hasTable ? "✅ Results table recorded in Data tab" : "⚠️ No results table found in Data tab",
        hasTable ? 2 : 0
    ));

    // Rate calculation in notes
    const notesRate = notesMatch(notes, /1000\s*\/\s*t|relative rate|1\/t|rate\s*=/, "1000/", "rate");
    criteria.push(crit(
        notesRate ? "pass" : "warn",
        notesRate ? "✅ Rate (1000/t) calculation shown in answer booklet"
                  : "⚠️ No rate calculation visible in answer booklet",
        notesRate ? 2 : 0
    ));

    // Graph
    const hasGraph = log.some(a => a.action === "add_graph");
    criteria.push(crit(
        hasGraph ? "pass" : "warn",
        hasGraph ? "✅ Graph plotted in Data tab" : "⚠️ No graph plotted in Data tab",
        hasGraph ? 2 : 0
    ));

    return criteria;
}

function scoreTitration(log, notes, q) {
    const criteria = [];

    // At least 3 additions (rough + ≥2 accurate)
    const addCount = log.filter(a => a.action === "add_chemical").length;
    criteria.push(crit(
        addCount >= 3 ? "pass" : addCount >= 1 ? "partial" : "fail",
        addCount >= 3 ? `✅ ${addCount} chemical additions recorded (rough + accurate titrations)`
                     : addCount >= 1 ? `⚠️ Only ${addCount} addition(s) – need rough + ≥2 accurate titrations`
                     : "❌ No chemicals added",
        addCount >= 3 ? 3 : addCount >= 1 ? 1 : 0
    ));

    // Indicator
    const usedIndicator = hasChemical(log, "starch") ||
        log.some(a => (a.details || "").toLowerCase().includes("indicator"));
    criteria.push(crit(
        usedIndicator ? "pass" : "warn",
        usedIndicator ? "✅ Indicator used" : "⚠️ No indicator recorded – needed for endpoint detection",
        usedIndicator ? 1 : 0
    ));

    // Burette readings / titre values in notes
    const notesHasTitre = notesMatch(notes, /\d+\.\d{2}/, "titre", "cm³", "cm3", "burette");
    criteria.push(crit(
        notesHasTitre ? "pass" : "warn",
        notesHasTitre ? "✅ Burette readings / titre values in answer booklet"
                      : "⚠️ No titration data found in answer booklet",
        notesHasTitre ? 2 : 0
    ));

    // Mean titre in notes
    const notesMean = notesMatch(notes, "mean", "average", /mean titre/i);
    criteria.push(crit(
        notesMean ? "pass" : "warn",
        notesMean ? "✅ Mean titre calculated in answer booklet" : "⚠️ Mean titre not shown in answer booklet",
        notesMean ? 2 : 0
    ));

    // Moles / concentration calculation
    const notesMol = notesMatch(notes, /mol|n\s*=|conc/i, "moles", "amount");
    criteria.push(crit(
        notesMol ? "pass" : "warn",
        notesMol ? "✅ Moles/concentration calculation in answer booklet"
                 : "⚠️ No moles calculation in answer booklet",
        notesMol ? 2 : 0
    ));

    // Transfer / pipette used
    const hasPipette = has(log, "pipette") || log.some(a => a.action === "transfer");
    criteria.push(crit(
        hasPipette ? "pass" : "warn",
        hasPipette ? "✅ Transfer / pipette operation recorded"
                   : "⚠️ No pipette/transfer to conical flask recorded",
        hasPipette ? 1 : 0
    ));

    return criteria;
}

function scoreCrystallisation(log, notes, q) {
    const criteria = [];

    const heatCount = countAction(log, "heat");
    criteria.push(crit(
        heatCount >= 2 ? "pass" : heatCount === 1 ? "partial" : "fail",
        heatCount >= 2 ? `✅ Heated to constant mass (${heatCount} heatings recorded)`
                       : heatCount === 1 ? "⚠️ Heated once – heat again to confirm constant mass"
                       : "❌ Sample not heated",
        heatCount >= 2 ? 3 : heatCount === 1 ? 1 : 0
    ));

    const weighCount = countAction(log, "weigh");
    criteria.push(crit(
        weighCount >= 3 ? "pass" : weighCount >= 2 ? "partial" : "fail",
        weighCount >= 3 ? `✅ Weighed before, during and after heating (${weighCount} weighings)`
                       : weighCount >= 2 ? `⚠️ ${weighCount} weighings recorded (need crucible + sample + residue)`
                       : "❌ Mass not measured",
        weighCount >= 3 ? 3 : weighCount >= 2 ? 2 : weighCount >= 1 ? 1 : 0
    ));

    const notesMoles = notesMatch(notes, /mol|mole|18|water of/i, "h2o", "H₂O");
    criteria.push(crit(
        notesMoles ? "pass" : "warn",
        notesMoles ? "✅ Moles of water / Mr calculation in answer booklet"
                   : "⚠️ No water-of-crystallisation calculation in answer booklet",
        notesMoles ? 2 : 0
    ));

    const notesMr = notesMatch(notes, /Mr|formula|ratio|mole ratio/i);
    criteria.push(crit(
        notesMr ? "pass" : "warn",
        notesMr ? "✅ Mr / formula worked out in answer booklet" : "⚠️ Formula/Mr not determined in answer booklet",
        notesMr ? 1 : 0
    ));

    return criteria;
}

function scoreGenericQuantitative(log, notes, q) {
    const criteria = [];

    const addCount = log.filter(a => a.action === "add_chemical").length;
    criteria.push(crit(
        addCount >= 2 ? "pass" : addCount === 1 ? "partial" : "fail",
        addCount >= 2 ? `✅ ${addCount} chemical additions – experiment performed`
                     : addCount === 1 ? "⚠️ Only one chemical added" : "❌ No chemicals added",
        addCount >= 2 ? 3 : addCount === 1 ? 1 : 0
    ));

    const hasWeigh = countAction(log, "weigh") > 0;
    const hasTemp = countAction(log, "measure_temp") > 0;
    const hasTable = log.some(a => a.action === "add_table");
    criteria.push(crit(
        hasWeigh || hasTemp || hasTable ? "pass" : "warn",
        hasWeigh || hasTemp || hasTable
            ? `✅ Quantitative data recorded (${[hasWeigh && "mass", hasTemp && "temperature", hasTable && "table"].filter(Boolean).join(", ")})`
            : "⚠️ No quantitative measurements recorded",
        hasWeigh || hasTemp || hasTable ? 2 : 0
    ));

    const notesMath = notesMatch(notes, /\d+\.\d+/, /mol|kj|dm³|cm³/i, "calculation");
    criteria.push(crit(
        notesMath ? "pass" : "warn",
        notesMath ? "✅ Numerical working shown in answer booklet" : "⚠️ No calculations in answer booklet",
        notesMath ? 2 : 0
    ));

    return criteria;
}

function scoreQ1(log, notes, q) {
    const title = q.title.toLowerCase();
    const ctx = (q.context || "").toLowerCase();
    let criteria;

    if (title.includes("rate") || title.includes("clock") || title.includes("thiosulfate")) {
        criteria = scoreRateClock(log, notes, q);
    } else if (title.includes("titration") || ctx.includes("burette") || ctx.includes("titre")) {
        criteria = scoreTitration(log, notes, q);
    } else if (title.includes("crystallis") || title.includes("alum") || title.includes("water of")) {
        criteria = scoreCrystallisation(log, notes, q);
    } else {
        criteria = scoreGenericQuantitative(log, notes, q);
    }

    return criteria;
}

// ─── Q2 Energetics Scoring ───────────────────────────────────────────────────

function scoreQ2(log, notes, q) {
    const criteria = [];

    // Mass measurement
    const weighCount = countAction(log, "weigh");
    criteria.push(crit(
        weighCount >= 1 ? "pass" : "fail",
        weighCount >= 1 ? `✅ Mass recorded (${weighCount} weighing${weighCount > 1 ? "s" : ""})`
                        : "❌ Mass not measured – needed to calculate moles",
        weighCount >= 1 ? 2 : 0
    ));

    // Temperature measurement
    const tempCount = countAction(log, "measure_temp");
    criteria.push(crit(
        tempCount >= 2 ? "pass" : tempCount === 1 ? "partial" : "fail",
        tempCount >= 2 ? "✅ Temperature measured before and after reaction"
                       : tempCount === 1 ? "⚠️ Temperature measured only once (need initial and maximum)"
                       : "❌ Temperature not measured",
        tempCount >= 2 ? 2 : tempCount === 1 ? 1 : 0
    ));

    // Stirring
    const stirred = countAction(log, "stir") > 0;
    criteria.push(crit(
        stirred ? "pass" : "warn",
        stirred ? "✅ Mixture stirred" : "⚠️ Mixture not stirred – may give uneven temperature distribution",
        stirred ? 1 : 0
    ));

    // Reagents mixed
    const mixed = log.filter(a => a.action === "add_chemical").length >= 2;
    criteria.push(crit(
        mixed ? "pass" : "fail",
        mixed ? "✅ Reagents combined for enthalpy experiment" : "❌ Insufficient reagents added",
        mixed ? 1 : 0
    ));

    // q = mcΔT in notes
    const notesQ = notesMatch(notes, /q\s*=\s*mc|mc.t|4\.18|4\.2|mass.*4/i, "mcΔT", "heat energy", "joule");
    criteria.push(crit(
        notesQ ? "pass" : "warn",
        notesQ ? "✅ Heat energy (q = mcΔT) calculated in answer booklet"
               : "⚠️ No q = mcΔT calculation in answer booklet",
        notesQ ? 2 : 0
    ));

    // ΔH in notes
    const notesDH = notesMatch(notes, /ΔH|delta H|kj.?mol|enthalpy/i, "kJ", "ΔH");
    criteria.push(crit(
        notesDH ? "pass" : "warn",
        notesDH ? "✅ ΔH / enthalpy value calculated in answer booklet"
                : "⚠️ No ΔH calculation in answer booklet",
        notesDH ? 2 : 0
    ));

    return criteria;
}

// ─── Q3 Qualitative Scoring ──────────────────────────────────────────────────

function scoreQ3(log, notes, q) {
    const criteria = [];

    // NaOH test
    const usedNaOH = hasChemical(log, "NaOH");
    criteria.push(crit(
        usedNaOH ? "pass" : "warn",
        usedNaOH ? "✅ NaOH test performed (identifies cations via precipitate colour)"
                 : "⚠️ NaOH not used – key reagent for cation identification",
        usedNaOH ? 1 : 0
    ));

    // BaCl₂ test
    const usedBaCl2 = hasChemical(log, "BaCl2");
    criteria.push(crit(
        usedBaCl2 ? "pass" : "warn",
        usedBaCl2 ? "✅ BaCl₂ test performed (identifies SO₄²⁻ / SO₃²⁻)"
                  : "⚠️ BaCl₂ not used – needed to identify sulfate/sulfite",
        usedBaCl2 ? 1 : 0
    ));

    // AgNO₃ test
    const usedAgNO3 = hasChemical(log, "AgNO3");
    criteria.push(crit(
        usedAgNO3 ? "pass" : "warn",
        usedAgNO3 ? "✅ AgNO₃ test performed (identifies halide ions)"
                  : "⚠️ AgNO₃ not used – needed to identify halides",
        usedAgNO3 ? 1 : 0
    ));

    // KMnO₄ test
    const usedKMnO4 = hasChemical(log, "KMnO4_acid");
    criteria.push(crit(
        usedKMnO4 ? "pass" : "warn",
        usedKMnO4 ? "✅ Acidified KMnO₄ used (identifies reducing agents)"
                  : "⚠️ Acidified KMnO₄ not used – identifies reducing anions",
        usedKMnO4 ? 1 : 0
    ));

    // Diversity of tests (≥3 different reagents used overall)
    const reagentsUsed = new Set(
        log.filter(a => a.action === "add_chemical").map(a => a.chemical)
    ).size;
    criteria.push(crit(
        reagentsUsed >= 4 ? "pass" : reagentsUsed >= 2 ? "partial" : "fail",
        reagentsUsed >= 4 ? `✅ ${reagentsUsed} different reagents used – thorough systematic testing`
                          : reagentsUsed >= 2 ? `⚠️ Only ${reagentsUsed} reagents used – more tests needed`
                          : "❌ Very few tests performed",
        reagentsUsed >= 4 ? 3 : reagentsUsed >= 2 ? 2 : reagentsUsed >= 1 ? 1 : 0
    ));

    // Gas tests
    const gasTest = log.some(a =>
        a.action === "test_gas_splint" || a.action === "test_gas_glowing" || a.action === "test_litmus"
    );
    criteria.push(crit(
        gasTest ? "pass" : "warn",
        gasTest ? "✅ Gas test performed (splint / litmus)"
                : "⚠️ No gas test performed – useful for identifying H₂ / O₂ / NH₃",
        gasTest ? 1 : 0
    ));

    // Observations recorded in log
    const hasObs = log.some(a => a.observation && a.observation.length > 10);
    criteria.push(crit(
        hasObs ? "pass" : "fail",
        hasObs ? "✅ Observations recorded for tests"
               : "❌ No test observations recorded",
        hasObs ? 2 : 0
    ));

    // Ion identifications in notes
    const notesIons = notesMatch(notes,
        /Fe[23]\+|Cu²\+|NH₄|NH4|SO₄|SO4|S₂O₃|S2O3|SO₃|SO3|Cl⁻|Br⁻|I⁻/i,
        "identified", "ion", "cation", "anion"
    );
    criteria.push(crit(
        notesIons ? "pass" : "warn",
        notesIons ? "✅ Ion identifications written in answer booklet"
                  : "⚠️ No ion identifications in answer booklet",
        notesIons ? 2 : 0
    ));

    // Ionic equations in notes
    const notesEqn = notesMatch(notes, /→|->|\(aq\)|\(s\)|\(g\)/, "ionic equation", "equation");
    criteria.push(crit(
        notesEqn ? "pass" : "warn",
        notesEqn ? "✅ Ionic equation(s) written in answer booklet"
                 : "⚠️ No ionic equations in answer booklet",
        notesEqn ? 1 : 0
    ));

    return criteria;
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function evaluateLog(actionLog, studentNotes = "", paper = null) {
    const notes = studentNotes || "";

    // Fallback paper structure if none provided
    const activePaper = paper || {
        marks: 40,
        questions: [
            { id: "Q1", type: "quantitative", title: "Question 1", marks: 17, context: "" },
            { id: "Q2", type: "energetics",   title: "Question 2", marks: 10, context: "" },
            { id: "Q3", type: "qualitative",  title: "Question 3", marks: 13, context: "" },
        ],
    };

    const sections = activePaper.questions.map(q => {
        let criteria;
        if (q.type === "energetics") {
            criteria = scoreQ2(actionLog, notes, q);
        } else if (q.type === "qualitative") {
            criteria = scoreQ3(actionLog, notes, q);
        } else {
            criteria = scoreQ1(actionLog, notes, q);
        }

        const raw = criteria.reduce((s, c) => s + c.marks, 0);
        const score = Math.min(raw, q.marks);
        return { label: q.title, score, max: q.marks, criteria };
    });

    const total = sections.reduce((s, sec) => s + sec.score, 0);
    const maxMarks = activePaper.marks;

    // Flat feedback list for backward compat
    const feedback = sections.flatMap(sec =>
        sec.criteria.map(c => c.text)
    );

    return {
        total,
        maxMarks,
        grade: gradeFromPct(total / maxMarks),
        sections,
        feedback,
        // Legacy fields
        Q1: sections[0]?.score ?? 0,
        Q2: sections[1]?.score ?? 0,
        Q3: sections[2]?.score ?? 0,
    };
}
