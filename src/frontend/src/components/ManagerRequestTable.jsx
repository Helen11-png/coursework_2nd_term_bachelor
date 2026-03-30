import styles from './ManagerRequestTable.module.css'; 

function ManagerRequestTable({requests, onApprove, onReject, showActions, role}){
    const formatDate = (dateStr) => {
        const [year, month, day] = dateStr.split('-');
        return `${day}.${month}.${year}`;
    };    

    return(
        <div className={styles.tableWrapper}>
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
                    {requests.length === 0 ? (
                        <tr>
                            <td colSpan={showActions ? 6 : 5} className={styles.empty}>
                                Нет заявлений
                            </td>
                        </tr>
                    ) : (
                        requests.map((req) => (
                            <tr key={req.id}>
                                <td>{req.employee}</td>
                                <td>{req.department}</td>
                                <td>{req.type}</td>
                                <td>{`${formatDate(req.startDate)} – ${formatDate(req.endDate)}`}</td>    
                                <td className={styles[req.status]}>
                                    {req.status === 'approved_by_hr' && 'Принято'}
                                    {req.status === 'approved_by_manager' && 'Одобрено руководителем'}
                                    {req.status === 'pending' && 'На рассмотрении'}
                                    {req.status === 'rejected' && 'Отклонено'}
                                </td>
                                {showActions && (
                                    <td>
                                        {(role === 'manager' && req.status === 'pending') || (role === 'hr' && req.status === 'approved_by_manager') ? (
                                            <div className={styles.actions}>
                                                <button onClick={() => onApprove(req.id)}>Одобрить</button>
                                                <button onClick={() => onReject(req.id)}>Отклонить</button>
                                            </div>
                                        ) : null}
                                    </td>
                                )}
                            </tr>
                        )))
                    }
                </tbody>
            </table>    
        </div>);
}
export default ManagerRequestTable;      


