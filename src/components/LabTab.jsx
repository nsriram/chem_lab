import { useState, useEffect, useRef } from "react";
import { CHEMICALS } from "../data/chemicals";
import { EQUIPMENT } from "../data/equipment";
import { useLang } from "../contexts/LangContext";

// ── Precision reference ────────────────────────────────────────────────────────
const PRECISION = [
    { icon: "⚖️", name: "Balance",          reading: "0.01 g",     uncertainty: "±0.005 g",   note: "record to 2 d.p." },
    { icon: "🧪", name: "Burette",           reading: "0.05 cm³",   uncertainty: "±0.025 cm³", note: "final digit 0 or 5" },
    { icon: "🌡️", name: "Thermometer",       reading: "0.5 °C",     uncertainty: "±0.25 °C",   note: "record to 0.5 °C" },
    { icon: "📐", name: "Measuring cyl.",    reading: "0.5 cm³",    uncertainty: "±0.25 cm³",  note: "read at bottom of meniscus" },
    { icon: "⏱️", name: "Stop-clock",        reading: "1 s",        uncertainty: "±0.5 s",     note: "record in whole seconds" },
    { icon: "💉", name: "Pipette (25 cm³)",  reading: "±0.06 cm³",  uncertainty: "±0.06 cm³",  note: "fixed volume, single graduation" },
];

// ── Lab actions (action key, icon, translation key, variant) ──────────────────
const ACTIONS = [
    ["heat",             "🔥",  "action.heat",             "danger" ],
    ["stir",             "🌀",  "action.stir",             ""       ],
    ["filter",           "🫧",  "action.filter",           ""       ],
    ["measure_temp",     "🌡️",  "action.measure_temp",     ""       ],
    ["weigh",            "⚖️",  "action.weigh",            ""       ],
    ["test_gas_splint",  "🕯️",  "action.test_gas_splint",  ""       ],
    ["test_gas_glowing", "🕯️",  "action.test_gas_glowing", ""       ],
    ["test_litmus",      "📄",  "action.test_litmus",      ""       ],
];

// ── Equipment palette groups ───────────────────────────────────────────────────
const EQUIP_GROUPS = [
    {
        id: "vessels",
        labelKey: "equip.vessels",
        color: "#60a5fa",
        ids: ["conical_flask", "beaker_100", "beaker_250", "polystyrene_cup", "test_tube", "boiling_tube", "crucible"],
    },
    {
        id: "measuring",
        labelKey: "equip.measuring",
        color: "#34d399",
        ids: ["burette", "pipette_25", "measuring_cylinder_10", "measuring_cylinder_25", "measuring_cylinder_50", "thermometer", "stop_clock", "balance"],
    },
    {
        id: "tools",
        labelKey: "equip.tools",
        color: "#fb923c",
        ids: ["bunsen", "stirring_rod", "filter_paper", "dropper", "splint", "litmus_red"],
    },
];

// ── Chemical category metadata ─────────────────────────────────────────────────
const CAT_META = {
    acid:      { color: "#f87171" },
    reagent:   { color: "#c084fc" },
    indicator: { color: "#34d399" },
    titrant:   { color: "#fbbf24" },
    solution:  { color: "#60a5fa" },
    solid:     { color: "#94a3b8" },
};
const CAT_ORDER = ["acid", "reagent", "indicator", "titrant", "solution", "solid"];

// ── Helpers ────────────────────────────────────────────────────────────────────
function groupChemicals() {
    const groups = {};
    Object.entries(CHEMICALS).forEach(([id, chem]) => {
        const cat = chem.category || "solution";
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push([id, chem]);
    });
    return groups;
}

// "Hydrochloric Acid (2.00 mol/dm³)" → { name: "Hydrochloric Acid", detail: "(2.00 mol/dm³)" }
function splitLabel(label) {
    const m = label.match(/^(.*?)\s*(\([^)]*\))\s*$/);
    return m ? { name: m[1], detail: m[2] } : { name: label, detail: "" };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LabTab({
    vessels, setVessels,
    selectedVessel, setSelectedVessel,
    selectedChemical, setSelectedChemical,
    addVolume, setAddVolume,
    addMass, setAddMass,
    transferDestId, setTransferDestId,
    transferAmount, setTransferAmount,
    lastObservation,
    clockTime, setClockTime,
    bureteReading, setBuretteReading,
    createVessel, addChemicalToVessel, performAction, transferContents, clearBench, pushLog,
    activePaper,
}) {
    const { t } = useLang();

    // ── Animation state ────────────────────────────────────────────────────────
    const [flashVesselId, setFlashVesselId] = useState(null);
    const [flashType, setFlashType]         = useState("reaction");
    const [newVesselIds, setNewVesselIds]   = useState(new Set());
    const [obsKey, setObsKey]               = useState(0);
    const [openSections, setOpenSections]   = useState(
        () => new Set(["vessels", "measuring", ...CAT_ORDER])
    );
    const prevObsRef   = useRef(null);
    const prevCountRef = useRef(0);

    // Flash vessel whenever a new observation fires
    useEffect(() => {
        if (!lastObservation || lastObservation === prevObsRef.current) return;
        prevObsRef.current = lastObservation;
        setObsKey(k => k + 1);
        if (!selectedVessel) return;
        setFlashVesselId(selectedVessel);
        setFlashType("reaction");
        const t = setTimeout(() => setFlashVesselId(null), 900);
        return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastObservation]);

    // Bounce-in each newly added vessel
    useEffect(() => {
        if (vessels.length > prevCountRef.current && vessels.length > 0) {
            const newest = vessels[vessels.length - 1];
            setNewVesselIds(ids => new Set([...ids, newest.id]));
            const timer = setTimeout(() => {
                setNewVesselIds(ids => { const s = new Set(ids); s.delete(newest.id); return s; });
            }, 800);
            prevCountRef.current = vessels.length;
            return () => clearTimeout(timer);
        }
        prevCountRef.current = vessels.length;
    }, [vessels.length]);

    // Per-action glow on the vessel
    const handleAction = (action) => {
        if (selectedVessel) {
            const typeMap = { heat: "heat", stir: "stir" };
            const ft = typeMap[action];
            if (ft) {
                setFlashVesselId(selectedVessel);
                setFlashType(ft);
                setTimeout(() => setFlashVesselId(null), 900);
            }
        }
        performAction(action);
    };

    const toggleSection = (id) =>
        setOpenSections(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const activeVessel = vessels.find(v => v.id === selectedVessel);
    const chemGroups   = groupChemicals();

    const vesselAnimClass = (v) => {
        const cls = ["vessel-card"];
        if (selectedVessel === v.id)  cls.push("selected");
        if (newVesselIds.has(v.id))   cls.push("vessel-new");
        if (flashVesselId === v.id)   cls.push(
            flashType === "heat" ? "vessel-heat" :
            flashType === "stir" ? "vessel-stir" :
            "vessel-reaction"
        );
        return cls.join(" ");
    };

    return (
        <div style={{ display: "flex", height: "calc(100vh - 130px)", overflow: "hidden" }}>

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* LEFT PANEL — Palette                                            */}
            {/* ════════════════════════════════════════════════════════════════ */}
            <div className="palette-panel">

                <div className="palette-heading">{t('lab.equipment')}</div>

                {EQUIP_GROUPS.map(group => (
                    <div key={group.id}>
                        <button
                            className="palette-group-hdr"
                            onClick={() => toggleSection(group.id)}
                            style={{ "--grp-color": group.color }}
                        >
                            <span className="palette-chevron">
                                {openSections.has(group.id) ? "▾" : "▸"}
                            </span>
                            <span className="palette-group-label" style={{ color: group.color }}>
                                {t(group.labelKey)}
                            </span>
                        </button>

                        {openSections.has(group.id) && (
                            <div className="palette-items">
                                {group.ids.map(id => EQUIPMENT[id] && (
                                    <button
                                        key={id}
                                        className="equip-card"
                                        onClick={() => createVessel(id)}
                                        title={`Add ${EQUIPMENT[id].label} to bench`}
                                    >
                                        <span className="equip-icon">{EQUIPMENT[id].icon}</span>
                                        <span className="equip-label">{EQUIPMENT[id].label}</span>
                                        <span className="equip-add">＋</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {/* ── Exam Materials (FA-labelled bottles) ── */}
                {activePaper?.faMap && (() => {
                    const unknownSet = new Set(activePaper.unknownFAs ?? []);
                    const faEntries = Object.entries(activePaper.faMap);
                    const unknowns = faEntries.filter(([lbl]) => unknownSet.has(lbl));
                    const knowns   = faEntries.filter(([lbl]) => !unknownSet.has(lbl));
                    return (
                        <>
                            <div style={{ borderTop: "1px solid #1a3a5a", margin: "10px 0 6px" }} />
                            <div className="palette-heading" style={{ color: "#f9a825" }}>
                                {t('lab.examMaterials')}
                            </div>
                            <div style={{ fontSize: 10, color: "#8a7040", padding: "0 8px 6px", fontStyle: "italic" }}>
                                {activePaper.title}
                            </div>

                            {/* Unknowns group */}
                            {unknowns.length > 0 && (<>
                                <button
                                    className="palette-group-hdr"
                                    onClick={() => toggleSection("exam_unknown")}
                                    style={{ "--grp-color": "#f9a825" }}
                                >
                                    <span className="palette-chevron">
                                        {openSections.has("exam_unknown") ? "▾" : "▸"}
                                    </span>
                                    <span className="palette-group-label" style={{ color: "#f9a825" }}>
                                        {t('lab.unknowns')}
                                    </span>
                                    <span className="palette-count">{unknowns.length}</span>
                                </button>
                                {openSections.has("exam_unknown") && (
                                    <div className="palette-items">
                                        {unknowns.map(([faLabel]) => {
                                            const isSel = selectedChemical === faLabel;
                                            return (
                                                <button
                                                    key={faLabel}
                                                    className={`chem-card fa-card${isSel ? " selected" : ""}`}
                                                    onClick={() => setSelectedChemical(isSel ? "" : faLabel)}
                                                    title={`${faLabel} — identity unknown`}
                                                >
                                                    <span className="chem-swatch fa-swatch" />
                                                    <span className="chem-body">
                                                        <span className="chem-name fa-label">{faLabel}</span>
                                                        <span className="chem-detail" style={{ fontStyle: "italic" }}>{t('lab.unknownLabel')}</span>
                                                    </span>
                                                    {isSel && <span className="chem-check">✓</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </>)}

                            {/* Known reagents group */}
                            {knowns.length > 0 && (<>
                                <button
                                    className="palette-group-hdr"
                                    onClick={() => toggleSection("exam_known")}
                                    style={{ "--grp-color": "#c8820a" }}
                                >
                                    <span className="palette-chevron">
                                        {openSections.has("exam_known") ? "▾" : "▸"}
                                    </span>
                                    <span className="palette-group-label" style={{ color: "#c8820a" }}>
                                        {t('lab.knownReagents')}
                                    </span>
                                    <span className="palette-count">{knowns.length}</span>
                                </button>
                                {openSections.has("exam_known") && (
                                    <div className="palette-items">
                                        {knowns.map(([faLabel, chemId]) => {
                                            const isSel = selectedChemical === faLabel;
                                            const chem = CHEMICALS[chemId];
                                            const { name, detail } = splitLabel(chem?.label ?? chemId);
                                            return (
                                                <button
                                                    key={faLabel}
                                                    className={`chem-card fa-card fa-card-known${isSel ? " selected" : ""}`}
                                                    onClick={() => setSelectedChemical(isSel ? "" : faLabel)}
                                                    title={`${faLabel} = ${chem?.label ?? chemId}`}
                                                >
                                                    <span className="chem-swatch fa-swatch fa-swatch-known" />
                                                    <span className="chem-body">
                                                        <span className="chem-name fa-label">{faLabel}</span>
                                                        <span className="chem-detail">{name}{detail ? ` ${detail}` : ""}</span>
                                                    </span>
                                                    {isSel && <span className="chem-check">✓</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </>)}
                        </>
                    );
                })()}

                <div style={{ borderTop: "1px solid #1a3a5a", margin: "10px 0 6px" }} />
                <div className="palette-heading">{t('lab.chemicals')}</div>

                {CAT_ORDER.map(cat => {
                    const items = chemGroups[cat];
                    if (!items?.length) return null;
                    const meta = CAT_META[cat];
                    return (
                        <div key={cat}>
                            <button
                                className="palette-group-hdr"
                                onClick={() => toggleSection(cat)}
                                style={{ "--grp-color": meta.color }}
                            >
                                <span className="palette-chevron">
                                    {openSections.has(cat) ? "▾" : "▸"}
                                </span>
                                <span className="palette-group-label" style={{ color: meta.color }}>
                                    {t(`cat.${cat}`)}
                                </span>
                                <span className="palette-count">{items.length}</span>
                            </button>

                            {openSections.has(cat) && (
                                <div className="palette-items">
                                    {items.map(([id, chem]) => {
                                        const { name, detail } = splitLabel(chem.label);
                                        const isSel = selectedChemical === id;
                                        return (
                                            <button
                                                key={id}
                                                className={`chem-card${isSel ? " selected" : ""}`}
                                                onClick={() => setSelectedChemical(isSel ? "" : id)}
                                                title={chem.label}
                                            >
                                                <span
                                                    className="chem-swatch"
                                                    style={{
                                                        background: chem.color,
                                                        boxShadow: isSel ? `0 0 6px ${chem.color}80` : "none",
                                                    }}
                                                />
                                                <span className="chem-body">
                                                    <span className="chem-name">{name}</span>
                                                    {detail && <span className="chem-detail">{detail}</span>}
                                                </span>
                                                {isSel && <span className="chem-check">✓</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* CENTRE — Bench                                                  */}
            {/* ════════════════════════════════════════════════════════════════ */}
            <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", color: "#c8e8ff", fontSize: 16 }}>{t('lab.bench')}</div>
                    <button className="action-btn danger" style={{ fontSize: 11 }} onClick={clearBench}>{t('lab.clearBench')}</button>
                </div>

                {vessels.length === 0 && (
                    <div style={{ textAlign: "center", color: "#3a6a9a", padding: 60, border: "2px dashed #1a3a5a", borderRadius: 12 }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>⚗️</div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18 }}>{t('lab.selectEquip')}</div>
                        <div style={{ fontSize: 13, marginTop: 8, color: "#2a5a7a" }}>{t('lab.clickToAdd')}</div>
                    </div>
                )}

                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                    {vessels.map(vessel => (
                        <div
                            key={vessel.id}
                            className={vesselAnimClass(vessel)}
                            style={{ width: 180, position: "relative" }}
                            onClick={() => setSelectedVessel(vessel.id)}
                        >
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 40 }}>{vessel.icon}</div>
                                <div style={{ fontSize: 12, color: "#8ab4d4", marginBottom: 4 }}>{vessel.label}</div>
                            </div>
                            {vessel.temp !== 22 && (
                                <div style={{ fontSize: 11, color: "#df9a4a", textAlign: "center" }}>🌡 {vessel.temp}°C</div>
                            )}
                            {vessel.contents.length > 0 && (
                                <div style={{ marginTop: 8 }}>
                                    {vessel.contents.map((c, i) => (
                                        <div key={i} style={{ fontSize: 11, color: "#8ab4d4", display: "flex", justifyContent: "space-between", padding: "2px 0", borderBottom: "1px solid rgba(42,90,138,0.2)" }}>
                                            <span style={{ maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {c.label?.startsWith("FA ")
                                                    ? c.label
                                                    : splitLabel(CHEMICALS[c.chemical]?.label ?? c.chemical).name}
                                            </span>
                                            <span style={{ color: "#4a9adf", fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
                                                {c.volume ? `${c.volume}cm³` : c.mass ? `${c.mass}g` : ""}
                                            </span>
                                        </div>
                                    ))}
                                    <div style={{ marginTop: 8, height: 32, borderRadius: 6, background: vessel.color, border: "1px solid rgba(255,255,255,0.18)", transition: "background 0.8s ease", boxShadow: `0 0 8px ${vessel.color}80, inset 0 1px 0 rgba(255,255,255,0.2)` }} />
                                </div>
                            )}
                            <button
                                onClick={e => {
                                    e.stopPropagation();
                                    setVessels(vs => vs.filter(v => v.id !== vessel.id));
                                    if (selectedVessel === vessel.id) setSelectedVessel(null);
                                }}
                                style={{ position: "absolute", top: 4, right: 4, background: "rgba(90,30,30,0.5)", border: "none", color: "#df8080", cursor: "pointer", borderRadius: 4, width: 18, height: 18, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}
                            >×</button>
                        </div>
                    ))}
                </div>

                {lastObservation && (
                    <div style={{ marginTop: 20 }}>
                        <div style={{ fontSize: 13, color: "#8ab4d4", marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>{t('lab.latestObs')}</div>
                        <div key={obsKey} className="obs-box obs-animate">{lastObservation}</div>
                    </div>
                )}

                {selectedVessel && activeVessel?.observations.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 13, color: "#8ab4d4", marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>
                            {t('lab.allObs')} {activeVessel.label}
                        </div>
                        <div className="obs-box">
                            {activeVessel.observations.map((obs, i) => (
                                <div key={i} style={{ marginBottom: 6 }}>• {obs}</div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* RIGHT PANEL — Actions                                           */}
            {/* ════════════════════════════════════════════════════════════════ */}
            <div style={{ width: 260, borderLeft: "1px solid #1a3a5a", overflow: "auto", padding: 12, flexShrink: 0 }}>

                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, color: "#8ab4d4", marginBottom: 8, letterSpacing: 1 }}>
                    {t('lab.addToVessel')}
                </div>

                {selectedVessel ? (
                    <div style={{ background: "rgba(74,154,223,0.08)", borderRadius: 6, padding: "8px 10px", marginBottom: 12, border: "1px solid #2a5a8a", fontSize: 12, color: "#4adf7a", display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 16 }}>{activeVessel?.icon}</span>
                        <span>{activeVessel?.label || "–"}</span>
                    </div>
                ) : (
                    <div style={{ fontSize: 12, color: "#8a6a2a", marginBottom: 12, padding: "8px 10px", background: "rgba(90,60,0,0.15)", borderRadius: 6, border: "1px solid rgba(120,80,0,0.3)" }}>
                        {t('lab.clickVesselFirst')}
                    </div>
                )}

                <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: "#6a9abf", marginBottom: 4 }}>{t('lab.selectedChem')}</div>
                    <div style={{ fontSize: 12, color: "#c8e8ff", minHeight: 20, display: "flex", alignItems: "center", gap: 6 }}>
                        {selectedChemical ? (
                            <>
                                <span style={{ width: 14, height: 14, borderRadius: 3, background: CHEMICALS[selectedChemical]?.color, border: "1px solid rgba(255,255,255,0.3)", flexShrink: 0, display: "inline-block", boxShadow: `0 0 6px ${CHEMICALS[selectedChemical]?.color}90` }} />
                                {splitLabel(CHEMICALS[selectedChemical]?.label ?? "").name}
                            </>
                        ) : "—"}
                    </div>
                </div>

                {(() => {
                    // Resolve FA label → actual chemical so type-based inputs work for FAs too
                    const isFa = String(selectedChemical).startsWith("FA ");
                    const resolvedId = isFa
                        ? (activePaper?.faMap?.[selectedChemical] ?? selectedChemical)
                        : selectedChemical;
                    const resolvedType = CHEMICALS[resolvedId]?.type;

                    if (!selectedChemical) return null;
                    if (resolvedType === "solution" || (isFa && resolvedType !== "solid")) {
                        return (
                            <div style={{ marginBottom: 8 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                                    <span style={{ fontSize: 11, color: "#6a9abf" }}>{t('lab.volume')}</span>
                                    <span style={{ fontSize: 10, color: "#5a7a9a", fontFamily: "'JetBrains Mono', monospace" }}>±0.025 cm³</span>
                                </div>
                                <input type="number" value={addVolume} onChange={e => setAddVolume(parseFloat(e.target.value))}
                                       min={0.1} max={100} step={0.05} style={{ width: "100%", boxSizing: "border-box" }} />
                                <div style={{ fontSize: 10, color: "#4a7a6a", marginTop: 2 }}>Record to 0.05 cm³ (e.g. 25.00)</div>
                            </div>
                        );
                    }
                    if (resolvedType === "solid") {
                        return (
                            <div style={{ marginBottom: 8 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                                    <span style={{ fontSize: 11, color: "#6a9abf" }}>{t('lab.mass')}</span>
                                    <span style={{ fontSize: 10, color: "#5a7a9a", fontFamily: "'JetBrains Mono', monospace" }}>±0.005 g</span>
                                </div>
                                <input type="number" value={addMass} onChange={e => setAddMass(parseFloat(e.target.value))}
                                       min={0.01} max={50} step={0.01} style={{ width: "100%", boxSizing: "border-box" }} />
                                <div style={{ fontSize: 10, color: "#4a7a6a", marginTop: 2 }}>Record to 0.01 g (e.g. 1.23 g)</div>
                            </div>
                        );
                    }
                    return null;
                })()}

                <button className="action-btn success" style={{ width: "100%", marginBottom: 16, fontSize: 13 }}
                        onClick={addChemicalToVessel} disabled={!selectedVessel || !selectedChemical}>
                    {t('lab.addBtn')}
                </button>

                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, color: "#8ab4d4", marginBottom: 8, letterSpacing: 1 }}>
                    {t('lab.actions')}
                </div>
                <div className="action-grid">
                    {ACTIONS.map(([action, icon, labelKey, variant]) => (
                        <button
                            key={action}
                            className={`action-tile${variant ? " " + variant : ""}`}
                            onClick={() => handleAction(action)}
                            title={t(labelKey)}
                        >
                            <span className="action-tile-icon">{icon}</span>
                            <span className="action-tile-label">{t(labelKey)}</span>
                        </button>
                    ))}
                </div>

                {/* Transfer */}
                <div style={{ marginTop: 12, borderTop: "1px solid #1a3a5a", paddingTop: 12 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, color: "#8ab4d4", marginBottom: 8 }}>{t('lab.transfer')}</div>
                    <div style={{ fontSize: 11, color: "#6a9abf", marginBottom: 4 }}>
                        {t('lab.from')} <span style={{ color: "#4adf7a" }}>{selectedVessel ? activeVessel?.label : "–"}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#6a9abf", marginBottom: 4 }}>{t('lab.to')}</div>
                    <select value={transferDestId ?? ""} onChange={e => setTransferDestId(+e.target.value || null)}
                            style={{ width: "100%", boxSizing: "border-box", marginBottom: 6 }}>
                        <option value="">{t('lab.selectVessel')}</option>
                        {vessels.filter(v => v.id !== selectedVessel).map(v => (
                            <option key={v.id} value={v.id}>{v.icon} {v.label}</option>
                        ))}
                    </select>
                    <div style={{ fontSize: 11, color: "#6a9abf", marginBottom: 4 }}>{t('lab.volume')}</div>
                    <input type="number" value={transferAmount} onChange={e => setTransferAmount(parseFloat(e.target.value))}
                           min={0.1} max={500} step={0.5} style={{ width: "100%", boxSizing: "border-box", marginBottom: 6 }} />
                    <button className="action-btn" style={{ width: "100%", background: "linear-gradient(135deg,#2a4a1a,#3a6a2a)" }}
                            onClick={transferContents} disabled={!selectedVessel || !transferDestId}>
                        {t('lab.transferBtn')}
                    </button>
                </div>

                {/* Stop-clock */}
                <div style={{ marginTop: 12, borderTop: "1px solid #1a3a5a", paddingTop: 12 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, color: "#8ab4d4", marginBottom: 8 }}>{t('lab.stopClock')}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                        <button className="action-btn success" style={{ flex: 1 }} onClick={() => handleAction("start_clock")}>{t('lab.start')}</button>
                        <button className="action-btn danger"  style={{ flex: 1 }} onClick={() => handleAction("stop_clock")}>{t('lab.stop')}</button>
                    </div>
                    <button className="action-btn" style={{ width: "100%", marginTop: 6 }} onClick={() => setClockTime(0)}>{t('lab.reset')}</button>
                </div>

                {/* Burette */}
                <div style={{ marginTop: 12, borderTop: "1px solid #1a3a5a", paddingTop: 12 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, color: "#8ab4d4", marginBottom: 8 }}>{t('lab.burette')}</div>
                    <input type="number" value={bureteReading} onChange={e => setBuretteReading(parseFloat(e.target.value))}
                           min={0} max={50} step={0.05} style={{ width: "100%", boxSizing: "border-box" }} />
                    {Math.abs(bureteReading * 20 - Math.round(bureteReading * 20)) > 0.001 ? (
                        <div style={{ fontSize: 10, color: "#df8a4a", marginTop: 3 }}>
                            ⚠ Not to 0.05 cm³ — final digit must be 0 or 5
                        </div>
                    ) : (
                        <div style={{ fontSize: 10, color: "#4adf7a", marginTop: 3 }}>
                            ✓ {bureteReading.toFixed(2)} cm³  [±0.025 cm³]
                        </div>
                    )}
                    <button className="action-btn" style={{ width: "100%", marginTop: 6 }}
                            onClick={() => pushLog({ action: "burette_reading", value: bureteReading, details: `Burette reading recorded: ${bureteReading.toFixed(2)} cm³` })}>
                        {t('lab.recordReading')}
                    </button>
                </div>

                {/* Precision reference */}
                <div style={{ marginTop: 12, borderTop: "1px solid #1a3a5a", paddingTop: 12 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, color: "#8ab4d4", marginBottom: 8 }}>{t('lab.precision')}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {PRECISION.map(p => (
                            <div key={p.name} style={{ fontSize: 10, background: "rgba(0,0,0,0.2)", borderRadius: 4, padding: "4px 8px", border: "1px solid #1a3a5a" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "#a8c8e0" }}>{p.icon} {p.name}</span>
                                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#4a9adf" }}>{p.reading}</span>
                                </div>
                                <div style={{ color: "#5a8aaa", marginTop: 1 }}>{p.uncertainty} · {p.note}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}