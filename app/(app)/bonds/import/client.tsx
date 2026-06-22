"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageTransition } from "@/components/shared/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useImportUpload, useImportConfirm, useImportHistory } from "@/hooks/use-imports";
import { useTxtImport } from "@/hooks/use-txt-import";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { DENOMINATION_NUMBERS } from "@/lib/constants";
import { Upload, FileText, Check, X, AlertTriangle, ArrowLeft, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";

export function ImportPageClient() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  const upload = useImportUpload();
  const confirm = useImportConfirm();
  const { data: history } = useImportHistory();
  const txt = useTxtImport();

  const { data: permissions } = useQuery({
    queryKey: ["user", "permissions"],
    queryFn: () => api.user.permissions(),
    staleTime: 60_000,
  });

  const canImport = permissions?.canImport;
  const preview = upload.data;
  const isProcessing = upload.isPending;
  const isConfirming = confirm.isPending;

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".xlsx") && !file.name.endsWith(".txt")) {
      toast.error("Unsupported file type. Please upload a CSV, XLSX, or TXT file.");
      return;
    }

    if (file.name.endsWith(".txt")) {
      const nums = await txt.parseFile(file);
      if (nums.length === 0) {
        toast.error("No valid 6-digit bond numbers found in the file.");
      }
      return;
    }

    let uploadFile = file;
    if (file.name.endsWith(".xlsx")) {
      try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 }) as string[][];
        const csv = rows
          .filter(row => row.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== ""))
          .map(row => row.join(","))
          .join("\n");
        uploadFile = new File([csv], file.name.replace(/\.xlsx$/i, ".csv"), { type: "text/csv" });
      } catch {
        toast.error("Failed to parse XLSX file. Please convert to CSV and try again.");
        return;
      }
    }

    upload.mutate(uploadFile);
  }, [upload, txt]);

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

  const handleConfirm = async () => {
    if (!preview?.importId) return;
    confirm.mutate(preview.importId, {
      onSuccess: (res) => {
        toast.success(res.message);
        upload.reset();
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

  const handleTxtSave = async () => {
    try {
      const result = await txt.save();
      toast.success(`${result.saved} bond${result.saved !== 1 ? "s" : ""} saved!${result.duplicates > 0 ? ` ${result.duplicates} duplicate${result.duplicates !== 1 ? "s" : ""} skipped.` : ""}`);
      txt.reset();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleTxtReset = () => {
    upload.reset();
    txt.reset();
  };

  const DENOMINATIONS_LIST = DENOMINATION_NUMBERS;

  if (canImport === false) {
    return (
      <PageTransition className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Import Bonds</h1>
          <p className="text-sm text-gray mt-1">Bulk-import your prize bond portfolio</p>
        </div>
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
                <Upload className="h-7 w-7 text-gold" />
              </div>
              <div className="text-center max-w-sm">
                <p className="text-base font-medium text-white">Upgrade to Import</p>
                <p className="text-sm text-gray mt-1">Bulk importing bonds requires a paid plan. Upgrade to import your portfolio from CSV or XLSX files.</p>
              </div>
              <Button variant="primary" size="lg" onClick={() => router.push("/settings")}>
                View Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Import Bonds</h1>
          <p className="text-sm text-gray mt-1">Bulk-import your prize bond portfolio</p>
        </div>
        <Button variant="secondary" onClick={() => router.push("/bonds/add")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Add Manually
        </Button>
      </div>

      {!preview && !isProcessing && txt.numbers.length === 0 && !txt.isParsing && (
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
                <Upload className="h-7 w-7 text-gold" />
              </div>
              <div className="text-center">
                <p className="text-base font-medium text-white">Upload a CSV or TXT file</p>
                <p className="text-sm text-gray mt-1">Drag & drop or click to browse</p>
                <p className="text-xs text-dark-500 mt-2">Format: BondNumber, Denomination (one per line)</p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  <Upload className="h-4 w-4 mr-1" /> Choose File
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setShowHistory(!showHistory)}>
                  <FileText className="h-4 w-4 mr-1" /> History
                </Button>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.txt" className="hidden" onChange={onFileChange} />

            <div className="mt-6 space-y-3">
              <div className="p-4 rounded-[var(--radius-md)] bg-dark-800/80 border border-dark-600">
                <p className="text-xs font-medium text-gray uppercase tracking-wider mb-2">CSV Format</p>
                <code className="block text-xs text-gray font-mono bg-dark-900 p-3 rounded-[var(--radius-sm)]">
                  123456, 100{'\n'}
                  789012, 750{'\n'}
                  345678, 1500
                </code>
                <p className="text-xs text-gray mt-2">First column: 6-digit bond number. Second column: denomination (100, 200, 750, 1500, 7500, 25000, 40000).</p>
              </div>
              <div className="p-4 rounded-[var(--radius-md)] bg-dark-800/80 border border-dark-600">
                <p className="text-xs font-medium text-gold uppercase tracking-wider mb-2">TXT Format (one bond per line)</p>
                <code className="block text-xs text-gray font-mono bg-dark-900 p-3 rounded-[var(--radius-sm)]">
                  123456{'\n'}
                  789012{'\n'}
                  345678
                </code>
                <p className="text-xs text-gray mt-2">Each line is one 6-digit bond number. Assign denominations in the preview.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(isProcessing || txt.isParsing) && (
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-gold animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white">Parsing file...</p>
                <p className="text-xs text-gray mt-1">Validating bond numbers and checking for duplicates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {upload.error && (
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-12 h-12 rounded-full bg-red/10 flex items-center justify-center">
                <X className="h-6 w-6 text-red" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white">Upload failed</p>
                <p className="text-xs text-gray mt-1">{upload.error.message}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => upload.reset()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {preview && (
        <>
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gold" />
                Preview
                <span className="text-sm font-normal text-gray ml-auto">{preview.totals.total} records</span>
              </CardTitle>
              <CardDescription>Review the parsed results before saving</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green/10 text-green text-sm">
                    <Check className="h-3.5 w-3.5" />
                    {preview.totals.valid} valid
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red/10 text-red text-sm">
                    <X className="h-3.5 w-3.5" />
                    {preview.totals.invalid} invalid
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow/10 text-yellow text-sm">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {preview.totals.duplicates} duplicates
                  </div>
                </div>

                {preview.preview.valid.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-green uppercase tracking-wider mb-2">Valid Bonds ({preview.preview.valid.length})</p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {preview.preview.valid.map((bn, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded bg-green/5 text-sm font-mono text-white">
                          <Check className="h-3 w-3 text-green shrink-0" />
                          {bn}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {preview.preview.invalid.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-red uppercase tracking-wider mb-2">Invalid Rows ({preview.preview.invalid.length})</p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {preview.preview.invalid.map((line, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded bg-red/5 text-sm font-mono text-gray">
                          <X className="h-3 w-3 text-red shrink-0" />
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {preview.preview.duplicates.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-yellow uppercase tracking-wider mb-2">Duplicate Bonds ({preview.preview.duplicates.length})</p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {preview.preview.duplicates.map((line, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded bg-yellow/5 text-sm font-mono text-gray">
                          <AlertTriangle className="h-3 w-3 text-yellow shrink-0" />
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-3">
            <Button variant="primary" size="lg" onClick={handleConfirm} disabled={isConfirming || preview.totals.valid === 0}>
              <Save className="h-4 w-4 mr-1" />
              {isConfirming ? "Saving..." : `Save ${preview.totals.valid} Bond${preview.totals.valid !== 1 ? "s" : ""}`}
            </Button>
            <Button variant="secondary" size="lg" onClick={() => upload.reset()}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
          </div>

          {confirm.isSuccess && (
            <div className="flex items-center justify-center gap-2 text-sm text-green">
              <Check className="h-4 w-4" /> {confirm.data?.message}
            </div>
          )}
        </>
      )}

      {txt.numbers.length > 0 && (
        <>
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gold" />
                TXT Import
                <span className="text-sm font-normal text-gray ml-auto">{txt.numbers.length} bond{txt.numbers.length !== 1 ? "s" : ""} found</span>
              </CardTitle>
              <CardDescription>Assign denominations, then save your bonds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="text-sm text-gray shrink-0">Preset denomination:</label>
                  <select
                    value={txt.presetDenomination ?? ""}
                    onChange={(e) => {
                      if (e.target.value) txt.applyPresetDenomination(parseInt(e.target.value));
                      else txt.clearPresetDenomination();
                    }}
                    className="w-36 px-2 py-1.5 rounded bg-dark-900 border border-dark-600 text-white text-sm focus:outline-none focus:border-gold/50"
                  >
                    <option value="">-- select --</option>
                    {DENOMINATIONS_LIST.map((d) => (
                      <option key={d} value={d}>Rs. {d.toLocaleString()}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={txt.selected.size === txt.numbers.length && txt.numbers.length > 0}
                      onChange={txt.toggleSelectAll}
                      className="accent-gold"
                    />
                    <span className="text-sm text-white">Select All</span>
                  </label>
                  <span className="text-xs text-gray">{txt.selected.size} of {txt.numbers.length} selected</span>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {txt.numbers.map((num, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-[var(--radius-sm)] border transition-colors",
                        txt.selected.has(i) ? "border-gold/30 bg-gold/5" : "border-dark-600 bg-dark-800/80"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={txt.selected.has(i)}
                        onChange={() => txt.toggleSelect(i)}
                        className="accent-gold shrink-0"
                      />
                      <span className="font-mono text-white flex-1">{num}</span>
                      <select
                        value={txt.denominations[i] ?? ""}
                        onChange={(e) => txt.setDenomination(i, e.target.value ? parseInt(e.target.value) : null)}
                        className={cn(
                          "w-28 px-2 py-1 rounded border text-sm focus:outline-none",
                          txt.denominations[i]
                            ? "bg-dark-900 border-dark-600 text-white focus:border-gold/50"
                            : "bg-dark-900/50 border-red/30 text-gray focus:border-red/50"
                        )}
                      >
                        <option value="">Denom</option>
                        {DENOMINATIONS_LIST.map((d) => (
                          <option key={d} value={d}>Rs. {d.toLocaleString()}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                {txt.selected.size > 0 && (
                  <div className="flex items-center gap-3 p-4 rounded-[var(--radius-md)] bg-gold/5 border border-gold/20">
                    <span className="text-sm text-white font-medium">{txt.selected.size} selected</span>
                    <span className="text-sm text-gray">→ Set denomination:</span>
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) txt.applyBulkDenomination(parseInt(e.target.value));
                      }}
                      className="w-28 px-2 py-1.5 rounded bg-dark-900 border border-dark-600 text-white text-sm focus:outline-none focus:border-gold/50"
                    >
                      <option value="">Select</option>
                      {DENOMINATIONS_LIST.map((d) => (
                        <option key={d} value={d}>Rs. {d.toLocaleString()}</option>
                      ))}
                    </select>
                  </div>
                )}

                {txt.unsetCount > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] bg-yellow/10 text-yellow text-sm">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {txt.unsetCount} bond{txt.unsetCount !== 1 ? "s" : ""} {txt.unsetCount !== 1 ? "need" : "needs"} a denomination before saving
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-3">
            <Button variant="primary" size="lg" onClick={handleTxtSave} disabled={txt.isSaving || txt.unsetCount > 0}>
              <Save className="h-4 w-4 mr-1" />
              {txt.isSaving ? "Saving..." : `Save ${txt.numbers.length} Bond${txt.numbers.length !== 1 ? "s" : ""}`}
            </Button>
            <Button variant="secondary" size="lg" onClick={handleTxtReset}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
          </div>

          {txt.result && (
            <Card variant="elevated">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-2 py-4">
                  <div className="flex items-center gap-2 text-sm text-green">
                    <Check className="h-4 w-4" />{txt.result.saved} bond{txt.result.saved !== 1 ? "s" : ""} saved
                  </div>
                  {txt.result.duplicates > 0 && (
                    <div className="flex items-center gap-2 text-sm text-yellow">
                      <AlertTriangle className="h-4 w-4" />{txt.result.duplicates} duplicate{txt.result.duplicates !== 1 ? "s" : ""} skipped
                    </div>
                  )}
                  {txt.result.invalid > 0 && (
                    <div className="flex items-center gap-2 text-sm text-red">
                      <X className="h-4 w-4" />{txt.result.invalid} invalid
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {showHistory && history && history.imports.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-gold" />
              Import History
            </CardTitle>
            <CardDescription>Your past imports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.imports.slice(0, 10).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 rounded-[var(--radius-sm)] bg-dark-800/80 border border-dark-600 text-sm">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-gray shrink-0" />
                    <div>
                      <p className="text-white font-medium capitalize">{job.fileType}</p>
                      <p className="text-xs text-gray">{new Date(job.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-green">{job.successfulRecords} saved</span>
                    {job.invalidRecords > 0 && <span className="text-red">{job.invalidRecords} invalid</span>}
                    {job.duplicateRecords > 0 && <span className="text-yellow">{job.duplicateRecords} dupes</span>}
                    <span className={cn(
                      "px-2 py-0.5 rounded-full capitalize",
                      job.status === "completed" ? "bg-green/10 text-green" : "bg-gray/10 text-gray"
                    )}>{job.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </PageTransition>
  );
}
