import { ShieldCheck, MessageSquare, PhoneCall } from "lucide-react";

export default function DashboardMockup() {
  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-gray-200 ring-1 ring-black/5 bg-[#fafafa]">
      {/* Browser chrome */}
      <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
        <span className="w-3 h-3 rounded-full bg-red-400 shadow-sm" />
        <span className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm" />
        <span className="w-3 h-3 rounded-full bg-green-400 shadow-sm" />
        <div className="flex-1 mx-4 bg-white/60 rounded-md px-3 py-1.5 text-[11px] text-gray-400 font-mono flex items-center gap-2">
          <ShieldCheck size={12} /> app.salvaai.com/dashboard
        </div>
      </div>

      {/* Dashboard Top Nav */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="font-bold text-gray-900 text-sm tracking-tight">Salva AI</span>
          <div className="flex items-center gap-6 text-xs font-semibold text-gray-400">
            <span className="text-gray-900">Overview</span>
            <span>Campaigns</span>
            <span>Settings</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">Smiles Dental</span>
          <div className="w-7 h-7 bg-blue-600 rounded-full border-2 border-white shadow-sm" />
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">Intelligence Center</h1>
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Agent Active
          </div>
        </div>

        {/* Mock Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Interactions", val: "147", badge: "+12%" },
            { label: "Bookings", val: "28", badge: "+4 AI" },
            { label: "Active Chats", val: "3", badge: "Live" },
            { label: "Total Engaged", val: "342", badge: "All time" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs font-semibold text-gray-500">{s.label}</div>
              </div>
              <div className="text-2xl font-black text-gray-900 tracking-tight">{s.val}</div>
              <div className="mt-3 text-[10px] font-bold text-gray-400">{s.badge}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Mock Charts Column */}
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm h-56 flex flex-col">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="font-semibold text-sm text-gray-900">Call Volume Handled</h3>
               </div>
               <div className="flex-1 w-full bg-gray-50 rounded-xl relative overflow-hidden flex items-end justify-between px-4 pt-10">
                 {/* CSS Mock Chart bars */}
                 {[40, 60, 30, 80, 50, 20, 10].map((h, i) => (
                    <div key={i} className="w-[10%] bg-blue-600 rounded-t-sm" style={{ height: `${h}%` }} />
                 ))}
               </div>
            </div>
          </div>
          
          {/* Mock Feed Column */}
          <div className="col-span-1">
             <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm h-56 overflow-hidden">
                <h3 className="font-semibold text-sm text-gray-900 mb-4">Recent Streams</h3>
                <div className="space-y-3">
                  {[
                    { type: 'Voice', time: '2m ago', active: true },
                    { type: 'Chat', time: '14m ago', active: false },
                    { type: 'Voice', time: '1h ago', active: false },
                  ].map((f, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50`}>
                         {f.type === 'Voice' ? <PhoneCall size={14} className="text-blue-600" /> : <MessageSquare size={14} className="text-orange-600"/>}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-gray-900">{f.type} Inquiry</div>
                        <div className="text-[10px] text-gray-400">{f.time}</div>
                      </div>
                      {f.active && <span className="bg-green-100 text-green-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Live</span>}
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
