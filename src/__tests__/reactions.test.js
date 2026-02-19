import { describe, it, expect } from "vitest";
import { simulateReaction } from "../engine/reactions.js";

// Helper: build a minimal vessel with given chemical ids
function vessel(...chemIds) {
    return {
        contents: chemIds.map(id => ({
            chemical: id,
            volume: 10,
            mass: 1,
        })),
        color: "#ffffff",
    };
}

// ─── Thiosulfate + HCl ────────────────────────────────────────────────────────

describe("Na₂S₂O₃ + HCl (rate-of-reaction clock)", () => {
    it("produces a cloudy observation", () => {
        const v = vessel("Na2S2O3", "HCl");
        const r = simulateReaction(v, "add_chemical");
        expect(r.observation).toMatch(/cloudy/i);
    });

    it("produces a pale-yellow sulfur precipitate", () => {
        const v = vessel("Na2S2O3", "HCl");
        const r = simulateReaction(v, "add_chemical");
        expect(r.hasPrecipitate).toBe(true);
        expect(r.precipitate).toMatch(/S\(s\)/);
    });

    it("returns a positive reactionTime", () => {
        const v = vessel("Na2S2O3", "HCl");
        const r = simulateReaction(v, "add_chemical");
        expect(r.reactionTime).toBeGreaterThan(0);
    });

    it("mentions SO₂ gas", () => {
        const v = vessel("Na2S2O3", "HCl");
        const r = simulateReaction(v, "add_chemical");
        expect(r.gas).toMatch(/SO₂/);
    });
});

// ─── CuSO₄ + Mg (energetics) ──────────────────────────────────────────────────

describe("CuSO₄ + Mg (displacement / enthalpy)", () => {
    it("mentions red-brown copper deposit", () => {
        const v = vessel("CuSO4", "Mg_powder");
        const r = simulateReaction(v, "add_chemical");
        expect(r.observation).toMatch(/copper/i);
    });

    it("has a positive temperature change", () => {
        const v = vessel("CuSO4", "Mg_powder");
        const r = simulateReaction(v, "add_chemical");
        expect(r.tempChange).toBeGreaterThan(0);
    });
});

// ─── KMnO₄ (acid) + Na₂S₂O₃ ─────────────────────────────────────────────────

describe("acidified KMnO₄ + Na₂S₂O₃ (qualitative)", () => {
    it("reports decolourisation", () => {
        const v = vessel("KMnO4_acid", "Na2S2O3");
        const r = simulateReaction(v, "add_chemical");
        expect(r.observation).toMatch(/decolouri/i);
    });

    it("sets the colour to near-colourless", () => {
        const v = vessel("KMnO4_acid", "Na2S2O3");
        const r = simulateReaction(v, "add_chemical");
        expect(r.newColor).toMatch(/#f5f5f5/i);
    });
});

// ─── BaCl₂ + H₂SO₄ ───────────────────────────────────────────────────────────

describe("BaCl₂ + H₂SO₄ (sulfate test)", () => {
    it("produces a white BaSO₄ precipitate", () => {
        const v = vessel("BaCl2", "H2SO4");
        const r = simulateReaction(v, "add_chemical");
        expect(r.hasPrecipitate).toBe(true);
        expect(r.precipitate).toMatch(/BaSO₄/);
    });
});

// ─── BaCl₂ + Na₂SO₃ ──────────────────────────────────────────────────────────

describe("BaCl₂ + Na₂SO₃ (sulfite test)", () => {
    it("forms a white precipitate soluble in HCl", () => {
        const v = vessel("BaCl2", "Na2SO3");
        const r = simulateReaction(v, "add_chemical");
        expect(r.hasPrecipitate).toBe(true);
        expect(r.precipitate).toMatch(/BaSO₃/);
        expect(r.observation).toMatch(/soluble/i);
    });
});

// ─── NaOH + CuSO₄ ────────────────────────────────────────────────────────────

describe("NaOH + CuSO₄ (cation test)", () => {
    it("produces a pale-blue Cu(OH)₂ precipitate", () => {
        const v = vessel("NaOH", "CuSO4");
        const r = simulateReaction(v, "add_chemical");
        expect(r.hasPrecipitate).toBe(true);
        expect(r.precipitate).toMatch(/Cu\(OH\)₂/);
    });
});

// ─── Mg + HCl ────────────────────────────────────────────────────────────────

describe("Mg + HCl (hydrogen gas)", () => {
    it("produces hydrogen gas that pops with a lighted splint", () => {
        const v = vessel("Mg_powder", "HCl");
        const r = simulateReaction(v, "add_chemical");
        expect(r.gas).toMatch(/H₂/);
    });
});

// ─── Heating potassium alum ──────────────────────────────────────────────────

describe("Heating potassium alum (crystallisation)", () => {
    it("mentions water of crystallisation loss", () => {
        const v = vessel("potassium_alum_hydrated");
        const r = simulateReaction(v, "heat");
        expect(r.observation).toMatch(/water/i);
    });

    it("mentions a white anhydrous residue", () => {
        const v = vessel("potassium_alum_hydrated");
        const r = simulateReaction(v, "heat");
        expect(r.observation).toMatch(/anhydrous/i);
    });
});

// ─── Empty vessel / no reaction ──────────────────────────────────────────────

describe("simulateReaction – edge cases", () => {
    it("reports empty vessel when there are no contents", () => {
        const r = simulateReaction({ contents: [], color: "#fff" }, "heat");
        expect(r.observation).toMatch(/empty/i);
    });

    it("always returns an observation string", () => {
        const r = simulateReaction(vessel("NaCl"), "add_chemical");
        expect(typeof r.observation).toBe("string");
    });
});
