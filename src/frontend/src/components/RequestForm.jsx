import Input from './Input';
import Select from './Select';
import Button from './Button';
import DateRange from './DateRange';
import styles from './RequestForm.module.css' 

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
    { value: 'mission', label: 'Командировка' }];с

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

    




}