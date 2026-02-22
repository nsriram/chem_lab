import { QUESTION_PAPERS } from "../data/questionPaper";
import ChemTextInput from "./ChemTextInput";
import { ChemInput, ResizableTable } from "./DataTab";
import GraphPlot from "./GraphPlot";

// Normalize answer value: old string format → new {text, tables, graphs} shape
function normalizeAns(v) {
    if (!v || typeof v === 'string') return { text: v ?? '', tables: [], graphs: [] };
    return { text: '', tables: [], graphs: [], ...v };
}

export default function PaperTab({ activePaperId, setActivePaperId, expandedQ, setExpandedQ, partAnswers, setPartAnswers }) {
    const paper = QUESTION_PAPERS[activePaperId] ?? QUESTION_PAPERS[0];

    // Merge a patch into a single part's answer object
    function updateAns(partId, patch) {
        setPartAnswers(prev => ({ ...prev, [partId]: { ...normalizeAns(prev[partId]), ...patch } }));
    }

    // Functional updater for a part's tables array
    function setTbls(partId, updater) {
        setPartAnswers(prev => {
            const ans = normalizeAns(prev[partId]);
            return { ...prev, [partId]: { ...ans, tables: typeof updater === 'function' ? updater(ans.tables) : updater } };
        });
    }

    // Functional updater for a part's graphs array
    function setGphs(partId, updater) {
        setPartAnswers(prev => {
            const ans = normalizeAns(prev[partId]);
            return { ...prev, [partId]: { ...ans, graphs: typeof updater === 'function' ? updater(ans.graphs) : updater } };
        });
    }

    return (
        <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>
            {/* Paper selector */}
            <div style={{ marginBottom: 20, padding: "14px 18px", background: "rgba(0,0,0,0.3)", borderRadius: 10, border: "1px solid #2a4a6a" }}>
                <div style={{ fontSize: 12, color: "#6a9abf", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
                    Select Question Paper
                </div>
                <select
                    value={activePaperId}
                    onChange={e => { setActivePaperId(Number(e.target.value)); setExpandedQ("Q1"); }}
                    style={{
                        width: "100%", padding: "8px 12px", borderRadius: 6,
                        background: "#0d1f35", border: "1px solid #2a5a8a",
                        color: "#c8e8ff", fontSize: 14, cursor: "pointer",
                    }}
                >
                    {QUESTION_PAPERS.map((p, i) => (
                        <option key={p.id} value={i}>{p.title}</option>
                    ))}
                </select>
            </div>

            {/* Header card */}
            <div style={{ textAlign: "center", marginBottom: 28, padding: "20px", background: "rgba(0,0,0,0.3)", borderRadius: 10, border: "1px solid #2a4a6a" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#c8e8ff", marginBottom: 4 }}>
                    {paper.title}
                </div>
                <div style={{ color: "#8ab4d4", marginBottom: 8 }}>{paper.subtitle}</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 24, fontSize: 13, color: "#6a9abf" }}>
                    <span>⏰ {paper.time}</span>
                    <span>📝 {paper.marks} marks</span>
                    <span>📖 Answer all questions</span>
                </div>
            </div>

            {/* Instructions */}
            <div style={{ background: "rgba(180,120,40,0.1)", border: "1px solid #8a6a2a", borderRadius: 8, padding: "10px 16px", marginBottom: 20, fontSize: 13, color: "#d4b86a" }}>
                ⚠️ <strong>Instructions:</strong> Answer all questions. Show precision of apparatus in recorded
                data. Show working in calculations. Use the Laboratory tab to perform experiments. Your actions
                are logged and evaluated.
            </div>

            {/* Questions */}
            {paper.questions.map(q => (
                <div key={q.id} className="q-card">
                    <div className="q-header" onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}>
                        <div>
                            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: "#c8e8ff" }}>{q.title}</span>
                            <span style={{ marginLeft: 12, fontSize: 12, color: "#6a9abf" }}>[{q.marks} marks]</span>
                        </div>
                        <span style={{ color: "#4a9adf" }}>{expandedQ === q.id ? "▲" : "▼"}</span>
                    </div>

                    {expandedQ === q.id && (
                        <div className="q-body">
                            <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 6, padding: "12px 16px", marginBottom: 16, fontSize: 14, lineHeight: 1.7, color: "#a8c8e0", borderLeft: "3px solid #2a6a9a", whiteSpace: "pre-line" }}>
                                {q.context}
                            </div>
                            {q.parts.map(part => {
                                const ans = normalizeAns(partAnswers[part.id]);
                                return (
                                    <div key={part.id} style={{ marginBottom: 16, padding: "14px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 6, border: "1px solid #1a3a5a" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                            <strong style={{ color: "#c8e8ff", fontFamily: "'Playfair Display', serif" }}>{part.label}</strong>
                                            <span style={{ fontSize: 12, color: "#4a9adf", fontFamily: "'JetBrains Mono', monospace" }}>
                                                [{part.marks} mark{part.marks > 1 ? "s" : ""}]
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 14, color: "#a8c8e0", lineHeight: 1.7, marginBottom: 10 }}>
                                            {part.instruction}
                                        </div>
                                        {part.hint && (
                                            <div style={{ fontSize: 12, color: "#8a7a4a", fontStyle: "italic", marginBottom: 10 }}>
                                                💡 Hint: {part.hint}
                                            </div>
                                        )}

                                        {/* ── Answer area ── */}
                                        <div style={{ borderTop: "1px solid #1a3a5a", paddingTop: 10 }}>
                                            <div style={{ fontSize: 11, color: "#5a8aaa", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 5 }}>
                                                ✏️ Your Answer
                                            </div>
                                            <ChemTextInput
                                                value={ans.text}
                                                onChange={v => updateAns(part.id, { text: v })}
                                                placeholder="Write your answer here…"
                                            />

                                            {/* ── Inline tables ── */}
                                            {ans.tables.map((tbl, ti) => (
                                                <div key={tbl.id} style={{ marginTop: 12, background: "rgba(0,0,0,0.2)", border: "1px solid #2a4a6a", borderRadius: 8, padding: "12px 14px" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                                                        <ChemInput
                                                            value={tbl.title}
                                                            onChange={v => setTbls(part.id, ts => ts.map((t, i) => i === ti ? { ...t, title: v } : t))}
                                                            style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, color: "#c8e8ff", background: "transparent", border: "none", borderBottom: "1px solid #2a5a8a", width: 220 }}
                                                        />
                                                        <div style={{ display: "flex", gap: 6 }}>
                                                            <button className="action-btn" style={{ fontSize: 10, padding: "3px 8px" }} onClick={() =>
                                                                setTbls(part.id, ts => ts.map((t, i) => i === ti
                                                                    ? { ...t, headers: [...t.headers, `Col ${t.headers.length + 1}`], rows: t.rows.map(r => [...r, '']), colWidths: [...(t.colWidths ?? t.headers.map(() => 140)), 140] }
                                                                    : t))
                                                            }>+ Column</button>
                                                            <button className="action-btn" style={{ fontSize: 10, padding: "3px 8px" }} onClick={() =>
                                                                setTbls(part.id, ts => ts.map((t, i) => i === ti
                                                                    ? { ...t, rows: [...t.rows, t.headers.map(() => '')] }
                                                                    : t))
                                                            }>+ Row</button>
                                                            <button className="action-btn danger" style={{ fontSize: 10, padding: "3px 8px" }} onClick={() =>
                                                                setTbls(part.id, ts => ts.filter((_, i) => i !== ti))
                                                            }>🗑</button>
                                                        </div>
                                                    </div>
                                                    <div style={{ overflowX: "auto" }}>
                                                        <ResizableTable
                                                            tbl={tbl}
                                                            ti={ti}
                                                            setTables={updater => setTbls(part.id, updater)}
                                                        />
                                                    </div>
                                                </div>
                                            ))}

                                            {/* ── Inline graphs ── */}
                                            {ans.graphs.map((g, gi) => (
                                                <div key={g.id} style={{ marginTop: 12, background: "rgba(0,0,0,0.2)", border: "1px solid #2a4a6a", borderRadius: 8, padding: "12px 14px" }}>
                                                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
                                                        <ChemInput
                                                            value={g.title}
                                                            onChange={v => setGphs(part.id, gs => gs.map((gg, i) => i === gi ? { ...gg, title: v } : gg))}
                                                            style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, color: "#c8e8ff", background: "transparent", border: "none", borderBottom: "1px solid #2a5a8a", width: 180 }}
                                                            placeholder="Graph title"
                                                        />
                                                        <ChemInput
                                                            value={g.xLabel}
                                                            onChange={v => setGphs(part.id, gs => gs.map((gg, i) => i === gi ? { ...gg, xLabel: v } : gg))}
                                                            style={{ fontSize: 11, width: 130 }}
                                                            placeholder="x-axis label"
                                                        />
                                                        <ChemInput
                                                            value={g.yLabel}
                                                            onChange={v => setGphs(part.id, gs => gs.map((gg, i) => i === gi ? { ...gg, yLabel: v } : gg))}
                                                            style={{ fontSize: 11, width: 130 }}
                                                            placeholder="y-axis label"
                                                        />
                                                        <label style={{ fontSize: 11, color: "#8ab4d4", display: "flex", alignItems: "center", gap: 4 }}>
                                                            <input type="checkbox" checked={g.showBestFit}
                                                                onChange={e => setGphs(part.id, gs => gs.map((gg, i) => i === gi ? { ...gg, showBestFit: e.target.checked } : gg))}
                                                            /> Best-fit
                                                        </label>
                                                        <button className="action-btn danger" style={{ fontSize: 10, padding: "3px 8px", marginLeft: "auto" }}
                                                            onClick={() => setGphs(part.id, gs => gs.filter((_, i) => i !== gi))}>🗑</button>
                                                    </div>

                                                    <GraphPlot graph={g} />

                                                    <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
                                                        <span style={{ fontSize: 11, color: "#6a9abf" }}>Add point:</span>
                                                        <input type="number" placeholder="x" value={g.newX}
                                                            onChange={e => setGphs(part.id, gs => gs.map((gg, i) => i === gi ? { ...gg, newX: e.target.value } : gg))}
                                                            style={{ width: 70, fontSize: 11 }} step="any"
                                                        />
                                                        <input type="number" placeholder="y" value={g.newY}
                                                            onChange={e => setGphs(part.id, gs => gs.map((gg, i) => i === gi ? { ...gg, newY: e.target.value } : gg))}
                                                            style={{ width: 70, fontSize: 11 }} step="any"
                                                        />
                                                        <input placeholder="label (opt.)" value={g.newPointLabel}
                                                            onChange={e => setGphs(part.id, gs => gs.map((gg, i) => i === gi ? { ...gg, newPointLabel: e.target.value } : gg))}
                                                            style={{ width: 120, fontSize: 11 }}
                                                        />
                                                        <button className="action-btn" style={{ fontSize: 11 }} onClick={() => {
                                                            const x = parseFloat(g.newX), y = parseFloat(g.newY);
                                                            if (isNaN(x) || isNaN(y)) return;
                                                            setGphs(part.id, gs => gs.map((gg, i) => i === gi
                                                                ? { ...gg, points: [...gg.points, { x, y, label: gg.newPointLabel }], newX: '', newY: '', newPointLabel: '' }
                                                                : gg));
                                                        }}>+ Add</button>
                                                    </div>

                                                    {g.points.length > 0 && (
                                                        <div style={{ marginTop: 8, overflowX: "auto" }}>
                                                            <table style={{ borderCollapse: "collapse", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                                                                <thead>
                                                                    <tr>
                                                                        {["#", g.xLabel || "x", g.yLabel || "y", "Label", ""].map((h, i) => (
                                                                            <th key={i} style={{ border: "1px solid #2a5a8a", padding: "3px 8px", background: "rgba(26,74,122,0.4)", color: "#c8e8ff", textAlign: "left" }}>{h}</th>
                                                                        ))}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {g.points.map((pt, pi) => (
                                                                        <tr key={pi}>
                                                                            <td style={{ border: "1px solid #1a3a5a", padding: "2px 8px", color: "#6a9abf" }}>{pi + 1}</td>
                                                                            <td style={{ border: "1px solid #1a3a5a", padding: "2px 8px", color: "#a8c8e0" }}>{pt.x}</td>
                                                                            <td style={{ border: "1px solid #1a3a5a", padding: "2px 8px", color: "#a8c8e0" }}>{pt.y}</td>
                                                                            <td style={{ border: "1px solid #1a3a5a", padding: "2px 8px", color: "#8a9abf" }}>{pt.label || "—"}</td>
                                                                            <td style={{ border: "1px solid #1a3a5a", padding: "2px 6px", textAlign: "center" }}>
                                                                                <button onClick={() => setGphs(part.id, gs => gs.map((gg, i) => i === gi ? { ...gg, points: gg.points.filter((_, pj) => pj !== pi) } : gg))}
                                                                                    style={{ background: "none", border: "none", color: "#df6060", cursor: "pointer", fontSize: 12 }}>×</button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            {/* ── Add table / graph buttons ── */}
                                            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                                                <button className="action-btn" style={{ fontSize: 11 }} onClick={() =>
                                                    setTbls(part.id, ts => [...ts, {
                                                        id: Date.now(),
                                                        title: `Table ${ts.length + 1}`,
                                                        headers: ['Variable 1', 'Variable 2', 'Variable 3'],
                                                        rows: [['', '', ''], ['', '', '']],
                                                        colWidths: [140, 140, 140],
                                                    }])
                                                }>📋 + Table</button>
                                                <button className="action-btn" style={{ fontSize: 11 }} onClick={() =>
                                                    setGphs(part.id, gs => [...gs, {
                                                        id: Date.now(),
                                                        title: `Graph ${gs.length + 1}`,
                                                        xLabel: 'x-axis',
                                                        yLabel: 'y-axis',
                                                        points: [],
                                                        showBestFit: true,
                                                        newX: '',
                                                        newY: '',
                                                        newPointLabel: '',
                                                    }])
                                                }>📉 + Graph</button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}