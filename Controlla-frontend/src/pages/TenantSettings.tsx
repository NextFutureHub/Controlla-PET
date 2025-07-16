import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { tenantService } from '../services/tenantService';
import { toast } from 'react-hot-toast';
import { invitesService } from '../services/invitesService';
import { UserRole } from '../types/user';



const TenantSettings = () => {
  const { tenant, updateTenant, user } = useAuth();
  const [formData, setFormData] = useState({
    name: tenant?.name || '',
    industry: tenant?.industry || '',
    website: tenant?.website || '',
    phone: tenant?.phone || '',
    address: tenant?.address || '',
  });
  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [codes, setCodes] = useState<any[]>([]);
  const [codesLoading, setCodesLoading] = useState(false);
  console.log('user.role:', user?.role);
  const fetchCodes = async () => {
    if (!tenant) return;
    setCodesLoading(true);
    try {
      const res = await invitesService.getActiveCodes(tenant.id);
      setCodes(res);
    } catch (e) {
      setCodes([]);
    } finally {
      setCodesLoading(false);
    }
  };

  React.useEffect(() => {
    if (user?.role?.toLowerCase() === 'tenant_admin' && tenant?.id) {
      fetchCodes();
    }
    // eslint-disable-next-line
  }, [tenant?.id]);

  const handleGenerateCode = async () => {
    if (!tenant) return;
    setInviteLoading(true);
    try {
      const res = await invitesService.generateCode(tenant.id, 'USER');
      toast.success('Код приглашения сгенерирован!');
      fetchCodes();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Ошибка генерации кода');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Код скопирован!');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    setLoading(true);
    try {
      const updated = await tenantService.update(tenant.id, formData);
      updateTenant(updated); // обновляем tenant в контексте
      toast.success('Tenant updated successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update tenant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tenant Settings</h1>
      {/* --- Секция инвайтов для администратора --- */}
      {user?.role?.toLowerCase() === 'tenant_admin' && tenant?.id && (
        <div className="mb-8 bg-white p-6 rounded shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Коды приглашения</h2>
            <button
              onClick={handleGenerateCode}
              className="bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700 disabled:opacity-50"
              disabled={inviteLoading}
            >
              {inviteLoading ? 'Генерируется...' : 'Сгенерировать код'}
            </button>
          </div>
          {codesLoading ? (
            <div className="text-gray-500">Загрузка...</div>
          ) : codes.length === 0 ? (
            <div className="text-gray-500">Нет активных кодов</div>
          ) : (
            <ul className="space-y-2">
              {codes.map((invite) => (
                <li key={invite.code} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                  <div>
                    <span className="font-mono text-base mr-2">{invite.code}</span>
                    <span className="text-xs text-gray-500">до {invite.expiresAt ? new Date(invite.expiresAt).toLocaleString() : '∞'}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(invite.code)}
                    className="text-primary-600 hover:underline text-sm"
                  >
                    Копировать
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {/* --- Конец секции инвайтов --- */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="industry">Industry</label>
          <input
            id="industry"
            name="industry"
            type="text"
            value={formData.industry}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            value={formData.website}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            type="text"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="address">Address</label>
          <input
            id="address"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default TenantSettings; 