import { useRef, useState, useCallback } from "react";
import GraphPlot from "./GraphPlot";
import { TO_SUB, TO_SUP } from "./ChemTextInput";

function autoHeight(el) {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
}

// ── ChemCell ──────────────────────────────────────────────────────────────────
// Compact table-cell textarea with Ctrl+, / Ctrl+. keyboard shortcuts.
// No visible toolbar — a small badge appears in the corner when mode is active.
function ChemCell({ value, onChange }) {
    const [mode, setMode] = useState(null);
    const ref = useRef(null);

    // Used as callback ref so autoHeight fires on mount
    const setRef = useCallback(el => {
        ref.current = el;
        autoHeight(el);
    }, []);

    function handleChange(e) {
        autoHeight(e.target);
        onChange(e.target.value);
    }

    function handleKeyDown(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === ',') {
            e.preventDefault(); setMode(m => m === 'sub' ? null : 'sub'); return;
        }
        if ((e.ctrlKey || e.metaKey) && e.key === '.') {
            e.preventDefault(); setMode(m => m === 'sup' ? null : 'sup'); return;
        }
        if (!mode) return;
        if (e.key === 'Escape') { setMode(null); return; }
        const map = mode === 'sub' ? TO_SUB : TO_SUP;
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const mapped = map[e.key.toLowerCase()];
            if (mapped) {
                e.preventDefault();
                const el = ref.current;
                const s = el.selectionStart, end = el.selectionEnd;
                const nv = (value ?? '').slice(0, s) + mapped + (value ?? '').slice(end);
                onChange(nv);
                requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + mapped.length; });
            }
        }
    }

    return (
        <div style={{ position: 'relative' }}>
            <textarea
                ref={setRef}
                value={value}
                rows={1}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                title="Ctrl+, = subscript mode · Ctrl+. = superscript mode · Esc to exit"
                style={{
                    display: 'block', width: '100%',
                    background: 'transparent', color: '#a8c8e0', border: 'none',
                    padding: '5px 8px',
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                    boxSizing: 'border-box', resize: 'none', overflow: 'hidden',
                    lineHeight: 1.5, minHeight: 28,
                    outline: mode ? `1px solid ${mode === 'sub' ? '#2a5adf' : '#df7a2a'}` : 'none',
                    outlineOffset: -1,
                }}
            />
            {mode && (
                <div style={{
                    position: 'absolute', top: 2, right: 4, fontSize: 8, lineHeight: 1,
                    color: mode === 'sub' ? '#60a0ff' : '#ffa060',
                    fontFamily: "'JetBrains Mono', monospace", pointerEvents: 'none',
                    background: 'rgba(10,20,40,0.8)', padding: '1px 3px', borderRadius: 2,
                }}>
                    {mode === 'sub' ? 'SUB' : 'SUP'}
                </div>
            )}
        </div>
    );
}

// ── ChemInput ─────────────────────────────────────────────────────────────────
// Single-line input with Ctrl+, / Ctrl+. keyboard shortcuts.
// Used for table titles, graph axis labels, etc.
function ChemInput({ value, onChange, placeholder, style }) {
    const [mode, setMode] = useState(null);
    const ref = useRef(null);

    function handleKeyDown(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === ',') {
            e.preventDefault(); setMode(m => m === 'sub' ? null : 'sub'); return;
        }
        if ((e.ctrlKey || e.metaKey) && e.key === '.') {
            e.preventDefault(); setMode(m => m === 'sup' ? null : 'sup'); return;
        }
        if (!mode) return;
        if (e.key === 'Escape') { setMode(null); return; }
        const map = mode === 'sub' ? TO_SUB : TO_SUP;
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const mapped = map[e.key.toLowerCase()];
            if (mapped) {
                e.preventDefault();
                const el = ref.current;
                const s = el.selectionStart, end = el.selectionEnd;
                const nv = (value ?? '').slice(0, s) + mapped + (value ?? '').slice(end);
                onChange(nv);
                requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + mapped.length; });
            }
        }
    }

    return (
        <input
            ref={ref}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            title="Ctrl+, = subscript · Ctrl+. = superscript · Esc to exit mode"
            style={{
                ...style,
                outline: mode ? `1px solid ${mode === 'sub' ? '#2a5adf' : '#df7a2a'}` : style?.outline,
            }}
        />
    );
}

function ResizableTable({ tbl, ti, setTables }) {
    const dragRef = useRef(null);

    function startResize(e, colIndex) {
        e.preventDefault();
        const startWidth = (tbl.colWidths ?? tbl.headers.map(() => 150))[colIndex];
        dragRef.current = { colIndex, startX: e.clientX, startWidth };

        function onMove(ev) {
            if (!dragRef.current) return;
            const newWidth = Math.max(60, dragRef.current.startWidth + ev.clientX - dragRef.current.startX);
            setTables(ts => ts.map((t, i) => {
                if (i !== ti) return t;
                const base = t.colWidths ?? t.headers.map(() => 150);
                return { ...t, colWidths: base.map((w, j) => j === colIndex ? newWidth : w) };
            }));
        }

        function onUp() {
            dragRef.current = null;
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        }

        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    }

    const colWidths = tbl.colWidths ?? tbl.headers.map(() => 150);

    return (
        <table style={{ borderCollapse: "collapse", tableLayout: "fixed", width: "100%", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
            <colgroup>
                {colWidths.map((w, i) => <col key={i} style={{ width: w }} />)}
                <col style={{ width: 30 }} />
            </colgroup>
            <thead>
                <tr>
                    {tbl.headers.map((h, hi) => (
                        <th key={hi} style={{ border: "1px solid #2a5a8a", padding: 0, position: "relative", overflow: "hidden" }}>
                            <ChemInput
                                value={h}
                                onChange={v => setTables(ts => ts.map((t, i) => i === ti
                                    ? { ...t, headers: t.headers.map((hh, j) => j === hi ? v : hh) }
                                    : t))}
                                style={{ width: "100%", background: "rgba(26,74,122,0.4)", color: "#c8e8ff", border: "none", padding: "6px 18px 6px 8px", fontWeight: "bold", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, boxSizing: "border-box" }}
                            />
                            {/* Resize handle */}
                            <div
                                onMouseDown={e => startResize(e, hi)}
                                title="Drag to resize column"
                                style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 6, cursor: "col-resize", background: "linear-gradient(to right, transparent, rgba(100,160,220,0.25))" }}
                            />
                        </th>
                    ))}
                    <th style={{ border: "1px solid #2a5a8a", background: "rgba(0,0,0,0.2)" }} />
                </tr>
            </thead>
            <tbody>
                {tbl.rows.map((row, ri) => (
                    <tr key={ri}>
                        {row.map((cell, ci) => (
                            <td key={ci} style={{ border: "1px solid #1a3a5a", padding: 0, verticalAlign: "top" }}>
                                <ChemCell
                                    value={cell}
                                    onChange={v => setTables(ts => ts.map((t, i) => i === ti
                                        ? { ...t, rows: t.rows.map((r, rj) => rj === ri ? r.map((c, cj) => cj === ci ? v : c) : r) }
                                        : t))}
                                />
                            </td>
                        ))}
                        <td style={{ border: "1px solid #1a3a5a", textAlign: "center", verticalAlign: "middle" }}>
                            <button
                                onClick={() => setTables(ts => ts.map((t, i) => i === ti ? { ...t, rows: t.rows.filter((_, rj) => rj !== ri) } : t))}
                                style={{ background: "none", border: "none", color: "#df6060", cursor: "pointer", fontSize: 13 }}>×</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

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
                                colWidths: [160, 160, 160],
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
                                <ChemInput
                                    value={tbl.title}
                                    onChange={v => setTables(ts => ts.map((t, i) => i === ti ? { ...t, title: v } : t))}
                                    style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: "#c8e8ff", background: "transparent", border: "none", borderBottom: "1px solid #2a5a8a", width: 300 }}
                                />
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button className="action-btn" style={{ fontSize: 11 }} onClick={() =>
                                        setTables(ts => ts.map((t, i) => i === ti
                                            ? {
                                                ...t,
                                                headers: [...t.headers, `Col ${t.headers.length + 1}`],
                                                rows: t.rows.map(r => [...r, ""]),
                                                colWidths: [...(t.colWidths ?? t.headers.map(() => 150)), 150],
                                              }
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
                                <ResizableTable tbl={tbl} ti={ti} setTables={setTables} />
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
                                <ChemInput value={g.title}
                                    onChange={v => setGraphs(gs => gs.map((gg, i) => i === gi ? { ...gg, title: v } : gg))}
                                    style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: "#c8e8ff", background: "transparent", border: "none", borderBottom: "1px solid #2a5a8a", width: 220 }}
                                    placeholder="Graph title"
                                />
                                <ChemInput value={g.xLabel}
                                    onChange={v => setGraphs(gs => gs.map((gg, i) => i === gi ? { ...gg, xLabel: v } : gg))}
                                    style={{ fontSize: 12, width: 160 }} placeholder="x-axis label"
                                />
                                <ChemInput value={g.yLabel}
                                    onChange={v => setGraphs(gs => gs.map((gg, i) => i === gi ? { ...gg, yLabel: v } : gg))}
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