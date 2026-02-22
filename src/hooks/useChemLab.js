import { useState, useEffect, useRef, useCallback } from "react";
import { CHEMICALS } from "../data/chemicals";
import { EQUIPMENT } from "../data/equipment";
import { QUESTION_PAPERS } from "../data/questionPaper";
import { simulateReaction } from "../engine/reactions";
import { evaluateLog } from "../engine/evaluation";

const STORAGE_KEY = "chemlab_v1";

function loadSaved() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

export function useChemLab() {
    const saved = useRef(loadSaved());
    const s = saved.current;

    const [activeTab, setActiveTab] = useState(() => s.activeTab ?? "paper");
    const [vessels, setVessels] = useState(() => s.vessels ?? []);
    const [selectedVessel, setSelectedVessel] = useState(null);
    const [actionLog, setActionLog] = useState(() => s.actionLog ?? []);
    const [logHistory, setLogHistory] = useState(() => s.logHistory ?? [[]]);
    const [historyIndex, setHistoryIndex] = useState(() => s.historyIndex ?? 0);
    const [lastObservation, setLastObservation] = useState("");
    const [partAnswers, setPartAnswers] = useState(() => s.partAnswers ?? {});
    const [evaluation, setEvaluation] = useState(() => s.evaluation ?? null);
    const [selectedChemical, setSelectedChemical] = useState("");
    const [addVolume, setAddVolume] = useState(10);
    const [addMass, setAddMass] = useState(1);
    const [clockTime, setClockTime] = useState(() => s.clockTime ?? 0);
    const [clockRunning, setClockRunning] = useState(false);
    const [bureteReading, setBuretteReading] = useState(0);
    const [expandedQ, setExpandedQ] = useState(() => s.expandedQ ?? "Q1");
    const [activePaperId, setActivePaperId] = useState(() => s.activePaperId ?? 0);
    const [transferDestId, setTransferDestId] = useState(null);
    const [transferAmount, setTransferAmount] = useState(10);
    const [tables, setTables] = useState(() => s.tables ?? []);
    const [graphs, setGraphs] = useState(() => s.graphs ?? []);
    const [activeDataTab, setActiveDataTab] = useState(() => s.activeDataTab ?? "tables");
    const clockRef = useRef(null);

    // Persist state to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                activeTab, activePaperId, expandedQ,
                vessels, actionLog, logHistory, historyIndex,
                partAnswers, evaluation, clockTime,
                tables, graphs, activeDataTab,
            }));
        } catch {
            // Storage quota exceeded — ignore
        }
    }, [activeTab, activePaperId, expandedQ, vessels, actionLog, logHistory,
        historyIndex, partAnswers, evaluation, clockTime, tables, graphs, activeDataTab]);

    useEffect(() => {
        if (clockRunning) {
            clockRef.current = setInterval(() => setClockTime(t => t + 1), 1000);
        } else {
            clearInterval(clockRef.current);
        }
        return () => clearInterval(clockRef.current);
    }, [clockRunning]);

    const pushLog = useCallback((entry) => {
        const newLog = [...actionLog, { ...entry, timestamp: new Date().toLocaleTimeString() }];
        setActionLog(newLog);
        const newHistory = logHistory.slice(0, historyIndex + 1);
        newHistory.push(newLog);
        setLogHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [actionLog, logHistory, historyIndex]);

    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(i => i - 1);
            setActionLog(logHistory[historyIndex - 1]);
        }
    };

    const redo = () => {
        if (historyIndex < logHistory.length - 1) {
            setHistoryIndex(i => i + 1);
            setActionLog(logHistory[historyIndex + 1]);
        }
    };

    const createVessel = (equipmentId) => {
        const eq = EQUIPMENT[equipmentId];
        const newVessel = {
            id: Date.now(),
            type: equipmentId,
            label: eq.label,
            icon: eq.icon,
            contents: [],
            color: "#f0f8ff",
            observations: [],
            temp: 22,
        };
        setVessels(v => [...v, newVessel]);
        pushLog({ action: "equipment_selected", equipment: eq.label, details: `Added ${eq.label} to bench` });
    };

    const addChemicalToVessel = () => {
        if (!selectedVessel || !selectedChemical) return;

        // Resolve FA label → actual chemical ID using the active paper's faMap
        const faMap = activePaper?.faMap ?? {};
        const unknownFAs = activePaper?.unknownFAs ?? [];
        const isFa = String(selectedChemical).startsWith("FA ");
        const actualChemId = isFa ? (faMap[selectedChemical] ?? selectedChemical) : selectedChemical;
        const chem = CHEMICALS[actualChemId];
        if (!chem) return;

        // Mark content as unknown so the reaction engine uses blind observations
        const isUnknownFA = isFa && unknownFAs.includes(selectedChemical);

        // Display label: FA label for exam materials, chemical name for regular chemicals
        const displayLabel = isFa ? selectedChemical : chem.label;

        const amount = chem.type === "solid" ? { mass: addMass } : { volume: addVolume };
        const amountStr = chem.type === "solid" ? `${addMass}g` : `${addVolume} cm³`;

        setVessels(vs => vs.map(v => {
            if (v.id !== selectedVessel) return v;
            const existing = v.contents.find(c => c.chemical === actualChemId);
            let newContents;
            if (existing) {
                newContents = v.contents.map(c => c.chemical === actualChemId
                    ? {
                        ...c,
                        volume: (c.volume || 0) + (amount.volume || 0),
                        mass: (c.mass || 0) + (amount.mass || 0),
                        // Once an unknown FA is in the vessel, keep it flagged
                        unknown: c.unknown || isUnknownFA,
                    }
                    : c
                );
            } else {
                newContents = [...v.contents, { chemical: actualChemId, label: displayLabel, ...amount, ...(isUnknownFA ? { unknown: true } : {}) }];
            }
            const tempVessel = { ...v, contents: newContents };
            const rxn = simulateReaction(tempVessel, "add");
            if (rxn.observation) setLastObservation(`[${v.label}] Added ${amountStr} ${displayLabel}: ${rxn.observation}`);
            return {
                ...v,
                contents: newContents,
                color: rxn.newColor || v.color,
                hasPrecipitate: v.hasPrecipitate || rxn.hasPrecipitate,
                precipitateLabel: rxn.precipitate || v.precipitateLabel,
                observations: rxn.observation ? [...v.observations, rxn.observation] : v.observations,
                temp: rxn.tempChange ? v.temp + rxn.tempChange : v.temp,
                reactionTime: rxn.reactionTime || v.reactionTime,
            };
        }));

        pushLog({
            action: "add_chemical",
            chemical: actualChemId,
            amount: amountStr,
            vessel: vessels.find(v => v.id === selectedVessel)?.label,
            details: `Added ${amountStr} of ${displayLabel}`,
        });
    };

    const performAction = (action) => {
        if (!selectedVessel) {
            setLastObservation("⚠️ Please select a vessel first!");
            return;
        }
        const vessel = vessels.find(v => v.id === selectedVessel);
        if (!vessel) return;

        let obs = "";
        if (action === "heat") {
            const rxn = simulateReaction(vessel, "heat");
            obs = rxn.observation;
            setVessels(vs => vs.map(v => v.id === selectedVessel
                ? { ...v, temp: Math.min(v.temp + 15, 100), observations: [...v.observations, obs] }
                : v
            ));
        } else if (action === "stir") {
            const rxn = simulateReaction(vessel, "stir");
            obs = rxn.observation || "Stirred vigorously. Contents well mixed.";
        } else if (action === "filter") {
            const solidContents = vessel.contents.filter(c => CHEMICALS[c.chemical]?.type === "solid");
            const liquidContents = vessel.contents.filter(c => CHEMICALS[c.chemical]?.type !== "solid");
            const hasSolid = solidContents.length > 0 || vessel.hasPrecipitate;

            if (hasSolid) {
                const residueLabel = vessel.precipitateLabel
                    ? `Residue: ${vessel.precipitateLabel}`
                    : "Solid residue on filter paper";
                const filtrateVessel = {
                    id: Date.now() + 1,
                    type: "beaker_100",
                    label: `Beaker (100 cm³) [Filtrate from ${vessel.label}]`,
                    icon: "🫙",
                    contents: liquidContents,
                    color: "#e8f4f8",
                    observations: [`Filtrate collected from ${vessel.label}`],
                    temp: vessel.temp,
                    hasPrecipitate: false,
                };
                setVessels(vs => [
                    ...vs.map(v => v.id === selectedVessel
                        ? { ...v, contents: solidContents, hasPrecipitate: false, color: "#e8e8e8", observations: [...v.observations, residueLabel] }
                        : v),
                    filtrateVessel,
                ]);
                obs = `Filter complete. ${residueLabel}. Filtrate collected in new beaker.`;
            } else {
                obs = "Solution filtered through filter paper. No solid residue observed.";
            }
        } else if (action === "start_clock") {
            setClockRunning(true);
            obs = "⏱ Stop-clock started.";
        } else if (action === "stop_clock") {
            setClockRunning(false);
            obs = `⏱ Stop-clock stopped at ${clockTime}s. ` + (vessel.reactionTime ? `Expected reaction time ~${vessel.reactionTime}s.` : "");
        } else if (action === "measure_temp") {
            // Round to nearest 0.5 °C to simulate thermometer precision
            const rounded = Math.round(vessel.temp * 2) / 2;
            obs = `🌡 Temperature: ${rounded.toFixed(1)} °C  [Thermometer precision: ±0.25 °C — record to 0.5 °C]`;
        } else if (action === "weigh") {
            const totalMass = vessel.contents
                .filter(c => CHEMICALS[c.chemical]?.type === "solid")
                .reduce((s, c) => s + (c.mass || 0), 0);
            obs = `⚖️ Mass of solid contents: ${totalMass.toFixed(2)} g  [Balance precision: ±0.005 g — record to 2 d.p.]`;
        } else if (action === "test_gas_splint") {
            const hasUnknownContent = vessel.contents.some(c => c.unknown);
            const pops = vessel.observations.some(o => o.includes("H₂") || o.includes("pops"));
            if (pops) {
                obs = hasUnknownContent
                    ? "🕯️ Gas pops with lighted splint."
                    : "🕯️ Gas pops with lighted splint → Hydrogen confirmed!";
            } else {
                obs = "🕯️ Gas does not pop with splint.";
            }
        } else if (action === "test_gas_glowing") {
            const hasUnknownContent = vessel.contents.some(c => c.unknown);
            const relights = vessel.observations.some(o => o.includes("O₂") || o.includes("relights"));
            if (relights) {
                obs = hasUnknownContent
                    ? "🕯️ Glowing splint relights."
                    : "🕯️ Glowing splint relights → Oxygen confirmed!";
            } else {
                obs = "🕯️ Glowing splint does not relight.";
            }
        } else if (action === "test_litmus") {
            const hasUnknownContent = vessel.contents.some(c => c.unknown);
            const turnsBlue = vessel.observations.some(o =>
                o.includes("NH₃") || o.includes("ammonia") ||
                (o.includes("litmus") && o.toLowerCase().includes("blue"))
            );
            if (turnsBlue) {
                obs = hasUnknownContent
                    ? "📄 Damp red litmus turns blue."
                    : "📄 Damp red litmus turns blue → Ammonia confirmed!";
            } else {
                obs = "📄 Litmus does not change colour.";
            }
        }

        setLastObservation(`[${vessel.label}] ${action.replace(/_/g, ' ')}: ${obs}`);
        if (action !== "filter" && action !== "heat") {
            setVessels(vs => vs.map(v => v.id === selectedVessel && obs
                ? { ...v, observations: [...v.observations, obs] }
                : v
            ));
        }
        pushLog({ action, vessel: vessel.label, observation: obs, details: obs });
    };

    const transferContents = () => {
        const sourceVessel = vessels.find(v => v.id === selectedVessel);
        const destVessel = vessels.find(v => v.id === transferDestId);
        if (!sourceVessel || !destVessel) return;

        const totalVolume = sourceVessel.contents.reduce((s, c) => s + (c.volume || 0), 0);
        const fraction = totalVolume > 0 ? Math.min(transferAmount / totalVolume, 1) : 1;

        setVessels(vs => vs.map(v => {
            if (v.id === selectedVessel) {
                const newContents = sourceVessel.contents
                    .map(c => ({
                        ...c,
                        volume: c.volume != null ? +(c.volume * (1 - fraction)).toFixed(2) : undefined,
                        mass: c.mass != null ? +(c.mass * (1 - fraction)).toFixed(3) : undefined,
                    }))
                    .filter(c => (c.volume ?? 0) > 0.005 || (c.mass ?? 0) > 0.001);
                return { ...v, contents: newContents };
            }
            if (v.id === transferDestId) {
                const transferred = sourceVessel.contents.map(c => ({
                    ...c,
                    volume: c.volume != null ? +(c.volume * fraction).toFixed(2) : undefined,
                    mass: c.mass != null ? +(c.mass * fraction).toFixed(3) : undefined,
                }));
                let merged = [...v.contents];
                transferred.forEach(tc => {
                    const existing = merged.find(c => c.chemical === tc.chemical);
                    if (existing) {
                        merged = merged.map(c => c.chemical === tc.chemical
                            ? {
                                ...c,
                                volume: c.volume != null ? +((c.volume || 0) + (tc.volume || 0)).toFixed(2) : undefined,
                                mass: c.mass != null ? +((c.mass || 0) + (tc.mass || 0)).toFixed(3) : undefined,
                            }
                            : c);
                    } else {
                        merged.push(tc);
                    }
                });
                const tempVessel = { ...v, contents: merged };
                const rxn = simulateReaction(tempVessel, "add");
                const obs = `Transfer from ${sourceVessel.label}: ${rxn.observation}`;
                if (rxn.observation) setLastObservation(`[${v.label}] ${obs}`);
                return {
                    ...v,
                    contents: merged,
                    color: rxn.newColor || v.color,
                    observations: rxn.observation ? [...v.observations, obs] : v.observations,
                    temp: rxn.tempChange ? v.temp + rxn.tempChange : v.temp,
                };
            }
            return v;
        }));

        pushLog({
            action: "transfer",
            vessel: sourceVessel.label,
            details: `Transferred ${transferAmount} cm³ from ${sourceVessel.label} → ${destVessel.label}`,
        });
    };

    const runEvaluation = () => {
        const paper = QUESTION_PAPERS[activePaperId] ?? QUESTION_PAPERS[0];
        const joinedNotes = Object.entries(partAnswers)
            .map(([id, ans]) => `${id}: ${ans}`)
            .join("\n");
        const result = evaluateLog(actionLog, joinedNotes, paper);
        setEvaluation(result);
        setActiveTab("evaluate");
    };

    const clearBench = () => {
        setVessels([]);
        setSelectedVessel(null);
        setLastObservation("");
    };

    const startFresh = () => {
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
        setActionLog([]);
        setLogHistory([[]]);
        setHistoryIndex(0);
        setVessels([]);
        setSelectedVessel(null);
        setPartAnswers({});
        setEvaluation(null);
        setClockTime(0);
        setTables([]);
        setGraphs([]);
        setActiveTab("paper");
    };

    const activePaper = QUESTION_PAPERS[activePaperId] ?? QUESTION_PAPERS[0];

    return {
        activeTab, setActiveTab,
        activePaper,
        vessels, setVessels,
        selectedVessel, setSelectedVessel,
        lastObservation,
        selectedChemical, setSelectedChemical,
        addVolume, setAddVolume,
        addMass, setAddMass,
        transferDestId, setTransferDestId,
        transferAmount, setTransferAmount,
        clockTime, setClockTime,
        clockRunning,
        bureteReading, setBuretteReading,
        expandedQ, setExpandedQ,
        activePaperId, setActivePaperId,
        partAnswers, setPartAnswers,
        tables, setTables,
        graphs, setGraphs,
        activeDataTab, setActiveDataTab,
        evaluation, setEvaluation,
        actionLog,
        historyIndex,
        logHistory,
        pushLog,
        undo,
        redo,
        createVessel,
        addChemicalToVessel,
        performAction,
        transferContents,
        runEvaluation,
        clearBench,
        startFresh,
    };
}
