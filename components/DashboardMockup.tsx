"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Calendar, Phone, Activity, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

export default function DashboardMockup() {
  const [activeTab, setActiveTab] = useState(1); // Default to Pending Bookings

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
    <div role="img" aria-label="Dashboard preview showing Intelligence Center, action required inbox, and overview metrics" className="w-full bg-gray-50 p-8 rounded-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 text-left">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Intelligence Center</h1>
          <p className="text-gray-500 mt-1 font-medium">Welcome back. Your AI agent is answering calls and chats right now.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          Agent Active
        </div>
      </div>

      {/* Action Required Section */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 mb-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] transition-all">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Action Required</h2>
            <p className="text-sm text-gray-400 font-medium">Review and resolve incoming requests</p>
          </div>
          <div className="text-[10px] bg-gray-900 text-white font-black px-2 py-1 rounded uppercase tracking-[0.2em] shadow-lg">
            Auto-syncing
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-10">
          {tabData.map((tab, idx) => (
            <button 
              key={tab.title}
              onClick={() => setActiveTab(idx)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[13px] font-bold transition-all ${
                activeTab === idx 
                ? `bg-${tab.color}-600 text-white shadow-lg shadow-${tab.color}-600/20 scale-105` 
                : "bg-white border border-gray-100 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              }`}
            >
              <tab.icon size={16} /> {tab.title}
            </button>
          ))}
        </div>

        {/* Dynamic Tab Data */}
        <div className="space-y-4">
          {currentTab.items.map((item, i) => (
            <div 
              key={i} 
              className="flex items-center justify-between p-5 bg-gray-50/50 border border-gray-100 rounded-[24px] hover:bg-white hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-transform group-hover:scale-110 ${
                  activeTab === 0 ? "bg-red-100 text-red-600" : activeTab === 1 ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                }`}>
                  {item.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[15px] font-black text-gray-900 tracking-tight">{item.name}</p>
                  <p className="text-[12px] text-gray-400 font-bold uppercase tracking-wider">{item.type} • {item.time}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="text-[11px] bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl font-bold hover:bg-gray-100 transition-colors">Dismiss</button>
                <button className={`text-[11px] text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${
                  activeTab === 0 ? "bg-red-600 shadow-red-600/20 hover:bg-red-700" : activeTab === 1 ? "bg-blue-600 shadow-blue-600/20 hover:bg-blue-700" : "bg-orange-600 shadow-orange-600/20 hover:bg-orange-700"
                }`}>Review</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overview Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Overview</h3>
          <div className="flex gap-2">
            <button className="text-xs text-gray-600 hover:text-gray-900">Today</button>
            <button className="text-xs text-gray-600 hover:text-gray-900">This week</button>
            <button className="text-xs text-gray-600 hover:text-gray-900">This month</button>
            <button className="text-xs text-gray-600 hover:text-gray-900">Last 3 months</button>
            <button className="text-xs font-bold bg-gray-900 text-white px-2.5 py-1 rounded">All time</button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Interactions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
              <Activity size={20} className="text-blue-600" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">1,482</div>
            <p className="text-gray-600 text-sm font-medium mb-3">Total Interactions</p>
            <p className="text-gray-400 text-xs text-green-600 font-bold">↑ 12% from last month</p>
          </div>

          {/* Appointments Booked */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4">
              <Calendar size={20} className="text-green-600" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">84</div>
            <p className="text-gray-600 text-sm font-medium mb-3">Appointments Booked</p>
            <p className="text-gray-400 text-xs font-bold text-gray-400">Total this month</p>
          </div>

          {/* Phone Calls */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-4">
              <Phone size={20} className="text-orange-600" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">942</div>
            <p className="text-gray-600 text-sm font-medium mb-3">Phone Calls</p>
            <p className="text-gray-400 text-xs">63% of total volume</p>
          </div>

          {/* Chats */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare size={20} className="text-yellow-600" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">540</div>
            <p className="text-gray-600 text-sm font-medium mb-3">Chats</p>
            <p className="text-gray-400 text-xs">37% of total volume</p>
          </div>

          {/* After-Hours Handled */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
              <Clock size={20} className="text-purple-600" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">291</div>
            <p className="text-gray-600 text-sm font-medium mb-3">After-Hours Handled</p>
            <p className="text-gray-400 text-xs">Fully automated triage</p>
          </div>

          {/* Emergency Flags */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mb-4">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">12</div>
            <p className="text-gray-600 text-sm font-medium mb-3">Emergency Flags</p>
            <p className="text-gray-400 text-xs text-red-500 font-bold">Action items pending</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add MessageSquare import helper
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
