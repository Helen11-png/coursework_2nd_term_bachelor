import LoginForm from '../components/LoginForm';
import styles from './LoginPage.module.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

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
          password: formData.password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка входа');
      }
      
      console.log('Успешный вход:', data);
      
      localStorage.setItem('user', JSON.stringify(data));
      
      // Перенаправляем в зависимости от роли из базы данных
      if (data.role === 'employee') {
        navigate('/employee');
      } else if (data.role === 'manager') {
        navigate('/manager');
      } else if (data.role === 'hr') {
        navigate('/hr');
      } else {
        navigate('/employee');
      }
      
    } catch (err) {
      console.error('Ошибка:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <LoginForm 
        onSubmit={handleLogin} 
        loading={loading} 
        errorMessage={error}
      />
    </div>
  );
}

export default LoginPage;