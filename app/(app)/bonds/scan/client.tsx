"use client";

import { useState, useRef, useCallback } from "react";
import { PageTransition } from "@/components/shared/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOcr } from "@/hooks/use-ocr";
import { Camera, Upload, ScanLine, X, Save, Check, AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const DENOMINATIONS = [100, 200, 750, 1500, 7500, 25000, 40000] as const;

export function ScanPageClient() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isProcessing, progress, results, imageUrl, recordingError, scan, updateBond, removeBond, saveBonds, retry, reset } = useOcr();
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setSavedCount(0);
    try {
      await scan(file);
    } catch {
      // error handled by UI
    }
  }, [scan]);

  const onFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [handleFile]);

  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await handleFile(file);
  }, [handleFile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await saveBonds();
      setSavedCount(saved.length);
    } finally {
      setSaving(false);
    }
  };

  const hasUnreviewedLowConfidence = results.some(
    (b) => (b.confidence === null || b.confidence < 50) && !b.reviewed
  );

  const canSave = results.length > 0 && results.some((b) => b.denomination) && !hasUnreviewedLowConfidence;

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Scan Bonds</h1>
        <p className="text-sm text-gray mt-1">Upload an image of your prize bond to extract its number</p>
      </div>

      {/* Upload area */}
      {!imageUrl && !recordingError && (
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={cn(
                "flex flex-col items-center gap-4 py-12 px-6 rounded-[var(--radius-lg)] border-2 border-dashed transition-colors cursor-pointer",
                dragOver ? "border-gold bg-gold/5" : "border-dark-600 hover:border-dark-500 bg-dark-800/50"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
                <Camera className="h-7 w-7 text-gold" />
              </div>
              <div className="text-center">
                <p className="text-base font-medium text-white">Upload a bond image</p>
                <p className="text-sm text-gray mt-1">Drag & drop or click to browse</p>
                <p className="text-xs text-dark-500 mt-2">Supports JPG, PNG — best results with clear, well-lit photos</p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  <Upload className="h-4 w-4 mr-1" /> Choose Image
                </Button>
                <Button variant="secondary" size="sm" disabled>
                  <Camera className="h-4 w-4 mr-1" /> Use Camera
                </Button>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFileChange} />
          </CardContent>
        </Card>
      )}

      {/* Processing */}
      {isProcessing && (
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                <ScanLine className="h-6 w-6 text-gold animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white">Scanning bond numbers...</p>
                <p className="text-xs text-gray mt-1">Tesseract.js is processing your image in the browser</p>
              </div>
              <div className="w-48 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-dark-500">{progress}%</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recording error */}
      {recordingError && (
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-12 h-12 rounded-full bg-red/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white">Scan could not be recorded</p>
                <p className="text-xs text-red mt-1">{recordingError}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={reset}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No bonds found */}
      {!isProcessing && imageUrl && results.length === 0 && !recordingError && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Scanned Image</CardTitle>
            </CardHeader>
            <CardContent>
              {/* eslint-disable-next-line @next/next/no-img-element -- blob URL */}
              <img src={imageUrl} alt="Scanned bond" className="w-full rounded-[var(--radius-md)] object-contain max-h-80" />
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-12 h-12 rounded-full bg-amber/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-amber" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white">No bonds found</p>
                  <p className="text-xs text-gray mt-1 max-w-sm">
                    No 6-digit bond numbers were detected. Try a clearer image or upload a different photo.
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="secondary" size="sm" onClick={retry} disabled={isProcessing}>
                    <RefreshCw className="h-3 w-3 mr-1" /> Retry OCR
                  </Button>
                  <Button variant="secondary" size="sm" onClick={reset}>
                    Try Another Image
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && !isProcessing && !recordingError && (
        <>
          {/* Preview + results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {imageUrl && (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">Scanned Image</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* eslint-disable-next-line @next/next/no-img-element -- blob URL */}
                  <img
                    src={imageUrl}
                    alt="Scanned bond"
                    className={cn(
                      "w-full rounded-[var(--radius-md)] object-contain max-h-80 transition-all",
                      hasUnreviewedLowConfidence && "ring-2 ring-red/40"
                    )}
                  />
                </CardContent>
              </Card>
            )}

            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ScanLine className="h-5 w-5 text-gold" />
                  Extracted Numbers
                  <span className="text-sm font-normal text-gray ml-auto">{results.length} found</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {results.map((bond, i) => {
                    const isLowConfidence = bond.confidence !== null && bond.confidence < 50;
                    const isUncertain = bond.confidence === null;
                    const needsReview = (isLowConfidence || isUncertain) && !bond.reviewed;

                    return (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-[var(--radius-sm)] bg-dark-800/80 border",
                          needsReview ? "border-red/40" : "border-dark-600"
                        )}
                      >
                        {/* Confidence badge */}
                        {bond.confidence !== null && (
                          <span
                            className={cn(
                              "shrink-0 text-xs font-medium px-1.5 py-0.5 rounded flex items-center gap-1",
                              bond.confidence >= 50
                                ? "bg-green/10 text-green"
                                : "bg-red/10 text-red"
                            )}
                          >
                            {bond.confidence >= 50 ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <AlertTriangle className="h-3 w-3" />
                            )}
                            {bond.confidence}%
                          </span>
                        )}

                        {!needsReview ? (
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={bond.bondNumber}
                                onChange={(e) => updateBond(i, { bondNumber: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                                className="w-28 px-2 py-1 rounded bg-dark-900 border border-dark-600 text-white text-sm font-mono focus:outline-none focus:border-gold/50"
                                maxLength={6}
                              />
                              <select
                                value={bond.denomination ?? ""}
                                onChange={(e) => updateBond(i, { denomination: e.target.value ? parseInt(e.target.value) : null })}
                                className="px-2 py-1 rounded bg-dark-900 border border-dark-600 text-white text-sm focus:outline-none focus:border-gold/50"
                              >
                                <option value="">Denom</option>
                                {DENOMINATIONS.map((d) => (
                                  <option key={d} value={d}>Rs. {d.toLocaleString()}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-white text-sm">{bond.bondNumber}</span>
                              <span className="text-xs text-red">Needs verification</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => updateBond(i, { reviewed: true })}
                              >
                                Enter Manually
                              </Button>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => removeBond(i)}
                          className="shrink-0 p-1.5 rounded-md hover:bg-red/10 text-gray hover:text-red transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3">
            <Button variant="primary" size="lg" onClick={handleSave} disabled={saving || !canSave}>
              <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save to My Bonds"}
            </Button>
            <Button variant="secondary" size="lg" onClick={retry} disabled={isProcessing}>
              <RefreshCw className="h-4 w-4 mr-1" /> Retry OCR
            </Button>
            <Button variant="secondary" size="lg" onClick={reset}>
              <X className="h-4 w-4 mr-1" /> Start Over
            </Button>
          </div>

          {savedCount > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-green">
              <Check className="h-4 w-4" /> {savedCount} bond{savedCount !== 1 ? "s" : ""} added successfully
            </div>
          )}
        </>
      )}
    </PageTransition>
  );
}
