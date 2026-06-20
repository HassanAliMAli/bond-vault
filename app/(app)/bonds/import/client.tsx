"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageTransition } from "@/components/shared/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useImportUpload, useImportConfirm, useImportHistory } from "@/hooks/use-imports";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
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
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".xlsx")) {
      toast.error("Unsupported file type. Please upload a CSV or XLSX file.");
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
  }, [upload]);

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
          <p className="text-sm text-gray mt-1">Bulk-import your prize bond portfolio from a CSV file</p>
        </div>
        <Button variant="secondary" onClick={() => router.push("/bonds/add")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Add Manually
        </Button>
      </div>

      {!preview && !isProcessing && (
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
                <p className="text-base font-medium text-white">Upload a CSV file</p>
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
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={onFileChange} />

            <div className="mt-6 p-4 rounded-[var(--radius-md)] bg-dark-800/80 border border-dark-600">
              <p className="text-xs font-medium text-gray uppercase tracking-wider mb-2">CSV Format</p>
              <code className="block text-xs text-gray font-mono bg-dark-900 p-3 rounded-[var(--radius-sm)]">
                123456, 100{'\n'}
                789012, 750{'\n'}
                345678, 1500
              </code>
              <p className="text-xs text-gray mt-2">First column: 6-digit bond number. Second column: denomination (100, 200, 750, 1500, 7500, 25000, 40000).</p>
            </div>
          </CardContent>
        </Card>
      )}

      {isProcessing && (
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
