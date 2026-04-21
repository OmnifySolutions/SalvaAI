import Link from "next/link";
import type { Metadata } from "next";
import Logo from "@/components/Logo";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for Salva AI — the AI receptionist platform for dental practices. Read our terms governing use of the platform, subscriptions, and liability.",
  alternates: { canonical: "/terms" },
};

export default function TermsOfServicePage() {
  const effectiveDate = "April 20, 2026";
  const lastUpdated = "April 20, 2026";

  return (
    <div
      className="min-h-screen bg-white text-gray-900"
      style={{ fontFamily: "var(--font-geist-sans)" }}
    >
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="transition-opacity hover:opacity-80">
              <Logo width={110} height={27} />
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
              <Link href="/how-it-works" className="hover:text-gray-800 transition-colors">
                How it works
              </Link>
              <Link href="/pricing" className="hover:text-gray-800 transition-colors">
                Pricing
              </Link>
              <Link href="/faq" className="hover:text-gray-800 transition-colors">
                FAQ
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm text-gray-500 hover:text-gray-800 px-3 py-2 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Get started free
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative bg-gray-950 py-20 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
          <div className="w-[900px] h-[500px] bg-blue-600/10 rounded-full blur-3xl -translate-y-1/4 animate-glow-float" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-blue-300 text-xs font-bold px-3 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            <FileText size={14} />
            Service Terms
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
            Read our terms governing use of the Salva AI platform, subscriptions, and liability.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-sm text-gray-500">
            Effective date: {effectiveDate} · Last updated: {lastUpdated}
          </p>
        </div>

        <div className="prose prose-gray max-w-none text-[15px] leading-relaxed space-y-8">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-600">
              By accessing or using the Salva AI platform (&ldquo;Service&rdquo;), you agree to be
              bound by these Terms of Service (&ldquo;Terms&rdquo;). If you are using the Service
              on behalf of a dental practice or organization, you represent that you have authority
              to bind that organization to these Terms. If you do not agree, do not use the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Description of Service</h2>
            <p className="text-gray-600">
              Salva AI provides an AI-powered receptionist platform for dental practices,
              including:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-2">
              <li>AI chat widget for your practice website.</li>
              <li>AI voice phone answering and call handling.</li>
              <li>Appointment booking assistance and patient inquiry management.</li>
              <li>Dashboard for conversation history, analytics, and settings.</li>
              <li>Integration with practice management software (e.g., Open Dental).</li>
            </ul>
            <p className="text-gray-600 mt-2">
              The Service is a <strong>communication and scheduling aid</strong>. It is not a
              medical device, does not provide clinical advice, and should not be relied upon for
              clinical decision-making.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Accounts &amp; Registration</h2>
            <p className="text-gray-600">
              To use the Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-2">
              <li>Provide accurate and complete registration information.</li>
              <li>Keep your credentials confidential and notify us immediately of unauthorized
                access.</li>
              <li>Be responsible for all activity that occurs under your account.</li>
            </ul>
            <p className="text-gray-600 mt-2">
              We reserve the right to suspend or terminate accounts that violate these Terms or
              are used for fraudulent purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Subscription Plans &amp; Billing</h2>

            <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">4.1 Plans</h3>
            <p className="text-gray-600">
              The Service is offered under the following plans: Free, Basic ($69/month), Pro
              ($219/month), and Multi-Practice ($749/month). Plan features, pricing, and
              interaction limits are described on our{" "}
              <Link href="/pricing" className="text-blue-600 underline hover:text-blue-800">
                Pricing page
              </Link>
              . We reserve the right to modify pricing with 30 days&apos; notice to existing
              subscribers.
            </p>

            <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">4.2 Free Trial</h3>
            <p className="text-gray-600">
              Paid plans include a 14-day free trial. You will not be charged during the trial
              period. If you do not cancel before the trial ends, your subscription will
              automatically convert to a paid plan and you will be billed accordingly.
            </p>

            <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">4.3 Billing</h3>
            <p className="text-gray-600">
              Subscriptions are billed monthly. Payment is processed through Stripe. You authorize
              us to charge your payment method on file for all applicable fees. If payment fails,
              we will attempt to collect and may suspend Service access after 7 days of
              non-payment.
            </p>

            <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">4.4 Cancellation</h3>
            <p className="text-gray-600">
              You may cancel your subscription at any time from your dashboard. Upon cancellation:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-2">
              <li>You retain access to the Service until the end of your current billing
                cycle.</li>
              <li>No partial refunds are issued for unused portions of a billing period.</li>
              <li>Your AI agent will deactivate at the end of the billing cycle.</li>
              <li>You may reactivate your subscription at any time.</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">4.5 Refund Policy</h3>
            <p className="text-gray-600">
              We do not offer refunds for partial months or for months in which the Service was
              available but unused. If you believe you were charged in error, contact us at{" "}
              <a href="mailto:support@getsalvaai.com" className="text-blue-600 underline hover:text-blue-800">
                support@getsalvaai.com
              </a>{" "}
              and we will investigate promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Acceptable Use</h2>
            <p className="text-gray-600">You agree NOT to use the Service to:</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-2">
              <li>Provide or solicit clinical, diagnostic, or medical advice through the AI
                agent.</li>
              <li>Collect Protected Health Information (PHI) through the AI agent.</li>
              <li>Misrepresent the AI as a licensed healthcare professional or a human
                receptionist.</li>
              <li>Send spam, unsolicited messages, or illegal content.</li>
              <li>Attempt to reverse-engineer, decompile, disassemble, exploit, or compromise
                the Service or its underlying technology.</li>
              <li>Use the Service for any purpose not related to legitimate dental practice
                operations.</li>
              <li>Resell, sublicense, or redistribute access to the Service without written
                consent.</li>
              <li>Violate any applicable local, state, or federal law, including
                telecommunications regulations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              5A. Telecommunications Compliance
            </h2>
            <p className="text-gray-600">
              By enabling voice AI features, you acknowledge and agree that:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-2">
              <li>You are solely responsible for ensuring compliance with all applicable
                federal, state, and local laws, including the
                Telephone Consumer Protection Act (TCPA).</li>
              <li>You will not use the Service to make outbound calls, send unsolicited
                text messages, or engage in any form of telemarketing.</li>
              <li>Salva AI shall not be liable for any claims, fines, or penalties arising
                from your failure to comply with applicable telecommunications laws.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. AI Agent Limitations</h2>
            <p className="text-gray-600">
              You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-2">
              <li>The AI agent is an automated system and may occasionally produce inaccurate,
                incomplete, or inappropriate responses.</li>
              <li>You are responsible for reviewing and configuring the AI&apos;s settings,
                including custom instructions, Do&apos;s &amp; Don&apos;ts, and FAQ
                responses.</li>
              <li>The AI agent is not a replacement for trained staff and should be used as a
                supplementary tool.</li>
              <li>Salva AI is not liable for any appointment scheduling errors, missed
                communications, or patient dissatisfaction arising from AI-generated
                responses.</li>
              <li>You should regularly review conversation transcripts to ensure quality.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              7. Practice Management Integrations
            </h2>
            <p className="text-gray-600">
              The Service may integrate with third-party practice management systems such as Open
              Dental. You are responsible for:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-2">
              <li>Providing valid API credentials for connected systems.</li>
              <li>Ensuring you have the right to connect your practice management software to
                third-party services.</li>
              <li>Verifying that appointment data synced through integrations is accurate.</li>
            </ul>
            <p className="text-gray-600 mt-2">
              Salva AI is not responsible for data loss, scheduling conflicts, or system failures
              originating from third-party software.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Intellectual Property</h2>
            <p className="text-gray-600">
              All content, features, and functionality of the Service — including but not limited
              to the software, design, text, graphics, and trademarks — are owned by Salva AI and
              are protected by intellectual property laws. You may not copy, modify, distribute,
              or create derivative works from any part of the Service without our written consent.
            </p>
            <p className="text-gray-600">
              You retain ownership of all practice data, configurations, and content you provide
              to the Service. You grant us a limited license to use this data solely to provide
              and improve the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Privacy</h2>
            <p className="text-gray-600">
              Your use of the Service is also governed by our{" "}
              <Link href="/privacy" className="text-blue-600 underline hover:text-blue-800">
                Privacy Policy
              </Link>
              , which describes how we collect, use, and protect your data. Please review it
              carefully.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              10. Disclaimer of Warranties
            </h2>
            <p className="text-gray-600">
              THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT
              WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
              IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
              NON-INFRINGEMENT.
            </p>
            <p className="text-gray-600">
              We do not warrant that the Service will be uninterrupted, error-free, or free of
              harmful components. We do not guarantee any specific results from use of the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Limitation of Liability</h2>
            <p className="text-gray-600">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, SALVA AI AND ITS OFFICERS, DIRECTORS,
              EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS,
              DATA, BUSINESS OPPORTUNITIES, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH
              YOUR USE OF THE SERVICE.
            </p>
            <p className="text-gray-600">
              OUR TOTAL LIABILITY FOR ANY CLAIM ARISING FROM THESE TERMS OR YOUR USE OF THE
              SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING
              THE CLAIM.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Indemnification</h2>
            <p className="text-gray-600">
              You agree to indemnify and hold harmless Salva AI, its affiliates, officers, and
              employees from any claims, losses, liabilities, damages, or expenses (including
              reasonable attorneys&apos; fees) arising from your use of the Service, violation of
              these Terms, or infringement of any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">13. Termination</h2>
            <p className="text-gray-600">
              We may suspend or terminate your access to the Service at any time, with or without
              cause, and with or without notice. Reasons for termination may include:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-2">
              <li>Violation of these Terms or our Acceptable Use policy.</li>
              <li>Non-payment of subscription fees.</li>
              <li>Extended period of inactivity (12+ months).</li>
              <li>Request by law enforcement or government agency.</li>
            </ul>
            <p className="text-gray-600 mt-2">
              Upon termination, your right to use the Service ceases immediately. Provisions that
              by their nature should survive (including Sections 10, 11, 12, and 15) shall survive
              termination.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">14. Modifications to Terms</h2>
            <p className="text-gray-600">
              We reserve the right to modify these Terms at any time. We will provide notice of
              material changes by email or through the Service dashboard. Continued use of the
              Service after changes take effect constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">15. Governing Law &amp; Disputes</h2>
            <p className="text-gray-600">
              These Terms are governed by and construed in accordance with the laws of the State
              of Delaware, United States, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              15A. Arbitration &amp; Class Action Waiver
            </h2>
            <p className="text-gray-600">
              <strong>PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR LEGAL RIGHTS.</strong>
            </p>
            <p className="text-gray-600">
              You and Salva AI agree that any dispute, claim, or controversy arising out of or
              relating to these Terms or the Service (a &ldquo;Dispute&rdquo;) will be resolved
              through <strong>binding individual arbitration</strong> administered by the American
              Arbitration Association (&ldquo;AAA&rdquo;) under its Commercial Arbitration Rules,
              rather than in court, except that either party may seek injunctive or equitable
              relief in court for intellectual property disputes.
            </p>
            <p className="text-gray-600">
              <strong>Class Action Waiver:</strong> YOU AND SALVA AI AGREE THAT DISPUTES WILL BE
              RESOLVED ON AN INDIVIDUAL BASIS ONLY, AND NOT AS A CLASS ACTION, REPRESENTATIVE
              ACTION, CLASS ARBITRATION, OR ANY SIMILAR PROCEEDING. The arbitrator may not
              consolidate more than one party&apos;s claims.
            </p>
            <p className="text-gray-600">
              <strong>Small Claims Exception:</strong> Either party may bring a qualifying claim
              in small claims court in lieu of arbitration.
            </p>
            <p className="text-gray-600">
              <strong>Opt-Out:</strong> You may opt out of this arbitration provision by sending
              written notice to{" "}
              <a href="mailto:support@getsalvaai.com" className="text-blue-600 underline hover:text-blue-800">
                support@getsalvaai.com
              </a>{" "}
              within 30 days of first accepting these Terms. If you opt out, disputes will be
              resolved in the state or federal courts located in Delaware.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">16. Severability</h2>
            <p className="text-gray-600">
              If any provision of these Terms is found to be unenforceable or invalid by a court
              of competent jurisdiction, that provision shall be limited or eliminated to the
              minimum extent necessary, and the remaining provisions shall remain in full force
              and effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">17. Force Majeure</h2>
            <p className="text-gray-600">
              Salva AI shall not be liable for any failure or delay in performance resulting from
              causes beyond our reasonable control, including but not limited to: acts of God,
              natural disasters, pandemics, war, terrorism, government actions, power failures,
              internet or telecommunications outages, third-party service provider failures, or
              cyberattacks. During such events, our obligations under these Terms will be
              suspended for the duration of the force majeure event.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">18. Entire Agreement</h2>
            <p className="text-gray-600">
              These Terms, together with the{" "}
              <Link href="/privacy" className="text-blue-600 underline hover:text-blue-800">
                Privacy Policy
              </Link>{" "}
              and any executed{" "}
              <Link href="/baa" className="text-blue-600 underline hover:text-blue-800">
                Business Associate Agreement
              </Link>
              , constitute the entire agreement between you and Salva AI regarding your use of
              the Service. They supersede all prior agreements, understandings, and
              communications, whether written or oral, relating to the subject matter herein.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">19. Assignment</h2>
            <p className="text-gray-600">
              You may not assign or transfer these Terms, or any rights or obligations hereunder,
              without the prior written consent of Salva AI. Salva AI may assign these Terms
              without restriction in connection with a merger, acquisition, corporate
              reorganization, or sale of all or substantially all of its assets. Subject to the
              foregoing, these Terms will bind and inure to the benefit of the parties, their
              successors, and permitted assigns.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">20. Waiver</h2>
            <p className="text-gray-600">
              The failure of Salva AI to enforce any right or provision of these Terms shall not
              constitute a waiver of such right or provision. Any waiver of any provision of these
              Terms will be effective only if in writing and signed by Salva AI.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">21. Notices</h2>
            <p className="text-gray-600">
              We may provide notices to you via email to the address associated with your account,
              through the Service dashboard, or by posting on our website. You are responsible for
              keeping your contact information up to date. Notices to Salva AI must be sent to{" "}
              <a href="mailto:support@getsalvaai.com" className="text-blue-600 underline hover:text-blue-800">
                support@getsalvaai.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">22. Contact</h2>
            <p className="text-gray-600">For questions about these Terms, contact us at:</p>
            <ul className="list-none pl-0 text-gray-600 space-y-1 mt-2">
              <li>
                <strong>Email:</strong>{" "}
                <a href="mailto:support@getsalvaai.com" className="text-blue-600 underline hover:text-blue-800">
                  support@getsalvaai.com
                </a>
              </li>
              <li>
                <strong>General inquiries:</strong>{" "}
                <a href="mailto:support@getsalvaai.com" className="text-blue-600 underline hover:text-blue-800">
                  support@getsalvaai.com
                </a>
              </li>
            </ul>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <Logo width={100} height={26} />
          </Link>
          <div className="flex gap-6">
            <Link href="/how-it-works" className="hover:text-gray-600 transition-colors">How it works</Link>
            <Link href="/pricing" className="hover:text-gray-600 transition-colors">Pricing</Link>
            <Link href="/faq" className="hover:text-gray-600 transition-colors">FAQ</Link>
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms</Link>
            <Link href="/baa" className="hover:text-gray-600 transition-colors">BAA</Link>
          </div>
          <span>© {new Date().getFullYear()} Salva AI</span>
        </div>
      </footer>
    </div>
  );
}
