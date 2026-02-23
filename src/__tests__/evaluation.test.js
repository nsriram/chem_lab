import { describe, it, expect } from "vitest";
import { evaluateLog } from "../engine/evaluation.js";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const ratePaper = {
    marks: 40,
    questions: [
        { id: "Q1", type: "quantitative", title: "Question 1 – Rate of Reaction (Thiosulfate Clock)", marks: 17, context: "" },
        { id: "Q2", type: "energetics",   title: "Question 2",  marks: 10, context: "" },
        { id: "Q3", type: "qualitative",  title: "Question 3",  marks: 13, context: "" },
    ],
};

const titrationPaper = {
    marks: 40,
    questions: [
        { id: "Q1", type: "quantitative", title: "Question 1 – Titration", marks: 17, context: "burette and titre" },
        { id: "Q2", type: "energetics",   title: "Question 2",  marks: 10, context: "" },
        { id: "Q3", type: "qualitative",  title: "Question 3",  marks: 13, context: "" },
    ],
};

const crystallisationPaper = {
    marks: 40,
    questions: [
        { id: "Q1", type: "quantitative", title: "Question 1 – Crystallisation of Alum (water of crystallisation)", marks: 17, context: "" },
        { id: "Q2", type: "energetics",   title: "Question 2",  marks: 10, context: "" },
        { id: "Q3", type: "qualitative",  title: "Question 3",  marks: 13, context: "" },
    ],
};

function makeLog(...entries) {
    return entries;
}

// ─── Return shape ─────────────────────────────────────────────────────────────

describe("evaluateLog – return shape", () => {
    it("returns total, maxMarks, grade, sections, feedback", () => {
        const result = evaluateLog([], "", ratePaper);
        expect(result).toHaveProperty("total");
        expect(result).toHaveProperty("maxMarks");
        expect(result).toHaveProperty("grade");
        expect(result).toHaveProperty("sections");
        expect(result).toHaveProperty("feedback");
    });

    it("sections length matches paper questions length", () => {
        const result = evaluateLog([], "", ratePaper);
        expect(result.sections).toHaveLength(3);
    });

    it("each section has label, score, max, criteria", () => {
        const result = evaluateLog([], "", ratePaper);
        for (const sec of result.sections) {
            expect(sec).toHaveProperty("label");
            expect(sec).toHaveProperty("score");
            expect(sec).toHaveProperty("max");
            expect(sec).toHaveProperty("criteria");
        }
    });

    it("total equals sum of section scores", () => {
        const result = evaluateLog([], "", ratePaper);
        const sum = result.sections.reduce((s, sec) => s + sec.score, 0);
        expect(result.total).toBe(sum);
    });

    it("maxMarks matches paper.marks", () => {
        const result = evaluateLog([], "", ratePaper);
        expect(result.maxMarks).toBe(40);
    });

    it("returns legacy Q1/Q2/Q3 fields", () => {
        const result = evaluateLog([], "", ratePaper);
        expect(result).toHaveProperty("Q1");
        expect(result).toHaveProperty("Q2");
        expect(result).toHaveProperty("Q3");
    });
});

// ─── Grade boundaries ────────────────────────────────────────────────────────

describe("evaluateLog – grade boundaries", () => {
    it("awards A* for ≥88 %", () => {
        // Force a perfect paper by crafting a full log
        const fullLog = [
            { action: "add_chemical", chemical: "Na2S2O3", vessel: "v", details: "" },
            { action: "add_chemical", chemical: "HCl",     vessel: "v", details: "" },
            { action: "add_chemical", chemical: "distilled_water", vessel: "v", details: "" },
            ...Array(5).fill({ action: "start_clock", vessel: "v", details: "" }),
            ...Array(5).fill({ action: "stop_clock",  vessel: "v", details: "" }),
            { action: "add_table",    vessel: "v", details: "table" },
            { action: "add_graph",    vessel: "v", details: "" },
            // Q2 energetics
            { action: "weigh",        vessel: "v", details: "" },
            { action: "measure_temp", vessel: "v", details: "" },
            { action: "measure_temp", vessel: "v", details: "" },
            { action: "stir",         vessel: "v", details: "" },
            // Q3 qualitative
            { action: "add_chemical", chemical: "NaOH",   vessel: "v", details: "", observation: "White precipitate forms" },
            { action: "add_chemical", chemical: "BaCl2",  vessel: "v", details: "", observation: "White precipitate BaSO4" },
            { action: "add_chemical", chemical: "AgNO3",  vessel: "v", details: "", observation: "Cream precipitate forms" },
            { action: "add_chemical", chemical: "KMnO4_acid", vessel: "v", details: "", observation: "Decolourised" },
            { action: "test_gas_splint", vessel: "v", details: "" },
        ];
        const notes = "1000/t rate=5.2  12.50 cm³  mean titre\nmoles n= 0.002\nq=mc*4.18*deltaT kJ/mol ΔH=-200 kJ/mol\n1.23 g 23.5 °C\nFe3+ Cu2+ SO4 Cl- identified\nNa+(aq) + OH-(aq) → ionic equation";
        const result = evaluateLog(fullLog, notes, ratePaper);
        expect(result.grade).toBe("A*");
    });

    it("returns grade U when score is 0", () => {
        const result = evaluateLog([], "", ratePaper);
        expect(result.grade).toBe("U");
    });
});

// ─── Rate / clock rubric ─────────────────────────────────────────────────────

describe("evaluateLog – rate/clock rubric", () => {
    it("penalises missing Na₂S₂O₃ and HCl", () => {
        const result = evaluateLog([], "", ratePaper);
        const q1 = result.sections[0];
        const reagentCrit = q1.criteria.find(c => c.text.includes("FA 1") || c.text.includes("Na₂S₂O₃"));
        expect(reagentCrit?.marks).toBe(0);
    });

    it("awards clock marks when start_clock + stop_clock present", () => {
        const log = [
            { action: "start_clock", vessel: "v", details: "" },
            { action: "stop_clock",  vessel: "v", details: "" },
        ];
        const result = evaluateLog(log, "", ratePaper);
        const q1 = result.sections[0];
        const clockCrit = q1.criteria.find(c => c.text.includes("Clock") || c.text.includes("clock") || c.text.includes("timed"));
        expect(clockCrit?.marks).toBeGreaterThan(0);
    });

    it("awards partial clock marks when clock started but not stopped", () => {
        const log = [{ action: "start_clock", vessel: "v", details: "" }];
        const result = evaluateLog(log, "", ratePaper);
        const q1 = result.sections[0];
        const clockCrit = q1.criteria.find(c =>
            c.status === "partial" && c.text.toLowerCase().includes("clock")
        );
        expect(clockCrit).toBeDefined();
    });

    it("gives 3 experiment marks for ≥5 timed runs", () => {
        const log = [
            ...Array(5).fill({ action: "start_clock", vessel: "v", details: "" }),
            ...Array(5).fill({ action: "stop_clock",  vessel: "v", details: "" }),
        ];
        const result = evaluateLog(log, "", ratePaper);
        const q1 = result.sections[0];
        // "X experiments performed" text is unique to the experiment-count criterion
        const exptCrit = q1.criteria.find(c => c.text.includes("experiments performed") || c.text.includes("Fewer than"));
        expect(exptCrit?.marks).toBeGreaterThanOrEqual(3);
    });
});

// ─── Titration rubric ────────────────────────────────────────────────────────

describe("evaluateLog – titration rubric", () => {
    it("awards additions marks for ≥3 add_chemical entries", () => {
        const log = Array(3).fill({ action: "add_chemical", chemical: "Na2S2O3_titrant", vessel: "v", details: "" });
        const result = evaluateLog(log, "", titrationPaper);
        const q1 = result.sections[0];
        const addCrit = q1.criteria[0];
        expect(addCrit.marks).toBe(3);
    });

    it("detects burette precision pattern in notes", () => {
        const log = Array(3).fill({ action: "add_chemical", chemical: "c", vessel: "v", details: "" });
        const notes = "Titre 1: 23.45 cm³\nTitre 2: 23.50 cm³\nmean titre = 23.48 cm³\nmoles = 0.002";
        const result = evaluateLog(log, notes, titrationPaper);
        const q1 = result.sections[0];
        const precCrit = q1.criteria.find(c => c.text.toLowerCase().includes("precision") || c.text.includes("0.05"));
        expect(precCrit?.marks).toBeGreaterThan(0);
    });
});

// ─── Crystallisation rubric ──────────────────────────────────────────────────

describe("evaluateLog – crystallisation rubric", () => {
    it("awards heating marks proportionally (1 heat → partial)", () => {
        const log = [{ action: "heat", vessel: "v", details: "" }];
        const result = evaluateLog(log, "", crystallisationPaper);
        const q1 = result.sections[0];
        const heatCrit = q1.criteria[0];
        expect(heatCrit.status).toBe("partial");
        expect(heatCrit.marks).toBeGreaterThan(0);
        expect(heatCrit.marks).toBeLessThan(3);
    });

    it("awards full heating marks for ≥2 heatings", () => {
        const log = [
            { action: "heat", vessel: "v", details: "" },
            { action: "heat", vessel: "v", details: "" },
        ];
        const result = evaluateLog(log, "", crystallisationPaper);
        const q1 = result.sections[0];
        expect(q1.criteria[0].marks).toBe(3);
    });
});

// ─── Energetics rubric ────────────────────────────────────────────────────────

describe("evaluateLog – energetics (Q2) rubric", () => {
    it("fails mass criterion when no weigh action", () => {
        const result = evaluateLog([], "", ratePaper);
        const q2 = result.sections[1];
        const massCrit = q2.criteria.find(c => c.text.includes("Mass") || c.text.includes("mass"));
        expect(massCrit?.marks).toBe(0);
    });

    it("detects q=mcΔT in notes", () => {
        const log = [
            { action: "weigh",        vessel: "v", details: "" },
            { action: "measure_temp", vessel: "v", details: "" },
            { action: "measure_temp", vessel: "v", details: "" },
            { action: "add_chemical", chemical: "c1", vessel: "v", details: "" },
            { action: "add_chemical", chemical: "c2", vessel: "v", details: "" },
            { action: "stir",         vessel: "v", details: "" },
        ];
        const notes = "q = mc*4.18*ΔT  ΔH = -200 kJ/mol  1.23 g  23.5 °C";
        const result = evaluateLog(log, notes, ratePaper);
        const q2 = result.sections[1];
        const qCrit = q2.criteria.find(c => c.text.includes("mcΔT") || c.text.includes("q ="));
        expect(qCrit?.marks).toBeGreaterThan(0);
    });
});

// ─── Qualitative rubric ───────────────────────────────────────────────────────

describe("evaluateLog – qualitative (Q3) rubric", () => {
    it("awards NaOH mark when NaOH used", () => {
        const log = [{ action: "add_chemical", chemical: "NaOH", vessel: "v", details: "", observation: "White precipitate" }];
        const result = evaluateLog(log, "", ratePaper);
        const q3 = result.sections[2];
        const naohCrit = q3.criteria.find(c => c.text.includes("NaOH"));
        expect(naohCrit?.marks).toBe(1);
    });

    it("penalises missing observations in log", () => {
        const log = [{ action: "add_chemical", chemical: "NaOH", vessel: "v", details: "" }];
        const result = evaluateLog(log, "", ratePaper);
        const q3 = result.sections[2];
        const obsCrit = q3.criteria.find(c => c.text.includes("Observations") || c.text.includes("observations"));
        expect(obsCrit?.marks).toBe(0);
    });

    it("detects ion identifications in notes", () => {
        const notes = "Fe3+ and Cu2+ ions identified. SO4 anion. Cl- halide.";
        const result = evaluateLog([], notes, ratePaper);
        const q3 = result.sections[2];
        // "identifications written in answer booklet" text is unique to the ion-ID criterion
        const ionCrit = q3.criteria.find(c => c.text.includes("identifications written") || c.text.includes("No ion identifications"));
        expect(ionCrit?.marks).toBeGreaterThan(0);
    });
});

// ─── No paper supplied (fallback) ────────────────────────────────────────────

describe("evaluateLog – fallback when no paper supplied", () => {
    it("does not throw", () => {
        expect(() => evaluateLog([], "")).not.toThrow();
    });

    it("still returns three sections using the default paper", () => {
        const result = evaluateLog([], "");
        expect(result.sections).toHaveLength(3);
    });

    it("maxMarks defaults to 40", () => {
        const result = evaluateLog([], "");
        expect(result.maxMarks).toBe(40);
    });
});

// ─── partAnswers format compatibility ────────────────────────────────────────
// Mirrors the joinedNotes logic in useChemLab.js runEvaluation().
// Guards against regression: partAnswers values are now {text, tables, graphs}
// objects (since inline tables/graphs were added). Previously they were plain
// strings; the consumer (EvaluateTab) and notes-builder must handle both.

function joinedNotesFromPartAnswers(partAnswers) {
    return Object.entries(partAnswers)
        .map(([id, ans]) => {
            const text = typeof ans === "string" ? ans : (ans?.text ?? "");
            return `${id}: ${text}`;
        })
        .join("\n");
}

describe("partAnswers format – joinedNotes helper", () => {
    it("extracts text from old plain-string format", () => {
        const pa = { Q1a: "25.00 cm³ titre", Q1b: "mean = 24.50" };
        const notes = joinedNotesFromPartAnswers(pa);
        expect(notes).toContain("Q1a: 25.00 cm³ titre");
        expect(notes).toContain("Q1b: mean = 24.50");
    });

    it("extracts text from new object format {text, tables, graphs}", () => {
        const pa = {
            Q1a: { text: "25.00 cm³ titre", tables: [], graphs: [] },
            Q1b: { text: "mean = 24.50",    tables: [{}], graphs: [{}] },
        };
        const notes = joinedNotesFromPartAnswers(pa);
        expect(notes).toContain("Q1a: 25.00 cm³ titre");
        expect(notes).toContain("Q1b: mean = 24.50");
    });

    it("returns empty string segment for null/undefined values", () => {
        const pa = { Q1a: null, Q1b: undefined, Q1c: { text: null } };
        const notes = joinedNotesFromPartAnswers(pa);
        expect(typeof notes).toBe("string");
        expect(notes).toContain("Q1a: ");
        expect(notes).toContain("Q1b: ");
        expect(notes).toContain("Q1c: ");
    });

    it("mixed old and new format in same partAnswers produces correct notes", () => {
        const pa = {
            Q1a: "old string answer",
            Q1b: { text: "new object answer", tables: [], graphs: [] },
        };
        const notes = joinedNotesFromPartAnswers(pa);
        expect(notes).toContain("Q1a: old string answer");
        expect(notes).toContain("Q1b: new object answer");
    });
});

describe("evaluateLog – does not throw with object-format partAnswers notes", () => {
    it("does not throw when notes come from object-format answers", () => {
        const pa = {
            Q1a: { text: "Titre 1: 23.45 cm³\nTitre 2: 23.50 cm³\nmean titre = 23.48 cm³", tables: [], graphs: [] },
            Q1b: { text: "moles n = 0.002 mol", tables: [], graphs: [] },
        };
        const notes = joinedNotesFromPartAnswers(pa);
        expect(() => evaluateLog([], notes, titrationPaper)).not.toThrow();
    });

    it("awards titre marks when text inside object answer contains titre data", () => {
        const pa = {
            Q1a: { text: "Titre 1: 23.45 cm³\nTitre 2: 23.50 cm³\nmean titre = 23.48 cm³ moles = 0.002", tables: [], graphs: [] },
        };
        const log = Array(3).fill({ action: "add_chemical", chemical: "Na2S2O3_titrant", vessel: "v", details: "" });
        const notes = joinedNotesFromPartAnswers(pa);
        const result = evaluateLog(log, notes, titrationPaper);
        const q1 = result.sections[0];
        const titreCrit = q1.criteria.find(c =>
            c.text.includes("Burette readings") || c.text.includes("titration data")
        );
        expect(titreCrit?.marks).toBeGreaterThan(0);
    });

    it("evaluateLog result has no undefined in sections when notes from objects", () => {
        const pa = { Q1a: { text: "some answer", tables: [{}], graphs: [] } };
        const notes = joinedNotesFromPartAnswers(pa);
        const result = evaluateLog([], notes, titrationPaper);
        for (const sec of result.sections) {
            expect(sec.score).not.toBeNaN();
            expect(sec.label).toBeDefined();
        }
    });
});

// ─── Section score capped at question marks ───────────────────────────────────

describe("evaluateLog – section score never exceeds question max", () => {
    it("Q1 score ≤ 17", () => {
        const result = evaluateLog([], "", ratePaper);
        expect(result.sections[0].score).toBeLessThanOrEqual(17);
    });

    it("Q2 score ≤ 10", () => {
        const result = evaluateLog([], "", ratePaper);
        expect(result.sections[1].score).toBeLessThanOrEqual(10);
    });

    it("Q3 score ≤ 13", () => {
        const result = evaluateLog([], "", ratePaper);
        expect(result.sections[2].score).toBeLessThanOrEqual(13);
    });
});
