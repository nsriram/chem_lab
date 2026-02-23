import { useChemLab } from "./hooks/useChemLab";
import PaperTab from "./components/PaperTab";
import LabTab from "./components/LabTab";
import DataTab from "./components/DataTab";
import EvaluateTab from "./components/EvaluateTab";
import FreeLabTab from "./components/FreeLabTab";
import { useLang } from "./contexts/LangContext";
import { LANG_OPTIONS } from "./data/i18n";

export default function ChemLabApp() {
    const lab = useChemLab();
    const { lang, setLang, t } = useLang();

    return (
        <div style={{
            fontFamily: "'Crimson Text', Georgia, serif",
            background: "linear-gradient(135deg, #0a1628 0%, #1a2d4a 50%, #0f2035 100%)",
            minHeight: "100vh",
            color: "#e8dcc8",
        }}>
            {/* Header */}
            <div style={{
                background: "rgba(0,0,0,0.4)",
                borderBottom: "1px solid #1a3a5a",
                padding: "16px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}>
                <div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: "#c8e8ff", letterSpacing: "1px" }}>
                        ⚗️ {t('app.title')}
                    </div>
                    <div style={{ fontSize: 12, color: "#6a9abf", letterSpacing: "2px", textTransform: "uppercase" }}>
                        {t('app.subtitle')}
                    </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {/* Language selector */}
                    <select
                        value={lang}
                        onChange={e => setLang(e.target.value)}
                        title="Select language"
                        style={{
                            background: "rgba(0,0,0,0.4)",
                            border: "1px solid #2a5a8a",
                            color: "#8ab4d4",
                            borderRadius: 6,
                            padding: "5px 8px",
                            fontSize: 13,
                            cursor: "pointer",
                        }}
                    >
                        {LANG_OPTIONS.map(o => (
                            <option key={o.code} value={o.code}>{o.flag} {o.label}</option>
                        ))}
                    </select>
                    <div style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 18,
                        color: lab.clockRunning ? "#4adf7a" : "#8ab4d4",
                        background: "rgba(0,0,0,0.4)",
                        padding: "6px 14px",
                        borderRadius: 6,
                        border: `1px solid ${lab.clockRunning ? "#2a8a4a" : "#2a5a8a"}`,
                    }}>
                        ⏱ {String(Math.floor(lab.clockTime / 60)).padStart(2, '0')}:{String(lab.clockTime % 60).padStart(2, '0')}
                    </div>
                    <button className="action-btn" style={{ fontSize: 11 }} onClick={lab.undo} disabled={lab.historyIndex === 0}>
                        {t('btn.undo')}
                    </button>
                    <button className="action-btn" style={{ fontSize: 11 }} onClick={lab.redo} disabled={lab.historyIndex >= lab.logHistory.length - 1}>
                        {t('btn.redo')}
                    </button>
                    <button
                        className="action-btn danger"
                        style={{ fontSize: 11 }}
                        title="Clear all session data: bench, answers, log, graphs, tables"
                        onClick={() => {
                            if (window.confirm(t('newSession.title') + '\n\n' + t('newSession.body'))) {
                                lab.startFresh();
                            }
                        }}
                    >
                        {t('btn.newSession')}
                    </button>
                </div>
            </div>

            {/* Tab Bar */}
            <div style={{ display: "flex", gap: 2, padding: "12px 24px 0", borderBottom: "1px solid #1a3a5a" }}>
                {[
                    ["paper",    t('tab.paper')],
                    ["lab",      t('tab.lab')],
                    ["data",     t('tab.data')],
                    ["evaluate", t('tab.evaluate')],
                    ["freelab",  t('tab.freelab')],
                ].map(([id, label]) => (
                    <button key={id} className={`tab-btn ${lab.activeTab === id ? "active" : ""}`}
                        onClick={() => lab.setActiveTab(id)}>{label}</button>
                ))}
                <div style={{ flex: 1 }} />
                <button className="action-btn success" style={{ marginBottom: 4 }} onClick={lab.runEvaluation}>
                    {t('btn.submitEvaluate')}
                </button>
            </div>

            {/* Tab Content */}
            {lab.activeTab === "paper" && (
                <PaperTab
                    activePaperId={lab.activePaperId}
                    setActivePaperId={lab.setActivePaperId}
                    expandedQ={lab.expandedQ}
                    setExpandedQ={lab.setExpandedQ}
                    partAnswers={lab.partAnswers}
                    setPartAnswers={lab.setPartAnswers}
                />
            )}

            {lab.activeTab === "lab" && (
                <LabTab
                    vessels={lab.vessels}
                    setVessels={lab.setVessels}
                    selectedVessel={lab.selectedVessel}
                    setSelectedVessel={lab.setSelectedVessel}
                    selectedChemical={lab.selectedChemical}
                    setSelectedChemical={lab.setSelectedChemical}
                    addVolume={lab.addVolume}
                    setAddVolume={lab.setAddVolume}
                    addMass={lab.addMass}
                    setAddMass={lab.setAddMass}
                    transferDestId={lab.transferDestId}
                    setTransferDestId={lab.setTransferDestId}
                    transferAmount={lab.transferAmount}
                    setTransferAmount={lab.setTransferAmount}
                    lastObservation={lab.lastObservation}
                    clockTime={lab.clockTime}
                    setClockTime={lab.setClockTime}
                    bureteReading={lab.bureteReading}
                    setBuretteReading={lab.setBuretteReading}
                    createVessel={lab.createVessel}
                    addChemicalToVessel={lab.addChemicalToVessel}
                    performAction={lab.performAction}
                    transferContents={lab.transferContents}
                    clearBench={lab.clearBench}
                    pushLog={lab.pushLog}
                    activePaper={lab.activePaper}
                />
            )}

            {lab.activeTab === "data" && (
                <DataTab
                    tables={lab.tables}
                    setTables={lab.setTables}
                    graphs={lab.graphs}
                    setGraphs={lab.setGraphs}
                    activeDataTab={lab.activeDataTab}
                    setActiveDataTab={lab.setActiveDataTab}
                />
            )}

            {lab.activeTab === "evaluate" && (
                <EvaluateTab
                    evaluation={lab.evaluation}
                    actionLog={lab.actionLog}
                    partAnswers={lab.partAnswers}
                    paper={lab.activePaper}
                    tables={lab.tables}
                    graphs={lab.graphs}
                    runEvaluation={lab.runEvaluation}
                    onBack={() => { lab.setEvaluation(null); lab.setActiveTab("paper"); }}
                    onStartFresh={lab.startFresh}
                />
            )}

            {lab.activeTab === "freelab" && (
                <FreeLabTab
                    freeExperiment={lab.freeExperiment}
                    setFreeExperiment={lab.setFreeExperiment}
                    freeLabReport={lab.freeLabReport}
                    setFreeLabReport={lab.setFreeLabReport}
                    actionLog={lab.actionLog}
                    clearLog={lab.clearLog}
                    setActiveTab={lab.setActiveTab}
                />
            )}
        </div>
    );
}