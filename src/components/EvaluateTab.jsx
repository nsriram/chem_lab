import { exportSessionJSON, exportActionLogCSV, exportNotesTxt, printReport } from "../utils/export";

export default function EvaluateTab({ evaluation, actionLog, studentNotes, paper, tables, graphs, runEvaluation, onBack, onStartFresh }) {
    return (
        <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
            {!evaluation ? (
                <div style={{ textAlign: "center", padding: 60 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#c8e8ff", marginBottom: 12 }}>
                        Ready to Evaluate
                    </div>
                    <div style={{ color: "#8ab4d4", marginBottom: 24 }}>
                        Click "Submit &amp; Evaluate" to receive your assessment
                    </div>
                    <button className="action-btn success" style={{ fontSize: 16, padding: "12px 32px" }} onClick={runEvaluation}>
                        🎓 Submit &amp; Evaluate Now
                    </button>
                </div>
            ) : (
                <div>
                    {/* Score Summary */}
                    <div style={{ background: "linear-gradient(135deg, rgba(26,58,90,0.8), rgba(26,74,90,0.8))", borderRadius: 12, padding: 24, marginBottom: 24, border: "1px solid #2a6a9a", textAlign: "center" }}>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#c8e8ff", marginBottom: 8 }}>
                            Your Result: {evaluation.grade}
                        </div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 42, color: "#4adf7a", marginBottom: 12 }}>
                            {evaluation.total} / {evaluation.maxMarks}
                        </div>
                        <div className="score-bar" style={{ maxWidth: 400, margin: "0 auto" }}>
                            <div className="score-fill" style={{ width: `${(evaluation.total / evaluation.maxMarks) * 100}%` }} />
                        </div>
                        <div style={{ marginTop: 8, fontSize: 13, color: "#8ab4d4" }}>
                            {Math.round((evaluation.total / evaluation.maxMarks) * 100)}%
                            · {evaluation.total >= evaluation.maxMarks * 0.7
                                ? "Distinction" : evaluation.total >= evaluation.maxMarks * 0.5
                                ? "Merit" : "Needs improvement"}
                        </div>
                    </div>

                    {/* Per-Question Breakdown */}
                    <div style={{ display: "grid", gridTemplateColumns: `repeat(${evaluation.sections?.length ?? 3}, 1fr)`, gap: 16, marginBottom: 24 }}>
                        {(evaluation.sections ?? []).map(sec => (
                            <div key={sec.label} style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: 16, border: "1px solid #2a4a6a", textAlign: "center" }}>
                                <div style={{ fontSize: 12, color: "#8ab4d4", marginBottom: 8, lineHeight: 1.4 }}>{sec.label}</div>
                                <div style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: 28,
                                    color: sec.score >= sec.max * 0.7 ? "#4adf7a"
                                         : sec.score >= sec.max * 0.5 ? "#df9a4a" : "#df4a4a",
                                }}>
                                    {sec.score}/{sec.max}
                                </div>
                                <div className="score-bar" style={{ marginTop: 8 }}>
                                    <div className="score-fill" style={{
                                        width: `${(sec.score / sec.max) * 100}%`,
                                        background: sec.score >= sec.max * 0.7
                                            ? "linear-gradient(90deg,#2a8a4a,#4adf7a)"
                                            : sec.score >= sec.max * 0.5
                                                ? "linear-gradient(90deg,#8a6a1a,#dfaa4a)"
                                                : "linear-gradient(90deg,#8a1a1a,#df4a4a)",
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Detailed criteria per section */}
                    {(evaluation.sections ?? []).map(sec => (
                        <div key={sec.label} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: 20, border: "1px solid #2a4a6a", marginBottom: 16 }}>
                            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: "#c8e8ff", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                <span>{sec.label}</span>
                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#6a9abf" }}>
                                    {sec.score}/{sec.max} marks
                                </span>
                            </div>
                            {sec.criteria.map((c, i) => (
                                <div key={i} style={{
                                    padding: "6px 10px", marginBottom: 4, borderRadius: 4, fontSize: 13,
                                    background: c.status === "pass"    ? "rgba(0,80,0,0.15)"
                                              : c.status === "partial" ? "rgba(80,60,0,0.15)"
                                              : c.status === "warn"    ? "rgba(60,50,0,0.15)"
                                              : "rgba(80,0,0,0.15)",
                                    color:     c.status === "pass"    ? "#8ad8a8"
                                             : c.status === "partial" ? "#d4c46a"
                                             : c.status === "warn"    ? "#c8a84a"
                                             : "#d48a8a",
                                    display: "flex", justifyContent: "space-between", gap: 8,
                                }}>
                                    <span>{c.text}</span>
                                    <span style={{ fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap", opacity: 0.75 }}>
                                        +{c.marks}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ))}

                    {/* Action Log */}
                    <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: 20, border: "1px solid #2a4a6a", marginBottom: 16 }}>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#c8e8ff", marginBottom: 14 }}>
                            🗒 Complete Action Log ({actionLog.length} actions)
                        </div>
                        <div style={{ maxHeight: 260, overflow: "auto" }}>
                            {actionLog.length === 0 ? (
                                <div style={{ color: "#3a6a9a", fontSize: 13 }}>
                                    No actions recorded yet. Go to the Laboratory tab to start experimenting.
                                </div>
                            ) : actionLog.map((entry, i) => (
                                <div key={i} className="log-entry">
                                    <span style={{ color: "#4a7a9a" }}>{entry.timestamp}</span>
                                    {" · "}
                                    <span style={{ color: "#4a9adf" }}>{entry.action}</span>
                                    {entry.vessel && <span style={{ color: "#8ab4d4" }}> [{entry.vessel}]</span>}
                                    {" · "}
                                    <span style={{ color: "#a8c8a8" }}>{entry.details}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Student Notes Review */}
                    {studentNotes && (
                        <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: 20, border: "1px solid #2a4a6a", marginBottom: 16 }}>
                            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#c8e8ff", marginBottom: 14 }}>
                                📝 Your Written Answers
                            </div>
                            <div style={{ whiteSpace: "pre-wrap", fontSize: 14, color: "#a8c8e0", lineHeight: 1.7 }}>
                                {studentNotes}
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: 20, padding: "16px 20px", background: "rgba(0,0,0,0.2)", borderRadius: 10, border: "1px solid #2a4a6a" }}>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: "#8ab4d4", marginBottom: 12 }}>
                            💾 Export / Print
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                            <button className="action-btn" style={{ fontSize: 12 }}
                                onClick={() => printReport({ paper, actionLog, studentNotes, evaluation })}>
                                🖨️ Print Report
                            </button>
                            <button className="action-btn" style={{ fontSize: 12 }}
                                onClick={() => exportSessionJSON({ paper, actionLog, studentNotes, evaluation, tables: tables ?? [], graphs: graphs ?? [] })}>
                                📦 Export Session (JSON)
                            </button>
                            <button className="action-btn" style={{ fontSize: 12 }}
                                onClick={() => exportActionLogCSV(actionLog)}>
                                📊 Export Log (CSV)
                            </button>
                            <button className="action-btn" style={{ fontSize: 12 }}
                                onClick={() => exportNotesTxt(studentNotes, paper?.title)}>
                                📄 Export Notes (.txt)
                            </button>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button className="action-btn" onClick={onBack}>← Back to Question Paper</button>
                            <button className="action-btn" onClick={onStartFresh}>🔄 Start Fresh</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
