"use client";

import { useState } from "react";
import { PageTransition } from "@/components/shared/page-transition";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { formatDrawDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { DENOMINATION_NUMBERS } from "@/lib/constants";
import { useAdminDraws, useCreateDraw, useUploadDrawPdf, useAddWinners, useGenerateMatches, type Draw } from "@/hooks/use-admin";
import { Plus, Search, Upload, Award, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";

const VALID_PRIZE_TYPES = ["1st Prize", "2nd Prize", "3rd Prize"];
const PAGE_SIZE = 20;

export function AdminDrawsClient() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useAdminDraws(search || undefined, page);
  const createDraw = useCreateDraw();
  const uploadPdf = useUploadDrawPdf();
  const addWinners = useAddWinners();
  const generateMatches = useGenerateMatches();
  const totalPages = data ? Math.ceil((data.total ?? 0) / PAGE_SIZE) : 0;

  const [showCreate, setShowCreate] = useState(false);
  const [newDraw, setNewDraw] = useState({ denomination: 100, drawNumber: "", drawDate: "", source: "" });
  const [addingWinnersFor, setAddingWinnersFor] = useState<string | null>(null);
  const [winnersText, setWinnersText] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleCreate = async () => {
    try {
      await createDraw.mutateAsync(newDraw);
      setShowCreate(false);
      setNewDraw({ denomination: 100, drawNumber: "", drawDate: "", source: "" });
      setPage(1);
      toast.success("Draw created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create draw");
    }
  };

  const handleUploadPdf = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setActionLoading(`pdf-${id}`);
    try {
      await uploadPdf.mutateAsync({ id, file });
      toast.success("PDF uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload PDF");
    } finally {
      setActionLoading(null);
      e.target.value = "";
    }
  };

  const handleAddWinners = async (id: string) => {
    const lines = winnersText.trim().split("\n").filter(Boolean);
    const winners = lines.map(line => {
      const parts = line.split(",").map(s => s.trim());
      const prizeType = VALID_PRIZE_TYPES.includes(parts[1]?.trim()) ? parts[1].trim() : "1st Prize";
      return {
        bondNumber: parts[0] || "",
        prizeType,
        prizeAmount: Number(parts[2]) || 0,
      };
    }).filter(w => w.bondNumber);

    if (!winners.length) {
      toast.error("No valid winners found. Use format: bondNumber, prizeType, prizeAmount");
      return;
    }

    const skipped = lines.length - winners.length;
    try {
      await addWinners.mutateAsync({ id, winners });
      setAddingWinnersFor(null);
      setWinnersText("");
      toast.success(`${winners.length} winner(s) added${skipped > 0 ? ` (${skipped} line(s) skipped)` : ""}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add winners");
    }
  };

  const handleGenerateMatches = async (id: string) => {
    if (!confirm("Generate matches for this draw? This may take a moment.")) return;
    setActionLoading(`gen-${id}`);
    try {
      await generateMatches.mutateAsync(id);
      toast.success("Matches generated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate matches");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Draws</h1>
          <p className="text-sm text-gray mt-1">Manage prize bond draws, upload results, and generate matches</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" /> New Draw
        </Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray" />
        <input
          type="text" placeholder="Search by draw number..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2 rounded-[var(--radius-sm)] bg-dark-800 border border-dark-600 text-white placeholder-gray text-sm focus:outline-none focus:border-gold/50 transition-colors"
        />
      </div>

      {isLoading ? (
        <div className="rounded-[var(--radius-md)] bg-dark-800 border border-dark-600 p-6">
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-dark-700 rounded-[var(--radius-sm)] animate-pulse" />)}
          </div>
        </div>
      ) : isError ? (
        <ErrorState title="Could not load draws" onRetry={() => refetch()} />
      ) : !data?.draws.length ? (
        <EmptyState title="No draws yet" description={search ? "No draws matching your search" : "Create your first prize bond draw"} action={search ? undefined : { label: "New Draw", onClick: () => setShowCreate(true) }} />
      ) : (
        <div className="space-y-4">
          {data.draws.map((draw: Draw) => (
            <div key={draw.id} className="rounded-[var(--radius-md)] bg-dark-800 border border-dark-600 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Draw #{draw.drawNumber}</h3>
                  <p className="text-sm text-gray mt-1">
                    Rs. {draw.denomination.toLocaleString()} | {formatDrawDate(draw.drawDate)}
                    {draw.source ? ` | ${draw.source}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <label className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-dark-700 text-gray hover:text-white text-sm transition-colors border border-dark-600 ${actionLoading === `pdf-${draw.id}` ? "opacity-40 pointer-events-none" : ""}`}>
                  <input type="file" accept=".pdf" className="hidden" onChange={e => handleUploadPdf(draw.id, e)} disabled={actionLoading === `pdf-${draw.id}`} />
                  {actionLoading === `pdf-${draw.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  {draw.pdfR2Key ? "Re-upload PDF" : "Upload PDF"}
                </label>
                <button onClick={() => setAddingWinnersFor(draw.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-dark-700 text-gray hover:text-white text-sm transition-colors border border-dark-600">
                  <Award className="h-3.5 w-3.5" /> Add Winners
                </button>
                <button
                  onClick={() => handleGenerateMatches(draw.id)}
                  disabled={actionLoading === `gen-${draw.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-dark-700 text-gray hover:text-white text-sm transition-colors border border-dark-600 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {actionLoading === `gen-${draw.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                  Generate Matches
                </button>
              </div>

              {addingWinnersFor === draw.id && (
                <div className="mt-4 p-4 rounded-[var(--radius-sm)] bg-dark-900/50 border border-dark-600">
                  <p className="text-sm text-gray mb-2">Enter winners (one per line: bondNumber, prizeType, prizeAmount)</p>
                  <textarea
                    value={winnersText}
                    onChange={e => setWinnersText(e.target.value)}
                    className="w-full h-24 px-3 py-2 rounded-[var(--radius-sm)] bg-dark-800 border border-dark-600 text-white text-sm focus:outline-none focus:border-gold/50"
                    placeholder="123456, 1st Prize, 1000000&#10;789012, 2nd Prize, 500000"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <Button size="sm" variant="primary" onClick={() => handleAddWinners(draw.id)} loading={addWinners.isPending}>Save Winners</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setAddingWinnersFor(null); setWinnersText(""); }}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 rounded-[var(--radius-md)] bg-dark-800 border border-dark-600">
              <span className="text-sm text-gray">{data?.total ?? 0} total</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray">Page {page} of {totalPages}</span>
                <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowCreate(false)}>
          <div className="bg-dark-800 border border-dark-600 rounded-[var(--radius-md)] p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-4">Create New Draw</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray mb-1 block">Denomination (Rs.)</label>
                <select value={newDraw.denomination} onChange={e => setNewDraw({ ...newDraw, denomination: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-[var(--radius-sm)] bg-dark-900 border border-dark-600 text-white text-sm focus:outline-none focus:border-gold/50">
                  {DENOMINATION_NUMBERS.map(d => (
                    <option key={d} value={d}>Rs. {d.toLocaleString()}</option>
                  ))}
                </select>
              </div>
              <Input label="Draw Number" value={newDraw.drawNumber} onChange={e => setNewDraw({ ...newDraw, drawNumber: e.target.value })} placeholder="e.g. 98" />
              <Input label="Draw Date" type="date" value={newDraw.drawDate} onChange={e => setNewDraw({ ...newDraw, drawDate: e.target.value })} />
              <Input label="Source (optional)" value={newDraw.source} onChange={e => setNewDraw({ ...newDraw, source: e.target.value })} placeholder="e.g. SBP" />
              <div className="flex items-center gap-2 pt-2">
                <Button variant="primary" onClick={handleCreate} loading={createDraw.isPending}>Create Draw</Button>
                <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
