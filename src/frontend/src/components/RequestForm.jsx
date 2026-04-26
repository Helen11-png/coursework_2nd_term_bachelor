import Input from './Input';
import Select from './Select';
import Button from './Button';
import DateRange from './DateRange';
import styles from './RequestForm.module.css' 
import { useState } from 'react';

function RequestForm({onSubmit, onCancel}){
    // Достаем данные пользователя из localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    const [formData, setFormData] = useState({
        requestType: '',
        startDate: '',
        endDate: '',
        comment: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const requestTypeOptions = [
    { value: 'vacation', label: 'Отпуск' },
    { value: 'mission', label: 'Командировка' }];

    const handleChange = (e) =>{
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name] : value}));
        if (errors[name]){
            setErrors(prev => ({...prev, [name] : ''}));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.requestType) newErrors.requestType = 'Выберите тип заявления';
        if (!formData.startDate) newErrors.startDate = 'Укажите дату начала';
        if (!formData.endDate) newErrors.endDate = 'Укажите дату окончания';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!currentUser.id) {
            setErrors({ general: 'Ошибка: данные пользователя не найдены. Выйдите и войдите заново.' });
            return;
        }
        
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        setIsLoading(true);
        try {
            await onSubmit({
                requestType: formData.requestType,
                startDate: formData.startDate,
                endDate: formData.endDate,
                comment: formData.comment,
                employeeId: currentUser.id
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <button type="button" className={styles.closeBtn} onClick={onCancel}>
        ✕
      </button>
      <h2 className={styles.title}>Новое заявление</h2>
      
      {/* Блок с информацией о пользователе - как readonly поля */}
      <div className={styles.readonlyField}>
        <label className={styles.readonlyLabel}>Сотрудник</label>
        <div className={styles.readonlyValue}>{currentUser.full_name || '—'}</div>
      </div>
      
      <div className={styles.readonlyField}>
        <label className={styles.readonlyLabel}>Отдел</label>
        <div className={styles.readonlyValue}>{currentUser.department || '—'}</div>
      </div>
      
      <div className={styles.readonlyField}>
        <label className={styles.readonlyLabel}>Должность</label>
        <div className={styles.readonlyValue}>{currentUser.position || '—'}</div>
      </div>
      
      {errors.general && <p className={styles.generalError}>{errors.general}</p>}

      <Select
        name="requestType"
        value={formData.requestType}
        onChange={handleChange}
        options={requestTypeOptions}
        placeholder="Выберите тип заявления"
        error={errors.requestType}
      />

      <DateRange
        startName="startDate"
        endName="endDate"
        startValue={formData.startDate}
        endValue={formData.endDate}
        onChange={handleChange}
        startError={errors.startDate}
        endError={errors.endDate}
      />

      <Button type="submit" disabled={isLoading} className={styles.submitButton}>
        {isLoading ? 'Отправка...' : 'Отправить'}
      </Button>
    </form>
  );
}

export default RequestForm;