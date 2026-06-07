"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function GlobalErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900">
      <ErrorState title="Something went wrong" description="We encountered an unexpected error." onRetry={reset}
        action={{ label: "Go to Vault", onClick: () => (window.location.href = "/vault") }} />
    </div>
  );
}
