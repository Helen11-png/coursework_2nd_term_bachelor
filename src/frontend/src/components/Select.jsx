import styles from './Select.module.css';
function Select({name, value, onChange, options = [], error, placeholder, ...rest }){
    return(
            <div className={styles.selectGroup}>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`${styles.select} ${error ? styles.errorSelect : ''}`}
        {...rest}
      >
         {placeholder && <option value="" disabled hidden>{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}

export default Select;