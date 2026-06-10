"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageTransition } from "@/components/shared/page-transition";
import { BondForm } from "@/components/bonds/bond-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCreateBond } from "@/hooks/use-bonds";

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
        <div><h1 className="text-2xl lg:text-3xl font-bold text-white">Add Bond</h1><p className="text-sm text-gray mt-1">Store a new prize bond in your vault</p></div>
        <Card variant="elevated">
          <CardHeader><CardTitle>Bond Details</CardTitle><CardDescription>Select the denomination and enter the bond number.</CardDescription></CardHeader>
          <CardContent><BondForm onSubmit={handleSubmit} onCancel={() => router.back()} /></CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
