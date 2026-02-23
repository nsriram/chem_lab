import { describe, it, expect } from "vitest";
import { QUESTION_PAPERS, QUESTION_PAPER } from "../data/questionPaper.js";

// ─── Basic structure ──────────────────────────────────────────────────────────

describe("QUESTION_PAPERS array", () => {
    it("exports an array", () => {
        expect(Array.isArray(QUESTION_PAPERS)).toBe(true);
    });

    it("contains exactly 23 papers", () => {
        expect(QUESTION_PAPERS).toHaveLength(23);
    });

    it("every paper has a unique id", () => {
        const ids = QUESTION_PAPERS.map(p => p.id);
        const unique = new Set(ids);
        expect(unique.size).toBe(23);
    });
});

// ─── Per-paper required fields ────────────────────────────────────────────────

describe("Each paper has required fields", () => {
    it.each(QUESTION_PAPERS.map((p, i) => [i + 1, p]))("paper %i has id, title, marks, questions", (_, paper) => {
        expect(typeof paper.id).toBe("string");
        expect(paper.id.length).toBeGreaterThan(0);
        expect(typeof paper.title).toBe("string");
        expect(paper.title.length).toBeGreaterThan(0);
        expect(typeof paper.marks).toBe("number");
        expect(paper.marks).toBeGreaterThan(0);
        expect(Array.isArray(paper.questions)).toBe(true);
    });
});

// ─── marks integrity ─────────────────────────────────────────────────────────

describe("marks consistency", () => {
    it("every paper has marks ≥ 30 (Cambridge minimum)", () => {
        for (const paper of QUESTION_PAPERS) {
            expect(paper.marks).toBeGreaterThanOrEqual(30);
        }
    });
});

// ─── questions structure ──────────────────────────────────────────────────────

describe("Paper questions structure", () => {
    it("each paper has at least one question", () => {
        for (const paper of QUESTION_PAPERS) {
            expect(paper.questions.length).toBeGreaterThanOrEqual(1);
        }
    });

    it("each question has id, type, title, marks", () => {
        for (const paper of QUESTION_PAPERS) {
            for (const q of paper.questions) {
                expect(typeof q.id).toBe("string");
                expect(typeof q.type).toBe("string");
                expect(typeof q.title).toBe("string");
                expect(typeof q.marks).toBe("number");
                expect(q.marks).toBeGreaterThan(0);
            }
        }
    });

    it("each question type is one of the recognised values", () => {
        const validTypes = new Set(["quantitative", "energetics", "qualitative"]);
        for (const paper of QUESTION_PAPERS) {
            for (const q of paper.questions) {
                expect(validTypes.has(q.type)).toBe(true);
            }
        }
    });
});

// ─── faMap coverage ───────────────────────────────────────────────────────────

describe("faMap on every paper", () => {
    it("every paper exposes a faMap object", () => {
        for (const paper of QUESTION_PAPERS) {
            expect(typeof paper.faMap).toBe("object");
            expect(paper.faMap).not.toBeNull();
        }
    });

    it("every paper exposes a non-empty unknownFAs array", () => {
        for (const paper of QUESTION_PAPERS) {
            expect(Array.isArray(paper.unknownFAs)).toBe(true);
            expect(paper.unknownFAs.length).toBeGreaterThan(0);
        }
    });

    it("every unknownFAs entry is also a key in faMap", () => {
        for (const paper of QUESTION_PAPERS) {
            for (const fa of paper.unknownFAs) {
                expect(paper.faMap[fa]).toBeDefined();
            }
        }
    });

    it("unknownFAs labels match FA N format", () => {
        for (const paper of QUESTION_PAPERS) {
            for (const fa of paper.unknownFAs) {
                expect(fa).toMatch(/^FA \d+$/);
            }
        }
    });

    it("every faMap key starts with 'FA '", () => {
        for (const paper of QUESTION_PAPERS) {
            for (const key of Object.keys(paper.faMap)) {
                expect(key).toMatch(/^FA \d+$/);
            }
        }
    });

    it("every faMap value is a non-empty string (chemical ID)", () => {
        for (const paper of QUESTION_PAPERS) {
            for (const val of Object.values(paper.faMap)) {
                expect(typeof val).toBe("string");
                expect(val.length).toBeGreaterThan(0);
            }
        }
    });

    it("paper 1 faMap covers FA 1 through FA 8", () => {
        const faMap = QUESTION_PAPERS[0].faMap;
        for (let i = 1; i <= 8; i++) {
            expect(faMap[`FA ${i}`]).toBeDefined();
        }
    });

    it("no Q3 context reveals specific known-unknowns by name", () => {
        // These strings were previously leaking the identity of FA unknowns.
        // Known test reagents (e.g. 'FA 3 = acidified KMnO₄') are allowed —
        // only the true unknowns that students must identify should be hidden.
        const bannedPhrases = [
            "FA 5 = Na₂S₂O₃",
            "FA 6 = H₂SO₄",
            "FA 7 = Na₂SO₃",
            "FA 8 = Cu₂O",
            "FA 7 = solution containing four ions",
            "FA 5 = contains Cl⁻",
            "FA 6 = contains Br⁻",
            "FA 7 = contains I⁻",
            "FA 8 = iron(III) sulfate",
            "FA 5 = contains CO₃²⁻",
            "FA 6 = contains NO₃⁻",
            "FA 7 = contains Cl⁻",
            "FA 4 contains NH₄⁺, Fe³⁺, SO₄²⁻ and Cl⁻",
            "FA 6 is a solution containing Cu²⁺ and SO₄²⁻",
            "FA 7 contains Fe³⁺ and Cl⁻",
            "FA 5 contains Cl⁻ and SO₄²⁻",
            "FA 6 contains Br⁻ and SO₃²⁻",
            "FA 7 contains I⁻ and S₂O₃²⁻",
        ];
        for (const paper of QUESTION_PAPERS) {
            const q3 = paper.questions.find(q => q.id === "Q3");
            if (!q3?.context) continue;
            for (const phrase of bannedPhrases) {
                expect(q3.context).not.toContain(phrase);
            }
        }
    });
});

// ─── Backward-compatible default export ───────────────────────────────────────

describe("QUESTION_PAPER (default)", () => {
    it("is defined", () => {
        expect(QUESTION_PAPER).toBeDefined();
    });

    it("equals the first paper in QUESTION_PAPERS", () => {
        expect(QUESTION_PAPER).toBe(QUESTION_PAPERS[0]);
    });

    it("has id 'p1'", () => {
        expect(QUESTION_PAPER.id).toBe("p1");
    });
});

// ─── Spot-check paper 1 content ───────────────────────────────────────────────

describe("Paper 1 (2024 Feb/Mar) content spot-check", () => {
    const p1 = QUESTION_PAPERS[0];

    it("title references 2024", () => {
        expect(p1.title).toContain("2024");
    });

    it("has exactly three questions", () => {
        expect(p1.questions).toHaveLength(3);
    });

    it("Q1 is quantitative and worth 17 marks", () => {
        const q1 = p1.questions.find(q => q.id === "Q1");
        expect(q1?.type).toBe("quantitative");
        expect(q1?.marks).toBe(17);
    });

    it("Q2 is energetics and worth 10 marks", () => {
        const q2 = p1.questions.find(q => q.id === "Q2");
        expect(q2?.type).toBe("energetics");
        expect(q2?.marks).toBe(10);
    });

    it("Q3 is qualitative and worth 13 marks", () => {
        const q3 = p1.questions.find(q => q.id === "Q3");
        expect(q3?.type).toBe("qualitative");
        expect(q3?.marks).toBe(13);
    });

    it("Q1 + Q2 + Q3 marks sum to paper marks", () => {
        const sum = p1.questions.reduce((s, q) => s + q.marks, 0);
        expect(sum).toBe(p1.marks);
    });
});
