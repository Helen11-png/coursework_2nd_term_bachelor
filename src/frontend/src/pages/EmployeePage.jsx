import { useState, useEffect } from 'react';
import RequestsTable from '../components/RequestTable';
import Button from '../components/Button';
import Modal from '../components/Modal';
import RequestForm from '../components/RequestForm';
import styles from './EmployeePage.module.css';

const mockRequests = [ //*это для проверки таблицы*//
  {
    id: 1,
    type: 'Отпуск',
    status: 'approved',
    updatedAt: '2026-03-15',
    createdAt: '2026-03-10',
  },
  {
    id: 2,
    type: 'Командировка',
    status: 'pending',
    updatedAt: '2026-03-14',
    createdAt: '2026-03-12',
  },
];

function EmployeePage(){
    const [requests, setRequests] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

      // Загружаем заявления при монтировании страницы
    useEffect(() => {
    // В будущем здесь будет fetch('/api/employee/requests')
        setRequests(mockRequests);
    }, []);

    const handleAddRequest = async (formData) => {
    // Имитация отправки на сервер
        console.log('Новое заявление:', formData);
        await new Promise(resolve => setTimeout(resolve, 1000));

    // Создаём объект нового заявления (сервер вернёт подобное)
        const typeMap = {
            vacation: 'Отпуск',
            mission: 'Командировка',
        };
    
        const newRequest = {
            id: Date.now(),
            type: typeMap[formData.requestType],
            status: 'pending',
            updatedAt: new Date().toISOString().slice(0, 10),
            createdAt: new Date().toISOString().slice(0, 10),
        };
        setRequests(prev => [newRequest, ...prev]);
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <div className={styles.container}>
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





