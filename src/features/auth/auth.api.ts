import { apiClient } from '../../api/client';

export const authApi = {
  getMe: async () => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },
  
  logout: async () => {
    await apiClient.post('/auth/logout');
  }
};
