import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { tenantService } from '../services/tenantService';
import { useAuth } from '../context/AuthContext';
import { CreateTenantDto } from '../types/tenant';

interface TenantFormData {
  name: string;
  industry: string;
  website: string;
  phone: string;
  address: string;
  admin: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };
}

export const TenantRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<TenantFormData>();

  const onSubmit = async (data: TenantFormData) => {
    try {
      setLoading(true);
      // Создаем тенант с администратором
      const response = await tenantService.register(data);
      console.log('Tenant registration response:', response);
      
      if (!response || !response.tenant || !response.access_token) {
        throw new Error('Failed to create tenant: Invalid response from server');
      }

      // Сохраняем токены в localStorage
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      
      // Автоматически авторизуем пользователя
      await login(data.admin.email, data.admin.password);
      
      toast.success('Тенант и администратор успешно созданы!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Ошибка при создании тенанта';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Регистрация тенанта
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Данные тенанта */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Данные компании</h3>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Название компании
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    type="text"
                    {...register('name', { required: 'Обязательное поле' })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                  Отрасль
                </label>
                <div className="mt-1">
                  <input
                    id="industry"
                    type="text"
                    {...register('industry', { required: 'Обязательное поле' })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {errors.industry && (
                    <p className="mt-2 text-sm text-red-600">{errors.industry.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Веб-сайт
                </label>
                <div className="mt-1">
                  <input
                    id="website"
                    type="url"
                    {...register('website')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Телефон
                </label>
                <div className="mt-1">
                  <input
                    id="phone"
                    type="tel"
                    {...register('phone', { required: 'Обязательное поле' })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Адрес
                </label>
                <div className="mt-1">
                  <input
                    id="address"
                    type="text"
                    {...register('address', { required: 'Обязательное поле' })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {errors.address && (
                    <p className="mt-2 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Данные администратора */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Данные администратора</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="admin.firstName" className="block text-sm font-medium text-gray-700">
                    Имя
                  </label>
                  <div className="mt-1">
                    <input
                      id="admin.firstName"
                      type="text"
                      {...register('admin.firstName', { required: 'Обязательное поле' })}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errors.admin?.firstName && (
                      <p className="mt-2 text-sm text-red-600">{errors.admin.firstName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="admin.lastName" className="block text-sm font-medium text-gray-700">
                    Фамилия
                  </label>
                  <div className="mt-1">
                    <input
                      id="admin.lastName"
                      type="text"
                      {...register('admin.lastName', { required: 'Обязательное поле' })}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errors.admin?.lastName && (
                      <p className="mt-2 text-sm text-red-600">{errors.admin.lastName.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="admin.email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    id="admin.email"
                    type="email"
                    {...register('admin.email', { 
                      required: 'Обязательное поле',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Некорректный email'
                      }
                    })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {errors.admin?.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.admin.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="admin.password" className="block text-sm font-medium text-gray-700">
                  Пароль
                </label>
                <div className="mt-1">
                  <input
                    id="admin.password"
                    type="password"
                    {...register('admin.password', { 
                      required: 'Обязательное поле',
                      minLength: {
                        value: 6,
                        message: 'Пароль должен содержать минимум 6 символов'
                      }
                    })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {errors.admin?.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.admin.password.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Регистрация...' : 'Зарегистрировать компанию'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 