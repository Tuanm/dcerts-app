import React from 'react';
import styles from './index.module.scss';

interface ContentAreaProps {
    id: number;
    title: any;
    content?: any;
    children?: React.ReactNode;
}

const ContentArea = (props: ContentAreaProps) => {
    return (
        <>
            <div className={styles.container}>
                <div className={styles.id}>
                    {'#'}
                    {props.id}
                </div>
                <div className={styles.title}>{props.title}</div>
                <div className={styles.text}>{props.content}</div>
                {props.children && (
                    <div className={styles.text}>{props.children}</div>
                )}
            </div>
        </>
    );
};

export default ContentArea;
