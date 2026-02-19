import { describe, it, expect } from "vitest";
import { buildCSV, buildNotesTxt } from "../utils/export.js";

// ─── buildCSV ────────────────────────────────────────────────────────────────

describe("buildCSV", () => {
    it("produces a header row with six columns", () => {
        const csv = buildCSV([]);
        const header = csv.split("\n")[0];
        const cols = header.split(",");
        expect(cols).toHaveLength(6);
        expect(header).toContain("Time");
        expect(header).toContain("Action");
        expect(header).toContain("Chemical");
        expect(header).toContain("Amount");
        expect(header).toContain("Details");
    });

    it("returns only a header for an empty log", () => {
        const csv = buildCSV([]);
        expect(csv.split("\n")).toHaveLength(1);
    });

    it("encodes a simple entry correctly", () => {
        const log = [
            { timestamp: "10:00:01", action: "add_chemical", vessel: "Beaker A", chemical: "HCl", amount: "10", details: "10 cm³" },
        ];
        const csv = buildCSV(log);
        const lines = csv.split("\n");
        expect(lines).toHaveLength(2);
        expect(lines[1]).toContain("add_chemical");
        expect(lines[1]).toContain("HCl");
    });

    it("escapes double-quotes inside field values", () => {
        const log = [
            { timestamp: "10:00", action: "note", vessel: "", chemical: "", amount: "", details: 'He said "hello"' },
        ];
        const csv = buildCSV(log);
        // RFC 4180: embedded " → ""
        expect(csv).toContain('""hello""');
    });

    it("collapses newlines in a details field to a space", () => {
        const log = [
            { timestamp: "10:00", action: "observe", vessel: "v", chemical: "", amount: "", details: "line1\nline2" },
        ];
        const csv = buildCSV(log);
        expect(csv).not.toContain("\nline2");
        expect(csv).toContain("line1 line2");
    });

    it("handles null / undefined field values gracefully", () => {
        const log = [
            { timestamp: null, action: undefined, vessel: null, chemical: undefined, amount: null, details: undefined },
        ];
        expect(() => buildCSV(log)).not.toThrow();
        const csv = buildCSV(log);
        expect(csv.split("\n")).toHaveLength(2);
    });

    it("handles multiple rows correctly", () => {
        const log = [
            { timestamp: "t1", action: "a1", vessel: "v1", chemical: "c1", amount: "1", details: "d1" },
            { timestamp: "t2", action: "a2", vessel: "v2", chemical: "c2", amount: "2", details: "d2" },
        ];
        const csv = buildCSV(log);
        expect(csv.split("\n")).toHaveLength(3);
    });
});

// ─── buildNotesTxt ───────────────────────────────────────────────────────────

describe("buildNotesTxt", () => {
    it("includes the app title", () => {
        const txt = buildNotesTxt("my notes", "Test Paper");
        expect(txt).toContain("Cambridge Chemistry Lab Simulator");
    });

    it("includes the paper title when provided", () => {
        const txt = buildNotesTxt("notes", "9701/33 March 2024");
        expect(txt).toContain("9701/33 March 2024");
    });

    it("falls back to a default title when paperTitle is not supplied", () => {
        const txt = buildNotesTxt("notes");
        expect(txt).toContain("Cambridge 9701/33");
    });

    it("includes the student notes verbatim", () => {
        const notes = "The titre was 23.50 cm³";
        const txt = buildNotesTxt(notes, "Paper");
        expect(txt).toContain(notes);
    });

    it("includes the section heading", () => {
        const txt = buildNotesTxt("n", "p");
        expect(txt).toContain("STUDENT ANSWER BOOKLET");
    });

    it("handles empty notes without throwing", () => {
        expect(() => buildNotesTxt("", "Paper")).not.toThrow();
    });
});
