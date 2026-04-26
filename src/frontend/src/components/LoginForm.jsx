import { useState } from 'react';
import Input from './Input';
import Button from './Button';
import styles from './LoginForm.module.css';

function LoginForm({ onSubmit, loading, errorMessage }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    tab_number: ''
  });
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const isFormValid = () => {
    const newErrors = {};
    
    if (!formData.tab_number) {
      newErrors.tab_number = 'Введите табельный номер';
    }
    
    if (!formData.email) {
      newErrors.email = 'Введите email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Введите пароль';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) return;
    
    const loginData = {
      tab_number: formData.tab_number,
      email: formData.email,
      password: formData.password
    };
    
    onSubmit(loginData);
  };
  
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Авторизация</h2>
      
      {errorMessage && (
        <div className={styles.errorBanner}>
          <span className={styles.errorText}>{errorMessage}</span>
        </div>
      )}
      
      <Input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Введите email"
        error={errors.email}
      />

      <Input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Введите пароль"
        error={errors.password}
      />

      <Input
        type="text"
        name="tab_number"
        value={formData.tab_number}
        onChange={handleChange}
        placeholder="Табельный номер (например, 001, 002, 003)"
        error={errors.tab_number}
      />
      
      <Button type="submit" disabled={loading}>
        {loading ? 'Вход...' : 'Войти'}
      </Button>
    </form>
  );
}

export default LoginForm;