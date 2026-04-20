import Link from "next/link";
import type { Metadata } from "next";
import Logo from "@/components/Logo";
import { ShieldCheck, FileText, Mail, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Business Associate Agreement (BAA)",
  description:
    "Salva AI offers HIPAA-aligned Business Associate Agreements for dental practices on Pro and Multi-Practice plans. Learn about our compliance posture and how to request a BAA.",
  alternates: { canonical: "/baa" },
};

export default function BAAPage() {
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
            <ShieldCheck size={14} />
            HIPAA Compliance
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Business Associate Agreement
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
            We take patient privacy seriously. Learn about our HIPAA compliance posture and how to
            request a BAA for your practice.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="space-y-12">
          {/* What is a BAA */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is a BAA?</h2>
            <p className="text-gray-600 leading-relaxed">
              A Business Associate Agreement (BAA) is a legally binding contract required under
              HIPAA between a healthcare provider (the &ldquo;Covered Entity&rdquo;) and a
              vendor (the &ldquo;Business Associate&rdquo;) that may access, process, or store
              Protected Health Information (PHI) on the provider&apos;s behalf.
            </p>
            <p className="text-gray-600 leading-relaxed mt-3">
              While Salva AI is designed to <strong>avoid collecting PHI</strong>, we understand
              that some practices require a BAA as part of their compliance framework. We are
              happy to execute one for eligible plans.
            </p>
          </section>

          {/* How Salva handles data */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How Salva AI Handles Patient Data
            </h2>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">No PHI collection by design</p>
                  <p className="text-gray-500 text-sm">
                    Our AI agents are specifically instructed to never ask for or record clinical
                    information, diagnoses, treatment histories, or health conditions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Conversation data is limited</p>
                  <p className="text-gray-500 text-sm">
                    AI conversations capture general inquiries only — scheduling preferences,
                    insurance plan names, office hours questions, and callback requests.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Clinical redirects</p>
                  <p className="text-gray-500 text-sm">
                    When patients bring up clinical concerns, the AI redirects them to contact the
                    practice directly. It does not attempt to provide medical advice.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Encryption everywhere</p>
                  <p className="text-gray-500 text-sm">
                    All data is encrypted in transit (TLS 1.2+) and at rest (AES-256). Data is
                    stored on US-based servers.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Access controls</p>
                  <p className="text-gray-500 text-sm">
                    Only you and authorized team members can access your practice&apos;s
                    conversation data. Salva AI employees access data only for support purposes
                    with appropriate controls.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Minimum Necessary Standard */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Minimum Necessary Standard
            </h2>
            <p className="text-gray-600 leading-relaxed">
              In accordance with the HIPAA Minimum Necessary Rule, Salva AI limits the information
              it accesses, uses, and discloses to the minimum amount necessary to accomplish the
              intended purpose. Our AI agents are programmed to collect only scheduling,
              contact, and general inquiry information — never clinical data, diagnoses, or
              treatment details.
            </p>
            <p className="text-gray-600 leading-relaxed mt-3">
              In the event that a patient inadvertently discloses PHI during a conversation, the
              AI is configured to redirect the conversation and advise the patient to contact the
              practice directly. Any inadvertently received PHI is treated with the same
              protections outlined in the BAA and is not used for any purpose beyond the immediate
              conversation context.
            </p>
          </section>

          {/* Incident Response */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Security Incident &amp; Breach Response
            </h2>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4">
              <p className="text-gray-600 text-sm leading-relaxed">
                In the event of a security incident involving potential unauthorized access to,
                or disclosure of, data covered under a BAA, Salva AI will:
              </p>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Notify within 60 days</p>
                  <p className="text-gray-500 text-sm">
                    Notify the Covered Entity of a confirmed breach without unreasonable delay and
                    in no event later than 60 calendar days from the date of discovery, as
                    required by the HIPAA Breach Notification Rule (45 CFR §§ 164.400–414).
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Provide detailed disclosure</p>
                  <p className="text-gray-500 text-sm">
                    Include the nature of the breach, types of information involved, steps taken
                    to investigate and mitigate, and recommendations for the Covered Entity to
                    protect affected individuals.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Cooperate fully</p>
                  <p className="text-gray-500 text-sm">
                    Cooperate with the Covered Entity&apos;s investigation and any required
                    notifications to the Department of Health and Human Services (HHS) and
                    affected individuals.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Subcontractor Disclosure */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Subcontractors &amp; Third-Party Processors
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Salva AI uses third-party infrastructure providers to deliver the Service. In
              accordance with HIPAA requirements, any subcontractor that may access data covered
              under a BAA is bound by equivalent confidentiality and security obligations. Our
              current infrastructure partners include:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-3">
              <li><strong>Supabase</strong> — Database hosting (US-based servers)</li>
              <li><strong>OpenAI</strong> — AI model processing (data processing agreement in place)</li>
              <li><strong>Vercel</strong> — Application hosting (US-based edge network)</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              We will notify BAA-covered practices of any material changes to subcontractors that
              process data covered under the agreement.
            </p>
          </section>

          {/* BAA Availability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">BAA Availability</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-blue-200 bg-blue-50/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={18} className="text-blue-600" />
                  <h3 className="font-bold text-gray-900">Pro Plan — $219/mo</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                    BAA available upon request
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                    Standard BAA template provided
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                    Typically executed within 2 business days
                  </li>
                </ul>
              </div>
              <div className="border-2 border-blue-200 bg-blue-50/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={18} className="text-blue-600" />
                  <h3 className="font-bold text-gray-900">Multi-Practice — $749/mo</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                    BAA available upon request
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                    Custom BAA review supported
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                    Dedicated compliance onboarding
                  </li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              BAAs are not available on the Free or Basic plans. If your compliance requirements
              mandate a BAA, please consider upgrading to Pro or Multi-Practice.
            </p>
          </section>

          {/* How to Request */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Request a BAA</h2>
            <div className="bg-gray-900 text-white rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <Mail size={20} className="text-blue-400" />
                <h3 className="font-bold text-lg">Request your BAA</h3>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                If you&apos;re on a Pro or Multi-Practice plan and need a BAA, simply email us.
                We&apos;ll send you our standard agreement for review and countersignature.
              </p>
              <ol className="space-y-3 text-gray-300 text-sm mb-6">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
                    1
                  </span>
                  <span>
                    Email{" "}
                    <a
                      href="mailto:compliance@salvaai.com"
                      className="text-blue-400 underline hover:text-blue-300"
                    >
                      compliance@salvaai.com
                    </a>{" "}
                    with your practice name and plan type.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
                    2
                  </span>
                  <span>We&apos;ll send you the BAA document for review (typically within 1 business day).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
                    3
                  </span>
                  <span>Sign and return the BAA. We&apos;ll countersign and send you the executed copy.</span>
                </li>
              </ol>
              <a
                href="mailto:compliance@salvaai.com?subject=BAA Request — [Your Practice Name]"
                className="inline-block bg-white text-gray-900 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Request a BAA
              </a>
            </div>
          </section>

          {/* Our BAA covers */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Our BAA Covers</h2>
            <p className="text-gray-600 mb-4">
              Our standard Business Associate Agreement addresses the following HIPAA
              requirements:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Permitted uses and disclosures of PHI",
                "Safeguards to prevent unauthorized use",
                "Breach notification procedures and timelines",
                "Obligations upon termination of the agreement",
                "Sub-contractor compliance requirements",
                "Individual rights to access and amend PHI",
                "Accounting of disclosures",
                "Compliance with the HITECH Act",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3"
                >
                  <CheckCircle2 size={14} className="text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Our standard BAA is based on the HHS model BAA template, adapted to reflect the
              specific nature of our Service. It complies with the requirements of 45 CFR Part 164,
              Subparts C and E.
            </p>
          </section>

          {/* Data Return/Destruction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Data Return &amp; Destruction
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Upon termination of a BAA or closure of your Salva AI account:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-3">
              <li>All conversation data and practice configuration data will be securely deleted
                within 30 days of termination.</li>
              <li>If return of data is feasible, we will provide an export upon request before
                deletion.</li>
              <li>If immediate deletion is not feasible (e.g., data embedded in backups), we will
                extend protections under the BAA until deletion is complete and limit further
                use of the data.</li>
              <li>Upon completion of deletion, we will provide written certification of
                destruction upon request.</li>
            </ul>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">
                  Do I need a BAA to use Salva AI?
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Not necessarily. Since Salva AI is designed to avoid collecting or storing PHI,
                  many practices may not require a BAA. However, if your compliance officer or
                  legal counsel recommends one, we&apos;re happy to provide it on eligible plans.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">
                  Is Salva AI HIPAA certified?
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  There is no official &ldquo;HIPAA certification.&rdquo; Instead, HIPAA
                  compliance is an ongoing process. Salva AI is designed with HIPAA principles in
                  mind — including data minimization, encryption, access controls, and breach
                  notification procedures.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">
                  What if a patient discloses health information to the AI?
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  If a patient voluntarily shares health information, the AI is configured to
                  redirect the conversation and advise the patient to contact the practice
                  directly for clinical matters. We do not use any voluntarily disclosed
                  information for any purpose other than handling that specific conversation.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">
                  Can I use my own BAA template?
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Custom BAA review is available on the Multi-Practice plan. For Pro plans, we
                  provide our standard BAA template. Contact us to discuss specific requirements.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">
                  How will I be notified of a data breach?
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  If a breach involving data covered under your BAA is confirmed, we will notify
                  you in writing (via email to your account address) within 60 days of discovery.
                  The notification will include the nature of the breach, the types of data
                  involved, steps we&apos;re taking to investigate and mitigate, and any
                  recommended actions for your practice.
                </p>
              </div>

            </div>
          </section>

          {/* Related docs */}
          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Related Documents</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/privacy"
                className="text-sm bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl hover:border-gray-300 hover:bg-gray-100 transition-colors font-medium text-gray-700"
              >
                Privacy Policy →
              </Link>
              <Link
                href="/terms"
                className="text-sm bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl hover:border-gray-300 hover:bg-gray-100 transition-colors font-medium text-gray-700"
              >
                Terms of Service →
              </Link>
              <Link
                href="/pricing"
                className="text-sm bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl hover:border-gray-300 hover:bg-gray-100 transition-colors font-medium text-gray-700"
              >
                View Plans →
              </Link>
            </div>
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
