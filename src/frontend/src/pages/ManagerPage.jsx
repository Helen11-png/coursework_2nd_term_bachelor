import { useState, useEffect } from 'react';      //не работает
import { useLocation } from 'react-router-dom';
import ManagerRequestTable from '../components/ManagerRequestTable';
import styles from './ManagerPage.module.css';

const mockRequests = [
  {
    id: 1,
    employee: 'Иванов Иван',
    department: 'HR',
    type: 'Отпуск',
    startDate: '2026-05-10',
    endDate: '2026-05-20',
    status: 'pending',
  },
  {
    id: 1,
    employee: 'Эдуард Эдиков',
    department: 'IT',
    type: 'Отпуск',
    startDate: '2026-05-10',
    endDate: '2026-05-31',
    status: 'approved_by_hr',
  },
  {
    id: 2,
    employee: 'Петров Петр',
    department: 'Продажи',
    type: 'Командировка',
    startDate: '2026-06-01',
    endDate: '2026-06-15',
    status: 'approved_by_manager'}]

function ManagerPage(){
    const location = useLocation();
    const role = location.pathname === '/.hr'? 'hr': 'manager';

    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
    // Имитация загрузки данных
        setTimeout(() => {
            setRequests(mockRequests);
            setIsLoading(false);
        }, 500);
    }, []);

    const filteredRequests = role === 'hr'
        ? requests.filter(req => req.status === 'approved_by_manager')
        : requests.filter(req => req.status === 'pending');

    const handleApprove = (id) => {
        console.log('handleApprove вызвана с id:', id);
        console.log('текущая роль:', role);
        setRequests(prev => {
            prev.map(req => {
                if (req.id !== id) return req;
                if (role === 'manager' && req.status === 'pending') {
                    return { ...req, status: 'approved_by_manager' };
                }
                if (role === 'hr' && req.status === 'approved_by_manager') {
                    return { ...req, status: 'approved_by_hr' };
                }
                return req;
            });
    });
    };

    const handleReject = (id) => {
        setRequests(prev =>
            prev.map(req =>
                req.id === id ? { ...req, status: 'rejected' } : req
            )
        );
    };

    return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        {role === 'hr' ? 'Заявления на согласование' : 'Заявления на рассмотрение'}
      </h1>
      <ManagerRequestTable
        requests={filteredRequests}
        onApprove={handleApprove}
        onReject={handleReject}
        showActions={true}
        role={role}
      />
    </div>
  );
}

export default ManagerPage;


    