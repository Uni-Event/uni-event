import React, { useEffect, useState } from "react";
import api from "../services/api";
import { startNotificationStream } from "./startNotificationsStream";
import { ACCESS_TOKEN } from "../constants";
import { NotificationsContext } from "./notifications.store";

export default function NotificationsProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) return;

    let stopStream = null;
    let cancelled = false;

    (async () => {
      try {
        // 1) initial notifications
        const res = await api.get("/api/interactions/notifications/");
        if (cancelled) return;

        const initialItems = res.data?.items ?? [];
        const initialUnread = res.data?.unreadCount ?? 0;

        setItems(initialItems);
        setUnreadCount(initialUnread);

        // 4) start SSE stream
        stopStream = startNotificationStream({
          onNotification: (notif) => {
            setItems((prev) => [notif, ...(prev || [])]);
            setUnreadCount((c) => c + 1);
          },
        });
      } catch (e) {
        console.error("Failed to init notifications:", e);
      }
    })();

    return () => {
      cancelled = true;
      if (stopStream) stopStream();
    };
  }, []);

  return (
    <NotificationsContext.Provider
      value={{ unreadCount, setUnreadCount, items, setItems }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
