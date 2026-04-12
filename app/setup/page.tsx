"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, ChevronRight } from "lucide-react";

type Platform = "squarespace" | "wix" | "wordpress" | "html";

const TABS: { id: Platform; label: string }[] = [
  { id: "squarespace", label: "Squarespace" },
  { id: "wix",         label: "Wix" },
  { id: "wordpress",   label: "WordPress" },
  { id: "html",        label: "Custom HTML" },
];

const PLACEHOLDER_CODE = `<script src="https://app.hustleclaude.com/api/widget/embed?id=YOUR_ID"></script>`;

export default function SetupPage() {
  const [platform, setPlatform] = useState<Platform>("squarespace");
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
            <Link href="/" className="font-bold text-gray-900 text-lg tracking-tight">HustleClaude</Link>
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
            Add HustleClaude to your website
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
            {TABS.map((tab) => (
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

        {/* Help */}
        <div className="mt-12 bg-gray-50 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-medium text-gray-800 text-sm">Need help?</p>
            <p className="text-sm text-gray-500 mt-0.5">
              We&apos;re happy to install the widget for you — just reach out.
            </p>
          </div>
          <a
            href="mailto:support@hustleclaude.com"
            className="shrink-0 text-sm bg-gray-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-gray-700 transition-colors"
          >
            Contact support
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <Link href="/" className="font-semibold text-gray-700">HustleClaude</Link>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-gray-600 transition-colors">Pricing</Link>
            <Link href="/sign-in" className="hover:text-gray-600 transition-colors">Sign in</Link>
          </div>
          <span>© {new Date().getFullYear()} HustleClaude</span>
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
        <>Give it a name like "HustleClaude" and click <strong className="text-gray-800">Apply</strong>.</>,
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
