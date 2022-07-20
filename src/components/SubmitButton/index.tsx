import React from 'react';
import styles from './index.module.scss';

interface SubmitButtonProps {
    onClick: () => void;
    title?: string;
}

const SubmitButton = (props: SubmitButtonProps) => {
    return (
        <div className={styles.container}>
            <button className={styles.submit} onClick={props.onClick}>
                {props.title && (
                    <div className={styles.text}>{props.title}</div>
                )}
            </button>
        </div>
    );
};

export default SubmitButton;
