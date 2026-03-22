import styles from './Button.module.css';
function Button({children, type = 'button', disabled, onClick}){
    return(
        <button
        type = {type}
        className = {styles.button}
        disabled = {disabled}
        onClick={onClick}
        >
            {children}
        </button>
    );
}
export default Button;