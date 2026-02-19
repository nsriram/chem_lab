import { CHEMICALS } from "../data/chemicals";
import { EQUIPMENT } from "../data/equipment";

const PRECISION = [
    { icon: "⚖️", name: "Balance",          reading: "0.01 g",     uncertainty: "±0.005 g",   note: "record to 2 d.p." },
    { icon: "🧪", name: "Burette",           reading: "0.05 cm³",   uncertainty: "±0.025 cm³", note: "final digit 0 or 5" },
    { icon: "🌡️", name: "Thermometer",       reading: "0.5 °C",     uncertainty: "±0.25 °C",   note: "record to 0.5 °C" },
    { icon: "📐", name: "Measuring cyl.",    reading: "0.5 cm³",    uncertainty: "±0.25 cm³",  note: "read at bottom of meniscus" },
    { icon: "⏱️", name: "Stop-clock",        reading: "1 s",        uncertainty: "±0.5 s",     note: "record in whole seconds" },
    { icon: "💉", name: "Pipette (25 cm³)",  reading: "±0.06 cm³",  uncertainty: "±0.06 cm³",  note: "fixed volume, single graduation" },
];

const ACTIONS = [
    ["heat",            "🔥 Heat"],
    ["stir",            "🥢 Stir"],
    ["filter",          "🫧 Filter"],
    ["measure_temp",    "🌡️ Measure Temperature"],
    ["weigh",           "⚖️ Weigh Contents"],
    ["test_gas_splint",  "🕯️ Test Gas (Splint)"],
    ["test_gas_glowing", "🕯️ Test Gas (Glowing)"],
    ["test_litmus",      "📄 Test Gas (Litmus)"],
];

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
}) {
    const activeVessel = vessels.find(v => v.id === selectedVessel);

    return (
        <div style={{ display: "flex", height: "calc(100vh - 130px)", overflow: "hidden" }}>

            {/* ── Left panel: Equipment + Chemicals ── */}
            <div style={{ width: 240, borderRight: "1px solid #1a3a5a", overflow: "auto", padding: 12, flexShrink: 0 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: "#8ab4d4", marginBottom: 10, letterSpacing: 1 }}>
                    EQUIPMENT
                </div>
                {Object.entries(EQUIPMENT).map(([id, eq]) => (
                    <button key={id} className="chem-btn" style={{ marginBottom: 4 }} onClick={() => createVessel(id)}>
                        {eq.icon} {eq.label}
                    </button>
                ))}

                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: "#8ab4d4", margin: "16px 0 10px", letterSpacing: 1 }}>
                    CHEMICALS
                </div>
                {Object.entries(CHEMICALS).map(([id, chem]) => (
                    <button
                        key={id}
                        className={`chem-btn ${selectedChemical === id ? "selected" : ""}`}
                        style={{ marginBottom: 3 }}
                        onClick={() => setSelectedChemical(selectedChemical === id ? "" : id)}
                    >
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: chem.color, border: "1px solid #888", display: "inline-block", marginRight: 6, verticalAlign: "middle" }} />
                        {chem.label}
                    </button>
                ))}
            </div>

            {/* ── Centre: Bench ── */}
            <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", color: "#c8e8ff", fontSize: 16 }}>🧪 Laboratory Bench</div>
                    <button className="action-btn danger" style={{ fontSize: 11 }} onClick={clearBench}>🗑 Clear Bench</button>
                </div>

                {vessels.length === 0 && (
                    <div style={{ textAlign: "center", color: "#3a6a9a", padding: 60, border: "2px dashed #1a3a5a", borderRadius: 12 }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>⚗️</div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18 }}>Select equipment from the left panel</div>
                        <div style={{ fontSize: 13, marginTop: 8, color: "#2a5a7a" }}>Click any item to add it to your bench</div>
                    </div>
                )}

                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                    {vessels.map(vessel => (
                        <div
                            key={vessel.id}
                            className={`vessel-card ${selectedVessel === vessel.id ? "selected" : ""}`}
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
                                                {CHEMICALS[c.chemical]?.label || c.chemical}
                                            </span>
                                            <span style={{ color: "#4a9adf", fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
                                                {c.volume ? `${c.volume}cm³` : c.mass ? `${c.mass}g` : ""}
                                            </span>
                                        </div>
                                    ))}
                                    <div style={{ marginTop: 8, height: 16, borderRadius: 4, background: vessel.color, border: "1px solid rgba(255,255,255,0.1)" }} />
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
                        <div style={{ fontSize: 13, color: "#8ab4d4", marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>🔬 Latest Observation</div>
                        <div className="obs-box">{lastObservation}</div>
                    </div>
                )}

                {selectedVessel && activeVessel?.observations.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 13, color: "#8ab4d4", marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>
                            📋 All observations for: {activeVessel.label}
                        </div>
                        <div className="obs-box">
                            {activeVessel.observations.map((obs, i) => (
                                <div key={i} style={{ marginBottom: 6 }}>• {obs}</div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Right panel: Actions ── */}
            <div style={{ width: 260, borderLeft: "1px solid #1a3a5a", overflow: "auto", padding: 12, flexShrink: 0 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: "#8ab4d4", marginBottom: 10, letterSpacing: 1 }}>
                    ADD TO VESSEL
                </div>

                {selectedVessel ? (
                    <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 6, padding: "10px", marginBottom: 12, border: "1px solid #2a5a8a", fontSize: 12, color: "#4adf7a" }}>
                        Selected: {activeVessel?.label || "–"}
                    </div>
                ) : (
                    <div style={{ fontSize: 12, color: "#6a4a2a", marginBottom: 12, padding: "8px 10px", background: "rgba(90,60,0,0.2)", borderRadius: 6 }}>
                        ⚠️ Click a vessel on the bench first
                    </div>
                )}

                <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: "#6a9abf", marginBottom: 4 }}>Selected Chemical:</div>
                    <div style={{ fontSize: 12, color: "#c8e8ff", minHeight: 20 }}>
                        {selectedChemical ? CHEMICALS[selectedChemical]?.label : "–"}
                    </div>
                </div>

                {selectedChemical && CHEMICALS[selectedChemical]?.type === "solution" && (
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                            <span style={{ fontSize: 11, color: "#6a9abf" }}>Volume (cm³):</span>
                            <span style={{ fontSize: 10, color: "#5a7a9a", fontFamily: "'JetBrains Mono', monospace" }}>±0.025 cm³</span>
                        </div>
                        <input type="number" value={addVolume} onChange={e => setAddVolume(parseFloat(e.target.value))}
                               min={0.1} max={100} step={0.05} style={{ width: "100%", boxSizing: "border-box" }} />
                        <div style={{ fontSize: 10, color: "#4a7a6a", marginTop: 2 }}>Record to 0.05 cm³ (e.g. 25.00)</div>
                    </div>
                )}
                {selectedChemical && CHEMICALS[selectedChemical]?.type === "solid" && (
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                            <span style={{ fontSize: 11, color: "#6a9abf" }}>Mass (g):</span>
                            <span style={{ fontSize: 10, color: "#5a7a9a", fontFamily: "'JetBrains Mono', monospace" }}>±0.005 g</span>
                        </div>
                        <input type="number" value={addMass} onChange={e => setAddMass(parseFloat(e.target.value))}
                               min={0.01} max={50} step={0.01} style={{ width: "100%", boxSizing: "border-box" }} />
                        <div style={{ fontSize: 10, color: "#4a7a6a", marginTop: 2 }}>Record to 0.01 g (e.g. 1.23 g)</div>
                    </div>
                )}

                <button className="action-btn" style={{ width: "100%", marginBottom: 16, background: "linear-gradient(135deg,#1a4a6a,#1a6a9a)" }}
                        onClick={addChemicalToVessel} disabled={!selectedVessel || !selectedChemical}>
                    + Add to Vessel
                </button>

                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, color: "#8ab4d4", marginBottom: 10, letterSpacing: 1 }}>ACTIONS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {ACTIONS.map(([action, label]) => (
                        <button key={action} className="action-btn" style={{ textAlign: "left" }} onClick={() => performAction(action)}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Transfer */}
                <div style={{ marginTop: 12, borderTop: "1px solid #1a3a5a", paddingTop: 12 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, color: "#8ab4d4", marginBottom: 8 }}>TRANSFER CONTENTS</div>
                    <div style={{ fontSize: 11, color: "#6a9abf", marginBottom: 4 }}>
                        From: <span style={{ color: "#4adf7a" }}>{selectedVessel ? activeVessel?.label : "–"}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#6a9abf", marginBottom: 4 }}>To:</div>
                    <select value={transferDestId ?? ""} onChange={e => setTransferDestId(+e.target.value || null)}
                            style={{ width: "100%", boxSizing: "border-box", marginBottom: 6 }}>
                        <option value="">— select vessel —</option>
                        {vessels.filter(v => v.id !== selectedVessel).map(v => (
                            <option key={v.id} value={v.id}>{v.icon} {v.label}</option>
                        ))}
                    </select>
                    <div style={{ fontSize: 11, color: "#6a9abf", marginBottom: 4 }}>Volume to transfer (cm³):</div>
                    <input type="number" value={transferAmount} onChange={e => setTransferAmount(parseFloat(e.target.value))}
                           min={0.1} max={500} step={0.5} style={{ width: "100%", boxSizing: "border-box", marginBottom: 6 }} />
                    <button className="action-btn" style={{ width: "100%", background: "linear-gradient(135deg,#2a4a1a,#3a6a2a)" }}
                            onClick={transferContents} disabled={!selectedVessel || !transferDestId}>
                        ↗ Transfer
                    </button>
                </div>

                {/* Stop-clock */}
                <div style={{ marginTop: 12, borderTop: "1px solid #1a3a5a", paddingTop: 12 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, color: "#8ab4d4", marginBottom: 8 }}>STOP-CLOCK</div>
                    <div style={{ display: "flex", gap: 6 }}>
                        <button className="action-btn success" style={{ flex: 1 }} onClick={() => performAction("start_clock")}>▶ Start</button>
                        <button className="action-btn danger"  style={{ flex: 1 }} onClick={() => performAction("stop_clock")}>■ Stop</button>
                    </div>
                    <button className="action-btn" style={{ width: "100%", marginTop: 6 }} onClick={() => setClockTime(0)}>↺ Reset</button>
                </div>

                {/* Burette */}
                <div style={{ marginTop: 12, borderTop: "1px solid #1a3a5a", paddingTop: 12 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, color: "#8ab4d4", marginBottom: 8 }}>BURETTE READING</div>
                    <input type="number" value={bureteReading} onChange={e => setBuretteReading(parseFloat(e.target.value))}
                           min={0} max={50} step={0.05} style={{ width: "100%", boxSizing: "border-box" }} />
                    {/* Validate: burette must be a multiple of 0.05 */}
                    {Math.abs(bureteReading * 20 - Math.round(bureteReading * 20)) > 0.001 ? (
                        <div style={{ fontSize: 10, color: "#df8a4a", marginTop: 3 }}>
                            ⚠️ Not to 0.05 cm³ precision — final digit must be 0 or 5
                        </div>
                    ) : (
                        <div style={{ fontSize: 10, color: "#4adf7a", marginTop: 3 }}>
                            ✓ {bureteReading.toFixed(2)} cm³  [±0.025 cm³]
                        </div>
                    )}
                    <button className="action-btn" style={{ width: "100%", marginTop: 6 }}
                            onClick={() => pushLog({ action: "burette_reading", value: bureteReading, details: `Burette reading recorded: ${bureteReading.toFixed(2)} cm³` })}>
                        📌 Record Reading
                    </button>
                </div>

                {/* Precision Reference */}
                <div style={{ marginTop: 12, borderTop: "1px solid #1a3a5a", paddingTop: 12 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, color: "#8ab4d4", marginBottom: 8 }}>📐 MEASUREMENT PRECISION</div>
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
