import { AlertTriangle, Calendar, Phone, Activity, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

export default function DashboardMockup() {
  return (
    <div role="img" aria-label="Dashboard preview showing Intelligence Center, action required inbox, and overview metrics" className="w-full bg-gray-50 p-8 rounded-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Intelligence Center</h1>
          <p className="text-gray-500 mt-1">Welcome back. Your AI agent is answering calls and chats right now.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          Agent Active
        </div>
      </div>

      {/* Action Required Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Action Required</h2>
          <p className="text-sm text-gray-400">Review and resolve incoming requests</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 bg-white">
            <AlertTriangle size={16} /> Emergencies
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-blue-600 border border-blue-300 bg-blue-50">
            <Calendar size={16} /> Pending Bookings
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 bg-white">
            <Phone size={16} /> Callbacks
          </button>
        </div>

        {/* All Clear State */}
        <div className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 size={48} className="text-green-500 mb-3" />
          <p className="text-gray-500 text-center">All clear — nothing to do here.</p>
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
            <div className="text-4xl font-bold text-gray-900 mb-1">0</div>
            <p className="text-gray-600 text-sm font-medium mb-3">Total Interactions</p>
            <p className="text-gray-400 text-xs">All time</p>
          </div>

          {/* Appointments Booked */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4">
              <Calendar size={20} className="text-green-600" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">0</div>
            <p className="text-gray-600 text-sm font-medium mb-3">Appointments Booked</p>
            <p className="text-gray-400 text-xs">This month</p>
          </div>

          {/* Phone Calls */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-4">
              <Phone size={20} className="text-orange-600" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">29</div>
            <p className="text-gray-600 text-sm font-medium mb-3">Phone Calls</p>
            <p className="text-gray-400 text-xs">All time</p>
          </div>

          {/* Chats */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare size={20} className="text-yellow-600" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">2</div>
            <p className="text-gray-600 text-sm font-medium mb-3">Chats</p>
            <p className="text-gray-400 text-xs">All time</p>
          </div>

          {/* After-Hours Handled */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
              <Clock size={20} className="text-purple-600" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">0</div>
            <p className="text-gray-600 text-sm font-medium mb-3">After-Hours Handled</p>
            <p className="text-gray-400 text-xs">0% of total volume</p>
          </div>

          {/* Emergency Flags */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mb-4">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">0</div>
            <p className="text-gray-600 text-sm font-medium mb-3">Emergency Flags</p>
            <p className="text-gray-400 text-xs">Last 30 days</p>
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
