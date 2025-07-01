async function testRegister() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Регистрация успешна!');
      console.log('Ответ:', JSON.stringify(data, null, 2));
    } else {
      const errorData = await response.json();
      console.log('❌ Ошибка регистрации:');
      console.log('Статус:', response.status);
      console.log('Сообщение:', errorData.message);
    }
  } catch (error) {
    console.log('❌ Ошибка сети:', error.message);
  }
}

testRegister(); 