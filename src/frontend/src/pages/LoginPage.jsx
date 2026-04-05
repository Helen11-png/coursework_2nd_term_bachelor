import { useState } from 'react';
import LoginForm from '../components/LoginForm';
import styles from './LoginPage.module.css';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (formData) => {
    console.log('Отправка данных:', formData);
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tab_number: formData.tab_number,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      });
      
      const textResponse = await response.text();
      console.log('📨 Сырой ответ от сервера:', textResponse);
      
      if (!textResponse || textResponse.trim() === '') {
        throw new Error('Сервер вернул пустой ответ');
      }
      
      let userData;
      try {
        userData = JSON.parse(textResponse);
      } catch (parseError) {
        console.error('❌ Ошибка парсинга JSON:', parseError);
        throw new Error('Сервер вернул неверный формат данных');
      }
      
      if (!response.ok) {
        throw new Error(userData.error || 'Ошибка входа');
      }
      
      console.log('✅ Успешный вход:', userData);
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Перенаправляем в зависимости от роли
      if (userData.role === 'employee') {
        navigate('/employee');
      } else if (userData.role === 'manager') {
        navigate('/manager');
      } else if (userData.role === 'hr') {
        navigate('/hr');
      } else {
        navigate('/employee');
      }
      
    } catch (err) {
      console.error('❌ Ошибка:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {error && <div className={styles.error}>{error}</div>}
      <LoginForm onSubmit={handleLogin} loading={loading} />
    </div>
  );
}

export default LoginPage;