import React from 'react';

const NotInTenant: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-2xl font-bold mb-4">Вы не привязаны к компании</h1>
      <p className="text-gray-600 mb-6">Похоже, вы ещё не присоединились ни к одной компании (тенанту).<br/>Попросите администратора отправить вам приглашение или дождитесь приглашения на email.</p>
      {/* Можно добавить кнопку или инструкцию */}
    </div>
  );
};

export default NotInTenant; 