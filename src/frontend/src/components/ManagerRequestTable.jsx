import { useState } from 'react';
import styles from './ManagerRequestTable.module.css';

function ManagerRequestTable({ requests, onApprove, onReject, showActions, role }) {
    const [rejectModal, setRejectModal] = useState({ isOpen: false, requestId: null, comment: '' });
    
    const getStatusText = (status) => {
        const statusMap = {
            'submitted': 'На рассмотрении',
            'in_approval': 'Утверждено руководителем',
            'approved': 'Утверждено',
            'rejected': 'Отклонено',
            'draft': 'Черновик'
        };
        return statusMap[status] || status;
    };

    const openRejectModal = (id) => {
        setRejectModal({ isOpen: true, requestId: id, comment: '' });
    };

    const closeRejectModal = () => {
        setRejectModal({ isOpen: false, requestId: null, comment: '' });
    };

    const handleRejectConfirm = () => {
        if (rejectModal.comment.trim()) {
            onReject(rejectModal.requestId, rejectModal.comment);
            closeRejectModal();
        }
    };

    return (
        <>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Сотрудник</th>
                        <th>Отдел</th>
                        <th>Тип заявления</th>
                        <th>Даты проведения</th>
                        <th>Статус</th>
                        {showActions && <th>Действия</th>}
                    </tr>
                </thead>
                <tbody>
                    {requests.map((req) => (
                        <tr key={req.id}>
                            <td>{req.employee}</td>
                            <td>{req.department}</td>
                            <td>{req.type}</td>
                            <td>{req.startDate} – {req.endDate}</td>
                            <td className={styles[req.status] || ''}>
                                {getStatusText(req.status)}
                                {req.status === 'rejected' && req.rejection_comment && (
                                    <div className={styles.rejectionComment}>
                                        Причина: {req.rejection_comment}
                                    </div>
                                )}
                            </td>
                            {showActions && (req.status === 'submitted' || req.status === 'in_approval') && (
                                <td className={styles.actions}>
                                    <button 
                                        className={styles.approveBtn}
                                        onClick={() => onApprove(req.id)}
                                    >
                                        Одобрить
                                    </button>
                                    <button 
                                        className={styles.rejectBtn}
                                        onClick={() => openRejectModal(req.id)}
                                    >
                                        Отклонить
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Модальное окно для комментария при отклонении */}
            {rejectModal.isOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>Отклонить заявку</h3>
                        <label>Укажите причину отклонения:</label>
                        <textarea
                            className={styles.modalTextarea}
                            value={rejectModal.comment}
                            onChange={(e) => setRejectModal({ ...rejectModal, comment: e.target.value })}
                            placeholder="Например: недостаточно оснований, неверные даты, превышение лимита..."
                            rows={4}
                        />
                        <div className={styles.modalButtons}>
                            <button className={styles.cancelBtn} onClick={closeRejectModal}>
                                Отмена
                            </button>
                            <button 
                                className={styles.confirmBtn} 
                                onClick={handleRejectConfirm}
                                disabled={!rejectModal.comment.trim()}
                            >
                                Подтвердить отклонение
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ManagerRequestTable;