import styles from './RequestTable.module.css';

function RequestTable({ requests }) {
  
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
          <th>Заявление</th>
          <th>Статус</th>
          <th>Дата создания</th>
        </tr>
      </thead>
      <tbody>
        {requests.map((req) => (
          <tr key={req.id}>
            <td>{req.type}</td>
            <td className={styles[req.status] || ''}>
              {getStatusText(req.status)}
            </td>
            <td>{req.createdAt}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default RequestTable;