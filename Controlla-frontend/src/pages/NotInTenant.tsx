import React, { useState } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const NotInTenant: React.FC = () => {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode || inviteCode.length < 8) {
      toast.error('Введите корректный код приглашения');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${API_URL}/invites/accept-code`, { code: inviteCode }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Вы успешно присоединились к компании!');
      // Обновить пользователя в контексте (можно вызвать updateUser или перезагрузить профиль)
      await updateUser({});
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Ошибка при присоединении');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-2xl font-bold mb-4">Вы не привязаны к компании</h1>
      <p className="text-gray-600 mb-6">Похоже, вы ещё не присоединились ни к одной компании (тенанту).<br/>Попросите администратора отправить вам код приглашения и введите его ниже.</p>
      <form onSubmit={handleJoin} className="flex flex-col items-center gap-3 w-full max-w-xs">
        <Input
          placeholder="Код приглашения"
          value={inviteCode}
          onChange={e => setInviteCode(e.target.value.trim())}
          maxLength={12}
          minLength={8}
          required
        />
        <Button type="submit" variant="primary" loading={loading} disabled={loading} className="w-full">
          Присоединиться
        </Button>
      </form>
    </div>
  );
};

export default NotInTenant; 