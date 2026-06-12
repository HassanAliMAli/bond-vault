import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-dark-600">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">BondVault</Link>
          <div className="flex items-center gap-4">
            <Link href="/login"><Button variant="ghost">Login</Button></Link>
            <Link href="/register"><Button variant="primary">Get Started</Button></Link>
          </div>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-gray">
          <p>Last updated: June 2026</p>
          <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
          <p>By using BondVault, you agree to these terms of service. If you do not agree, do not use our service.</p>
          <h2 className="text-xl font-semibold text-white">2. Service Description</h2>
          <p>BondVault provides a digital portfolio management platform for Pakistani Prize Bonds. We do not provide financial advice or guarantee any prize bond winnings.</p>
          <h2 className="text-xl font-semibold text-white">3. User Responsibilities</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
          <h2 className="text-xl font-semibold text-white">4. Subscription and Payments</h2>
          <p>Premium features require an active subscription. Payments are processed through our manual verification system. Refund requests are handled on a case-by-case basis.</p>
          <h2 className="text-xl font-semibold text-white">5. Limitation of Liability</h2>
          <p>BondVault is provided as-is without warranty. We are not liable for any financial losses or missed winnings resulting from the use of our service.</p>
          <h2 className="text-xl font-semibold text-white">6. Termination</h2>
          <p>We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.</p>
          <h2 className="text-xl font-semibold text-white">7. Changes to Terms</h2>
          <p>We may update these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
        </div>
      </section>
    </div>
  );
}
