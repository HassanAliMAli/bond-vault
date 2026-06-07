import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--background)]">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            fill="none"
            className="mx-auto mb-6"
          >
            <circle cx="50" cy="50" r="45" stroke="var(--border)" strokeWidth="1.5" fill="var(--surface)" />
            <path
              d="M35 35l30 30M65 35l-30 30"
              stroke="var(--muted)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="50" cy="50" r="18" stroke="#00F0FF" strokeWidth="1.5" fill="none" opacity="0.6" />
          </svg>
          <h1 className=" text-4xl font-bold text-black mb-3">
            404
          </h1>
          <p className="text-muted text-sm mb-4">
            This bond number doesn&apos;t exist. The page you&apos;re looking
            for has been moved or doesn&apos;t exist.
          </p>
        </div>
        <Link href="/vault">
          <Button variant="primary" size="lg">
            Back to Vault
          </Button>
        </Link>
      </div>
    </div>
  );
}
