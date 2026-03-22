import styles from './Input.module.css';
function Input({type = 'text', name, value, onChange, error, ...rest }) {
    return(
        <div className={styles.inputGroup}>
            <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                className={`${styles.input} ${error ? styles.errorInput : ''}`}
                {...rest}
            />
            {error && <p className={styles.errorMessage}>{error}</p>}    
        </div>
     );    
}
export default Input;
