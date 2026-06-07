"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function GlobalErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <ErrorState
        title="Something went wrong"
        description="We encountered an unexpected error. Please try again or go back to your vault."
        onRetry={reset}
        action={{
          label: "Go to Vault",
          onClick: () => (window.location.href = "/vault"),
        }}
      />
    </div>
  );
}
