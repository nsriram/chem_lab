// apparatusMass (g): typical mass of the empty vessel as it would sit on a balance.
// Used so the balance reading includes apparatus + contents, matching real lab practice.
// group: "vessels" | "measuring" | "tools" — controls which palette section it appears in.
export const EQUIPMENT = {
    "conical_flask":            { label: "Conical Flask (250 cm³)",     icon: "⚗️", group: "vessels",   apparatusMass: 89.46 },
    "beaker_100":               { label: "Beaker (100 cm³)",            icon: "🫙", group: "vessels",   apparatusMass: 63.82 },
    "beaker_250":               { label: "Beaker (250 cm³)",            icon: "🫗", group: "vessels",   apparatusMass: 94.17 },
    "volumetric_flask_250":     { label: "Volumetric Flask (250 cm³)", icon: "⚱️", group: "vessels",   apparatusMass: 132.67 },
    "polystyrene_cup":          { label: "Polystyrene Cup (125 cm³)",   icon: "🥤", group: "vessels",   apparatusMass:  2.84 },
    "test_tube":                { label: "Test-tube",                   icon: "🧫", group: "vessels",   apparatusMass: 16.23 },
    "boiling_tube":             { label: "Boiling Tube",               icon: "🔬", group: "vessels",   apparatusMass: 22.68 },
    "crucible":                 { label: "Crucible + Lid",             icon: "🏺", group: "vessels",   apparatusMass: 24.11 },
    "burette":                  { label: "Burette (50 cm³)",           icon: "🧪", group: "measuring", apparatusMass: 80.52 },
    "pipette_25":               { label: "Pipette (25.0 cm³)",         icon: "💉", group: "measuring", apparatusMass: 14.83 },
    "measuring_cylinder_10":    { label: "Measuring Cylinder (10 cm³)",icon: "📏", group: "measuring", apparatusMass: 34.57 },
    "measuring_cylinder_25":    { label: "Measuring Cylinder (25 cm³)",icon: "📐", group: "measuring", apparatusMass: 54.91 },
    "measuring_cylinder_50":    { label: "Measuring Cylinder (50 cm³)",icon: "📐", group: "measuring", apparatusMass: 65.34 },
    "thermometer":              { label: "Thermometer",                icon: "🌡️", group: "measuring" },
    "stop_clock":               { label: "Stop-clock",                 icon: "⏱️", group: "measuring" },
    "balance":                  { label: "Balance (2 d.p.)",           icon: "⚖️", group: "measuring" },
    "bunsen":                   { label: "Bunsen Burner",              icon: "🔥", group: "tools" },
    "stirring_rod":             { label: "Stirring Rod",               icon: "🥢", group: "tools" },
    "filter_paper":             { label: "Filter Paper + Funnel",      icon: "🫧", group: "tools" },
    "dropper":                  { label: "Dropper / Teat Pipette",     icon: "💧", group: "tools" },
    "splint":                   { label: "Lighted Splint",             icon: "🕯️", group: "tools" },
    "litmus_red":               { label: "Damp Red Litmus Paper",      icon: "📄", group: "tools" },
};
