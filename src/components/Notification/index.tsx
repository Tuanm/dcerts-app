import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

const ERROR = 'error';
const WARNING = 'warning';
const SUCCESS = 'success';

interface NotificationProps {
    title: string;
    message: string;
    type?: string;
    action?: () => void;
}

const Notification = (props: NotificationProps) => {
    const getStyles = (type: string) => {
        let notificationStyle = styles.unknown;
        if (type === SUCCESS) notificationStyle = styles.success;
        if (type === WARNING) notificationStyle = styles.warning;
        if (type === ERROR) notificationStyle = styles.error;
        return classNames(styles.container, notificationStyle);
    };

    return (
        <>
            <div className={getStyles(props.type || '')} onClick={props.action}>
                <div className={styles.title}>{props.title}</div>
                <div className={styles.text}>{props.message}</div>
            </div>
        </>
    );
};

export default Notification;
