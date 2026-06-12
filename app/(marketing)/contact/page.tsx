"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, MessageSquare, Send } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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

      <section className="max-w-2xl mx-auto px-4 py-20">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="h-8 w-8 text-gold" />
          <h1 className="text-3xl font-bold text-white">Contact Us</h1>
        </div>
        <p className="text-gray mb-8">Have a question or need help? Send us a message and we will get back to you.</p>
        {submitted ? (
          <div className="p-8 rounded-[var(--radius-lg)] bg-dark-800/50 border border-dark-600 text-center">
            <Mail className="h-12 w-12 text-gold mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Message Sent!</h2>
            <p className="text-gray mb-6">Thank you for reaching out. We will respond within 24 hours.</p>
            <Link href="/"><Button variant="primary">Back to Home</Button></Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium text-white mb-2">Name</label><Input placeholder="Your name" required /></div>
            <div><label className="block text-sm font-medium text-white mb-2">Email</label><Input type="email" placeholder="your@email.com" required /></div>
            <div><label className="block text-sm font-medium text-white mb-2">Message</label><textarea className="w-full h-32 px-4 py-3 rounded-[var(--radius-sm)] border border-dark-600 bg-dark-800 text-white placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none" placeholder="How can we help?" required /></div>
            <Button variant="primary" type="submit" className="w-full"><Send className="h-4 w-4" />Send Message</Button>
          </form>
        )}
      </section>
    </div>
  );
}
