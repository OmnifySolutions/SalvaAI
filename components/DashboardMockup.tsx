import { ShieldCheck, MessageSquare, PhoneCall } from "lucide-react";

export default function DashboardMockup() {
  return (
    <div role="img" aria-label="Dashboard preview showing call volume, revenue saved, and patient stats" className="w-full max-w-[1000px] mx-auto rounded-3xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-gray-200 ring-1 ring-black/5 bg-[#fafafa]">
      {/* Browser chrome */}
      <div className="bg-gray-100 px-5 py-3 flex items-center gap-2 border-b border-gray-200">
        <span className="w-3.5 h-3.5 rounded-full bg-red-400 shadow-sm border border-black/5" />
        <span className="w-3.5 h-3.5 rounded-full bg-yellow-400 shadow-sm border border-black/5" />
        <span className="w-3.5 h-3.5 rounded-full bg-green-400 shadow-sm border border-black/5" />
        <div className="flex-1 mx-6 bg-white/70 rounded-lg px-4 py-1.5 text-[11px] text-gray-400 font-mono flex items-center justify-center gap-2 shadow-sm border border-gray-200">
          <ShieldCheck size={12} className="text-green-500" /> app.salvaai.com/dashboard
        </div>
      </div>

      {/* Dashboard Top Nav */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <span className="font-black text-gray-900 text-lg tracking-tight">Salva AI</span>
          <div className="flex items-center gap-8 text-sm font-semibold text-gray-400">
            <span className="text-gray-900 py-1 border-b-2 border-gray-900">Overview</span>
            <span>Campaigns</span>
            <span>Settings</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border border-gray-200">Smiles Dental</span>
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-full border-2 border-white shadow-md relative">
             <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></span>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
             <p className="text-2xl font-black text-gray-900">Intelligence Center</p>
             <p className="text-gray-500 text-sm mt-1 font-medium">Your agent has successfully routed 14 calls today.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-500 shadow-sm flex items-center gap-2">
                <span className="font-mono text-gray-800">+1 (602) 555-0182</span>
             </div>
             <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
               <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" /> Agent Active
             </div>
          </div>
        </div>

        {/* Mock Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          {[
            { label: "Total Interactions", val: "1,248", badge: "+12%", color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Appointments Booked", val: "154", badge: "+4 AI", color: "text-green-600", bg: "bg-green-50" },
            { label: "Active Chats", val: "3", badge: "Live now", color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Total Patients Engaged", val: "342", badge: "All time", color: "text-purple-600", bg: "bg-purple-50" },
          ].map((s, idx) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.bg}`}>
                   {idx === 0 && <PhoneCall size={16} className={s.color} />}
                   {idx === 1 && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={s.color}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="m9 16 2 2 4-4"></path></svg>}
                   {idx === 2 && <MessageSquare size={16} className={s.color} />}
                   {idx === 3 && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={s.color}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
                </div>
              </div>
              <div className="text-3xl font-black text-gray-900 tracking-tighter mb-1">{s.val}</div>
              <div className="text-sm font-semibold text-gray-500 mb-4">{s.label}</div>
              <div className="text-[11px] font-bold text-gray-400 border-t border-gray-50 pt-3">{s.badge}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Mock Chart: Call Volume */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm h-72 flex flex-col relative overflow-hidden">
             <div className="flex justify-between items-start mb-6 relative z-10">
               <div>
                 <h3 className="font-bold text-gray-900">Call Volume Handled</h3>
                 <p className="text-xs text-gray-500 mt-1 font-medium">AI agent vs. normal business calls</p>
               </div>
               <div className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200">Last 7 days ▼</div>
             </div>
             
             {/* Beautiful CSS Chart rendering to look like Recharts */}
             <div className="flex-1 w-full relative flex items-end justify-between px-2 pt-10 z-10">
               {/* Grid lines */}
               <div className="absolute inset-0 flex flex-col justify-between pt-10 pb-6 pointer-events-none">
                  <div className="w-full border-b border-dashed border-gray-200"></div>
                  <div className="w-full border-b border-dashed border-gray-200"></div>
                  <div className="w-full border-b border-dashed border-gray-200"></div>
               </div>
               
               {/* Bars side by side */}
               {[{tot: 60, ai: 40, label: "Mon"}, {tot: 80, ai: 50, label: "Tue"}, {tot: 40, ai: 20, label: "Wed"}, {tot: 90, ai: 70, label: "Thu"}, {tot: 70, ai: 50, label: "Fri"}, {tot: 30, ai: 30, label: "Sat"}, {tot: 20, ai: 20, label: "Sun"}].map((h, i) => (
                  <div key={i} className="relative w-[10%] h-full flex items-end justify-center group cursor-pointer z-10 gap-[2px]">
                    <div className="absolute -bottom-8 text-[11px] font-semibold text-gray-400">{h.label}</div>
                    
                    {/* Light Gray (Total) */}
                    <div className="w-1/2 bg-gray-200 rounded-t-sm transition-all group-hover:bg-gray-300" style={{ height: `${h.tot}%` }} />
                    {/* Blue (AI) */}
                    <div className="w-1/2 bg-blue-600 rounded-t-sm transition-all group-hover:bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.2)]" style={{ height: `${h.ai}%` }} />
                    
                    {/* Hover tooltip mock */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-bold px-3 py-2 rounded-lg shadow-xl whitespace-nowrap z-20 pointer-events-none">
                       Total Calls: {h.tot} <br/> Handled by AI: {h.ai}
                    </div>
                  </div>
               ))}
             </div>
          </div>
          
          {/* Mock Chart: Revenue Saved */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm h-72 flex flex-col overflow-hidden relative">
             <div className="flex justify-between items-start mb-6 z-10 relative">
               <div>
                 <h3 className="font-bold text-gray-900">Revenue Saved</h3>
                 <p className="text-xs text-gray-500 mt-1 font-medium">Based on new patient bookings via AI</p>
               </div>
               <div className="text-right">
                 <div className="text-2xl font-black text-green-600">+$26,800</div>
                 <div className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md inline-block mt-1">+14% vs last month</div>
               </div>
             </div>
             
             {/* Fake Area Chart SVG */}
             <div className="absolute bottom-0 left-0 right-0 h-[60%] flex items-end">
               <svg viewBox="0 0 400 150" className="w-full h-full drop-shadow-lg" preserveAspectRatio="none">
                 <defs>
                   <linearGradient id="gradientGreen" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3"></stop>
                     <stop offset="100%" stopColor="#22c55e" stopOpacity="0"></stop>
                   </linearGradient>
                 </defs>
                 <path d="M 0 150 L 0 100 C 50 80 100 120 150 90 C 200 60 250 80 300 40 C 350 0 400 20 400 20 L 400 150 Z" fill="url(#gradientGreen)"></path>
                 <path d="M 0 100 C 50 80 100 120 150 90 C 200 60 250 80 300 40 C 350 0 400 20" fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round"></path>
                 
                 {/* Data Points */}
                 <circle cx="150" cy="90" r="5" fill="#fff" stroke="#22c55e" strokeWidth="2"></circle>
                 <circle cx="300" cy="40" r="5" fill="#fff" stroke="#22c55e" strokeWidth="2"></circle>
                 <circle cx="400" cy="20" r="5" fill="#fff" stroke="#22c55e" strokeWidth="2"></circle>
               </svg>
             </div>
             
             <div className="absolute bottom-4 left-6 right-6 flex justify-between text-[10px] font-bold text-gray-400 z-10 w-full px-4 mb-2 pointer-events-none">
                <span>Week 1</span>
                <span className="ml-[10%]">Week 2</span>
                <span className="ml-[20%]">Week 3</span>
                <span className="-ml-12">Week 4</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
