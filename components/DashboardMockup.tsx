const conversations = [
  { channel: "Voice", status: "completed", time: "Today, 9:41 AM" },
  { channel: "Chat",  status: "completed", time: "Today, 8:57 AM" },
  { channel: "Voice", status: "active",    time: "Today, 8:22 AM" },
  { channel: "Chat",  status: "completed", time: "Yesterday, 6:14 PM" },
  { channel: "Voice", status: "completed", time: "Yesterday, 3:05 PM" },
];

export default function DashboardMockup() {
  return (
    <div className="w-full max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-gray-200 ring-1 ring-black/5">
      {/* Browser chrome */}
      <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
        <span className="w-3 h-3 rounded-full bg-red-400" />
        <span className="w-3 h-3 rounded-full bg-yellow-400" />
        <span className="w-3 h-3 rounded-full bg-green-400" />
        <div className="flex-1 mx-3 bg-white rounded-md px-3 py-1 text-xs text-gray-400 font-mono truncate">
          app.salvaai.com/dashboard
        </div>
      </div>

      {/* Dashboard */}
      <div className="bg-gray-50">
        {/* Nav */}
        <div className="bg-white border-b border-gray-200 px-5 py-3.5 flex items-center justify-between">
          <span className="font-bold text-gray-900 text-sm tracking-tight">Salva AI</span>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Bright Smile Dental</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-400 hover:text-gray-600 cursor-pointer">Settings</span>
          </div>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Interactions", value: "147" },
              { label: "Plan", value: "Pro" },
              { label: "Conversations", value: "23" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3.5 shadow-sm">
                <div className="text-xl font-bold text-gray-800">{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Voice AI status */}
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3.5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-semibold text-gray-800">Voice AI</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>
            </div>
            <div>
              <p className="text-xs text-gray-400 text-right">Forwarding number</p>
              <p className="text-xs font-mono text-gray-700">+1 (602) 555-0182</p>
            </div>
          </div>

          {/* Conversations */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800">Recent Conversations</span>
              <span className="text-xs text-gray-400">Last 20</span>
            </div>
            <ul className="divide-y divide-gray-50">
              {conversations.map((c, i) => (
                <li key={i} className="px-4 py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${c.status === "active" ? "bg-green-400" : "bg-gray-300"}`} />
                    <span className="font-medium text-gray-700">{c.channel}</span>
                    <span className="text-gray-400">{c.time}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full ${c.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {c.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
