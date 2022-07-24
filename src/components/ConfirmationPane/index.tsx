import React from 'react';
import ConfirmationButton from '../ConfirmationButton';
import styles from './index.module.scss';

interface ConfirmationButtonProps {
    onConfirm: () => void;
    onReject: () => void;
}

const ConfirmationPane = (props: ConfirmationButtonProps) => {
    return (
        <div className={styles.container}>
            <div className={styles.button}>
                <ConfirmationButton
                    onClick={props.onConfirm}
                    title={'Đồng ý'}
                    confirm={true}
                />
            </div>
            <div className={styles.button}>
                <ConfirmationButton
                    onClick={props.onReject}
                    title={'Từ chối'}
                    confirm={false}
                />
            </div>
        </div>
    );
};

export default ConfirmationPane;
