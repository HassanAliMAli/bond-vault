import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark-900">
      <div className="text-center max-w-md">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" className="mx-auto mb-6">
          <circle cx="50" cy="50" r="45" stroke="var(--border)" strokeWidth="1.5" fill="none" />
          <path d="M35 35l30 30M65 35l-30 30" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" />
          <circle cx="50" cy="50" r="18" stroke="#E2B04A" strokeWidth="1.5" fill="none" opacity={0.6} />
        </svg>
        <h1 className="text-4xl font-bold text-white mb-3">404</h1>
        <p className="text-gray text-sm mb-6">This bond number doesn&apos;t exist.</p>
        <Link href="/vault"><Button variant="primary" size="lg">Back to Vault</Button></Link>
      </div>
    </div>
  );
}
