"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { createWorker } from "tesseract.js";
import { api } from "@/lib/api-client";

export interface ScannedBond {
  bondNumber: string;
  denomination: number | null;
  confidence: number | null;
  reviewed: boolean;
}

export interface BondValidation {
  isBondCertificate: boolean;
  confidence: "high" | "medium" | "low";
  reasons: string[];
}

interface WordWithBbox {
  text: string;
  confidence: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

const BOND_KEYWORDS = [
  "GOVERNMENT OF PAKISTAN",
  "PRIZE BOND",
  "قومی بچت",
  "پرائز بانڈ",
];

const LEFT_STUB_REGION = { x0: 0.03, y0: 0.72, x1: 0.24, y1: 0.98 };
const MAIN_SERIAL_REGION = { x0: 0.72, y0: 0.15, x1: 0.95, y1: 0.35 };

function isInRegion(w: WordWithBbox, region: typeof LEFT_STUB_REGION): boolean {
  const cx = (w.x0 + w.x1) / 2;
  const cy = (w.y0 + w.y1) / 2;
  return cx >= region.x0 && cx <= region.x1 && cy >= region.y0 && cy <= region.y1;
}

function validateBondImage(text: string, words: WordWithBbox[]): BondValidation {
  const upper = text.toUpperCase();
  const reasons: string[] = [];
  const matchedKeywords: string[] = [];

  for (const kw of BOND_KEYWORDS) {
    if (upper.includes(kw)) {
      matchedKeywords.push(kw);
    }
  }

  const isBondCertificate = matchedKeywords.length >= 2;

  if (isBondCertificate) {
    reasons.push(`Matched ${matchedKeywords.length} prize bond keywords`);
  } else if (matchedKeywords.length > 0) {
    reasons.push(`Partial keyword match (${matchedKeywords.length}/${BOND_KEYWORDS.length})`);
  } else {
    reasons.push("No prize bond keywords detected");
  }

  const leftSerials = words
    .filter((w) => isInRegion(w, LEFT_STUB_REGION))
    .map((w) => w.text.match(/^(\d{6})$/))
    .filter(Boolean)
    .map((m) => m![1]);

  const mainSerials = words
    .filter((w) => isInRegion(w, MAIN_SERIAL_REGION))
    .map((w) => w.text.match(/^(\d{6})$/))
    .filter(Boolean)
    .map((m) => m![1]);

  let confidence: BondValidation["confidence"];

  if (leftSerials.length > 0 && mainSerials.length > 0 && leftSerials[0] === mainSerials[0]) {
    confidence = "high";
    reasons.push(`Serial number verified in both regions: ${leftSerials[0]}`);
  } else if (leftSerials.length > 0 || mainSerials.length > 0) {
    confidence = "medium";
    const serial = leftSerials[0] || mainSerials[0];
    const foundIn = leftSerials.length > 0 ? "left stub" : "main body";
    reasons.push(`Serial found in ${foundIn} region: ${serial}`);
  } else {
    confidence = isBondCertificate ? "medium" : "low";
    reasons.push("No serial number found in expected bond regions");
  }

  return { isBondCertificate, confidence, reasons };
}

function preprocessImage(img: HTMLImageElement): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const val = gray > 128 ? 255 : 0;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }

  ctx.putImageData(imageData, 0, 0);
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b!), "image/png");
  });
}

export function useOcr() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ScannedBond[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [bondValidation, setBondValidation] = useState<BondValidation | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const fileRef = useRef<File | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const scan = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    setRecordingError(null);
    setBondValidation(null);

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setImageUrl(objectUrl);
    fileRef.current = file;

    let imgWidth = 0;
    let imgHeight = 0;
    let processedBlob: Blob | null = null;
    try {
      const img = new Image();
      img.src = objectUrl;
      await img.decode();
      imgWidth = img.naturalWidth;
      imgHeight = img.naturalHeight;
      processedBlob = await preprocessImage(img);
    } catch {
      // proceed without bbox normalization or preprocessing
    }

    try {
      const worker = await createWorker("eng+urd", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const { data } = await worker.recognize(processedBlob ?? file);
      await worker.terminate();

      const allWords: WordWithBbox[] = [];
      for (const block of data.blocks ?? []) {
        for (const paragraph of block.paragraphs) {
          for (const line of paragraph.lines) {
            for (const word of line.words) {
              allWords.push({
                text: word.text,
                confidence: word.confidence,
                x0: imgWidth > 0 ? word.bbox.x0 / imgWidth : 0,
                y0: imgHeight > 0 ? word.bbox.y0 / imgHeight : 0,
                x1: imgWidth > 0 ? word.bbox.x1 / imgWidth : 1,
                y1: imgHeight > 0 ? word.bbox.y1 / imgHeight : 1,
              });
            }
          }
        }
      }

      const validation = validateBondImage(data.text, allWords);
      setBondValidation(validation);

      const seen = new Map<string, ScannedBond>();
      let wordMatchCount = 0;

      for (const word of allWords) {
        const match = word.text.match(/^(\d{6})$/);
        if (match) {
          wordMatchCount++;
          const bn = match[1];
          const conf = Math.round(word.confidence);
          const existing = seen.get(bn);
          if (!existing || conf > (existing.confidence ?? 0)) {
            seen.set(bn, {
              bondNumber: bn,
              confidence: conf,
              denomination: null,
              reviewed: false,
            });
          }
        }
      }

      if (wordMatchCount === 0) {
        const bondRegex = /\b(\d{6})\b/g;
        for (const line of data.text.split("\n")) {
          let match;
          while ((match = bondRegex.exec(line)) !== null) {
            const bn = match[1];
            if (!seen.has(bn)) {
              seen.set(bn, {
                bondNumber: bn,
                confidence: null,
                denomination: null,
                reviewed: false,
              });
            }
          }
        }
      }

      const unique = Array.from(seen.values());

      try {
        await api.ocr.record();
      } catch (err) {
        setRecordingError(err instanceof Error ? err.message : "Failed to record OCR scan");
        setIsProcessing(false);
        setProgress(100);
        return;
      }

      setResults(unique);
    } catch {
      setResults([]);
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  }, []);

  const updateBond = useCallback((index: number, updates: Partial<ScannedBond>) => {
    setResults((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  }, []);

  const removeBond = useCallback((index: number) => {
    setResults((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const saveBonds = useCallback(async () => {
    const saved: ScannedBond[] = [];
    for (const bond of results) {
      if (!bond.denomination) continue;
      if ((bond.confidence === null || bond.confidence < 50) && !bond.reviewed) continue;
      try {
        await api.bonds.create({
          bondNumber: bond.bondNumber,
          denomination: bond.denomination,
        });
        saved.push(bond);
      } catch {
        // skip duplicates
      }
    }
    return saved;
  }, [results]);

  const retry = useCallback(async () => {
    if (fileRef.current) {
      setRecordingError(null);
      await scan(fileRef.current);
    }
  }, [scan]);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setResults([]);
    setImageUrl(null);
    setProgress(0);
    setRecordingError(null);
    setBondValidation(null);
    fileRef.current = null;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  return {
    isProcessing,
    progress,
    results,
    imageUrl,
    recordingError,
    bondValidation,
    scan,
    updateBond,
    removeBond,
    saveBonds,
    retry,
    reset,
  };
}
