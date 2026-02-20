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

// ─── AgNO3 halide tests ───────────────────────────────────────────────────────

describe("AgNO₃ + HCl (chloride test — reported bug fix)", () => {
    it("produces a curdy white AgCl precipitate", () => {
        const v = vessel("AgNO3", "HCl");
        const r = simulateReaction(v, "add_chemical");
        expect(r.hasPrecipitate).toBe(true);
        expect(r.precipitate).toMatch(/AgCl/);
    });

    it("mentions curdy white colour", () => {
        const v = vessel("AgNO3", "HCl");
        const r = simulateReaction(v, "add_chemical");
        expect(r.observation).toMatch(/curdy/i);
    });

    it("also works when Cl⁻ comes from BaCl2", () => {
        const v = vessel("AgNO3", "BaCl2");
        const r = simulateReaction(v, "add_chemical");
        expect(r.hasPrecipitate).toBe(true);
        expect(r.precipitate).toMatch(/AgCl/);
    });
});

describe("AgNO₃ + KBr (bromide test)", () => {
    it("produces a cream AgBr precipitate", () => {
        const v = vessel("AgNO3", "KBr");
        const r = simulateReaction(v, "add_chemical");
        expect(r.hasPrecipitate).toBe(true);
        expect(r.precipitate).toMatch(/AgBr/);
    });

    it("mentions insolubility in dilute NH₃", () => {
        const v = vessel("AgNO3", "KBr");
        const r = simulateReaction(v, "add_chemical");
        expect(r.observation).toMatch(/NH₃/);
    });
});

describe("AgNO₃ + KI (iodide test)", () => {
    it("produces a pale yellow AgI precipitate", () => {
        const v = vessel("AgNO3", "KI");
        const r = simulateReaction(v, "add_chemical");
        expect(r.hasPrecipitate).toBe(true);
        expect(r.precipitate).toMatch(/AgI/);
    });

    it("observation mentions pale yellow colour", () => {
        const v = vessel("AgNO3", "KI");
        const r = simulateReaction(v, "add_chemical");
        expect(r.observation).toMatch(/pale yellow/i);
    });
});

// ─── NaOH additional cation tests ────────────────────────────────────────────

describe("NaOH + FeSO₄ (Fe²⁺ cation test)", () => {
    it("produces a dirty green Fe(OH)₂ precipitate", () => {
        const v = vessel("NaOH", "FeSO4");
        const r = simulateReaction(v, "add_chemical");
        expect(r.hasPrecipitate).toBe(true);
        expect(r.precipitate).toMatch(/Fe\(OH\)₂/);
    });

    it("observation mentions green colour and darkening on standing", () => {
        const v = vessel("NaOH", "FeSO4");
        const r = simulateReaction(v, "add_chemical");
        expect(r.observation).toMatch(/green/i);
    });
});

// ─── NH3 cation tests ─────────────────────────────────────────────────────────

describe("NH₃(aq) + CuSO₄", () => {
    it("produces a deep royal blue solution in excess NH₃", () => {
        const v = vessel("NH3_aq", "CuSO4");
        const r = simulateReaction(v, "add_chemical");
        expect(r.observation).toMatch(/deep.*blue|royal blue/i);
    });

    it("mentions the tetraamminecopper complex", () => {
        const v = vessel("NH3_aq", "CuSO4");
        const r = simulateReaction(v, "add_chemical");
        expect(r.observation).toMatch(/Cu\(NH₃\)₄/);
    });
});

// ─── Acid + anion gas evolution ───────────────────────────────────────────────

describe("HCl + Na₂CO₃ (carbonate test)", () => {
    it("evolves CO₂ gas", () => {
        const v = vessel("HCl", "Na2CO3");
        const r = simulateReaction(v, "add_chemical");
        expect(r.gas).toMatch(/CO₂/);
    });

    it("mentions limewater turning milky", () => {
        const v = vessel("HCl", "Na2CO3");
        const r = simulateReaction(v, "add_chemical");
        expect(r.observation).toMatch(/limewater/i);
    });

    it("also works with H₂SO₄", () => {
        const v = vessel("H2SO4", "Na2CO3");
        const r = simulateReaction(v, "add_chemical");
        expect(r.gas).toMatch(/CO₂/);
    });
});

describe("HCl + Na₂SO₃ (sulfite test — SO₂ gas)", () => {
    it("evolves SO₂ gas", () => {
        const v = vessel("HCl", "Na2SO3");
        const r = simulateReaction(v, "add_chemical");
        expect(r.gas).toMatch(/SO₂/);
    });

    it("observation mentions pungent/choking smell", () => {
        const v = vessel("HCl", "Na2SO3");
        const r = simulateReaction(v, "add_chemical");
        expect(r.observation).toMatch(/pungent|choking/i);
    });
});

// ─── Zn reactions ─────────────────────────────────────────────────────────────

describe("Zn + HCl (hydrogen gas)", () => {
    it("evolves H₂ gas", () => {
        const v = vessel("Zn", "HCl");
        const r = simulateReaction(v, "add_chemical");
        expect(r.gas).toMatch(/H₂/);
    });
});

describe("Zn + CuSO₄ (displacement)", () => {
    it("deposits copper", () => {
        const v = vessel("Zn", "CuSO4");
        const r = simulateReaction(v, "add_chemical");
        expect(r.hasPrecipitate).toBe(true);
        expect(r.precipitate).toMatch(/Cu/);
    });

    it("observation mentions blue decolourising", () => {
        const v = vessel("Zn", "CuSO4");
        const r = simulateReaction(v, "add_chemical");
        expect(r.observation).toMatch(/decolouri/i);
    });
});

// ─── KMnO4 extended redox ─────────────────────────────────────────────────────

describe("KMnO₄ + FeSO₄ (Fe²⁺ redox)", () => {
    it("decolourises KMnO₄ and forms Fe³⁺", () => {
        const v = vessel("KMnO4_acid", "FeSO4");
        const r = simulateReaction(v, "add_chemical");
        expect(r.observation).toMatch(/decolouri/i);
    });

    it("mentions Fe³⁺ formation", () => {
        const v = vessel("KMnO4_acid", "FeSO4");
        const r = simulateReaction(v, "add_chemical");
        expect(r.observation).toMatch(/Fe³⁺/);
    });
});

describe("KI + H₂O₂ (iodide redox)", () => {
    it("produces yellow-brown I₂", () => {
        const v = vessel("KI", "H2O2");
        const r = simulateReaction(v, "add_chemical");
        expect(r.observation).toMatch(/yellow-brown|I₂/i);
    });
});

// ─── BaCl2 carbonate ─────────────────────────────────────────────────────────

describe("BaCl₂ + Na₂CO₃ (carbonate precipitation)", () => {
    it("forms white BaCO₃ precipitate soluble in HCl", () => {
        const v = vessel("BaCl2", "Na2CO3");
        const r = simulateReaction(v, "add_chemical");
        expect(r.hasPrecipitate).toBe(true);
        expect(r.precipitate).toMatch(/BaCO₃/);
    });

    it("mentions solubility in HCl to distinguish from BaSO₄", () => {
        const v = vessel("BaCl2", "Na2CO3");
        const r = simulateReaction(v, "add_chemical");
        expect(r.observation).toMatch(/HCl|hydrochloric/i);
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
