'use client';

import { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react';

type CallStatus = 'idle' | 'connecting' | 'ringing' | 'active' | 'ended' | 'error';

export default function VoiceTestPage() {
  const deviceRef = useRef<import('@twilio/voice-sdk').Device | null>(null);
  const callRef   = useRef<import('@twilio/voice-sdk').Call | null>(null);

  const [status, setStatus]           = useState<CallStatus>('idle');
  const [businessName, setBusinessName] = useState('');
  const [log, setLog]                 = useState<string[]>([]);
  const [muted, setMuted]             = useState(false);
  const [ready, setReady]             = useState(false);

  function addLog(msg: string) {
    setLog((prev) => [...prev, `${new Date().toLocaleTimeString()} — ${msg}`]);
  }

  useEffect(() => {
    async function init() {
      try {
        addLog('Fetching access token…');
        const res = await fetch('/api/voice/browser-token');
        if (!res.ok) {
          const text = await res.text();
          addLog(`Token error (${res.status}): ${text.slice(0, 200)}`);
          setStatus('error');
          return;
        }
        const { token, businessName: bName } = await res.json();
        setBusinessName(bName);

        // Dynamically import so it only runs client-side
        const { Device } = await import('@twilio/voice-sdk');
        const device = new Device(token, { logLevel: 'warn' });

        device.on('ready', () => {
          addLog('Device ready — microphone access granted');
          setReady(true);
        });

        device.on('error', (err: Error) => {
          addLog(`Device error: ${err.message}`);
          setStatus('error');
        });

        device.on('registrationFailed', (err: Error) => {
          addLog(`Registration failed: ${err.message}`);
        });

        await device.register();
        deviceRef.current = device;
        addLog(`Loaded business: ${bName}`);
      } catch (e: unknown) {
        addLog(`Init failed: ${e instanceof Error ? e.message : String(e)}`);
        setStatus('error');
      }
    }

    init();

    return () => {
      deviceRef.current?.destroy();
    };
  }, []);

  async function startCall() {
    if (!deviceRef.current || !ready) return;
    try {
      setStatus('connecting');
      addLog('Connecting…');

      const res = await fetch('/api/voice/browser-token');
      const { businessId } = await res.json();

      const call = await deviceRef.current.connect({
        params: { businessId },
      });
      callRef.current = call;

      call.on('ringing', () => { setStatus('ringing'); addLog('Ringing…'); });
      call.on('accept', () => { setStatus('active'); addLog('Call connected — AI receptionist live'); });
      call.on('disconnect', () => { setStatus('ended'); addLog('Call ended'); callRef.current = null; });
      call.on('cancel', () => { setStatus('idle'); addLog('Call cancelled'); callRef.current = null; });
      call.on('error', (err: Error) => {
        addLog(`Call error: ${err.message}`);
        setStatus('error');
        callRef.current = null;
      });
    } catch (e: unknown) {
      addLog(`Connect failed: ${e instanceof Error ? e.message : String(e)}`);
      setStatus('error');
    }
  }

  function endCall() {
    callRef.current?.disconnect();
    deviceRef.current?.disconnectAll();
    setStatus('idle');
    setMuted(false);
    addLog('Hung up');
  }

  function toggleMute() {
    if (!callRef.current) return;
    const next = !muted;
    callRef.current.mute(next);
    setMuted(next);
    addLog(next ? 'Muted' : 'Unmuted');
  }

  const statusColor: Record<CallStatus, string> = {
    idle: 'text-gray-500',
    connecting: 'text-blue-600',
    ringing: 'text-blue-600',
    active: 'text-green-600',
    ended: 'text-gray-500',
    error: 'text-red-600',
  };

  const statusLabel: Record<CallStatus, string> = {
    idle: 'Ready',
    connecting: 'Connecting…',
    ringing: 'Ringing…',
    active: 'Call active',
    ended: 'Call ended',
    error: 'Error',
  };

  const isOnCall = status === 'active' || status === 'ringing' || status === 'connecting';

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md border border-gray-200 rounded-2xl p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Voice AI Test</h1>
          {businessName && (
            <p className="text-gray-500 mt-1">Testing receptionist for <span className="font-medium text-gray-700">{businessName}</span></p>
          )}
        </div>

        {/* Status pill */}
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-500 animate-pulse' : status === 'error' ? 'bg-red-500' : 'bg-gray-300'}`} />
          <span className={`text-sm font-medium ${statusColor[status]}`}>{statusLabel[status]}</span>
        </div>

        {/* Call controls */}
        <div className="flex gap-3">
          {!isOnCall ? (
            <button
              onClick={startCall}
              disabled={!ready || status === 'error'}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white rounded-xl py-3 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
            >
              <Phone size={18} strokeWidth={1.5} />
              Call AI Receptionist
            </button>
          ) : (
            <>
              <button
                onClick={endCall}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white rounded-xl py-3 font-medium hover:bg-red-700 transition-colors"
              >
                <PhoneOff size={18} strokeWidth={1.5} />
                Hang Up
              </button>
              <button
                onClick={toggleMute}
                className={`px-4 rounded-xl border transition-colors ${muted ? 'border-red-300 bg-red-50 text-red-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                {muted ? <MicOff size={18} strokeWidth={1.5} /> : <Mic size={18} strokeWidth={1.5} />}
              </button>
            </>
          )}
        </div>

        {/* Log */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Activity</p>
          <div className="bg-gray-50 rounded-xl p-4 h-48 overflow-y-auto space-y-1">
            {log.length === 0 && <p className="text-xs text-gray-400">Initialising…</p>}
            {log.map((entry, i) => (
              <p key={i} className="text-xs text-gray-600 font-mono">{entry}</p>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Browser demo — make sure your microphone is enabled
        </p>
      </div>
    </div>
  );
}
