"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, ChevronRight } from "lucide-react";

type Platform = "squarespace" | "wix" | "wordpress" | "html";
type Carrier  = "gsm" | "voip" | "us";

const PLATFORM_TABS: { id: Platform; label: string }[] = [
  { id: "squarespace", label: "Squarespace" },
  { id: "wix",         label: "Wix" },
  { id: "wordpress",   label: "WordPress" },
  { id: "html",        label: "Custom HTML" },
];

const CARRIER_TABS: { id: Carrier; label: string; sub: string }[] = [
  { id: "gsm",  label: "Mobile / GSM",           sub: "Works worldwide" },
  { id: "voip", label: "VoIP & Business Phones",  sub: "RingCentral, Vonage, 3CX…" },
  { id: "us",   label: "US Mobile Carriers",      sub: "AT&T, Verizon, T-Mobile" },
];

const PLACEHOLDER_CODE = `<script src="https://app.salvaai.com/api/widget/embed?id=YOUR_ID"></script>`;

export default function SetupPage() {
  const [platform, setPlatform] = useState<Platform>("squarespace");
  const [carrier,  setCarrier]  = useState<Carrier>("gsm");
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(PLACEHOLDER_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "var(--font-geist-sans)" }}>

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-gray-900 text-lg tracking-tight">Salva AI</Link>
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
              <Link href="/pricing" className="hover:text-gray-800 transition-colors">Pricing</Link>
              <Link href="/#features" className="hover:text-gray-800 transition-colors">Features</Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm text-gray-500 hover:text-gray-800 px-3 py-2 transition-colors">
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Dashboard
            </Link>
          </div>
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            Setup guide
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-3">
            Add Salva AI to your website
          </h1>
          <p className="text-lg text-gray-500">
            Your AI receptionist will be live in under 5 minutes. No developer needed.
          </p>
        </div>

        {/* Step 1 */}
        <Step number={1} title="Get your embed code">
          <p className="text-gray-500 text-sm mb-4">
            Log in to your dashboard and find the <span className="font-medium text-gray-700">Embed Your Widget</span> section. Your unique code is already generated — just click to copy it.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors mb-5"
          >
            Go to your dashboard <ExternalLink size={13} />
          </Link>

          {/* Code block */}
          <div className="relative group">
            <div className="bg-gray-900 text-green-400 rounded-xl px-5 py-4 font-mono text-xs overflow-x-auto pr-16">
              {PLACEHOLDER_CODE}
            </div>
            <button
              onClick={copyCode}
              className="absolute top-3 right-3 flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white text-xs px-2.5 py-1.5 rounded-lg transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Your actual code in the dashboard already has your unique business ID filled in.
          </p>
        </Step>

        {/* Step 2 */}
        <Step number={2} title="Add it to your website">
          <p className="text-gray-500 text-sm mb-5">
            Choose your website platform for step-by-step instructions:
          </p>

          {/* Platform tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {PLATFORM_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPlatform(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  platform === tab.id
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            {platform === "squarespace" && <SquarespaceSteps />}
            {platform === "wix"         && <WixSteps />}
            {platform === "wordpress"   && <WordPressSteps />}
            {platform === "html"        && <CustomHtmlSteps />}
          </div>
        </Step>

        {/* Step 3 */}
        <Step number={3} title="Test your widget" last>
          <p className="text-gray-500 text-sm mb-4">
            After saving your changes, open your website in a new browser tab.
          </p>
          <ol className="space-y-3">
            {[
              "Look for the blue chat bubble in the bottom-right corner of your page.",
              "Click it — the AI chat window should slide open.",
              "Send a test message to confirm it's responding.",
              "Not seeing it? Try a hard refresh (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac) or clear your browser cache.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                <span className="shrink-0 w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </Step>

        {/* ── Voice AI setup ────────────────────────────────────────────── */}
        <div className="mt-16 pt-14 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Voice AI setup</h2>
                <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Pro</span>
              </div>
              <p className="text-gray-500 text-sm">
                Forward your office phone to your Salva AI number so the AI answers when your team can&apos;t.
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-gray-50 rounded-2xl p-5 mb-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm">
            {[
              { step: "Patient calls", sub: "your existing office number" },
              { step: "No answer", sub: "after ~4 rings (20 sec)" },
              { step: "AI picks up", sub: "on your Salva AI number" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-700 flex items-center justify-center mb-1">
                  {i + 1}
                </div>
                <span className="font-medium text-gray-800">{item.step}</span>
                <span className="text-gray-500 text-xs">{item.sub}</span>
              </div>
            ))}
          </div>

          {/* Steps */}
          <Step number={1} title="Find your forwarding number">
            <p className="text-gray-500 text-sm mb-3">
              Once you activate the Pro plan, Salva AI provisions a dedicated phone number for your practice. You&apos;ll find it in your dashboard under <span className="font-medium text-gray-700">Settings → Voice AI</span>.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
              <span className="text-gray-400 text-xs font-mono">+1 (555) 000-0000</span>
              <span className="text-gray-300">—</span>
              <span className="text-xs">Your number will appear here after Pro activation</span>
            </div>
          </Step>

          <Step number={2} title="Set up call forwarding on your office phone">
            <p className="text-gray-500 text-sm mb-5">
              Choose your phone type. We recommend <strong className="text-gray-700">forward when unanswered</strong> — your staff can still answer calls normally; the AI only kicks in when nobody picks up.
            </p>

            {/* Carrier tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {CARRIER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCarrier(tab.id)}
                  className={`flex flex-col items-start px-4 py-2.5 rounded-xl border text-left transition-colors ${
                    carrier === tab.id
                      ? "bg-gray-900 border-gray-900 text-white"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span className="text-sm font-medium leading-tight">{tab.label}</span>
                  <span className={`text-xs mt-0.5 ${carrier === tab.id ? "text-gray-400" : "text-gray-400"}`}>{tab.sub}</span>
                </button>
              ))}
            </div>

            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              {carrier === "gsm"  && <GsmSteps />}
              {carrier === "voip" && <VoipSteps />}
              {carrier === "us"   && <UsCarrierSteps />}
            </div>
          </Step>

          <Step number={3} title="Test your forwarding" last>
            <ol className="space-y-3">
              {[
                "Call your office number from a different phone.",
                "Let it ring without answering — after about 20 seconds (4–5 rings), the AI should pick up.",
                "You should hear your AI receptionist greet the caller.",
                "If it goes to your old voicemail instead, double-check the forwarding number and repeat the setup steps.",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </Step>
        </div>

        {/* Help */}
        <div className="mt-12 bg-gray-50 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-medium text-gray-800 text-sm">Need help?</p>
            <p className="text-sm text-gray-500 mt-0.5">
              We&apos;re happy to install the widget for you — just reach out.
            </p>
          </div>
          <a
            href="mailto:support@salvaai.com"
            className="shrink-0 text-sm bg-gray-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-gray-700 transition-colors"
          >
            Contact support
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <Link href="/" className="font-semibold text-gray-700">Salva AI</Link>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-gray-600 transition-colors">Pricing</Link>
            <Link href="/sign-in" className="hover:text-gray-600 transition-colors">Sign in</Link>
          </div>
          <span>© {new Date().getFullYear()} Salva AI</span>
        </div>
      </footer>
    </div>
  );
}

// ─── Step wrapper ─────────────────────────────────────────────────────────────

function Step({ number, title, children, last = false }: {
  number: number;
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`flex gap-5 ${!last ? "mb-12" : ""}`}>
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div className="w-9 h-9 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center shrink-0">
          {number}
        </div>
        {!last && <div className="w-px flex-1 bg-gray-200 mt-3" />}
      </div>

      {/* Content */}
      <div className="flex-1 pb-2">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 mt-1.5">{title}</h2>
        {children}
      </div>
    </div>
  );
}

// ─── Nav path helper ──────────────────────────────────────────────────────────

function NavPath({ steps }: { steps: string[] }) {
  return (
    <div className="flex items-center flex-wrap gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-4">
      {steps.map((s, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="font-medium text-gray-700">{s}</span>
          {i < steps.length - 1 && <ChevronRight size={11} className="text-gray-400" />}
        </span>
      ))}
    </div>
  );
}

// ─── Instruction list helper ──────────────────────────────────────────────────

function Instructions({ steps }: { steps: (string | React.ReactNode)[] }) {
  return (
    <ol className="space-y-3 p-5">
      {steps.map((step, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
          <span className="shrink-0 w-5 h-5 rounded-full border border-gray-300 text-gray-500 text-xs font-semibold flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          <span className="leading-relaxed">{step}</span>
        </li>
      ))}
    </ol>
  );
}

// ─── Platform content ─────────────────────────────────────────────────────────

function SquarespaceSteps() {
  return (
    <div>
      <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
        <NavPath steps={["Squarespace dashboard", "Settings", "Developer Tools", "Code Injection", "Footer"]} />
        <p className="text-xs text-gray-400">This adds the widget to every page of your site automatically.</p>
      </div>
      <Instructions steps={[
        <>In your Squarespace dashboard, click <strong className="text-gray-800">Settings</strong> in the left sidebar.</>,
        <>Select <strong className="text-gray-800">Developer Tools</strong>. (On older Squarespace plans this may be labeled <strong className="text-gray-800">Advanced</strong>.)</>,
        <>Click <strong className="text-gray-800">Code Injection</strong>.</>,
        <>Scroll to the <strong className="text-gray-800">Footer</strong> field and paste your embed code.</>,
        <>Click <strong className="text-gray-800">Save</strong>. Your widget will now appear on every page.</>,
      ]} />
    </div>
  );
}

function WixSteps() {
  return (
    <div>
      <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
        <NavPath steps={["Wix dashboard", "Settings", "Custom Code", "+ Add Custom Code"]} />
        <p className="text-xs text-gray-400">Use "Body - end" placement for best performance.</p>
      </div>
      <Instructions steps={[
        <>Log in to <strong className="text-gray-800">Wix</strong> and open your site&apos;s dashboard (not the editor).</>,
        <>Click <strong className="text-gray-800">Settings</strong> in the left menu.</>,
        <>Scroll down to <strong className="text-gray-800">Custom Code</strong> under the Advanced section.</>,
        <>Click <strong className="text-gray-800">+ Add Custom Code</strong>.</>,
        <>Paste your embed code into the code field.</>,
        <>Set <strong className="text-gray-800">Place Code in</strong> to <strong className="text-gray-800">Body — end</strong>.</>,
        <>Set <strong className="text-gray-800">Add Code to Pages</strong> to <strong className="text-gray-800">All Pages</strong>.</>,
        <>Give it a name like "Salva AI" and click <strong className="text-gray-800">Apply</strong>.</>,
      ]} />
    </div>
  );
}

function WordPressSteps() {
  return (
    <div>
      <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
        <p className="text-xs font-medium text-gray-600 mb-1">Recommended: use the free WPCode plugin (no coding required)</p>
        <NavPath steps={["WordPress admin", "Plugins", "Add New", "Search 'WPCode'", "Install & Activate"]} />
      </div>
      <Instructions steps={[
        <>In your WordPress admin, go to <strong className="text-gray-800">Plugins → Add New Plugin</strong>.</>,
        <>Search for <strong className="text-gray-800">WPCode</strong> and click <strong className="text-gray-800">Install Now</strong>, then <strong className="text-gray-800">Activate</strong>.</>,
        <>In the left sidebar, click <strong className="text-gray-800">Code Snippets → + Add Snippet</strong>.</>,
        <>Choose <strong className="text-gray-800">Add Your Custom Code (New Snippet)</strong>.</>,
        <>Set the code type to <strong className="text-gray-800">HTML Snippet</strong> and paste your embed code.</>,
        <>Under <strong className="text-gray-800">Insertion</strong>, set Location to <strong className="text-gray-800">Footer</strong>.</>,
        <>Toggle the snippet to <strong className="text-gray-800">Active</strong> and click <strong className="text-gray-800">Save Snippet</strong>.</>,
      ]} />
      <div className="px-5 pb-5">
        <details className="text-sm">
          <summary className="text-gray-400 cursor-pointer hover:text-gray-600 text-xs">
            Advanced: edit theme files directly
          </summary>
          <ol className="mt-3 space-y-2 pl-3 border-l border-gray-200">
            {[
              <>Go to <strong className="text-gray-800">Appearance → Theme File Editor</strong>.</>,
              <>Open <strong className="text-gray-800">footer.php</strong> from the file list on the right.</>,
              <>Find the <code className="bg-gray-100 px-1 rounded text-xs">&lt;/body&gt;</code> closing tag and paste your embed code just above it.</>,
              <>Click <strong className="text-gray-800">Update File</strong>.</>,
            ].map((s, i) => (
              <li key={i} className="text-gray-500 leading-relaxed py-1">{s}</li>
            ))}
          </ol>
        </details>
      </div>
    </div>
  );
}

// ─── Carrier content ──────────────────────────────────────────────────────────

function ForwardCode({ label, code, note }: { label: string; code: string; note?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {note && <p className="text-xs text-gray-400 mt-0.5">{note}</p>}
      </div>
      <code className="shrink-0 bg-gray-900 text-green-400 text-xs font-mono px-3 py-1.5 rounded-lg">{code}</code>
    </div>
  );
}

function GsmSteps() {
  return (
    <div>
      <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
        <p className="text-xs font-medium text-gray-600 mb-0.5">Standard GSM codes — works on virtually all mobile carriers worldwide</p>
        <p className="text-xs text-gray-400">Dial the code from your office phone keypad and press Call. Replace <span className="font-mono">+XXXXXXXXXXX</span> with your Salva AI number (include country code, e.g. +44 for UK, +1 for US).</p>
      </div>
      <div className="px-5 pt-3 pb-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Activate forwarding</p>
        <ForwardCode
          label="Forward when unanswered (recommended)"
          code="*61*+XXXXXXXXXXX#"
          note="AI answers after ~4 rings. Your staff can still pick up first."
        />
        <ForwardCode
          label="Forward when busy"
          code="*67*+XXXXXXXXXXX#"
          note="Forwards if the line is engaged."
        />
        <ForwardCode
          label="Forward all calls"
          code="*21*+XXXXXXXXXXX#"
          note="Every call goes straight to the AI — staff cannot answer first."
        />
      </div>
      <div className="px-5 pt-3 pb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Deactivate forwarding</p>
        <ForwardCode label="Cancel forward when unanswered" code="#61#" />
        <ForwardCode label="Cancel forward when busy"       code="#67#" />
        <ForwardCode label="Cancel all call forwarding"     code="#21#" />
      </div>
      <div className="bg-blue-50 border-t border-blue-100 px-5 py-3 text-xs text-blue-700">
        These codes follow the 3GPP standard and work on mobile networks in 180+ countries including the EU, UK, US, Canada, Australia, and most of Asia. If your carrier uses different codes, check their website or call their business support line.
      </div>
    </div>
  );
}

function VoipSteps() {
  return (
    <div>
      <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
        <p className="text-xs text-gray-400">Select your platform. All of these are available globally.</p>
      </div>

      {/* RingCentral */}
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-800 mb-2">RingCentral</p>
        <NavPath steps={["Admin Portal", "Phone System", "Users", "Select user", "Call Handling & Forwarding"]} />
        <Instructions steps={[
          <>In the <strong className="text-gray-800">Admin Portal</strong>, go to <strong className="text-gray-800">Phone System → Users</strong>.</>,
          <>Click the user whose calls should forward (usually the main receptionist line).</>,
          <>Open <strong className="text-gray-800">Call Handling &amp; Forwarding</strong>.</>,
          <>Under <strong className="text-gray-800">If no one answers</strong>, select <strong className="text-gray-800">Forward to external number</strong> and enter your Salva AI number.</>,
          <>Set the ring time to <strong className="text-gray-800">20–25 seconds</strong> and save.</>,
        ]} />
      </div>

      {/* Vonage */}
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-800 mb-2">Vonage Business Communications</p>
        <NavPath steps={["Admin Dashboard", "Phone Numbers", "Select number", "Call Forwarding"]} />
        <Instructions steps={[
          <>Log in to the <strong className="text-gray-800">Vonage Business Admin Dashboard</strong>.</>,
          <>Go to <strong className="text-gray-800">Phone Numbers</strong> and click on your main office number.</>,
          <>Select <strong className="text-gray-800">Call Forwarding</strong> and choose <strong className="text-gray-800">Forward when not answered</strong>.</>,
          <>Enter your Salva AI forwarding number and click <strong className="text-gray-800">Save</strong>.</>,
        ]} />
      </div>

      {/* 3CX */}
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-800 mb-2">3CX</p>
        <NavPath steps={["Admin Console", "Users", "Select extension", "Forwarding Rules"]} />
        <Instructions steps={[
          <>In the <strong className="text-gray-800">3CX Admin Console</strong>, go to <strong className="text-gray-800">Users</strong>.</>,
          <>Select the extension for your main reception line.</>,
          <>Click <strong className="text-gray-800">Forwarding Rules</strong> and set <strong className="text-gray-800">No Answer</strong> to <strong className="text-gray-800">Forward to number</strong>.</>,
          <>Enter your Salva AI number (with country code) and save.</>,
        ]} />
      </div>

      {/* Generic */}
      <div className="px-5 py-4">
        <p className="text-sm font-semibold text-gray-800 mb-2">Other VoIP / cloud PBX systems</p>
        <p className="text-sm text-gray-500">
          Look for <strong className="text-gray-700">Call Forwarding</strong> or <strong className="text-gray-700">No Answer rules</strong> in your admin dashboard. You want to forward to an <strong className="text-gray-700">external number</strong> when a call goes unanswered after 20–25 seconds. Contact your VoIP provider&apos;s support if you can&apos;t find the setting.
        </p>
      </div>
    </div>
  );
}

function UsCarrierSteps() {
  return (
    <div>
      <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
        <p className="text-xs text-gray-400">For US mobile carriers. Replace <span className="font-mono">10DIGITNUMBER</span> with your Salva AI number (10 digits, no spaces).</p>
      </div>

      {/* AT&T */}
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-800 mb-3">AT&T</p>
        <ForwardCode label="Forward when unanswered" code="*61*10DIGITNUMBER#" note="Recommended — staff can still answer first" />
        <ForwardCode label="Forward all calls"       code="*21*10DIGITNUMBER#" />
        <ForwardCode label="Deactivate unanswered"   code="#61#" />
        <p className="text-xs text-gray-400 mt-2">You can also manage call forwarding in the <strong className="text-gray-600">myAT&amp;T app</strong> under Phone → Call Forwarding.</p>
      </div>

      {/* Verizon */}
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-800 mb-3">Verizon</p>
        <ForwardCode label="Forward when unanswered" code="*61*10DIGITNUMBER#" note="Recommended" />
        <ForwardCode label="Forward all calls"       code="*72 10DIGITNUMBER"  note="Dial, wait for confirmation tone, hang up" />
        <ForwardCode label="Deactivate all"          code="*73"                note="Dial and wait for confirmation" />
        <p className="text-xs text-gray-400 mt-2">You can also manage this in <strong className="text-gray-600">My Verizon</strong> under Account → Manage Services → Call Forwarding.</p>
      </div>

      {/* T-Mobile */}
      <div className="px-5 py-4">
        <p className="text-sm font-semibold text-gray-800 mb-3">T-Mobile</p>
        <ForwardCode label="Forward when unanswered" code="**61*10DIGITNUMBER#" note="Recommended" />
        <ForwardCode label="Forward all calls"       code="*21*10DIGITNUMBER#" />
        <ForwardCode label="Deactivate unanswered"   code="##61#" />
        <p className="text-xs text-gray-400 mt-2">You can also go to <strong className="text-gray-600">T-Mobile app → Account → More → Call Forwarding</strong>.</p>
      </div>
    </div>
  );
}

function CustomHtmlSteps() {
  return (
    <div>
      <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
        <p className="text-xs text-gray-400">Add the code once to your site template and it will appear on every page.</p>
      </div>
      <Instructions steps={[
        <>Open your website&apos;s HTML file(s) in a text editor (such as VS Code, Notepad++, or your hosting control panel&apos;s file manager).</>,
        <>Use <strong className="text-gray-800">Find</strong> (Ctrl+F / Cmd+F) to search for <code className="bg-gray-100 px-1 rounded text-xs">&lt;/body&gt;</code>.</>,
        <>Paste your embed code on the line <strong className="text-gray-800">immediately above</strong> <code className="bg-gray-100 px-1 rounded text-xs">&lt;/body&gt;</code>.</>,
        <>Save the file and upload it to your web server (via FTP, cPanel, or your hosting dashboard).</>,
        <>If your site uses a shared template or layout file (common in site builders), adding the code once there is enough — you don&apos;t need to edit every page.</>,
      ]} />
    </div>
  );
}
