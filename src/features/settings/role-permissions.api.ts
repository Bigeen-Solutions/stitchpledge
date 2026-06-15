import { apiClient } from '../../infrastructure/http/axios.client';

export interface CapabilityEntry {
  capability: string;
  isEnabled: boolean;
  isOverridden: boolean;
}

export interface RoleEntry {
  role: string;
  capabilities: CapabilityEntry[];
}

export interface RolePermissionsMatrix {
  roles: RoleEntry[];
}

export const rolePermissionsApi = {
  getMatrix: async (): Promise<RolePermissionsMatrix> => {
    const res = await apiClient.get<RolePermissionsMatrix>('/settings/role-permissions');
    return res.data;
  },

  setOverride: async (
    role: string,
    capability: string,
    isEnabled: boolean,
  ): Promise<CapabilityEntry> => {
    const res = await apiClient.put<CapabilityEntry>(
      `/settings/role-permissions/${role}/${capability}`,
      { is_enabled: isEnabled },
    );
    return res.data;
  },

  deleteOverride: async (
    role: string,
    capability: string,
  ): Promise<{ reverted_to_default: boolean; default_value: boolean }> => {
    const res = await apiClient.delete(
      `/settings/role-permissions/${role}/${capability}`,
    );
    return res.data;
  },
};
