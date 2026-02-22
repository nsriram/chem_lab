import { QUESTION_PAPERS } from "../data/questionPaper";
import ChemTextInput from "./ChemTextInput";

export default function PaperTab({ activePaperId, setActivePaperId, expandedQ, setExpandedQ, partAnswers, setPartAnswers }) {
    const paper = QUESTION_PAPERS[activePaperId] ?? QUESTION_PAPERS[0];

    function setAnswer(partId, value) {
        setPartAnswers(prev => ({ ...prev, [partId]: value }));
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
                            {q.parts.map(part => (
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
                                    {/* Per-part answer box */}
                                    <div style={{ borderTop: "1px solid #1a3a5a", paddingTop: 10 }}>
                                        <div style={{ fontSize: 11, color: "#5a8aaa", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 5 }}>
                                            ✏️ Your Answer
                                        </div>
                                        <ChemTextInput
                                            value={partAnswers[part.id] ?? ""}
                                            onChange={v => setAnswer(part.id, v)}
                                            placeholder="Write your answer here…"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}