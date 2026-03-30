import LoginForm from '../components/LoginForm';
import styles from './LoginPage.module.css';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();
  const handleLogin = async (formData) => {
  console.log('Отправка данных:', formData);
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (formData.role === 'employee') {
    navigate('/employee');
  } 
  else if (formData.role === 'manager'){
    navigate('/manager');
  }
  else if (formData.role === 'hr'){
    navigate('/hr');
  }
};

  return (
    <div className={styles.page}>
        <LoginForm onSubmit={handleLogin} />
    </div>
  );
}

export default LoginPage;