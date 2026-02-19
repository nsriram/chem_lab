import GraphPlot from "./GraphPlot";

export default function DataTab({ tables, setTables, graphs, setGraphs, activeDataTab, setActiveDataTab }) {
    return (
        <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
            {/* Sub-tab bar */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                {[["tables", "📋 Tables"], ["graphs", "📉 Graphs"]].map(([id, label]) => (
                    <button key={id} className={`tab-btn ${activeDataTab === id ? "active" : ""}`}
                            onClick={() => setActiveDataTab(id)}>{label}</button>
                ))}
            </div>

            {/* ── Tables ── */}
            {activeDataTab === "tables" && (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: "#c8e8ff" }}>Results Tables</div>
                        <button className="action-btn success" onClick={() =>
                            setTables(ts => [...ts, {
                                id: Date.now(),
                                title: `Table ${ts.length + 1}`,
                                headers: ["Variable 1", "Variable 2", "Variable 3"],
                                rows: [["", "", ""], ["", "", ""]],
                            }])
                        }>+ New Table</button>
                    </div>

                    {tables.length === 0 && (
                        <div style={{ textAlign: "center", padding: 60, color: "#3a6a9a", border: "2px dashed #1a3a5a", borderRadius: 12 }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                            <div style={{ fontFamily: "'Playfair Display', serif" }}>No tables yet — click "+ New Table" to start recording</div>
                        </div>
                    )}

                    {tables.map((tbl, ti) => (
                        <div key={tbl.id} style={{ background: "rgba(0,0,0,0.25)", border: "1px solid #2a4a6a", borderRadius: 10, padding: 18, marginBottom: 20 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                <input
                                    value={tbl.title}
                                    onChange={e => setTables(ts => ts.map((t, i) => i === ti ? { ...t, title: e.target.value } : t))}
                                    style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: "#c8e8ff", background: "transparent", border: "none", borderBottom: "1px solid #2a5a8a", width: 300 }}
                                />
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button className="action-btn" style={{ fontSize: 11 }} onClick={() =>
                                        setTables(ts => ts.map((t, i) => i === ti
                                            ? { ...t, headers: [...t.headers, `Col ${t.headers.length + 1}`], rows: t.rows.map(r => [...r, ""]) }
                                            : t))
                                    }>+ Column</button>
                                    <button className="action-btn" style={{ fontSize: 11 }} onClick={() =>
                                        setTables(ts => ts.map((t, i) => i === ti
                                            ? { ...t, rows: [...t.rows, t.headers.map(() => "")] }
                                            : t))
                                    }>+ Row</button>
                                    <button className="action-btn danger" style={{ fontSize: 11 }} onClick={() =>
                                        setTables(ts => ts.filter((_, i) => i !== ti))
                                    }>🗑 Delete</button>
                                </div>
                            </div>

                            <div style={{ overflowX: "auto" }}>
                                <table style={{ borderCollapse: "collapse", width: "100%", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                                    <thead>
                                        <tr>
                                            {tbl.headers.map((h, hi) => (
                                                <th key={hi} style={{ border: "1px solid #2a5a8a", padding: 0 }}>
                                                    <input
                                                        value={h}
                                                        onChange={e => setTables(ts => ts.map((t, i) => i === ti
                                                            ? { ...t, headers: t.headers.map((hh, j) => j === hi ? e.target.value : hh) }
                                                            : t))}
                                                        style={{ width: "100%", background: "rgba(26,74,122,0.4)", color: "#c8e8ff", border: "none", padding: "6px 8px", fontWeight: "bold", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, boxSizing: "border-box" }}
                                                    />
                                                </th>
                                            ))}
                                            <th style={{ border: "1px solid #2a5a8a", width: 28, background: "rgba(0,0,0,0.2)" }} />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tbl.rows.map((row, ri) => (
                                            <tr key={ri}>
                                                {row.map((cell, ci) => (
                                                    <td key={ci} style={{ border: "1px solid #1a3a5a", padding: 0 }}>
                                                        <input
                                                            value={cell}
                                                            onChange={e => setTables(ts => ts.map((t, i) => i === ti
                                                                ? { ...t, rows: t.rows.map((r, rj) => rj === ri ? r.map((c, cj) => cj === ci ? e.target.value : c) : r) }
                                                                : t))}
                                                            style={{ width: "100%", background: "transparent", color: "#a8c8e0", border: "none", padding: "5px 8px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, boxSizing: "border-box" }}
                                                        />
                                                    </td>
                                                ))}
                                                <td style={{ border: "1px solid #1a3a5a", textAlign: "center" }}>
                                                    <button onClick={() => setTables(ts => ts.map((t, i) => i === ti ? { ...t, rows: t.rows.filter((_, rj) => rj !== ri) } : t))}
                                                        style={{ background: "none", border: "none", color: "#df6060", cursor: "pointer", fontSize: 13 }}>×</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Graphs ── */}
            {activeDataTab === "graphs" && (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: "#c8e8ff" }}>Graphs</div>
                        <button className="action-btn success" onClick={() =>
                            setGraphs(gs => [...gs, {
                                id: Date.now(),
                                title: `Graph ${gs.length + 1}`,
                                xLabel: "x-axis",
                                yLabel: "y-axis",
                                points: [],
                                showBestFit: true,
                                newX: "",
                                newY: "",
                                newPointLabel: "",
                            }])
                        }>+ New Graph</button>
                    </div>

                    {graphs.length === 0 && (
                        <div style={{ textAlign: "center", padding: 60, color: "#3a6a9a", border: "2px dashed #1a3a5a", borderRadius: 12 }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>📉</div>
                            <div style={{ fontFamily: "'Playfair Display', serif" }}>No graphs yet — click "+ New Graph" to start plotting</div>
                        </div>
                    )}

                    {graphs.map((g, gi) => (
                        <div key={g.id} style={{ background: "rgba(0,0,0,0.25)", border: "1px solid #2a4a6a", borderRadius: 10, padding: 18, marginBottom: 24 }}>
                            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
                                <input value={g.title}
                                    onChange={e => setGraphs(gs => gs.map((gg, i) => i === gi ? { ...gg, title: e.target.value } : gg))}
                                    style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: "#c8e8ff", background: "transparent", border: "none", borderBottom: "1px solid #2a5a8a", width: 220 }}
                                    placeholder="Graph title"
                                />
                                <input value={g.xLabel}
                                    onChange={e => setGraphs(gs => gs.map((gg, i) => i === gi ? { ...gg, xLabel: e.target.value } : gg))}
                                    style={{ fontSize: 12, width: 160 }} placeholder="x-axis label"
                                />
                                <input value={g.yLabel}
                                    onChange={e => setGraphs(gs => gs.map((gg, i) => i === gi ? { ...gg, yLabel: e.target.value } : gg))}
                                    style={{ fontSize: 12, width: 160 }} placeholder="y-axis label"
                                />
                                <label style={{ fontSize: 12, color: "#8ab4d4", display: "flex", alignItems: "center", gap: 4 }}>
                                    <input type="checkbox" checked={g.showBestFit}
                                        onChange={e => setGraphs(gs => gs.map((gg, i) => i === gi ? { ...gg, showBestFit: e.target.checked } : gg))}
                                    /> Best-fit line
                                </label>
                                <button className="action-btn danger" style={{ fontSize: 11, marginLeft: "auto" }}
                                    onClick={() => setGraphs(gs => gs.filter((_, i) => i !== gi))}>🗑 Delete</button>
                            </div>

                            <GraphPlot graph={g} />

                            <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center", flexWrap: "wrap" }}>
                                <span style={{ fontSize: 12, color: "#6a9abf" }}>Add point:</span>
                                <input type="number" placeholder="x" value={g.newX}
                                    onChange={e => setGraphs(gs => gs.map((gg, i) => i === gi ? { ...gg, newX: e.target.value } : gg))}
                                    style={{ width: 80, fontSize: 12 }} step="any"
                                />
                                <input type="number" placeholder="y" value={g.newY}
                                    onChange={e => setGraphs(gs => gs.map((gg, i) => i === gi ? { ...gg, newY: e.target.value } : gg))}
                                    style={{ width: 80, fontSize: 12 }} step="any"
                                />
                                <input placeholder="label (optional)" value={g.newPointLabel}
                                    onChange={e => setGraphs(gs => gs.map((gg, i) => i === gi ? { ...gg, newPointLabel: e.target.value } : gg))}
                                    style={{ width: 140, fontSize: 12 }}
                                />
                                <button className="action-btn" style={{ fontSize: 12 }} onClick={() => {
                                    const x = parseFloat(g.newX), y = parseFloat(g.newY);
                                    if (isNaN(x) || isNaN(y)) return;
                                    setGraphs(gs => gs.map((gg, i) => i === gi
                                        ? { ...gg, points: [...gg.points, { x, y, label: gg.newPointLabel }], newX: "", newY: "", newPointLabel: "" }
                                        : gg));
                                }}>+ Add</button>
                            </div>

                            {g.points.length > 0 && (
                                <div style={{ marginTop: 12, overflowX: "auto" }}>
                                    <table style={{ borderCollapse: "collapse", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                                        <thead>
                                            <tr>
                                                {["#", g.xLabel || "x", g.yLabel || "y", "Label", ""].map((h, i) => (
                                                    <th key={i} style={{ border: "1px solid #2a5a8a", padding: "4px 10px", background: "rgba(26,74,122,0.4)", color: "#c8e8ff", textAlign: "left" }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {g.points.map((pt, pi) => (
                                                <tr key={pi}>
                                                    <td style={{ border: "1px solid #1a3a5a", padding: "3px 10px", color: "#6a9abf" }}>{pi + 1}</td>
                                                    <td style={{ border: "1px solid #1a3a5a", padding: "3px 10px", color: "#a8c8e0" }}>{pt.x}</td>
                                                    <td style={{ border: "1px solid #1a3a5a", padding: "3px 10px", color: "#a8c8e0" }}>{pt.y}</td>
                                                    <td style={{ border: "1px solid #1a3a5a", padding: "3px 10px", color: "#8a9abf" }}>{pt.label || "—"}</td>
                                                    <td style={{ border: "1px solid #1a3a5a", padding: "3px 8px", textAlign: "center" }}>
                                                        <button onClick={() => setGraphs(gs => gs.map((gg, i) => i === gi ? { ...gg, points: gg.points.filter((_, pj) => pj !== pi) } : gg))}
                                                            style={{ background: "none", border: "none", color: "#df6060", cursor: "pointer", fontSize: 13 }}>×</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
