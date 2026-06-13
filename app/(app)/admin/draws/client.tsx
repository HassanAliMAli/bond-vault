"use client";

import { useState } from "react";
import { PageTransition } from "@/components/shared/page-transition";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminDraws, useCreateDraw, useUploadDrawPdf, useAddWinners, useGenerateMatches, type Draw } from "@/hooks/use-admin";
import { Plus, Upload, Award, Zap } from "lucide-react";

export function AdminDrawsClient() {
  const { data, isLoading, isError, refetch } = useAdminDraws();
  const createDraw = useCreateDraw();
  const uploadPdf = useUploadDrawPdf();
  const addWinners = useAddWinners();
  const generateMatches = useGenerateMatches();

  const [showCreate, setShowCreate] = useState(false);
  const [newDraw, setNewDraw] = useState({ denomination: 100, drawNumber: "", drawDate: "", source: "" });
  const [addingWinnersFor, setAddingWinnersFor] = useState<string | null>(null);
  const [winnersText, setWinnersText] = useState("");

  const handleCreate = async () => {
    await createDraw.mutateAsync(newDraw);
    setShowCreate(false);
    setNewDraw({ denomination: 100, drawNumber: "", drawDate: "", source: "" });
  };

  const handleUploadPdf = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadPdf.mutateAsync({ id, file });
  };

  const handleAddWinners = async (id: string) => {
    const lines = winnersText.trim().split("\n").filter(Boolean);
    const winners = lines.map(line => {
      const [bondNumber, prizeType, prizeAmount] = line.split(",").map(s => s.trim());
      return { bondNumber, prizeType: prizeType || "1st Prize", prizeAmount: Number(prizeAmount) || 0 };
    });
    await addWinners.mutateAsync({ id, winners });
    setAddingWinnersFor(null);
    setWinnersText("");
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

      {isLoading ? (
        <div className="rounded-[var(--radius-md)] bg-dark-800 border border-dark-600 p-6">
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-dark-700 rounded-[var(--radius-sm)] animate-pulse" />)}
          </div>
        </div>
      ) : isError ? (
        <ErrorState title="Could not load draws" onRetry={() => refetch()} />
      ) : !data?.draws.length ? (
        <EmptyState title="No draws yet" description="Create your first prize bond draw" action={{ label: "New Draw", onClick: () => setShowCreate(true) }} />
      ) : (
        <div className="space-y-4">
          {data.draws.map((draw: Draw) => (
            <div key={draw.id} className="rounded-[var(--radius-md)] bg-dark-800 border border-dark-600 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Draw #{draw.drawNumber}</h3>
                  <p className="text-sm text-gray mt-1">
                    Rs. {draw.denomination.toLocaleString()} | {new Date(draw.drawDate).toLocaleDateString()}
                    {draw.source ? ` | ${draw.source}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <label className="cursor-pointer">
                  <input type="file" accept=".pdf" className="hidden" onChange={e => handleUploadPdf(draw.id, e)} />
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-dark-700 text-gray hover:text-white text-sm transition-colors border border-dark-600">
                    <Upload className="h-3.5 w-3.5" /> {draw.pdfR2Key ? "Re-upload PDF" : "Upload PDF"}
                  </span>
                </label>
                <button onClick={() => setAddingWinnersFor(draw.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-dark-700 text-gray hover:text-white text-sm transition-colors border border-dark-600">
                  <Award className="h-3.5 w-3.5" /> Add Winners
                </button>
                <button onClick={() => { if (confirm("Generate matches for this draw?")) generateMatches.mutate(draw.id); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-dark-700 text-gray hover:text-white text-sm transition-colors border border-dark-600">
                  <Zap className="h-3.5 w-3.5" /> Generate Matches
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
                  {[100, 200, 750, 1500, 7500, 15000, 28000, 40000].map(d => (
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
