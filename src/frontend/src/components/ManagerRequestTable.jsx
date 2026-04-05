import styles from './ManagerRequestTable.module.css';

function ManagerRequestTable({ requests, onApprove, onReject, showActions, role }) {
  
  // Функция для отображения статуса на русском
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

  return (
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
            </td>
            {showActions && (
              <td className={styles.actions}>
                <button 
                  className={styles.approveBtn}
                  onClick={() => onApprove(req.id)}
                >
                  Одобрить
                </button>
                <button 
                  className={styles.rejectBtn}
                  onClick={() => onReject(req.id)}
                >
                  Отклонить
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ManagerRequestTable;