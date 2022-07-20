import classNames from 'classnames';
import React from 'react';
import styles from './index.module.scss';

interface ConfirmationButtonProps {
    onClick: () => void;
    title?: string;
    confirm?: boolean;
}

const ConfirmationButton = (props: ConfirmationButtonProps) => {
    const getButtonStyle = () => {
        return classNames(styles.submit, {
            [styles.reject]: !props.confirm,
        });
    };

    return (
        <div className={styles.container}>
            <button className={getButtonStyle()} onClick={props.onClick}>
                {props.title && (
                    <div className={styles.text}>{props.title}</div>
                )}
            </button>
        </div>
    );
};

export default ConfirmationButton;
