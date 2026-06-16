import { readFileSync } from "fs";

const PRIZE_TYPES = [
  { label: "First Prize", key: "first" },
  { label: "Second Prize", key: "second" },
  { label: "Third Prize", key: "third" },
  { label: "Fourth Prize", key: "fourth" },
  { label: "Fifth Prize", key: "fifth" },
];

export function parseDrawFile(filePath) {
  const raw = readFileSync(filePath, "utf8");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const text = raw.replace(/\r/g, "");

  const drawNumberMatch = text.match(/(\d+)(?:st|nd|rd|th)\s*(?:DRAW|draw)/i);
  const drawNumber = drawNumberMatch ? drawNumberMatch[1] : null;

  const dateMatch = text.match(/(?:Held on|held on)\s+(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i);
  let drawDate = dateMatch ? dateMatch[1] : null;

  const filenameDateMatch = !drawDate ? filePath.match(/(\d{1,2}[-.]\d{1,2}[-.]\d{2,4})/) : null;
  drawDate = drawDate || (filenameDateMatch ? filenameDateMatch[1].replace(/\./g, "-") : null);

  const mainLine = lines.find((l) => /Rs\.?\s*[\d,]+\s*\/-\s*DENOMINATION/i.test(l)) || lines[0] || "";
  const denomMatch = mainLine.match(/Rs\.?\s*([\d,]+)\s*(?:\/-\s*)?DENOMINATION/i);
  const rawDenom = denomMatch ? denomMatch[1].replace(/,/g, "") : null;
  const denomination = rawDenom ? parseInt(rawDenom, 10) : null;

  let bondType = "National Prize Bonds";
  if (mainLine.includes("Student Welfare")) bondType = "Student Welfare Prize Bonds";
  else if (mainLine.includes("Premium")) bondType = "Premium Prize Bonds";

  const winningNumbers = [];
  let currentPrizeIndex = -1;

  for (const line of lines) {
    const prizeMatch = line.match(/^(First|Second|Third|Fourth|Fifth)\s+Prize/i);
    if (prizeMatch) {
      currentPrizeIndex = PRIZE_TYPES.findIndex(p => p.label.startsWith(prizeMatch[1]));
      continue;
    }

    if (currentPrizeIndex < 0) continue;

    const prizeKey = PRIZE_TYPES[currentPrizeIndex]?.key || "unknown";
    const tokens = line.split(/\t|\s{2,}/).map(t => t.trim()).filter(Boolean);

    for (const token of tokens) {
      if (/^\d+$/.test(token)) {
        winningNumbers.push({
          bondNumber: token,
          prizeType: prizeKey,
          prizeAmount: null,
        });
      }
    }
  }

  return {
    denomination,
    drawNumber,
    drawDate: drawDate,
    bondType,
    source: "savings.gov.pk",
    winningNumbers,
    rawLineCount: lines.length,
  };
}

export function denomFolderName(denomination) {
  return String(denomination);
}

export function filenameToDrawKey(denomination, drawDate, drawNumber) {
  const d = drawDate ? drawDate.replace(/[-\/]/g, "-") : "unknown";
  const dn = drawNumber ? `-draw-${drawNumber}` : "";
  return `draws/${denomination}/${d}${dn}.json`;
}
