"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/shared/page-transition";
import { BondList } from "@/components/bonds/bond-list";
import { BondDeleteDialog } from "@/components/bonds/bond-delete-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const MOCK_BONDS = Array.from({ length: 50 }, (_, i) => ({
  id: `${i + 1}`,
  bondNumber: `${String(100000 + i * 137).slice(0, 6)}`,
  denomination: ["100", "200", "750", "1500", "7500", "25000"][i % 6],
  addedAt: new Date(2026, 5, 1 - i).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }),
}));

export function BondsPageClient() {
  const router = useRouter();
  const [bonds, setBonds] = useState(MOCK_BONDS);
  const [deletingBond, setDeletingBond] = useState<{
    id: string;
    bondNumber: string;
    denomination: string;
  } | null>(null);

  const handleDelete = (id: string) => {
    const bond = bonds.find((b) => b.id === id);
    if (bond) {
      setDeletingBond({
        id: bond.id,
        bondNumber: bond.bondNumber,
        denomination: bond.denomination,
      });
    }
  };

  const confirmDelete = () => {
    if (deletingBond) {
      setBonds((prev) => prev.filter((b) => b.id !== deletingBond.id));
      setDeletingBond(null);
    }
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className=" text-2xl lg:text-3xl font-bold text-black">
            My Bonds
          </h1>
          <p className="text-sm text-muted mt-1">
            {bonds.length} bonds in your vault
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => router.push("/bonds/add")}
        >
          <PlusCircle className="h-4 w-4" />
          Add Bond
        </Button>
      </div>

      <BondList
        bonds={bonds}
        onDelete={handleDelete}
        onAddNew={() => router.push("/bonds/add")}
      />

      {deletingBond && (
        <BondDeleteDialog
          open={true}
          onClose={() => setDeletingBond(null)}
          onConfirm={confirmDelete}
          bondNumber={deletingBond.bondNumber}
          denomination={`Rs. ${deletingBond.denomination}`}
        />
      )}
    </PageTransition>
  );
}
