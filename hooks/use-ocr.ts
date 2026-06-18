"use client";

import { useState, useCallback } from "react";
import { createWorker } from "tesseract.js";
import { api } from "@/lib/api-client";

export interface ScannedBond {
  bondNumber: string;
  denomination: number | null;
  confidence: number;
}

export function useOcr() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ScannedBond[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const scan = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    const objectUrl = URL.createObjectURL(file);
    setImageUrl(objectUrl);

    try {
      const worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const { data } = await worker.recognize(file);

      await worker.terminate();

      // Extract bond numbers from recognized text
      const lines = data.text.split("\n").map((l) => l.trim()).filter(Boolean);
      const bondRegex = /\b(\d{6})\b/g;
      const found: ScannedBond[] = [];

      for (const line of lines) {
        let match;
        while ((match = bondRegex.exec(line)) !== null) {
          found.push({
            bondNumber: match[1],
            denomination: null,
            confidence: 0,
          });
        }
      }

      // Deduplicate
      const seen = new Set<string>();
      const deduped = found.filter((b) => {
        if (seen.has(b.bondNumber)) return false;
        seen.add(b.bondNumber);
        return true;
      });

      setResults(deduped);
    } catch (e) {
      console.error("OCR error:", e);
      throw e;
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
    const saved = [];
    for (const bond of results) {
      if (!bond.denomination) continue;
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

  const reset = useCallback(() => {
    setResults([]);
    setImageUrl(null);
    setProgress(0);
    if (imageUrl) URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  return {
    isProcessing,
    progress,
    results,
    imageUrl,
    scan,
    updateBond,
    removeBond,
    saveBonds,
    reset,
  };
}
