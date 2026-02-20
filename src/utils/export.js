import { jsPDF } from "jspdf";

const W = 210, H = 297, MARGIN = 18, CW = W - MARGIN * 2;

function datestamp() {
    return new Date().toISOString().slice(0, 10);
}

function checkPage(doc, y, needed = 10) {
    if (y + needed > H - 16) { doc.addPage(); return MARGIN; }
    return y;
}

function sectionHeader(doc, text, y) {
    doc.setFillColor(20, 50, 80);
    doc.rect(MARGIN, y, CW, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(200, 232, 255);
    doc.text(text, MARGIN + 4, y + 5.5);
    return y + 12;
}

export function exportReportPDF({ paper, actionLog, partAnswers = {}, evaluation }) {
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    let y = MARGIN;

    // ── Header band ──────────────────────────────────────────────────────────
    doc.setFillColor(14, 38, 64);
    doc.rect(0, 0, W, 30, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(200, 232, 255);
    doc.text("Cambridge Chemistry Lab Simulator", MARGIN, 13);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(120, 170, 210);
    doc.text(paper?.title ?? "Lab Report", MARGIN, 21);
    const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    doc.text(date, W - MARGIN, 21, { align: "right" });

    y = 40;

    // ── Score summary ─────────────────────────────────────────────────────────
    if (evaluation) {
        const pct = Math.round((evaluation.total / evaluation.maxMarks) * 100);
        const hi = evaluation.total >= evaluation.maxMarks * 0.7;
        const mid = evaluation.total >= evaluation.maxMarks * 0.5;
        const level = hi ? "Distinction" : mid ? "Merit" : "Needs improvement";
        const fillRgb = hi ? [74, 210, 110] : mid ? [210, 160, 60] : [210, 70, 70];

        doc.setFillColor(22, 60, 90);
        doc.roundedRect(MARGIN, y, CW, 28, 3, 3, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(...fillRgb);
        doc.text(`${evaluation.total} / ${evaluation.maxMarks}`, MARGIN + 6, y + 13);

        doc.setFontSize(11);
        doc.setTextColor(200, 232, 255);
        doc.text(`Grade: ${evaluation.grade}`, MARGIN + 6, y + 21);

        doc.setFontSize(10);
        doc.setTextColor(130, 175, 215);
        doc.text(`${pct}%  ·  ${level}`, MARGIN + 6, y + 26);

        // Bar background
        const bx = W / 2 + 10, bw = CW / 2 - 14;
        doc.setFillColor(30, 55, 80);
        doc.roundedRect(bx, y + 10, bw, 7, 1.5, 1.5, "F");
        doc.setFillColor(...fillRgb);
        doc.roundedRect(bx, y + 10, Math.max(3, bw * pct / 100), 7, 1.5, 1.5, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(200, 232, 255);
        doc.text(`${pct}%`, bx + bw / 2, y + 15.5, { align: "center" });

        y += 36;
    }

    // ── Section breakdown ─────────────────────────────────────────────────────
    if (evaluation?.sections?.length) {
        y = checkPage(doc, y, 20);
        y = sectionHeader(doc, "Assessment Breakdown", y);

        for (const sec of evaluation.sections) {
            y = checkPage(doc, y, 14);

            const sp = sec.score / sec.max;
            const sc = sp >= 0.7 ? [74, 210, 110] : sp >= 0.5 ? [210, 160, 60] : [210, 70, 70];

            doc.setFillColor(18, 44, 68);
            doc.roundedRect(MARGIN, y, CW, 8, 2, 2, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.5);
            doc.setTextColor(...sc);
            doc.text(`${sec.score} / ${sec.max}`, W - MARGIN - 4, y + 5.5, { align: "right" });
            doc.setTextColor(210, 235, 255);
            doc.text(sec.label, MARGIN + 4, y + 5.5);
            y += 11;

            for (const c of sec.criteria) {
                y = checkPage(doc, y, 7);
                const dotRgb = c.status === "pass"    ? [74, 200, 100]
                             : c.status === "partial" ? [200, 180, 60]
                             : c.status === "warn"    ? [200, 140, 40]
                             : [200, 75, 75];
                doc.setFillColor(...dotRgb);
                doc.circle(MARGIN + 3, y + 1.8, 1.3, "F");
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8.5);
                doc.setTextColor(175, 210, 235);
                const lines = doc.splitTextToSize(c.text, CW - 22);
                doc.text(lines, MARGIN + 7, y + 2.5);
                doc.setFont("helvetica", "italic");
                doc.setTextColor(120, 150, 175);
                doc.text(`+${c.marks} mk`, W - MARGIN - 3, y + 2.5, { align: "right" });
                y += lines.length * 4.8 + 1.5;
            }
            y += 3;
        }
    }

    // ── Student answers per question part ────────────────────────────────────
    if (paper?.questions?.length) {
        y = checkPage(doc, y, 20);
        y = sectionHeader(doc, "Written Answers", y);

        for (const q of paper.questions) {
            y = checkPage(doc, y, 12);

            // Question title bar
            doc.setFillColor(16, 40, 64);
            doc.rect(MARGIN, y, CW, 7, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(180, 220, 255);
            doc.text(q.title, MARGIN + 3, y + 5);
            y += 10;

            for (const part of q.parts) {
                const answer = partAnswers[part.id] ?? "";
                const colW = (CW - 4) / 2;

                // Measure both sides to find row height
                doc.setFontSize(8);
                const qLines = doc.splitTextToSize(part.instruction, colW - 4);
                const aLines = answer.trim()
                    ? doc.splitTextToSize(answer, colW - 4)
                    : ["—"];
                const lineH = 4.2;
                const headerH = 6;
                const rowH = Math.max(qLines.length, aLines.length) * lineH + headerH + 6;

                y = checkPage(doc, y, rowH);

                // Row background
                doc.setFillColor(14, 35, 56);
                doc.roundedRect(MARGIN, y, CW, rowH, 1.5, 1.5, "F");

                // Divider
                const midX = MARGIN + colW + 2;
                doc.setDrawColor(30, 60, 90);
                doc.line(midX, y + 2, midX, y + rowH - 2);

                // Part label header (left)
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7.5);
                doc.setTextColor(74, 154, 223);
                doc.text(`${part.label}  [${part.marks} mk]`, MARGIN + 3, y + 4.5);

                // Answer header (right)
                doc.setTextColor(80, 180, 110);
                doc.text("Student Answer", midX + 3, y + 4.5);

                // Question instruction (left)
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.setTextColor(160, 200, 230);
                doc.text(qLines, MARGIN + 3, y + headerH + 2);

                // Student answer (right)
                doc.setTextColor(answer.trim() ? 210 : 80, answer.trim() ? 235 : 100, answer.trim() ? 255 : 120);
                if (!answer.trim()) doc.setFont("helvetica", "italic");
                doc.text(aLines, midX + 3, y + headerH + 2);
                doc.setFont("helvetica", "normal");

                y += rowH + 3;
            }
            y += 4;
        }
    }

    // ── Action log ────────────────────────────────────────────────────────────
    if (actionLog.length > 0) {
        y = checkPage(doc, y, 20);
        y = sectionHeader(doc, `Action Log  (${actionLog.length} entries)`, y);

        // Column positions
        const cols = [MARGIN + 1, MARGIN + 26, MARGIN + 62, MARGIN + 96];

        doc.setFillColor(22, 58, 100);
        doc.rect(MARGIN, y, CW, 6.5, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(200, 230, 255);
        ["Time", "Action", "Vessel", "Details"].forEach((h, i) => doc.text(h, cols[i], y + 4.3));
        y += 6.5;

        doc.setFont("helvetica", "normal");
        for (let i = 0; i < actionLog.length; i++) {
            y = checkPage(doc, y, 6.5);
            const e = actionLog[i];
            doc.setFillColor(i % 2 === 0 ? 18 : 14, i % 2 === 0 ? 38 : 30, i % 2 === 0 ? 58 : 46);
            doc.rect(MARGIN, y, CW, 6, "F");
            doc.setFontSize(7.5);
            doc.setTextColor(110, 160, 200);
            doc.text(String(e.timestamp ?? "").slice(0, 14), cols[0], y + 4);
            doc.setTextColor(80, 150, 220);
            doc.text(String(e.action ?? "").slice(0, 20), cols[1], y + 4);
            doc.setTextColor(140, 180, 210);
            doc.text(String(e.vessel ?? "").slice(0, 18), cols[2], y + 4);
            doc.setTextColor(160, 200, 160);
            doc.text(String(e.details ?? "").slice(0, 55), cols[3], y + 4);
            y += 6;
        }
    }

    // ── Page footers ──────────────────────────────────────────────────────────
    const total = doc.internal.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
        doc.setPage(p);
        doc.setDrawColor(30, 60, 90);
        doc.line(MARGIN, H - 12, W - MARGIN, H - 12);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(80, 115, 150);
        doc.text("Cambridge Chemistry Lab Simulator", MARGIN, H - 7);
        doc.text(`Page ${p} of ${total}`, W - MARGIN, H - 7, { align: "right" });
    }

    doc.save(`chemlab-report-${datestamp()}.pdf`);
}