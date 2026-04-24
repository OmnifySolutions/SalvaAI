"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNotifications } from "./NotificationContext";
import NotificationPanel from "./NotificationPanel";
import { type InboxItem } from "@/lib/inbox-utils";

type Props = {
  orgId: string;
  locationIds: string[];
};

export default function NotificationBell({ orgId, locationIds }: Props) {
  const { pushToast } = useNotifications();
  const [unreadCount, setUnreadCount] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelItems, setPanelItems] = useState<InboxItem[]>([]);
  const [panelLoading, setPanelLoading] = useState(false);
  const locationIdsKey = useMemo(() => locationIds.join(","), [locationIds]);

  const fetchPanelItems = useCallback(async () => {
    setPanelLoading(true);
    try {
      const res = await fetch("/api/inbox");
      const json = await res.json();
      setPanelItems(json.items ?? []);
    } catch {
      // silently fail
    } finally {
      setPanelLoading(false);
    }
  }, []);

  useEffect(() => {
    if (locationIds.length === 0) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      channel = supabase
        .channel(`org-bell-${orgId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "conversations",
            filter: `business_id=in.(${locationIdsKey})`,
          },
          (payload) => {
            const row = payload.new as {
              urgency?: string;
              channel?: string;
              location_name?: string;
              visitor_name?: string;
              visitor_phone?: string;
              visitor_email?: string;
            };

            setUnreadCount((c) => c + 1);

            if (row.urgency === "emergency") {
              const caller = row.visitor_name ?? row.visitor_phone ?? row.visitor_email ?? "Unknown caller";
              pushToast({
                title: "Emergency Alert",
                body: `${caller} may need urgent care`,
                urgency: "emergency",
                locationName: row.location_name ?? null,
                channel: row.channel ?? "chat",
                createdAt: new Date().toISOString(),
              });
            }
          }
        )
        .subscribe();
    } catch (e) {
      console.warn("NotificationBell: Realtime unavailable", e);
    }

    return () => { if (channel) channel.unsubscribe(); };
  }, [orgId, locationIdsKey, pushToast]);

  function openPanel() {
    setPanelOpen(true);
    setUnreadCount(0);
    fetchPanelItems();
  }

  return (
    <div className="relative">
      <button
        onClick={() => panelOpen ? setPanelOpen(false) : openPanel()}
        className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {panelOpen && (
        <NotificationPanel
          items={panelItems}
          loading={panelLoading}
          onClose={() => setPanelOpen(false)}
        />
      )}
    </div>
  );
}
