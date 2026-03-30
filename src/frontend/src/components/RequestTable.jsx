import styles from './RequestTable.module.css';

function RequestsTable({ requests }) {
    const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
  };
      return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Заявление</th>
            <th>Статус</th>
            <th>Дата изменения</th>
            <th>Дата создания</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td colSpan="4" className={styles.empty}>
                Нет заявлений
              </td>
            </tr>
          ) : (
            requests.map((req) => (
              <tr key={req.id}>
                <td>{req.type}</td>
                <td className={styles[req.status]}>
                  {req.status === 'approved_by_hr' && 'Принято'}
                  {req.status === 'approved_by_manager' && 'Одобрено руководителем'}
                  {req.status === 'pending' && 'На рассмотрении'}
                  {req.status === 'rejected' && 'Отклонено'}
                </td>
                <td>{formatDate(req.updatedAt)}</td>
                <td>{formatDate(req.createdAt)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default RequestsTable;
