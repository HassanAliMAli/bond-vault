"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageTransition } from "@/components/shared/page-transition";
import { BondForm } from "@/components/bonds/bond-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCreateBond } from "@/hooks/use-bonds";
import { ScanLine, Upload } from "lucide-react";

export function AddBondPageClient() {
  const router = useRouter();
  const createBond = useCreateBond();

  const handleSubmit = (data: { denomination: string; bondNumber: string }) => {
    createBond.mutate(
      { bondNumber: data.bondNumber, denomination: parseInt(data.denomination) },
      {
        onSuccess: () => {
          toast.success("Bond added to your vault");
          router.push("/bonds");
        },
        onError: (err) => {
          toast.error(err.message);
        },
      }
    );
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl lg:text-3xl font-bold text-white">Add Bond</h1><p className="text-sm text-gray mt-1">Store a new prize bond in your vault</p></div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => router.push("/bonds/import")}>
              <Upload className="h-4 w-4 mr-1" /> Import
            </Button>
            <Button variant="secondary" onClick={() => router.push("/bonds/scan")}>
              <ScanLine className="h-4 w-4 mr-1" /> Scan
            </Button>
          </div>
        </div>
        <Card variant="elevated">
          <CardHeader><CardTitle>Bond Details</CardTitle><CardDescription>Select the denomination and enter the bond number.</CardDescription></CardHeader>
          <CardContent><BondForm onSubmit={handleSubmit} onCancel={() => router.back()} /></CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
