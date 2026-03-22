import { useState, useEffect } from 'react';
import styles from './DateRange.module.css';

function DateRange({startName, endName, startValue, endValue, startError, endError, onChange}){
    const rangeError = startValue && endValue && new Date(startValue) > new Date(endValue)
        ? 'Дата начала не может быть позже даты окончания'
        : '';
    return(
        <div className={styles.rangeGroup}>
            <div className={styles.field}>
                <input
                type = "date"
                name = {startName}
                value = {startValue}
                onChange = {onChange}
                placeholder='Дата начала (дд.мм.гггг)'
                className={`${styles.input} ${startError ? styles.errorInput : ''}`}
                />
                {startError && <p className={styles.errorMessage}>{startError}</p>}
            </div>
            <div className={styles.field}>
                <input
                type = "date"
                name = {endName}
                value = {endValue}
                onChange = {onChange}
                placeholder='Дата окончания (дд.мм.гггг)'
                className={`${styles.input} ${startError ? styles.errorInput : ''}`}
                />
                {endError && <p className={styles.errorMessage}>{endError}</p>}
            </div>
            {rangeError && <p className={styles.errorMessage}>{rangeError}</p>}
        </div>
    ) ;      
}
export default DateRange;