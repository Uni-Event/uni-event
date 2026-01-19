import { createContext, useContext } from "react";

export const NotificationsContext = createContext({
  unreadCount: 0,
  setUnreadCount: () => {},
  items: [],
  setItems: () => {},
});

export function useNotifications() {
  return useContext(NotificationsContext);
}
