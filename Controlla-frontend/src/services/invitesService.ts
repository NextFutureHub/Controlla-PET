import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const invitesService = {
  async generateCode(tenantId: string, role: string = 'USER') {
    const token = localStorage.getItem('access_token');
    const response = await axios.post(
      `${API_URL}/invites/generate`,
      { tenantId, role, expiresInDays: '7' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async getActiveCodes(tenantId: string) {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(`${API_URL}/invites/tenant/${tenantId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Фильтруем только неиспользованные и неистёкшие
    return (response.data || []).filter((invite: any) => !invite.isUsed && (!invite.expiresAt || new Date(invite.expiresAt) > new Date()));
  }
};