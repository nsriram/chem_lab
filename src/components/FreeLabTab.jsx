import { useState } from "react";
import { generateGuidanceReport, CATEGORY_LABELS } from "../engine/freeLabReport";
import { CHEMICALS } from "../data/chemicals";
import { useLang } from "../contexts/LangContext";

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
    { value: 'qualitative', label: '🔍 Qualitative Analysis / Salt Analysis',    hint: 'Identify cations and anions in an unknown salt or solution' },
    { value: 'titration',   label: '⚗️ Titration (acid-base or iodometric)',     hint: 'e.g. Titrate HCl vs NaOH; iodine–thiosulfate back-titration' },
    { value: 'energetics',  label: '🌡️ Energetics / Calorimetry',               hint: 'Measure temperature changes and calculate ΔH' },
    { value: 'rate',        label: '⏱️ Rate of Reaction / Kinetics',             hint: 'e.g. Thiosulfate clock; effect of concentration on rate' },
    { value: 'thermal',     label: '🔥 Thermal Decomposition',                   hint: 'e.g. Water of crystallisation; decompose a hydrated salt' },
    { value: 'general',     label: '🧪 Open / Other Experiment',                 hint: 'Any experiment or investigation not listed above' },
];

const EXAMPLE_EXPERIMENTS = [
    { title: 'Identify ions in unknown FA solutions',     category: 'qualitative', goal: 'Use NaOH, AgNO₃, BaCl₂, and NH₃ to identify the cation and anion in each unknown FA solution.' },
    { title: 'Brown ring test for nitrate ions',          category: 'qualitative', goal: 'Test for the presence of NO₃⁻ using FeSO₄ and concentrated H₂SO₄ to produce the characteristic brown ring.' },
    { title: 'Titration: HCl vs NaOH with methyl orange', category: 'titration',  goal: 'Determine the concentration of hydrochloric acid by titrating against a standard NaOH solution.' },
    { title: 'Enthalpy of dissolving ammonium nitrate',   category: 'energetics',  goal: 'Measure the enthalpy change when NH₄NO₃ dissolves in water and calculate ΔH in kJ mol⁻¹.' },
    { title: 'Rate of thiosulfate clock reaction',        category: 'rate',        goal: 'Investigate how concentration of HCl affects the rate of the Na₂S₂O₃ clock reaction using 1000/t as rate.' },
    { title: 'Water of crystallisation in CuSO₄·5H₂O',  category: 'thermal',     goal: 'Determine the number of moles of water of crystallisation by heating to constant mass.' },
];

const SEVERITY_CONFIG = {
    essential:   { color: '#ef6060', bg: 'rgba(200,50,50,0.1)',  border: 'rgba(200,50,50,0.3)',  icon: '🔴', label: 'Essential' },
    recommended: { color: '#dfaa3a', bg: 'rgba(200,150,30,0.1)', border: 'rgba(200,150,30,0.3)', icon: '🟡', label: 'Recommended' },
    suggested:   { color: '#4a9adf', bg: 'rgba(50,100,200,0.1)', border: 'rgba(50,100,200,0.3)', icon: '💡', label: 'Suggested' },
};

const CATEGORY_HINTS = {
    titration: [
        { icon: '⚗️', text: 'Use a Burette (50 cm³) for the titrant — add it from the Equipment palette' },
        { icon: '💉', text: 'Use a Pipette (25.0 cm³) to measure the analyte into a Conical Flask' },
        { icon: '🎯', text: 'Add an indicator (starch, or use methyl orange for acid-base)' },
        { icon: '🔁', text: 'Perform at least 3 titrations: 1 rough + 2 concordant (within 0.10 cm³)' },
        { icon: '📋', text: 'Record results in a table on the Data tab' },
    ],
    qualitative: [
        { icon: '🧪', text: 'Test each unknown with NaOH first — record precipitate colour' },
        { icon: '🧪', text: 'Add NH₃(aq) to a fresh portion — compare result with NaOH' },
        { icon: '🧪', text: 'Add BaCl₂ then acidify with HCl — white ppt insoluble = SO₄²⁻' },
        { icon: '🧪', text: 'Add AgNO₃ then dilute NH₃ — identify the halide ion' },
        { icon: '🧪', text: 'Try acidified KMnO₄ — decolourisation = reducing agent' },
        { icon: '🌡️', text: 'Perform gas tests when gas evolves (splint, glowing splint, litmus)' },
    ],
    energetics: [
        { icon: '⚖️', text: 'Weigh your solid before adding it to the solution' },
        { icon: '🌡️', text: 'Measure temperature before mixing (T₁)' },
        { icon: '🌡️', text: 'Measure maximum (or minimum) temperature after mixing (T₂)' },
        { icon: '🥤', text: 'Use a Polystyrene Cup — it insulates better than glass' },
        { icon: '🥢', text: 'Stir after adding the solid to get an accurate T₂' },
    ],
    rate: [
        { icon: '⏱️', text: 'Use the stop-clock — start it as soon as you mix the reactants' },
        { icon: '💧', text: 'Add distilled water to vary concentration while keeping total volume constant' },
        { icon: '🔁', text: 'Perform at least 5 experiments at different concentrations' },
        { icon: '📋', text: 'Record: volume, concentration, time, 1000/t in a table' },
        { icon: '📉', text: 'Plot rate (1000/t) vs concentration on the Graphs tab' },
    ],
    thermal: [
        { icon: '🏺', text: 'Use a Crucible + Lid — add it from the Vessels palette' },
        { icon: '⚖️', text: 'Weigh crucible alone (m₁), with salt (m₂), and after heating (m₃)' },
        { icon: '🔥', text: 'Heat strongly, then cool and reweigh — repeat until constant mass' },
        { icon: '📋', text: 'Record all masses on the Data tab table' },
    ],
    general: [
        { icon: '🧪', text: 'Add chemicals to vessels from the Chemicals palette' },
        { icon: '📋', text: 'Record your observations — use the Latest Observation panel' },
        { icon: '⚖️', text: 'Weigh, measure temperature, heat, or stir as appropriate' },
        { icon: '📈', text: 'Record data in a table or graph on the Data tab' },
    ],
};


// ── Sub-components ────────────────────────────────────────────────────────────

function CategoryHints({ category, guidanceFor }) {
    const hints = CATEGORY_HINTS[category] || CATEGORY_HINTS.general;
    return (
        <div style={{ background: 'rgba(42,74,42,0.15)', border: '1px solid rgba(74,154,74,0.3)', borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ fontSize: 12, color: '#4adf7a', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
                💡 {guidanceFor} {CATEGORY_LABELS[category] || 'This Experiment'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {hints.map((h, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#a8c8a0' }}>
                        <span style={{ flexShrink: 0 }}>{h.icon}</span>
                        <span>{h.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ReportView({ report, onNew, onUpdateReport, t }) {
    // Group improvements by severity
    const bySeverity = { essential: [], recommended: [], suggested: [] };
    (report.improvements || []).forEach(imp => {
        const key = imp.severity || 'suggested';
        bySeverity[key].push(imp);
    });

    function handlePrint() {
        window.print();
    }

    return (
        <div style={{ padding: '24px', maxWidth: 860, margin: '0 auto' }}>
            {/* Report header */}
            <div style={{ background: 'linear-gradient(135deg, rgba(26,58,100,0.7), rgba(26,74,100,0.7))', border: '1px solid #2a6a9a', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ fontSize: 11, color: '#4a9adf', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>{t('free.report.labReport')}</div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#c8e8ff', marginBottom: 4 }}>{report.title}</div>
                        <div style={{ fontSize: 12, color: '#6a9abf', marginBottom: 4 }}>{report.categoryLabel}</div>
                        {report.goal && <div style={{ fontSize: 13, color: '#8ab4d4', fontStyle: 'italic' }}>{t('free.report.goal')} {report.goal}</div>}
                    </div>
                    <div style={{ textAlign: 'right', fontSize: 11, color: '#4a7a9a' }}>
                        <div>{report.generatedAt}</div>
                        <div style={{ marginTop: 4 }}>{report.actionsCount} {t('free.report.actionsCount')} · {report.chemicalsUsed.length} {t('free.report.chemicalsCount')}</div>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid #1a3a5a', borderRadius: 10, padding: '16px 20px', marginBottom: 20 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: '#8ab4d4', marginBottom: 8 }}>{t('free.report.summary')}</div>
                <div style={{ fontSize: 14, color: '#a8c8e0', lineHeight: 1.7 }}>{report.summary}</div>
            </div>

            {/* Strengths */}
            {report.strengths.length > 0 && (
                <div style={{ background: 'rgba(42,100,42,0.15)', border: '1px solid rgba(74,154,74,0.4)', borderRadius: 10, padding: '16px 20px', marginBottom: 20 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: '#4adf7a', marginBottom: 10 }}>{t('free.report.didWell')}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {report.strengths.map((s, i) => (
                            <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#a0d4a0', lineHeight: 1.6 }}>
                                <span style={{ flexShrink: 0, color: '#4adf7a' }}>✓</span>
                                <span>{s.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {report.strengths.length === 0 && (
                <div style={{ background: 'rgba(42,42,42,0.2)', border: '1px solid #2a3a4a', borderRadius: 10, padding: '14px 20px', marginBottom: 20, fontSize: 13, color: '#6a8aaa', fontStyle: 'italic' }}>
                    {t('free.report.noStrengths')}
                </div>
            )}

            {/* Improvements */}
            <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: '#c8e8ff', marginBottom: 12 }}>{t('free.report.areasToImprove')}</div>
                {['essential', 'recommended', 'suggested'].map(sev => {
                    const items = bySeverity[sev];
                    if (items.length === 0) return null;
                    const cfg = SEVERITY_CONFIG[sev];
                    return (
                        <div key={sev} style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 12 }}>
                            <div style={{ fontSize: 11, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10, fontWeight: 'bold' }}>
                                {cfg.icon} {cfg.label}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {items.map((imp, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#c8d0d8', lineHeight: 1.6 }}>
                                        <span style={{ flexShrink: 0, color: cfg.color, marginTop: 2 }}>›</span>
                                        <span>{imp.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recommended Protocol */}
            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid #1a3a5a', borderRadius: 10, padding: '16px 20px', marginBottom: 20 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: '#c8e8ff', marginBottom: 12 }}>
                    {t('free.report.protocol')} — {report.categoryLabel}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {report.protocol.map((step, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, fontSize: 13, color: '#a8c8e0', lineHeight: 1.6 }}>
                            <span style={{ flexShrink: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#4a7aaa', background: 'rgba(42,74,138,0.3)', borderRadius: 4, padding: '2px 7px', marginTop: 1, minWidth: 24, textAlign: 'center' }}>
                                {i + 1}
                            </span>
                            <span>{step}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Key Tips */}
            <div style={{ background: 'rgba(42,42,80,0.2)', border: '1px solid rgba(100,100,160,0.3)', borderRadius: 10, padding: '16px 20px', marginBottom: 28 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: '#a8a8d4', marginBottom: 10 }}>{t('free.report.keyTips')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {report.tips.map((tip, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#9898c4', lineHeight: 1.6 }}>
                            <span style={{ flexShrink: 0 }}>•</span>
                            <span>{tip}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="action-btn" style={{ padding: '10px 28px', fontSize: 14 }} onClick={onNew}>
                    {t('free.newExperiment')}
                </button>
                <button className="action-btn" style={{ padding: '10px 28px', fontSize: 14 }} onClick={onUpdateReport}>
                    {t('free.regenerate')}
                </button>
                <button className="action-btn" style={{ padding: '10px 28px', fontSize: 14 }} onClick={handlePrint}>
                    {t('free.print')}
                </button>
            </div>
        </div>
    );
}


// ── Main component ────────────────────────────────────────────────────────────

export default function FreeLabTab({
    freeExperiment, setFreeExperiment,
    freeLabReport,  setFreeLabReport,
    actionLog, clearLog,
    setActiveTab,
}) {
    const { t } = useLang();
    const [form, setForm] = useState(freeExperiment ?? { title: '', category: 'qualitative', goal: '' });
    const [clearOnStart, setClearOnStart] = useState(true);

    function handleStart() {
        if (clearOnStart) clearLog();
        setFreeExperiment({ ...form, startedAt: new Date().toLocaleString() });
        setFreeLabReport(null);
    }

    function handleGenerate() {
        const report = generateGuidanceReport(freeExperiment, actionLog);
        setFreeLabReport(report);
    }

    function handleNew() {
        setFreeExperiment(null);
        setFreeLabReport(null);
        setForm({ title: '', category: 'qualitative', goal: '' });
    }

    function loadExample(ex) {
        setForm({ title: ex.title, category: ex.category, goal: ex.goal });
    }

    const selectedCat = CATEGORY_OPTIONS.find(c => c.value === form.category);

    // ── Phase 3: Report ───────────────────────────────────────────────────────
    if (freeLabReport) {
        return (
            <ReportView
                report={freeLabReport}
                onNew={handleNew}
                onUpdateReport={handleGenerate}
                t={t}
            />
        );
    }

    // ── Phase 2: Experiment in progress ──────────────────────────────────────
    if (freeExperiment) {
        const chemicalsUsed = [...new Set(actionLog.filter(a => a.chemical).map(a => a.chemical))];
        const cat = CATEGORY_OPTIONS.find(c => c.value === freeExperiment.category);
        return (
            <div style={{ padding: 24, maxWidth: 860, margin: '0 auto' }}>
                {/* Active banner */}
                <div style={{ background: 'linear-gradient(135deg, rgba(30,80,50,0.5), rgba(30,70,60,0.5))', border: '1px solid #2a8a4a', borderRadius: 12, padding: '18px 24px', marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: 11, color: '#4adf7a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>{t('free.inProgress')}</div>
                            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, color: '#c8e8ff', marginBottom: 3 }}>{freeExperiment.title}</div>
                            <div style={{ fontSize: 12, color: '#6ab4a4' }}>{cat?.label}</div>
                            {freeExperiment.goal && (
                                <div style={{ fontSize: 13, color: '#90b898', marginTop: 6, fontStyle: 'italic' }}>"{freeExperiment.goal}"</div>
                            )}
                        </div>
                        <button
                            className="action-btn"
                            style={{ fontSize: 11, flexShrink: 0 }}
                            onClick={() => { setFreeExperiment(null); setFreeLabReport(null); }}
                        >{t('free.change')}</button>
                    </div>
                </div>

                {/* Navigation */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                    <button className="action-btn success" style={{ padding: '13px 0', fontSize: 14 }} onClick={() => setActiveTab('lab')}>
                        {t('free.goToLab')}
                    </button>
                    <button className="action-btn" style={{ padding: '13px 0', fontSize: 14 }} onClick={() => setActiveTab('data')}>
                        {t('free.goToData')}
                    </button>
                </div>

                {/* Stats */}
                <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid #2a4a6a', borderRadius: 10, padding: '16px 20px', marginBottom: 20 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, color: '#8ab4d4', marginBottom: 12 }}>{t('free.progressSoFar')}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
                        {[
                            [t('free.actionsLogged'), actionLog.length, '#4a9adf'],
                            [t('free.chemicalsUsed'), chemicalsUsed.length, '#4adf9a'],
                            [t('free.observations'), actionLog.filter(a => a.observation).length, '#df9a4a'],
                        ].map(([label, val, col]) => (
                            <div key={label} style={{ background: 'rgba(42,90,138,0.15)', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 26, color: col }}>{val}</div>
                                <div style={{ fontSize: 11, color: '#5a8aaa', marginTop: 2 }}>{label}</div>
                            </div>
                        ))}
                    </div>
                    {chemicalsUsed.length > 0 && (
                        <div style={{ fontSize: 12, color: '#7a9abf', lineHeight: 1.5 }}>
                            <span style={{ color: '#5a7a9a' }}>{t('free.chemicals')} </span>
                            {chemicalsUsed.map(id => CHEMICALS[id]?.label ?? id).join(' · ')}
                        </div>
                    )}
                    {actionLog.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#4a7a6a', fontSize: 13, padding: 8 }}>
                            {t('free.noLabActions')}
                        </div>
                    )}
                </div>

                {/* Category guidance */}
                <div style={{ marginBottom: 20 }}>
                    <CategoryHints category={freeExperiment.category} guidanceFor={t('free.guidanceFor')} />
                </div>

                {/* Generate button */}
                <div style={{ textAlign: 'center' }}>
                    <button
                        className="action-btn success"
                        style={{ fontSize: 15, padding: '14px 48px', opacity: actionLog.length === 0 ? 0.5 : 1 }}
                        onClick={handleGenerate}
                        disabled={actionLog.length === 0}
                    >
                        {t('free.generateReport')}
                    </button>
                    {actionLog.length === 0 && (
                        <div style={{ fontSize: 12, color: '#5a7a8a', marginTop: 6 }}>
                            {t('free.completeFirst')}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── Phase 1: Setup ────────────────────────────────────────────────────────
    return (
        <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
            {/* Page header */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ fontSize: 44, marginBottom: 8 }}>🔬</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#c8e8ff', marginBottom: 6 }}>
                    {t('free.pageTitle')}
                </div>
                <div style={{ color: '#7aa4c4', fontSize: 14, maxWidth: 560, margin: '0 auto' }}>
                    {t('free.pageDesc')}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: 20, alignItems: 'start' }}>
                {/* Form */}
                <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid #2a4a6a', borderRadius: 12, padding: 24 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#c8e8ff', marginBottom: 20 }}>
                        {t('free.describeTitle')}
                    </div>

                    {/* Title */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 11, color: '#5a8aaa', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 5 }}>
                            {t('free.expTitleLabel')}
                        </label>
                        <input
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="e.g. Brown Ring Test for Nitrate Ions"
                            style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', fontSize: 14 }}
                        />
                    </div>

                    {/* Category */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 11, color: '#5a8aaa', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 5 }}>
                            {t('free.categoryLabel')}
                        </label>
                        <select
                            value={form.category}
                            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                            style={{ width: '100%', padding: '9px 12px', background: '#0d1f35', border: '1px solid #2a5a8a', color: '#c8e8ff', fontSize: 13, borderRadius: 6, cursor: 'pointer' }}
                        >
                            {CATEGORY_OPTIONS.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                        {selectedCat && (
                            <div style={{ fontSize: 11, color: '#4a7a9a', marginTop: 4 }}>{selectedCat.hint}</div>
                        )}
                    </div>

                    {/* Goal */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 11, color: '#5a8aaa', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 5 }}>
                            {t('free.goalLabel')}
                        </label>
                        <textarea
                            value={form.goal}
                            onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}
                            placeholder="e.g. Determine whether the unknown solution contains nitrate ions using the brown ring test…"
                            rows={3}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', fontSize: 13, resize: 'vertical', background: 'rgba(0,0,0,0.2)', border: '1px solid #2a4a6a', color: '#c8e8ff', borderRadius: 6, fontFamily: "'Crimson Text', Georgia, serif", lineHeight: 1.5 }}
                        />
                    </div>

                    {/* Clear log option */}
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#8ab4c4', marginBottom: 18, cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={clearOnStart}
                            onChange={e => setClearOnStart(e.target.checked)}
                            style={{ marginTop: 2, flexShrink: 0 }}
                        />
                        <span>
                            {t('free.clearLog')}{' '}
                            <span style={{ color: '#5a8a9a' }}>{t('free.clearLogNote')}</span>
                        </span>
                    </label>

                    <button
                        className="action-btn success"
                        style={{ width: '100%', padding: '13px 0', fontSize: 15, opacity: form.title.trim() ? 1 : 0.5 }}
                        onClick={handleStart}
                        disabled={!form.title.trim()}
                    >
                        {t('free.startBtn')}
                    </button>
                    {!form.title.trim() && (
                        <div style={{ fontSize: 11, color: '#4a6a7a', marginTop: 5, textAlign: 'center' }}>{t('free.enterTitle')}</div>
                    )}
                </div>

                {/* Example experiments sidebar */}
                <div>
                    <div style={{ fontSize: 12, color: '#5a8aaa', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
                        {t('free.tryOneOf')}
                    </div>
                    {EXAMPLE_EXPERIMENTS.map((ex, i) => (
                        <div
                            key={i}
                            onClick={() => loadExample(ex)}
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid #1a3a5a', borderRadius: 8, padding: '10px 12px', marginBottom: 8, cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = '#4a9adf'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = '#1a3a5a'}
                        >
                            <div style={{ fontSize: 12, color: '#a8c8e0', fontWeight: 'bold', marginBottom: 3 }}>{ex.title}</div>
                            <div style={{ fontSize: 11, color: '#5a7a9a', lineHeight: 1.4 }}>{ex.goal.slice(0, 72)}…</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}