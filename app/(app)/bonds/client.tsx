"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/shared/page-transition";
import { BondList } from "@/components/bonds/bond-list";
import { BondDeleteDialog } from "@/components/bonds/bond-delete-dialog";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { useBonds, useDeleteBond } from "@/hooks/use-bonds";
import { PlusCircle } from "lucide-react";

export function BondsPageClient() {
  const router = useRouter();
  const [denomination, setDenomination] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<string>("newest");
  const [deletingBond, setDeletingBond] = useState<{ id: string; bondNumber: string; denomination: number } | null>(null);

  const { data, isLoading, isError, refetch } = useBonds({ denomination, search });
  const deleteBond = useDeleteBond();

  const bonds = data?.bonds ?? [];
  const total = data?.total ?? 0;

  const handleDelete = () => {
    if (!deletingBond) return;
    deleteBond.mutate(deletingBond.id, {
      onSuccess: () => setDeletingBond(null),
    });
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl lg:text-3xl font-bold text-white">My Bonds</h1><p className="text-sm text-gray mt-1">{total} bonds in your vault</p></div>
        <Button variant="primary" size="lg" onClick={() => router.push("/bonds/add")}><PlusCircle className="h-4 w-4" />Add Bond</Button>
      </div>
      {isError ? (
        <ErrorState title="Could not load bonds" description="Something went wrong." onRetry={() => refetch()} />
      ) : (
        <BondList
          bonds={bonds.map((b) => ({
            id: b.id,
            bondNumber: b.bondNumber,
            denomination: b.denomination,
            addedAt: new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          }))}
          onDelete={(id) => {
            const bond = bonds.find((b) => b.id === id);
            if (bond) setDeletingBond({ id: bond.id, bondNumber: bond.bondNumber, denomination: bond.denomination });
          }}
          onAddNew={() => router.push("/bonds/add")}
        />
      )}
      {deletingBond && (
        <BondDeleteDialog
          open={true}
          onClose={() => setDeletingBond(null)}
          onConfirm={handleDelete}
          loading={deleteBond.isPending}
          bondNumber={deletingBond.bondNumber}
          denomination={`Rs. ${deletingBond.denomination}`}
        />
      )}
    </PageTransition>
  );
}
