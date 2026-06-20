"use client";

import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/shared/page-transition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useExportCsv } from "@/hooks/use-imports";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Download, FileText, ArrowLeft } from "lucide-react";

export function ExportPageClient() {
  const router = useRouter();
  const exportCsv = useExportCsv();

  const { data: permissions } = useQuery({
    queryKey: ["user", "permissions"],
    queryFn: () => api.user.permissions(),
    staleTime: 60_000,
  });

  const canExport = permissions?.canExport;

  if (canExport === false) {
    return (
      <PageTransition className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Export Portfolio</h1>
          <p className="text-sm text-gray mt-1">Download your bonds as a file</p>
        </div>
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
                <Download className="h-7 w-7 text-gold" />
              </div>
              <div className="text-center max-w-sm">
                <p className="text-base font-medium text-white">Upgrade to Export</p>
                <p className="text-sm text-gray mt-1">Exporting your portfolio requires a paid plan. Upgrade to download CSV files.</p>
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
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Export Portfolio</h1>
          <p className="text-sm text-gray mt-1">Download your bonds as a file</p>
        </div>
        <Button variant="secondary" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
      </div>

      <div className="max-w-md mx-auto">
        <Card variant="elevated" className="cursor-pointer hover:border-gold/30 transition-colors" onClick={() => exportCsv.mutate()}>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
                <FileText className="h-7 w-7 text-gold" />
              </div>
              <div className="text-center">
                <p className="text-base font-medium text-white">CSV Format</p>
                <p className="text-sm text-gray mt-1">Comma-separated values, openable in any spreadsheet application</p>
              </div>
              <Button variant="primary" size="lg" loading={exportCsv.isPending} onClick={(e) => { e.stopPropagation(); exportCsv.mutate(); }}>
                <Download className="h-4 w-4 mr-1" /> Download CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
