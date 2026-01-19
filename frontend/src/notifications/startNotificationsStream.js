import { fetchEventSource } from "@microsoft/fetch-event-source";
import { ACCESS_TOKEN } from "../constants";

export function startNotificationStream({ onNotification }) {
  const token = localStorage.getItem(ACCESS_TOKEN);
  const ctrl = new AbortController();

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  fetchEventSource(`${API_BASE_URL}/api/interactions/notifications/stream/`, {
    method: "GET",
    signal: ctrl.signal,
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
        }
      : { Accept: "text/event-stream" },

    onopen(res) {
      if (!res.ok) {
        console.error("SSE failed:", res.status, res.statusText);
      }
    },

    onmessage(ev) {
      if (!ev.data) return;
      let payload;
      try {
        payload = JSON.parse(ev.data);
      } catch {
        return;
      }
      if (payload?.kind === "notification:new" && payload?.notification) {
        onNotification?.(payload.notification);
      }
    },

    onerror(err) {
      // opreste reconectarea infinita
      console.error("SSE error:", err);
      ctrl.abort();
      throw err;
    },
  });

  return () => ctrl.abort();
}
