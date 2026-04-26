import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ManagerRequestTable from '../components/ManagerRequestTable';
import styles from './ManagerPage.module.css';

function ManagerPage() {
    const location = useLocation();
    const role = location.pathname === '/hr' ? 'hr' : 'manager';
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const managerId = currentUser.id || 10;
    
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const getPageTitle = () => {
        if (role === 'hr') {
            return 'Заявления на согласование (HR)';
        }
        
        const department = currentUser.department || 'отдела';
        return `Заявления на рассмотрение (${department})`;
    };

    useEffect(() => {
        const apiUrl = role === 'hr' 
            ? '/api/hr-requests/' 
            : `/api/manager-requests/?manager_id=${managerId}`;
        
        fetch(apiUrl)
            .then(res => {
                if (!res.ok) throw new Error('Ошибка загрузки');
                return res.json();
            })
            .then(data => {
                console.log('📋 Получены заявки:', data);
                
                const formattedRequests = data.map(req => ({
                    id: req.id,
                    employee: req.employee_name,
                    department: req.employee_department || '—',
                    type: req.request_type === 'vacation' ? 'Отпуск' : 'Командировка',
                    startDate: req.start_date || req.startDate || '—',
                    endDate: req.end_date || req.endDate || '—',
                    status: req.status,
                    rejection_comment: req.rejection_comment
                }));
                
                setRequests(formattedRequests);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('❌ Ошибка:', err);
                setError(err.message);
                setIsLoading(false);
            });
    }, [role, managerId]);

    const filteredRequests = role === 'hr'
        ? requests.filter(req => req.status === 'in_approval')
        : requests.filter(req => req.status === 'submitted');

    const handleApprove = async (id) => {
        console.log('✅ handleApprove вызвана с id:', id, 'роль:', role);
        
        try {
            const response = await fetch(`/api/requests/${id}/approve/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: role })
            });
            
            if (!response.ok) throw new Error('Ошибка утверждения');
            
            setRequests(prev => prev.map(req => {
                if (req.id !== id) return req;
                
                if (role === 'manager' && req.status === 'submitted') {
                    return { ...req, status: 'in_approval' };
                }
                if (role === 'hr' && req.status === 'in_approval') {
                    return { ...req, status: 'approved' };
                }
                return req;
            }));
            
        } catch (err) {
            console.error('❌ Ошибка:', err);
            alert('Ошибка при утверждении заявки');
        }
    };

    const handleReject = async (id, comment) => {
        console.log('❌ handleReject вызвана с id:', id, 'комментарий:', comment);
        
        try {
            const response = await fetch(`/api/requests/${id}/reject/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rejection_comment: comment })
            });
            
            if (!response.ok) throw new Error('Ошибка отклонения');
            
            setRequests(prev => prev.map(req =>
                req.id === id ? { ...req, status: 'rejected', rejection_comment: comment } : req
            ));
            
        } catch (err) {
            console.error('❌ Ошибка:', err);
            alert('Ошибка при отклонении заявки');
        }
    };

    if (isLoading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.userInfo}>
                <p>
                    Вы вошли как: <strong>{currentUser.full_name}</strong>
                    {currentUser.department && ` (${currentUser.department})`}
                </p>
                <Link to="/employee" className={styles.myRequestsLink}>
                    Мои заявки (как сотрудник)
                </Link>
            </div>
            
            <h1 className={styles.title}>
                {getPageTitle()}
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