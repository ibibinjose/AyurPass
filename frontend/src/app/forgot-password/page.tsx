"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button, Field, Input } from "@/components/ui";
import { AuthBanner } from "@/components/auth/AuthBanner";
import { MailCheck, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    // Simulate sending recovery email
    setTimeout(() => {
      setBusy(false);
      setSent(true);
    }, 1500);
  };

  return (
    <main className="flex min-h-screen bg-surface">
      <AuthBanner />

      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Logo on mobile only */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo variant="stacked" />
          </div>

          <div className="rounded-3xl border border-hairline bg-surface p-8 shadow-[0_12px_40px_rgba(36,56,46,0.04)]">
            {!sent ? (
              <>
                <h1 className="font-display text-2xl font-semibold text-forest">Reset password</h1>
                <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                  <Field label="Email address">
                    <Input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </Field>

                  <Button type="submit" disabled={busy} className="w-full mt-2">
                    {busy ? "Sending link…" : "Send reset link"}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-leaf/10 text-forest">
                  <MailCheck className="h-6 w-6" />
                </div>
                <h1 className="font-display text-2xl font-semibold text-forest">Check your email</h1>
                <p className="mt-3 text-sm text-ink-secondary leading-relaxed">
                  We've sent a password recovery link to <span className="font-semibold text-foreground">{email}</span>.
                  Please check your inbox and spam folder.
                </p>

                <div className="mt-6 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setSent(false);
                      setBusy(true);
                      setTimeout(() => {
                        setBusy(false);
                        setSent(true);
                      }, 1000);
                    }}
                    className="text-xs font-semibold text-forest hover:underline focus:outline-none"
                  >
                    Didn't receive email? Click to resend
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-forest transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
