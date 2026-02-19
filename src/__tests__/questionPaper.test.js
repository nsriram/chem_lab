import { describe, it, expect } from "vitest";
import { QUESTION_PAPERS, QUESTION_PAPER } from "../data/questionPaper.js";

// ─── Basic structure ──────────────────────────────────────────────────────────

describe("QUESTION_PAPERS array", () => {
    it("exports an array", () => {
        expect(Array.isArray(QUESTION_PAPERS)).toBe(true);
    });

    it("contains exactly 20 papers", () => {
        expect(QUESTION_PAPERS).toHaveLength(20);
    });

    it("every paper has a unique id", () => {
        const ids = QUESTION_PAPERS.map(p => p.id);
        const unique = new Set(ids);
        expect(unique.size).toBe(20);
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
