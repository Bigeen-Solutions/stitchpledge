import { apiClient } from '../../infrastructure/http/axios.client';
import type { NotificationTemplateKey } from './notifications.types';

export type { NotificationTemplateKey };

export interface UserNotification {
  id: string;
  user_id: string;
  company_id: string;
  template_key: NotificationTemplateKey;
  payload: Record<string, string>;
  read_at: string | null;
  created_at: string;
}

export interface NotificationsListResponse {
  items: UserNotification[];
  unreadCount: number;
}

export const notificationsApi = {
  list: async (): Promise<NotificationsListResponse> => {
    const res = await apiClient.get('/notifications');
    return res.data;
  },

  markRead: async (id: string): Promise<void> => {
    await apiClient.post(`/notifications/${id}/read`);
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.post('/notifications/read-all');
  },
};
