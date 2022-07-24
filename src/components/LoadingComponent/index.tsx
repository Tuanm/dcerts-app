import React from 'react';
import TextShortCut from '../TextShortCut';
import styles from './index.module.scss';

interface LoadingComponentProps {
    text?: string;
    cancelText?: string;
    onCancel?: () => void;
}

const LoadingComponent = (props: LoadingComponentProps) => {
    const defaultText = 'Vui lòng chờ...';
    const defaultCancelText = 'Huỷ!';

    return (
        <div className={styles.container}>
            <div className={styles.text}>
                {props.text || defaultText}{' '}
                {props.cancelText && (
                    <div className={styles.clickable}>
                        <TextShortCut
                            text={props.cancelText || defaultCancelText}
                            onClick={props.onCancel}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoadingComponent;
