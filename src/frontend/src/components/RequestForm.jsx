import Input from './Input';
import Select from './Select';
import Button from './Button';
import DateRange from './DateRange';
import styles from './RequestForm.module.css' 
import { useState } from 'react';

function RequestForm({onSubmit, onCancel}){
    const [formData, setFormData] = useState({
        requestType: '',
        fullName: '',
        department: '',
        startDate: '',
        endDate: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const requestTypeOptions = [
    { value: 'vacation', label: 'Отпуск' },
    { value: 'mission', label: 'Командировка' }];

    const departmentOptions = [
    { value: 'it', label: 'IT' },
    { value: 'hr', label: 'HR' },
    { value: 'sales', label: 'Продажи' }];

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
        if (!formData.fullName.trim()) newErrors.fullName = 'Укажите ФИО';
        if (!formData.department) newErrors.department = 'Выберите отдел';
        if (!formData.startDate) newErrors.startDate = 'Укажите дату начала';
        if (!formData.endDate) newErrors.endDate = 'Укажите дату окончания';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return}
        setIsLoading(true);
        try {
            await onSubmit(formData);
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
      {errors.general && <p className={styles.generalError}>{errors.general}</p>}

      <Select
        name="requestType"
        value={formData.requestType}
        onChange={handleChange}
        options={requestTypeOptions}
        placeholder="Выберите тип заявления"
        error={errors.requestType}
      />

      <Input
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        placeholder="Введите ФИО"
        error={errors.fullName}
      />

      <Select
        name="department"
        value={formData.department}
        onChange={handleChange}
        options={departmentOptions}
        placeholder="Выберите отдел"
        error={errors.department}
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
    
    




