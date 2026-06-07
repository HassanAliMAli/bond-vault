"use client";

import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/shared/page-transition";
import { BondForm } from "@/components/bonds/bond-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function AddBondPageClient() {
  const router = useRouter();
  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-6">
        <div><h1 className="text-2xl lg:text-3xl font-bold text-white">Add Bond</h1><p className="text-sm text-gray mt-1">Store a new prize bond in your vault</p></div>
        <Card variant="elevated">
          <CardHeader><CardTitle>Bond Details</CardTitle><CardDescription>Select the denomination and enter the bond number.</CardDescription></CardHeader>
          <CardContent><BondForm onSubmit={(d) => { console.log(d); router.push("/bonds"); }} onCancel={() => router.back()} /></CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
