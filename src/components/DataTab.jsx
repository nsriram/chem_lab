import { useRef, useState, useCallback } from "react";
import GraphPlot from "./GraphPlot";
import { TO_SUB, TO_SUP } from "./ChemTextInput";

function autoHeight(el) {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
}

// Quick-insert palettes for the cell toolbar (most common in chemistry tables)
const CELL_QUICK_SUB = ['₀','₁','₂','₃','₄','₅','₆','₇','₈','₉','₊','₋','ₙ','ₐ','ₑ'];
const CELL_QUICK_SUP = ['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹','⁺','⁻','ⁿ'];

// ── ChemCell ──────────────────────────────────────────────────────────────────
// Compact table-cell textarea with sub/sup toolbar (shown on focus) and
// Ctrl+, / Ctrl+. keyboard shortcuts.
export function ChemCell({ value, onChange, style: styleOverride }) {
    const [mode, setMode] = useState(null);
    const [focused, setFocused] = useState(false);
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

    function insertChar(char) {
        const el = ref.current;
        if (!el) { onChange((value ?? '') + char); return; }
        const s = el.selectionStart, end = el.selectionEnd;
        const nv = (value ?? '').slice(0, s) + char + (value ?? '').slice(end);
        onChange(nv);
        requestAnimationFrame(() => {
            el.selectionStart = el.selectionEnd = s + char.length;
            el.focus();
        });
    }

    // Shared mini-button style
    function modeBtn(active, activeColor, activeBg) {
        return {
            padding: '0 5px', fontSize: 9, lineHeight: '16px', borderRadius: 2,
            cursor: 'pointer', border: `1px solid ${active ? activeColor : '#1a3a5a'}`,
            background: active ? activeBg : 'rgba(255,255,255,0.04)',
            color: active ? activeColor : '#5a8aaa',
            fontFamily: "'JetBrains Mono', monospace", outline: 'none',
        };
    }
    function quickBtn(color, bg) {
        return {
            padding: '0 3px', fontSize: 11, lineHeight: '16px', borderRadius: 2,
            cursor: 'pointer', border: '1px solid #1a3a5a', background: bg,
            color, fontFamily: 'inherit', minWidth: 18, textAlign: 'center', outline: 'none',
        };
    }

    return (
        <div style={{ position: 'relative' }}>
            <textarea
                ref={setRef}
                value={value}
                rows={1}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setFocused(true)}
                onBlur={() => { setFocused(false); setMode(null); }}
                title="Ctrl+, = subscript · Ctrl+. = superscript · Esc to exit mode"
                style={{
                    display: 'block', width: '100%',
                    background: 'transparent', color: '#a8c8e0', border: 'none',
                    padding: '5px 8px',
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                    boxSizing: 'border-box', resize: 'none', overflow: 'hidden',
                    lineHeight: 1.5, minHeight: 28,
                    outline: mode ? `1px solid ${mode === 'sub' ? '#2a5adf' : '#df7a2a'}` : 'none',
                    outlineOffset: -1,
                    ...styleOverride,
                }}
            />
            {/* Sub/sup toolbar — visible only when cell is focused */}
            {focused && (
                <div style={{
                    display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center',
                    padding: '2px 4px 3px',
                    borderTop: '1px solid #1a3a5a',
                    background: 'rgba(8,18,36,0.85)',
                }}>
                    <button type="button"
                        onMouseDown={e => { e.preventDefault(); setMode(m => m === 'sub' ? null : 'sub'); }}
                        title="Subscript (Ctrl+,)"
                        style={modeBtn(mode === 'sub', '#60a0ff', 'rgba(30,70,180,0.35)')}>
                        X₂
                    </button>
                    <button type="button"
                        onMouseDown={e => { e.preventDefault(); setMode(m => m === 'sup' ? null : 'sup'); }}
                        title="Superscript (Ctrl+.)"
                        style={modeBtn(mode === 'sup', '#ffa060', 'rgba(180,80,20,0.35)')}>
                        X²
                    </button>
                    {mode === 'sub' && CELL_QUICK_SUB.map(c => (
                        <button key={c} type="button"
                            onMouseDown={e => { e.preventDefault(); insertChar(c); }}
                            style={quickBtn('#a0c8ff', 'rgba(30,70,180,0.15)')}>{c}</button>
                    ))}
                    {mode === 'sup' && CELL_QUICK_SUP.map(c => (
                        <button key={c} type="button"
                            onMouseDown={e => { e.preventDefault(); insertChar(c); }}
                            style={quickBtn('#ffb080', 'rgba(180,80,20,0.15)')}>{c}</button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── ChemInput ─────────────────────────────────────────────────────────────────
// Single-line input with Ctrl+, / Ctrl+. keyboard shortcuts.
// Used for table titles, graph axis labels, etc.
export function ChemInput({ value, onChange, placeholder, style }) {
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

export function ResizableTable({ tbl, ti, setTables }) {
    const dragRef = useRef(null);

    function removeColumn(colIndex) {
        if (tbl.headers.length <= 1) return;
        setTables(ts => ts.map((t, i) => {
            if (i !== ti) return t;
            const base = t.colWidths ?? t.headers.map(() => 150);
            return {
                ...t,
                headers: t.headers.filter((_, j) => j !== colIndex),
                rows: t.rows.map(r => r.filter((_, j) => j !== colIndex)),
                colWidths: base.filter((_, j) => j !== colIndex),
            };
        }));
    }

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
                            <ChemCell
                                value={h}
                                onChange={v => setTables(ts => ts.map((t, i) => i === ti
                                    ? { ...t, headers: t.headers.map((hh, j) => j === hi ? v : hh) }
                                    : t))}
                                style={{ background: "rgba(26,74,122,0.4)", color: "#c8e8ff", padding: "6px 26px 6px 8px", fontWeight: "bold" }}
                            />
                            {/* Column remove button */}
                            {tbl.headers.length > 1 && (
                                <button
                                    onClick={() => removeColumn(hi)}
                                    title="Remove this column"
                                    style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: 8, background: "none", border: "none", color: "#df6060", cursor: "pointer", fontSize: 12, lineHeight: 1, padding: "2px 3px" }}
                                >×</button>
                            )}
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