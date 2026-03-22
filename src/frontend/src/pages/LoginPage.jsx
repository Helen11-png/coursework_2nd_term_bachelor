import LoginForm from '../components/LoginForm';
import styles from './LoginPage.module.css';
function LoginPage() {
  const handleLogin = async (formData) => {
    // Здесь будет реальный запрос к API
    console.log('Отправка данных:', formData);
    // Имитация успешного ответа
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className={styles.page}>
        <LoginForm onSubmit={handleLogin} />
    </div>
  );
}

export default LoginPage;