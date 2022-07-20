import React from 'react';
import styles from './index.module.scss';

interface WaitingForTransactionProps {
    onClick?: () => void;
    onClickOut?: () => void;
    children?: React.ReactNode;
}

const WaitingForTransaction = (props: WaitingForTransactionProps) => {
    return (
        <div>
            <div className={styles.blur}></div>
            <div
                className={styles.container}
                onClick={() => {
                    if (props.onClick) props.onClick();
                }}
            >
                <div
                    className={styles.back}
                    onClick={() => {
                        if (props.onClickOut) props.onClickOut();
                    }}
                />
                {props.children && (
                    <div className={styles.pane}>{props.children}</div>
                )}
            </div>
        </div>
    );
};

export default WaitingForTransaction;
