import Link from "next/link";
import type { Metadata } from "next";
import Logo from "@/components/Logo";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Salva AI collects, uses, and protects your data. We are committed to transparency and HIPAA-aligned data handling for dental practices.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPolicyPage() {
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
            <Shield size={14} />
            Data Protection
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
            Learn how we collect, use, and protect your data. We are committed to transparency and HIPAA-aligned data handling for dental practices.
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
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
            <p className="text-gray-600">
              Salva AI (&ldquo;Salva,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
              &ldquo;our&rdquo;) operates the website{" "}
              <a
                href="https://salvaai.com"
                className="text-blue-600 underline hover:text-blue-800"
              >
                salvaai.com
              </a>{" "}
              and the Salva AI platform (collectively, the &ldquo;Service&rdquo;). This Privacy
              Policy explains how we collect, use, disclose, and safeguard your information when
              you visit our website or use our Service.
            </p>
            <p className="text-gray-600">
              By using the Service, you agree to the collection and use of information in
              accordance with this policy. If you do not agree, please discontinue use of the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>

            <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">
              2.1 Information You Provide
            </h3>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>
                <strong>Account information:</strong> Name, email address, and authentication
                credentials when you create an account.
              </li>
              <li>
                <strong>Practice information:</strong> Practice name, address, phone number,
                office hours, services offered, accepted insurance plans, and FAQs you provide
                during setup.
              </li>
              <li>
                <strong>Billing information:</strong> Payment card details and billing address,
                processed securely through our payment processor (Stripe). We do not store full
                card numbers on our servers.
              </li>
              <li>
                <strong>Support communications:</strong> Messages and attachments you send to our
                support team.
              </li>
            </ul>

            <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">
              2.2 Information Collected Automatically
            </h3>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>
                <strong>Usage data:</strong> Pages visited, features used, interaction counts,
                and session duration.
              </li>
              <li>
                <strong>Device data:</strong> Browser type, operating system, IP address, and
                device identifiers.
              </li>
              <li>
                <strong>Conversation data:</strong> Transcripts of AI-handled chats and voice
                calls, including caller information voluntarily provided by patients during those
                conversations (e.g., name, phone number, appointment preferences).
              </li>
            </ul>

            <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">
              2.3 Information We Do NOT Collect
            </h3>
            <p className="text-gray-600">
              Salva AI is designed to <strong>never collect or store Protected Health Information
              (PHI)</strong> as defined by HIPAA. The AI does not ask patients for, and is
              instructed to decline, clinical information such as diagnoses, treatment histories,
              medical records, or health conditions. Patients are directed to contact the practice
              directly for any clinical matters.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>To provide, operate, and maintain the Service.</li>
              <li>To personalize your AI agent based on your practice&apos;s settings.</li>
              <li>To process transactions and manage your subscription.</li>
              <li>To send you service-related notifications (e.g., emergency alerts, booking
                requests).</li>
              <li>To analyze usage patterns and improve the Service.</li>
              <li>To respond to your support inquiries.</li>
              <li>To comply with legal obligations.</li>
            </ul>
            <p className="text-gray-600 mt-2">
              We do <strong>not</strong> sell, rent, or trade your personal information to third
              parties for marketing purposes. We do not use your conversation data to train
              general-purpose AI models.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3A. Disclosure of Information</h2>
            <p className="text-gray-600">
              We may disclose your information in the following limited circumstances:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-2">
              <li>
                <strong>Service providers:</strong> To trusted third-party vendors who assist us
                in operating the Service (see Section 4), subject to confidentiality obligations.
              </li>
              <li>
                <strong>Legal requirements:</strong> When required by law, regulation, subpoena,
                court order, or other governmental request.
              </li>
              <li>
                <strong>Protection of rights:</strong> When we believe disclosure is necessary to
                protect our rights, your safety, or the safety of others, investigate fraud, or
                respond to a government request.
              </li>
              <li>
                <strong>Business transfers:</strong> In connection with a merger, acquisition,
                bankruptcy, or sale of all or a portion of our assets. In such event, you will be
                notified via email and/or a prominent notice on the Service.
              </li>
              <li>
                <strong>With your consent:</strong> In any other case, we will disclose your
                information only with your explicit consent.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Third-Party Services</h2>
            <p className="text-gray-600">We use the following third-party services to operate the
              platform:</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-2">
              <li>
                <strong>Clerk</strong> — Authentication and user management.{" "}
                <a href="https://clerk.com/privacy" className="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
              </li>
              <li>
                <strong>Supabase</strong> — Database and real-time data infrastructure.{" "}
                <a href="https://supabase.com/privacy" className="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
              </li>
              <li>
                <strong>Stripe</strong> — Payment processing.{" "}
                <a href="https://stripe.com/privacy" className="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
              </li>
              <li>
                <strong>OpenAI</strong> — AI language model powering the conversational agent.{" "}
                <a href="https://openai.com/policies/privacy-policy" className="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
              </li>
              <li>
                <strong>Vercel</strong> — Website hosting and deployment.{" "}
                <a href="https://vercel.com/legal/privacy-policy" className="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
              </li>
            </ul>
            <p className="text-gray-600 mt-2">
              Each third-party provider maintains its own privacy policy governing their use of
              data. We encourage you to review them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Storage &amp; Security</h2>
            <p className="text-gray-600">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-2">
              <li>All data is encrypted in transit using TLS 1.2+.</li>
              <li>Data at rest is encrypted using AES-256 encryption.</li>
              <li>Access to production systems is restricted and audited.</li>
              <li>We conduct regular security reviews of our infrastructure.</li>
            </ul>
            <p className="text-gray-600 mt-2">
              Data is stored on servers located in the <strong>United States</strong>. By using the
              Service, you consent to the transfer and storage of your data in the US.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Data Retention</h2>
            <p className="text-gray-600">
              We retain your account and conversation data for as long as your account is active.
              Upon account deletion:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-2">
              <li>Practice settings and configuration data are deleted within 30 days.</li>
              <li>Conversation transcripts are deleted within 30 days.</li>
              <li>Billing records are retained as required by tax and financial regulations (up
                to 7 years).</li>
              <li>Aggregated, anonymized analytics data may be retained indefinitely.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Cookies &amp; Tracking Technologies</h2>
            <p className="text-gray-600">
              We use essential cookies to operate the Service (e.g., authentication session
              tokens). We do not use advertising or tracking cookies. Our third-party providers
              may set their own cookies — please refer to their respective privacy policies for
              details.
            </p>
            <p className="text-gray-600 mt-2">
              <strong>Do Not Track:</strong> Some browsers offer a &ldquo;Do Not Track&rdquo;
              (&ldquo;DNT&rdquo;) signal. Because there is no accepted standard for how to respond
              to DNT signals, we do not currently respond to them. However, since we do not use
              advertising or behavioral tracking cookies, your experience is not affected.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Your Rights</h2>
            <p className="text-gray-600">You have the right to:</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-2">
              <li>
                <strong>Access</strong> the personal information we hold about you.
              </li>
              <li>
                <strong>Correct</strong> inaccurate or incomplete information.
              </li>
              <li>
                <strong>Delete</strong> your account and associated data.
              </li>
              <li>
                <strong>Export</strong> your data in a portable format.
              </li>
              <li>
                <strong>Opt out</strong> of non-essential communications.
              </li>
            </ul>
            <p className="text-gray-600 mt-2">
              To exercise any of these rights, contact us at{" "}
              <a
                href="mailto:privacy@salvaai.com"
                className="text-blue-600 underline hover:text-blue-800"
              >
                privacy@salvaai.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              9. HIPAA Compliance
            </h2>
            <p className="text-gray-600">
              Salva AI is designed with HIPAA compliance in mind. Our AI agents are configured to
              avoid soliciting, collecting, or storing Protected Health Information (PHI).
              Conversations are limited to general practice inquiries such as scheduling,
              insurance questions, and office information.
            </p>
            <p className="text-gray-600">
              For practices on our <strong>Pro</strong> or <strong>Multi-Practice</strong> plans
              that require a Business Associate Agreement (BAA), we are happy to execute one.
              Please contact{" "}
              <a
                href="mailto:compliance@salvaai.com"
                className="text-blue-600 underline hover:text-blue-800"
              >
                compliance@salvaai.com
              </a>{" "}
              to request a BAA. See our{" "}
              <Link href="/baa" className="text-blue-600 underline hover:text-blue-800">
                BAA page
              </Link>{" "}
              for more details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              9B. California Privacy Rights (CCPA/CPRA)
            </h2>
            <p className="text-gray-600">
              If you are a California resident, the California Consumer Privacy Act (CCPA), as
              amended by the California Privacy Rights Act (CPRA), provides you with additional
              rights regarding your personal information:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-2">
              <li>
                <strong>Right to know:</strong> You may request the categories and specific pieces
                of personal information we have collected about you.
              </li>
              <li>
                <strong>Right to delete:</strong> You may request deletion of personal information
                we hold about you, subject to certain exceptions.
              </li>
              <li>
                <strong>Right to opt out of sale:</strong> We do not sell personal information as
                defined under the CCPA. No opt-out is necessary.
              </li>
              <li>
                <strong>Right to non-discrimination:</strong> We will not discriminate against you
                for exercising your CCPA rights.
              </li>
              <li>
                <strong>Right to correct:</strong> You may request correction of inaccurate
                personal information.
              </li>
              <li>
                <strong>Right to limit use of sensitive personal information:</strong> We only use
                sensitive personal information for purposes permitted under the CPRA.
              </li>
            </ul>
            <p className="text-gray-600 mt-2">
              To exercise these rights, email{" "}
              <a href="mailto:privacy@salvaai.com" className="text-blue-600 underline hover:text-blue-800">
                privacy@salvaai.com
              </a>{" "}
              with the subject line &ldquo;CCPA Request.&rdquo; We will verify your identity before
              responding and will fulfill verified requests within 45 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              9C. Data Breach Notification
            </h2>
            <p className="text-gray-600">
              In the event of a data breach that affects your personal information, we will notify
              affected users without unreasonable delay, and in no event later than 60 days after
              discovering the breach, unless a shorter timeline is required by applicable law. The
              notification will describe the nature of the breach, the types of information
              affected, the steps we are taking to address the breach, and any steps you can take
              to protect yourself. We will also notify relevant regulatory authorities as required
              by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              10. Children&apos;s Privacy
            </h2>
            <p className="text-gray-600">
              The Service is not directed to individuals under the age of 18. We do not knowingly
              collect personal information from children. If we become aware that we have
              collected data from a child under 18, we will take steps to delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              11. Changes to This Policy
            </h2>
            <p className="text-gray-600">
              We may update this Privacy Policy from time to time. We will notify registered users
              of material changes via email or an in-app notification. Continued use of the
              Service after changes become effective constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Contact Us</h2>
            <p className="text-gray-600">
              If you have questions or concerns about this Privacy Policy, please contact us:
            </p>
            <ul className="list-none pl-0 text-gray-600 space-y-1 mt-2">
              <li>
                <strong>Email:</strong>{" "}
                <a href="mailto:privacy@salvaai.com" className="text-blue-600 underline hover:text-blue-800">
                  privacy@salvaai.com
                </a>
              </li>
              <li>
                <strong>General inquiries:</strong>{" "}
                <a href="mailto:hello@salvaai.com" className="text-blue-600 underline hover:text-blue-800">
                  hello@salvaai.com
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
