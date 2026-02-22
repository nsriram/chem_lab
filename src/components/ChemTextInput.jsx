import { useRef, useState } from "react";

// Exported so DataTab can reuse without duplicating
export const TO_SUB = {
    '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉',
    '+':'₊','-':'₋','=':'₌','(':'₍',')':'₎',
    'a':'ₐ','e':'ₑ','o':'ₒ','x':'ₓ','n':'ₙ','i':'ᵢ','r':'ᵣ','u':'ᵤ','v':'ᵥ',
};
export const TO_SUP = {
    '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹',
    '+':'⁺','-':'⁻','=':'⁼','(':'⁽',')':'⁾',
    'n':'ⁿ','a':'ᵃ','b':'ᵇ','c':'ᶜ','d':'ᵈ','e':'ᵉ','f':'ᶠ','g':'ᵍ','h':'ʰ',
    'i':'ⁱ','j':'ʲ','k':'ᵏ','l':'ˡ','m':'ᵐ','o':'ᵒ','p':'ᵖ','r':'ʳ','s':'ˢ',
    't':'ᵗ','u':'ᵘ','v':'ᵛ','w':'ʷ','x':'ˣ','y':'ʸ','z':'ᶻ',
};

const QUICK_SUB = ['₀','₁','₂','₃','₄','₅','₆','₇','₈','₉','₊','₋','ₐ','ₑ','ₒ'];
const QUICK_SUP = ['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹','⁺','⁻','ⁿ'];
const QUICK_SYM = ['→','⇌','°','Δ','·','×','≈','±','∞','α','β','γ','λ','μ'];

// ─── helpers ──────────────────────────────────────────────────────────────────

function insertAtCursor(elRef, value, onChange, char) {
    const el = elRef.current;
    if (!el) { onChange((value ?? '') + char); return; }
    const s = el.selectionStart ?? (value ?? '').length;
    const e = el.selectionEnd   ?? (value ?? '').length;
    const v = value ?? '';
    onChange(v.slice(0, s) + char + v.slice(e));
    requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = s + char.length;
        el.focus();
    });
}

function chemKeyDown(e, mode, setMode, elRef, value, onChange) {
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
        if (mapped) { e.preventDefault(); insertAtCursor(elRef, value, onChange, mapped); }
    }
}

// ─── styles ───────────────────────────────────────────────────────────────────

function toolBtnStyle(active, activeColor = '#60a0ff') {
    return {
        padding: '2px 8px', fontSize: 11, borderRadius: 3, cursor: 'pointer',
        background: active ? 'rgba(30,70,180,0.35)' : 'rgba(255,255,255,0.04)',
        color: active ? activeColor : '#5a8aaa',
        border: `1px solid ${active ? '#3060c0' : '#1a3a5a'}`,
        fontFamily: "'JetBrains Mono', monospace",
        lineHeight: 1.4, userSelect: 'none', transition: 'all 0.12s', outline: 'none',
    };
}
function quickBtnStyle(color = '#c8e8ff') {
    return {
        padding: '1px 5px', fontSize: 14, borderRadius: 3, cursor: 'pointer',
        background: 'rgba(255,255,255,0.06)', color,
        border: '1px solid #1a3a5a', fontFamily: 'inherit',
        lineHeight: 1.4, userSelect: 'none', minWidth: 24, textAlign: 'center', outline: 'none',
    };
}
const SEP = <span style={{ width: 1, alignSelf: 'stretch', background: '#1a3a5a', margin: '0 2px' }} />;

// ─── ChemTextInput ─────────────────────────────────────────────────────────────
// Full-featured textarea with subscript/superscript toolbar.
// onChange(newValue: string)  — not an event object.

export default function ChemTextInput({ value, onChange, placeholder, style }) {
    const ref = useRef(null);
    const [mode, setMode]       = useState(null); // 'sub' | 'sup' | null
    const [symOpen, setSymOpen] = useState(false);

    function insert(char) { insertAtCursor(ref, value, onChange, char); }

    function handleKeyDown(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === ',') { setSymOpen(false); }
        if ((e.ctrlKey || e.metaKey) && e.key === '.') { setSymOpen(false); }
        chemKeyDown(e, mode, setMode, ref, value, onChange);
    }

    function toggleMode(m) {
        setMode(prev => prev === m ? null : m);
        setSymOpen(false);
        requestAnimationFrame(() => ref.current?.focus());
    }

    const borderColor = mode === 'sub' ? '#2a5adf' : mode === 'sup' ? '#df7a2a' : '#2a5a8a';

    return (
        <div>
            {/* ── toolbar ── */}
            <div style={{ display: 'flex', gap: 3, marginBottom: 4, flexWrap: 'wrap', alignItems: 'center', minHeight: 22 }}>
                <span style={{ fontSize: 10, color: '#3a5a7a', userSelect: 'none', fontFamily: "'JetBrains Mono',monospace", marginRight: 1 }}>
                    Format:
                </span>

                <button type="button"
                    onMouseDown={e => { e.preventDefault(); toggleMode('sub'); }}
                    style={toolBtnStyle(mode === 'sub', '#60a0ff')}
                    title="Subscript mode — Ctrl+,  (type digits/letters while active)">
                    X₂ Sub
                </button>
                <button type="button"
                    onMouseDown={e => { e.preventDefault(); toggleMode('sup'); }}
                    style={toolBtnStyle(mode === 'sup', '#ffa060')}
                    title="Superscript mode — Ctrl+.  (type digits/letters while active)">
                    X² Sup
                </button>

                {/* Symbol palette — only shown when not in sub/sup mode */}
                {!mode && (
                    <>
                        <button type="button"
                            onMouseDown={e => { e.preventDefault(); setSymOpen(o => !o); }}
                            style={toolBtnStyle(symOpen, '#c0a0ff')}
                            title="Insert chemistry symbols">
                            Sym ▾
                        </button>
                        {symOpen && <>{SEP}{QUICK_SYM.map(c =>
                            <button key={c} type="button"
                                onMouseDown={e => { e.preventDefault(); insert(c); }}
                                style={quickBtnStyle('#d0b0ff')}>{c}</button>
                        )}</>}
                    </>
                )}

                {/* Quick-insert palette while mode is active */}
                {mode === 'sub' && (
                    <>{SEP}
                        {QUICK_SUB.map(c =>
                            <button key={c} type="button"
                                onMouseDown={e => { e.preventDefault(); insert(c); }}
                                style={quickBtnStyle('#a0c8ff')}>{c}</button>
                        )}
                        <button type="button"
                            onMouseDown={e => { e.preventDefault(); setMode(null); }}
                            style={{ ...toolBtnStyle(false), color: '#df7050', fontSize: 10 }}>✕ Exit</button>
                    </>
                )}
                {mode === 'sup' && (
                    <>{SEP}
                        {QUICK_SUP.map(c =>
                            <button key={c} type="button"
                                onMouseDown={e => { e.preventDefault(); insert(c); }}
                                style={quickBtnStyle('#ffc090')}>{c}</button>
                        )}
                        <button type="button"
                            onMouseDown={e => { e.preventDefault(); setMode(null); }}
                            style={{ ...toolBtnStyle(false), color: '#df7050', fontSize: 10 }}>✕ Exit</button>
                    </>
                )}
            </div>

            {/* ── mode status line ── */}
            {mode && (
                <div style={{
                    fontSize: 10, marginBottom: 3, userSelect: 'none',
                    fontFamily: "'JetBrains Mono',monospace",
                    color: mode === 'sub' ? '#4a8ae0' : '#e0904a',
                    display: 'flex', alignItems: 'center', gap: 5,
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                    {mode === 'sub' ? 'Subscript' : 'Superscript'} mode active · type digits / letters to insert {mode === 'sub' ? 'subscript' : 'superscript'} chars · Esc or Ctrl+{mode === 'sub' ? ',' : '.'} to exit
                </div>
            )}

            <textarea
                ref={ref}
                value={value ?? ''}
                onChange={e => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                style={{
                    width: '100%', minHeight: 72, resize: 'vertical', lineHeight: 1.6,
                    boxSizing: 'border-box',
                    background: 'rgba(10,25,45,0.6)', color: '#c8e8ff',
                    border: `1px solid ${borderColor}`, borderRadius: 4,
                    padding: '7px 10px', fontSize: 13,
                    fontFamily: "'JetBrains Mono', monospace",
                    transition: 'border-color 0.15s',
                    ...style,
                }}
            />
        </div>
    );
}