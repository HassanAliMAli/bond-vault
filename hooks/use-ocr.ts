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

export function useOcr() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ScannedBond[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
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

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setImageUrl(objectUrl);
    fileRef.current = file;

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

      const seen = new Map<string, ScannedBond>();
      let wordMatchCount = 0;

      const allWords: Array<{ text: string; confidence: number }> = [];
      for (const block of data.blocks ?? []) {
        for (const paragraph of block.paragraphs) {
          for (const line of paragraph.lines) {
            for (const word of line.words) {
              allWords.push({ text: word.text, confidence: word.confidence });
            }
          }
        }
      }

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
    scan,
    updateBond,
    removeBond,
    saveBonds,
    retry,
    reset,
  };
}
