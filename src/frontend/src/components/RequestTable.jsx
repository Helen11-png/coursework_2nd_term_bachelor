import styles from './RequestTable.module.css';

function RequestsTable({ requests }) {
    const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
  };
  
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
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Заявление</th>
            <th>Статус</th>
            <th>Дата создания</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td colSpan="3" className={styles.empty}>
                Нет заявлений
              </td>
            </tr>
          ) : (
            requests.map((req) => (
              <tr key={req.id}>
                <td>{req.type}</td>
                <td className={styles[req.status] || ''}>
                  {getStatusText(req.status)}
                  {req.status === 'rejected' && req.rejection_comment && (
                    <div className={styles.rejectionComment}>
                      Причина: {req.rejection_comment}
                    </div>
                  )}
                </td>
                <td>{req.createdAt}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default RequestsTable;