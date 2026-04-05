import { useState } from 'react';
import styles from './LoginForm.module.css';
import Select from './Select';
import Input from './Input';
import Button from './Button';

function LoginForm({ onSubmit, loading, error: externalError }) {
  const [formData, setFormData] = useState({
    role: 'employee',
    email: '',
    password: '',
    tab_number: ''
  });
  
  const [errors, setErrors] = useState({});

  const roleOptions = [
    { value: 'employee', label: 'Сотрудник' },
    { value: 'manager', label: 'Руководитель' },
    { value: 'hr', label: 'HR-специалист' }
  ];

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isFormValid()) return;
    
    const loginData = {
      tab_number: formData.tab_number,
      email: formData.email,
      password: formData.password,
      role: formData.role
    };
    
    onSubmit(loginData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Авторизация</h2>
      {externalError && <p className={styles.generalError}>{externalError}</p>}
      {errors.general && <p className={styles.generalError}>{errors.general}</p>}

      <Select
        name="role"
        value={formData.role}
        onChange={handleChange}
        options={roleOptions}
        placeholder="Выберите должность"
        error={errors.role}
      />

      <Input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        error={errors.email}
      />

      <Input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Пароль"
        error={errors.password}
      />
      <Input
        type="text"
        name="tab_number"
        value={formData.tab_number}
        onChange={handleChange}
        placeholder="Табельный номер (например, 001, 010, 003)"
        error={errors.tab_number}
      />

      <Button 
        type="submit" 
        disabled={loading}
      >
        {loading ? 'Вход...' : 'Войти'}
      </Button>
    </form>
  );
}

export default LoginForm;