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
    const base = baseResult(vessel);
    for (const rule of REACTION_RULES) {
        if (ruleMatches(rule, chemicals, vessel, action)) {
            return { ...base, ...rule.produce(vessel, action, params) };
        }
    }
    return {
        ...base,
        observation: (vessel.contents || []).length === 0
            ? "Vessel is empty."
            : "No reaction observed.",
    };
}
