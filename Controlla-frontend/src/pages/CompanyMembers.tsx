import React, { useEffect, useState } from 'react';
import { usersService } from '../services/usersService';
import { User, UserRole } from '../types/user';
import { Card } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import Button from '../components/ui/Button';

const CompanyMembers: React.FC = () => {
  const [members, setMembers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    usersService.getCompanyMembers()
      .then((data) => {
        console.log('Ответ от API:', data, 'Тип:', typeof data, 'isArray:', Array.isArray(data));
        if (Array.isArray(data)) {
          setMembers(data);
          setFiltered(data);
          setError(null); // сбрасываем ошибку при успехе
        } else if (data && Array.isArray(data.users)) {
          setMembers(data.users);
          setFiltered(data.users);
          setError(null); // сбрасываем ошибку при успехе
        } else {
          setMembers([]);
          setFiltered([]);
          setError('Некорректный ответ от сервера');
        }
        setLoading(false);
      })
      .catch((err) => {
        setMembers([]);
        setFiltered([]);
        setError('Ошибка загрузки участников: ' + (err?.response?.data?.message || err.message));
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let f = members;
    if (search) {
      f = f.filter(u => (u.firstName + ' ' + u.lastName + ' ' + u.email).toLowerCase().includes(search.toLowerCase()));
    }
    if (role) {
      f = f.filter(u => u.role === role);
    }
    setFiltered(f);
  }, [search, role, members]);

  const handleExport = () => {
    const csv = [
      ['Имя', 'Фамилия', 'Email', 'Роль', 'Активен', 'Последний вход'],
      ...filtered.map(u => [u.firstName, u.lastName, u.email, u.role, u.isActive ? 'Да' : 'Нет', u.lastLoginAt || ''] )
    ].map(row => row.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'company-members.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Участники компании</h1>
      <div className="flex gap-4 mb-4">
        <Input placeholder="Поиск по имени или email" value={search} onChange={e => setSearch(e.target.value)} />
        <Select
          label=""
          value={role}
          onChange={e => setRole(e.target.value)}
          options={[
            { value: '', label: 'Все роли' },
            ...Object.values(UserRole).map(r => ({ value: r, label: r }))
          ]}
        />
        <Button onClick={handleExport}>Экспорт в CSV</Button>
      </div>
      {loading ? (
        <div>Загрузка...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Array.isArray(filtered) ? filtered : []).map(user => (
            <Card key={user.id} className="flex flex-col gap-2 p-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{user.firstName} {user.lastName}</span>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{user.role}</span>
                {!user.isActive && <span className="text-xs text-red-500 ml-2">Неактивен</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">{user.email}</span>
                <Button size="sm" onClick={() => handleCopyEmail(user.email)}>Копировать email</Button>
              </div>
              <div className="text-xs text-gray-500">Последний вход: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '—'}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyMembers; 