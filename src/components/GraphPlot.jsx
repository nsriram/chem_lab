export default function GraphPlot({ graph }) {
    const W = 540, H = 360;
    const ml = 62, mr = 24, mt = 36, mb = 58;
    const pw = W - ml - mr, ph = H - mt - mb;
    const pts = graph.points || [];

    if (pts.length === 0) {
        return (
            <svg width={W} height={H} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 8, display: "block" }}>
                <text x={W / 2} y={H / 2} textAnchor="middle" fill="#3a6a9a" fontSize={14} fontFamily="serif">
                    No data points yet
                </text>
            </svg>
        );
    }

    const xs = pts.map(p => p.x);
    const ys = pts.map(p => p.y);
    const rawXMin = Math.min(...xs), rawXMax = Math.max(...xs);
    const rawYMin = Math.min(...ys), rawYMax = Math.max(...ys);
    const xPad = (rawXMax - rawXMin || 1) * 0.12;
    const yPad = (rawYMax - rawYMin || 1) * 0.12;
    const xMin = rawXMin - xPad, xMax = rawXMax + xPad;
    const yMin = rawYMin - yPad, yMax = rawYMax + yPad;

    const sx = x => ml + ((x - xMin) / (xMax - xMin)) * pw;
    const sy = y => mt + ph - ((y - yMin) / (yMax - yMin)) * ph;

    let slope = 0, intercept = 0;
    if (pts.length >= 2 && graph.showBestFit) {
        const n   = pts.length;
        const mx  = xs.reduce((a, v) => a + v, 0) / n;
        const my  = ys.reduce((a, v) => a + v, 0) / n;
        const num = pts.reduce((a, p) => a + (p.x - mx) * (p.y - my), 0);
        const den = pts.reduce((a, p) => a + (p.x - mx) ** 2, 0);
        slope     = den !== 0 ? num / den : 0;
        intercept = my - slope * mx;
    }

    const nTicks = 5;
    const xTicks = Array.from({ length: nTicks + 1 }, (_, i) => xMin + i * (xMax - xMin) / nTicks);
    const yTicks = Array.from({ length: nTicks + 1 }, (_, i) => yMin + i * (yMax - yMin) / nTicks);

    const fmt = v => {
        if (Math.abs(v) >= 1000 || (Math.abs(v) < 0.01 && v !== 0)) return v.toExponential(2);
        return parseFloat(v.toFixed(3)).toString();
    };

    return (
        <svg width={W} height={H} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 8, display: "block" }}>
            {xTicks.map((x, i) => <line key={`gx${i}`} x1={sx(x)} y1={mt} x2={sx(x)} y2={mt + ph} stroke="#1a3a5a" strokeWidth={0.5} />)}
            {yTicks.map((y, i) => <line key={`gy${i}`} x1={ml}    y1={sy(y)} x2={ml + pw} y2={sy(y)} stroke="#1a3a5a" strokeWidth={0.5} />)}

            <line x1={ml} y1={mt}      x2={ml}      y2={mt + ph} stroke="#4a9adf" strokeWidth={2} />
            <line x1={ml} y1={mt + ph} x2={ml + pw} y2={mt + ph} stroke="#4a9adf" strokeWidth={2} />

            {pts.length >= 2 && graph.showBestFit && (
                <line
                    x1={sx(xMin)} y1={sy(slope * xMin + intercept)}
                    x2={sx(xMax)} y2={sy(slope * xMax + intercept)}
                    stroke="#4adf9a" strokeWidth={1.5} strokeDasharray="6,3" opacity={0.85}
                />
            )}

            {pts.map((p, i) => (
                <g key={i}>
                    <circle cx={sx(p.x)} cy={sy(p.y)} r={5} fill="#4a9adf" stroke="#c8e8ff" strokeWidth={1.5} />
                    {p.label && (
                        <text x={sx(p.x) + 8} y={sy(p.y) - 6} fill="#8ab4d4" fontSize={10} fontFamily="monospace">{p.label}</text>
                    )}
                </g>
            ))}

            {xTicks.map((x, i) => (
                <g key={`xt${i}`}>
                    <line x1={sx(x)} y1={mt + ph} x2={sx(x)} y2={mt + ph + 5} stroke="#4a9adf" />
                    <text x={sx(x)} y={mt + ph + 17} textAnchor="middle" fill="#6a9abf" fontSize={10} fontFamily="monospace">{fmt(x)}</text>
                </g>
            ))}

            {yTicks.map((y, i) => (
                <g key={`yt${i}`}>
                    <line x1={ml - 5} y1={sy(y)} x2={ml} y2={sy(y)} stroke="#4a9adf" />
                    <text x={ml - 8} y={sy(y) + 4} textAnchor="end" fill="#6a9abf" fontSize={10} fontFamily="monospace">{fmt(y)}</text>
                </g>
            ))}

            <text x={ml + pw / 2} y={H - 8}  textAnchor="middle" fill="#8ab4d4" fontSize={12} fontFamily="serif">{graph.xLabel}</text>
            <text x={14} y={mt + ph / 2} textAnchor="middle" fill="#8ab4d4" fontSize={12} fontFamily="serif"
                  transform={`rotate(-90, 14, ${mt + ph / 2})`}>{graph.yLabel}</text>
            <text x={ml + pw / 2} y={22} textAnchor="middle" fill="#c8e8ff" fontSize={13} fontFamily="serif" fontWeight="bold">{graph.title}</text>

            {pts.length >= 2 && graph.showBestFit && (
                <text x={ml + pw - 4} y={mt + 16} textAnchor="end" fill="#4adf9a" fontSize={10} fontFamily="monospace">
                    y = {slope.toFixed(4)}x + {intercept.toFixed(4)}
                </text>
            )}
        </svg>
    );
}
