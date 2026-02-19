export default function EvaluateTab({ evaluation, actionLog, studentNotes, runEvaluation, onBack, onStartFresh }) {
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
                            · {evaluation.total >= 28 ? "Distinction" : evaluation.total >= 20 ? "Merit" : "Needs improvement"}
                        </div>
                    </div>

                    {/* Section Breakdown */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
                        {[
                            ["Q1 – Rate of Reaction", evaluation.Q1, 14],
                            ["Q2 – Enthalpy", evaluation.Q2, 10],
                            ["Q3 – Qualitative", evaluation.Q3, 13],
                        ].map(([label, score, max]) => (
                            <div key={label} style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: 16, border: "1px solid #2a4a6a", textAlign: "center" }}>
                                <div style={{ fontSize: 13, color: "#8ab4d4", marginBottom: 8 }}>{label}</div>
                                <div style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: 28,
                                    color: score >= max * 0.7 ? "#4adf7a" : score >= max * 0.5 ? "#df9a4a" : "#df4a4a",
                                }}>
                                    {score}/{max}
                                </div>
                                <div className="score-bar" style={{ marginTop: 8 }}>
                                    <div className="score-fill" style={{
                                        width: `${(score / max) * 100}%`,
                                        background: score >= max * 0.7
                                            ? "linear-gradient(90deg,#2a8a4a,#4adf7a)"
                                            : score >= max * 0.5
                                                ? "linear-gradient(90deg,#8a6a1a,#dfaa4a)"
                                                : "linear-gradient(90deg,#8a1a1a,#df4a4a)",
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Feedback */}
                    <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: 20, border: "1px solid #2a4a6a", marginBottom: 20 }}>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#c8e8ff", marginBottom: 14 }}>
                            📋 Detailed Feedback
                        </div>
                        {evaluation.feedback.map((f, i) => (
                            <div key={i} style={{
                                padding: "6px 10px",
                                marginBottom: 4,
                                borderRadius: 4,
                                background: f.startsWith("✅") ? "rgba(0,80,0,0.15)" : f.startsWith("⚠️") ? "rgba(80,60,0,0.15)" : "rgba(80,0,0,0.15)",
                                fontSize: 13,
                                color: f.startsWith("✅") ? "#8ad8a8" : f.startsWith("⚠️") ? "#d4b86a" : "#d48a8a",
                            }}>
                                {f}
                            </div>
                        ))}
                    </div>

                    {/* Action Log */}
                    <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: 20, border: "1px solid #2a4a6a" }}>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#c8e8ff", marginBottom: 14 }}>
                            🗒 Complete Action Log ({actionLog.length} actions)
                        </div>
                        <div style={{ maxHeight: 300, overflow: "auto" }}>
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
                        <div style={{ marginTop: 20, background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: 20, border: "1px solid #2a4a6a" }}>
                            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#c8e8ff", marginBottom: 14 }}>
                                📝 Your Written Answers
                            </div>
                            <div style={{ whiteSpace: "pre-wrap", fontSize: 14, color: "#a8c8e0", lineHeight: 1.7 }}>
                                {studentNotes}
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
                        <button className="action-btn" onClick={onBack}>
                            ← Back to Question Paper
                        </button>
                        <button className="action-btn" onClick={onStartFresh}>
                            🔄 Start Fresh
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
