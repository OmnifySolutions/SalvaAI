"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Calendar, Phone, Activity, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

export default function DashboardMockup() {
  const [activeTab, setActiveTab] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % 3);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const tabData = [
    {
      title: "Emergencies",
      icon: AlertTriangle,
      color: "red",
      items: [
        { name: "Robert Wilson", type: "Severe Pain", time: "Logged 10 mins ago", status: "Critical" },
        { name: "Linda Moore", type: "Broken Crown", time: "Logged 25 mins ago", status: "Urgent" }
      ]
    },
    {
      title: "Pending Bookings",
      icon: Calendar,
      color: "blue",
      items: [
        { name: "Sarah Miller", type: "New Patient Exam", time: "Requested Tue 2:00 PM", status: "Checking" },
        { name: "David Chen", type: "Teeth Whitening", time: "Requested Today 10:45 AM", status: "Pending" },
        { name: "Jessica Ross", type: "Routine Cleaning", time: "Requested Wed 9:30 AM", status: "Pending" }
      ]
    },
    {
      title: "Callbacks",
      icon: Phone,
      color: "orange",
      items: [
        { name: "Michael Page", type: "Insurance Question", time: "Called 8:15 AM", status: "Wait" },
        { name: "Kevin Hart", type: "Billing Inquiry", time: "Called 9:30 AM", status: "Wait" }
      ]
    }
  ];

  const currentTab = tabData[activeTab];

  return (
    <div role="img" aria-label="Dashboard preview showing Intelligence Center, action required inbox, and overview metrics" className="w-full">
      {/* Mac Browser Frame */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-2xl" style={{ background: "linear-gradient(to bottom, #f9fafb, #f3f4f6)" }}>
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm" />
            <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm" />
            <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-gray-100 rounded-lg px-3 py-1.5 flex items-center gap-2 max-w-xs mx-auto">
              <div className="w-3 h-3 bg-gray-400 rounded-full" />
              <span className="text-xs text-gray-600">getsalvaai.com/dashboard</span>
            </div>
          </div>
          <div className="w-8" />
        </div>

        {/* Dashboard Content */}
        <div className="bg-gray-50 p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-4 text-left">
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Intelligence Center</h1>
              <p className="text-gray-500 mt-0.5 text-xs font-medium">Your AI agent is answering calls and chats right now.</p>
            </div>
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              Agent Active
            </div>
          </div>

          {/* Action Required Section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-black text-gray-900 tracking-tight">Action Required</h2>
                <p className="text-xs text-gray-400 font-medium">Review incoming requests</p>
              </div>
              <div className="text-[8px] bg-gray-900 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-[0.1em] shadow-lg">
                Auto-syncing
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              {tabData.map((tab, idx) => (
                <button
                  key={tab.title}
                  onClick={() => setActiveTab(idx)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${
                    activeTab === idx
                    ? `bg-${tab.color}-600 text-white shadow-lg shadow-${tab.color}-600/20 scale-105`
                    : "bg-white border border-gray-100 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                  }`}
                >
                  <tab.icon size={13} /> {tab.title}
                </button>
              ))}
            </div>

            {/* Dynamic Tab Data */}
            <div className="space-y-2">
              {currentTab.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-50/50 border border-gray-100 rounded-lg hover:bg-white hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-sm transition-transform group-hover:scale-110 ${
                      activeTab === 0 ? "bg-red-100 text-red-600" : activeTab === 1 ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                    }`}>
                      {item.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-gray-900 tracking-tight">{item.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate">{item.type} • {item.time}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="text-[9px] bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded-lg font-bold hover:bg-gray-100 transition-colors whitespace-nowrap">Dismiss</button>
                    <button className={`text-[9px] text-white px-2 py-1 rounded-lg font-bold transition-all shadow-lg active:scale-95 whitespace-nowrap ${
                      activeTab === 0 ? "bg-red-600 shadow-red-600/20 hover:bg-red-700" : activeTab === 1 ? "bg-blue-600 shadow-blue-600/20 hover:bg-blue-700" : "bg-orange-600 shadow-orange-600/20 hover:bg-orange-700"
                    }`}>Review</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overview Section */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Overview</h3>
              <div className="flex gap-1 items-center">
                <span className="text-[8px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">Sample data</span>
                <button className="text-[9px] text-gray-600 hover:text-gray-900">Today</button>
                <button className="text-[9px] text-gray-600 hover:text-gray-900">Week</button>
                <button className="text-[9px] font-bold bg-gray-900 text-white px-2 py-0.5 rounded">All time</button>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-2">
              {/* Total Interactions */}
              <div className="bg-white rounded-lg border border-gray-200 p-2.5">
                <div className="w-6 h-6 bg-blue-50 rounded flex items-center justify-center mb-1.5">
                  <Activity size={14} className="text-blue-600" />
                </div>
                <div className="text-lg font-bold text-gray-900">1,482</div>
                <p className="text-gray-600 text-[9px] font-medium">Interactions</p>
              </div>

              {/* Appointments Booked */}
              <div className="bg-white rounded-lg border border-gray-200 p-2.5">
                <div className="w-6 h-6 bg-green-50 rounded flex items-center justify-center mb-1.5">
                  <Calendar size={14} className="text-green-600" />
                </div>
                <div className="text-lg font-bold text-gray-900">84</div>
                <p className="text-gray-600 text-[9px] font-medium">Appointments</p>
              </div>

              {/* Phone Calls */}
              <div className="bg-white rounded-lg border border-gray-200 p-2.5">
                <div className="w-6 h-6 bg-orange-50 rounded flex items-center justify-center mb-1.5">
                  <Phone size={14} className="text-orange-600" />
                </div>
                <div className="text-lg font-bold text-gray-900">942</div>
                <p className="text-gray-600 text-[9px] font-medium">Phone Calls</p>
              </div>

              {/* Chats */}
              <div className="bg-white rounded-lg border border-gray-200 p-2.5">
                <div className="w-6 h-6 bg-yellow-50 rounded flex items-center justify-center mb-1.5">
                  <MessageSquare size={14} className="text-yellow-600" />
                </div>
                <div className="text-lg font-bold text-gray-900">540</div>
                <p className="text-gray-600 text-[9px] font-medium">Chats</p>
              </div>

              {/* After-Hours Handled */}
              <div className="bg-white rounded-lg border border-gray-200 p-2.5">
                <div className="w-6 h-6 bg-purple-50 rounded flex items-center justify-center mb-1.5">
                  <Clock size={14} className="text-purple-600" />
                </div>
                <div className="text-lg font-bold text-gray-900">291</div>
                <p className="text-gray-600 text-[9px] font-medium">After-Hours</p>
              </div>

              {/* Emergency Flags */}
              <div className="bg-white rounded-lg border border-gray-200 p-2.5">
                <div className="w-6 h-6 bg-red-50 rounded flex items-center justify-center mb-1.5">
                  <AlertCircle size={14} className="text-red-600" />
                </div>
                <div className="text-lg font-bold text-gray-900">12</div>
                <p className="text-gray-600 text-[9px] font-medium">Emergency</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageSquare({ size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
