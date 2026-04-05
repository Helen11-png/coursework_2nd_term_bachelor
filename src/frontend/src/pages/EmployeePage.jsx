import { useState, useEffect } from 'react';
import RequestsTable from '../components/RequestTable';
import Button from '../components/Button';
import Modal from '../components/Modal';
import RequestForm from '../components/RequestForm';
import styles from './EmployeePage.module.css';

function EmployeePage() {
    const [requests, setRequests] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Получаем ID текущего пользователя из localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const employeeId = currentUser.id;
    console.log('👤 Текущий пользователь:', currentUser);
    console.log('🆔 ID сотрудника для заявки:', employeeId);
    const getPositionDisplay = () => {
        if (currentUser.position) {
            return currentUser.position;
        }
        return 'Сотрудник';
    };


    useEffect(() => {
        // Загружаем заявки ТЕКУЩЕГО сотрудника
        fetch(`/api/my-requests/?employee_id=${employeeId}`)
            .then(res => {
                if (!res.ok) throw new Error('Ошибка загрузки');
                return res.json();
            })
            .then(data => {
                const formattedRequests = data.map(req => ({
                    id: req.id,
                    type: req.request_type === 'vacation' ? 'Отпуск' : 'Командировка',
                    status: req.status === 'draft' ? 'Черновик' : 
                            req.status === 'submitted' ? 'На рассмотрении' :
                            req.status === 'in_approval' ? 'Утверждено руководителем' :
                            req.status === 'approved' ? 'Утверждено' : 'Отклонено',
                    createdAt: req.created_at.slice(0, 10),
                    updatedAt: req.updated_at?.slice(0, 10) || req.created_at.slice(0, 10),
                }));
                setRequests(formattedRequests);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, [employeeId]);

    const handleAddRequest = async (formData) => {
        console.log('📤 Отправляем данные:', formData);
        console.log('👤 Текущий сотрудник ID:', employeeId);
        
        try {
            const response = await fetch('/api/requests/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employee: employeeId,  
                    request_type: formData.requestType === 'mission' ? 'business_trip' : 'vacation',
                    status: 'submitted',
                    start_date: formData.startDate,
                    end_date: formData.endDate,
                    comment: ''
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Ошибка сервера:', errorData);
                throw new Error('Ошибка отправки');
            }
            
            const newRequest = await response.json();
            console.log('✅ Заявка создана:', newRequest);
            
            // Добавляем в таблицу
            const formattedRequest = {
                id: newRequest.id,
                type: newRequest.request_type === 'vacation' ? 'Отпуск' : 'Командировка',
                status: 'На рассмотрении',
                createdAt: new Date().toISOString().slice(0, 10),
                updatedAt: new Date().toISOString().slice(0, 10),
            };
            
            setRequests(prev => [formattedRequest, ...prev]);
            setIsModalOpen(false);
            
        } catch (err) {
            console.error('❌ Ошибка:', err);
            alert('Ошибка при создании заявки');
        }
    };
    
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;

    return (
        <div className={styles.container}>
            {/* Информация о пользователе */}
            <div className={styles.userInfo}>
                <p>
                    Вы вошли как: <strong>{currentUser.full_name}</strong>
                    {currentUser.position && ` (${getPositionDisplay()})`}
                    {currentUser.department && ` · ${currentUser.department}`}
                </p>
            </div>
            <div className={styles.header}>
                <Button onClick={() => setIsModalOpen(true)}>Добавить заявление</Button>
            </div>
            <RequestsTable requests={requests} />
            <Modal isOpen={isModalOpen} onClose={handleCancel}>
                <RequestForm onSubmit={handleAddRequest} onCancel={handleCancel} />
            </Modal>
        </div>
    );
}

export default EmployeePage;