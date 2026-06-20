"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface Notification {
  id: string;
  userId: string;
  batchId: string | null;
  channel: string;
  title: string | null;
  message: string | null;
  status: string;
  sentAt: string | null;
  readAt: string | null;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  total: number;
}

export function useNotifications(limit = 5) {
  return useQuery({
    queryKey: ["notifications", limit],
    queryFn: () => api.notifications.list({ limit, page: 1 }) as Promise<NotificationsResponse>,
    staleTime: 15_000,
  });
}

export function useUnreadCount() {
  const { data } = useNotifications(100);
  const unread = (data?.notifications ?? []).filter((n) => n.status === "pending" || n.status === "sent").length;
  return unread;
}

export interface NotificationPreferences {
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  smsEnabled: boolean;
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ["notification-preferences"],
    queryFn: () => api.notifications.preferences.get() as Promise<NotificationPreferences>,
    staleTime: 60_000,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<NotificationPreferences>) =>
      api.notifications.preferences.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
  });
}
