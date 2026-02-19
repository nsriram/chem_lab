// ─── Download helper ─────────────────────────────────────────────────────────

function downloadBlob(content, filename, type) {
    const blob = new Blob([content], { type });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement("a"), { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
}

function datestamp() {
    return new Date().toISOString().slice(0, 10);
}

// ─── Export: full session JSON ────────────────────────────────────────────────

export function exportSessionJSON({ paper, actionLog, studentNotes, evaluation, tables, graphs }) {
    const payload = {
        exportedAt: new Date().toISOString(),
        paper: { id: paper?.id, title: paper?.title },
        studentNotes,
        evaluation,
        actionLog,
        tables,
        graphs,
    };
    downloadBlob(JSON.stringify(payload, null, 2), `chemlab-session-${datestamp()}.json`, "application/json");
}

// ─── Pure builders (exported for testing) ────────────────────────────────────

export function buildCSV(actionLog) {
    const esc = v => `"${String(v ?? "").replace(/"/g, '""').replace(/\n/g, " ")}"`;
    const header = ["Time", "Action", "Vessel", "Chemical", "Amount", "Details"].map(esc).join(",");
    const rows   = actionLog.map(e =>
        [e.timestamp, e.action, e.vessel, e.chemical, e.amount, e.details].map(esc).join(",")
    );
    return [header, ...rows].join("\n");
}

export function buildNotesTxt(notes, paperTitle) {
    const bar = "═".repeat(50);
    return [
        "Cambridge Chemistry Lab Simulator",
        bar,
        paperTitle ?? "Cambridge 9701/33 Advanced Practical Skills",
        bar,
        "",
        "STUDENT ANSWER BOOKLET",
        "─".repeat(50),
        "",
        notes,
    ].join("\n");
}

// ─── Export: action log CSV ───────────────────────────────────────────────────

export function exportActionLogCSV(actionLog) {
    downloadBlob(buildCSV(actionLog), `chemlab-log-${datestamp()}.csv`, "text/csv");
}

// ─── Export: student notes .txt ───────────────────────────────────────────────

export function exportNotesTxt(notes, paperTitle) {
    downloadBlob(buildNotesTxt(notes, paperTitle), `chemlab-answers-${datestamp()}.txt`, "text/plain");
}

// ─── Print report ─────────────────────────────────────────────────────────────

export function printReport({ paper, actionLog, studentNotes, evaluation }) {
    const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

    const escHtml = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const evalHtml = evaluation ? `
    <section>
      <h2>Evaluation Results</h2>
      <p class="grade-line">
        Grade: <strong>${escHtml(evaluation.grade)}</strong> &nbsp;·&nbsp;
        Score: <strong>${evaluation.total} / ${evaluation.maxMarks}</strong> &nbsp;·&nbsp;
        ${Math.round((evaluation.total / evaluation.maxMarks) * 100)}%
      </p>
      ${(evaluation.sections ?? []).map(sec => `
        <h3>${escHtml(sec.label)} — ${sec.score}/${sec.max}</h3>
        <ul>
          ${sec.criteria.map(c => `<li class="crit-${escHtml(c.status)}">${escHtml(c.text)} <span class="marks">[+${c.marks}]</span></li>`).join("")}
        </ul>
      `).join("")}
    </section>` : "";

    const logRows = actionLog.map(e => `
      <tr>
        <td>${escHtml(e.timestamp)}</td>
        <td>${escHtml(e.action)}</td>
        <td>${escHtml(e.vessel)}</td>
        <td>${escHtml(e.details)}</td>
      </tr>`).join("") || "<tr><td colspan='4'><em>No actions recorded.</em></td></tr>";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Lab Report – ${escHtml(paper?.title ?? "Session")}</title>
  <style>
    *  { box-sizing: border-box; }
    body { font-family: "Times New Roman", Times, serif; margin: 2.5cm 2cm; color: #111; font-size: 11pt; line-height: 1.5; }
    h1  { font-size: 16pt; margin: 0 0 4pt; }
    h2  { font-size: 13pt; border-bottom: 1pt solid #555; margin: 18pt 0 6pt; page-break-after: avoid; }
    h3  { font-size: 11pt; margin: 10pt 0 3pt; }
    .meta { font-size: 9.5pt; color: #444; margin-bottom: 14pt; }
    .grade-line { font-size: 12pt; margin: 4pt 0 10pt; }
    ul  { margin: 4pt 0; padding-left: 20pt; }
    li  { margin: 2pt 0; font-size: 10pt; }
    .crit-pass    { color: #145214; }
    .crit-partial { color: #5a4a00; }
    .crit-warn    { color: #7a5a00; }
    .crit-fail    { color: #8a0000; }
    .marks { color: #555; font-style: italic; }
    table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 6pt; }
    th    { background: #f0f0f0; padding: 3pt 6pt; text-align: left; border: 1pt solid #aaa; }
    td    { padding: 2pt 6pt; border: 1pt solid #ccc; vertical-align: top; word-break: break-word; }
    .notes-box { border: 1pt solid #999; padding: 10pt; white-space: pre-wrap; min-height: 80pt; font-size: 11pt; }
    @page  { margin: 2cm; }
  </style>
</head>
<body>
  <h1>⚗️ Cambridge Chemistry Lab Simulator</h1>
  <div class="meta">
    <strong>Paper:</strong> ${escHtml(paper?.title ?? "—")} &nbsp;·&nbsp;
    ${escHtml(paper?.subtitle ?? "")} &nbsp;·&nbsp;
    <strong>Date:</strong> ${date} &nbsp;·&nbsp;
    <strong>Actions logged:</strong> ${actionLog.length}
  </div>

  ${studentNotes ? `
  <section>
    <h2>Student Answer Booklet</h2>
    <div class="notes-box">${escHtml(studentNotes)}</div>
  </section>` : ""}

  <section>
    <h2>Action Log (${actionLog.length} entries)</h2>
    <table>
      <thead><tr><th>Time</th><th>Action</th><th>Vessel</th><th>Details</th></tr></thead>
      <tbody>${logRows}</tbody>
    </table>
  </section>

  ${evalHtml}
</body>
</html>`;

    const win = window.open("", "_blank", "width=860,height=720");
    if (!win) { alert("Please allow pop-ups to use the Print Report feature."); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    // Small delay lets the browser finish layout before print dialog
    setTimeout(() => win.print(), 600);
}
