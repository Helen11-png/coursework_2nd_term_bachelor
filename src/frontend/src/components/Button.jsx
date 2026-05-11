import styles from './Button.module.css';
function Button({children, className = '', type = 'button', disabled, onClick}){
    return(
        <button
        type = {type}
        className = {`${styles.button} ${className}`}
        disabled = {disabled}
        onClick={onClick}
        >
            {children}
        </button>
    );
}
export default Button;