import { describe, it, expect } from "vitest";
import { EQUIPMENT } from "../data/equipment.js";
import { CHEMICALS } from "../data/chemicals.js";

const VALID_GROUPS = new Set(["vessels", "measuring", "tools"]);
const VALID_CHEM_TYPES = new Set(["solution", "solid"]);
const VALID_CHEM_CATEGORIES = new Set(["acid", "reagent", "indicator", "titrant", "solution", "solid"]);

// ─── Equipment integrity ──────────────────────────────────────────────────────

describe("Equipment data integrity", () => {
    it("every entry has a label and icon", () => {
        for (const [id, eq] of Object.entries(EQUIPMENT)) {
            expect(typeof eq.label, `${id} missing label`).toBe("string");
            expect(eq.label.length, `${id} label is empty`).toBeGreaterThan(0);
            expect(typeof eq.icon, `${id} missing icon`).toBe("string");
        }
    });

    it("every entry has a valid group field", () => {
        for (const [id, eq] of Object.entries(EQUIPMENT)) {
            expect(
                VALID_GROUPS.has(eq.group),
                `"${id}" has group "${eq.group}" — must be one of: ${[...VALID_GROUPS].join(", ")}`
            ).toBe(true);
        }
    });

    it("no two entries share the same label", () => {
        const labels = Object.values(EQUIPMENT).map(e => e.label);
        const unique = new Set(labels);
        expect(unique.size).toBe(labels.length);
    });
});

// ─── Chemicals integrity ──────────────────────────────────────────────────────

describe("Chemicals data integrity", () => {
    it("every entry has label, type, color, and category", () => {
        for (const [id, chem] of Object.entries(CHEMICALS)) {
            expect(typeof chem.label,    `${id} missing label`).toBe("string");
            expect(typeof chem.type,     `${id} missing type`).toBe("string");
            expect(typeof chem.color,    `${id} missing color`).toBe("string");
            expect(typeof chem.category, `${id} missing category`).toBe("string");
        }
    });

    it("every entry has a valid type", () => {
        for (const [id, chem] of Object.entries(CHEMICALS)) {
            expect(
                VALID_CHEM_TYPES.has(chem.type),
                `"${id}" has type "${chem.type}" — must be "solution" or "solid"`
            ).toBe(true);
        }
    });

    it("every entry has a valid category", () => {
        for (const [id, chem] of Object.entries(CHEMICALS)) {
            expect(
                VALID_CHEM_CATEGORIES.has(chem.category),
                `"${id}" has category "${chem.category}" — must be one of: ${[...VALID_CHEM_CATEGORIES].join(", ")}`
            ).toBe(true);
        }
    });

    it("every color is a valid hex string", () => {
        for (const [id, chem] of Object.entries(CHEMICALS)) {
            expect(
                chem.color,
                `"${id}" color "${chem.color}" is not a valid hex color`
            ).toMatch(/^#[0-9a-fA-F]{3,6}$/);
        }
    });
});