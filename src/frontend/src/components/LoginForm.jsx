import { useState } from 'react';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import styles from './LoginForm.module.css';
function LoginForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    role: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const roleOptions = [
    { value: 'employee', label: 'Сотрудник' },
    { value: 'hr', label: 'HR-менеджер' },
    { value: 'admin', label: 'Администратор' },
    { value: 'manager', label: 'Руководитель' }
  ];
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  const validate = () => {
    const newErrors = {};
    if (!formData.role) newErrors.role = 'Выберите должность';
    if (!formData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    }
    return newErrors;
  };
  const isFormValid = () => {
    return Object.values(formData).every(value => value.trim() !== '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({ general: 'Ошибка входа. Проверьте данные.' });
    } finally {
      setIsLoading(false);
    }
  };
    return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Авторизация</h2>
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
          <Button type="submit" disabled={!isFormValid() || isLoading}>
        {isLoading ? 'Вход...' : 'Войти'}
      </Button>
    </form>
  );
}

export default LoginForm;