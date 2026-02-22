import { REACTION_RULES } from "./reaction-rules.js";

function baseResult(vessel) {
    return {
        observation: null,
        colorChange: null,
        precipitate: null,
        gas: null,
        newColor: vessel.color,
        hasPrecipitate: false,
    };
}

function ruleMatches(rule, chemicals, vessel, action) {
    if (rule.actionFilter && rule.actionFilter !== action) return false;
    if (rule.matches) return rule.matches(chemicals, vessel, action);
    if (rule.requires) return rule.requires.every(id => chemicals.includes(id));
    return true;
}

export function simulateReaction(vessel, action, params = {}) {
    const chemicals = (vessel.contents || []).map(c => c.chemical);
    // Any content added as an unknown FA → observations must not reveal identity
    const hasUnknown = (vessel.contents || []).some(c => c.unknown);
    const base = baseResult(vessel);
    for (const rule of REACTION_RULES) {
        if (ruleMatches(rule, chemicals, vessel, action)) {
            const result = { ...base, ...rule.produce(vessel, action, params) };
            // Merge blind overrides on top — only text/label fields; colour/temp/precipitate
            // boolean are kept from produce() so the visual simulation still works.
            if (hasUnknown && rule.blind) {
                return { ...result, ...rule.blind(vessel, action, params) };
            }
            return result;
        }
    }
    return {
        ...base,
        observation: (vessel.contents || []).length === 0
            ? "Vessel is empty."
            : "No reaction observed.",
    };
}
