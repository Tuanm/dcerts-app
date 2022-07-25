import React, { useEffect, useState } from 'react';
import styles from './index.module.scss';

interface PaginationProps {
    totalPages: number,
    currentPage: number,
    onClick?: (page: number) => void;
}

const Pagination = (props: PaginationProps) => {
    const [currentPage, setCurrentPage] = useState(props.currentPage);

    useEffect(() => {
        setCurrentPage(props.currentPage);
    }, [props.currentPage, props.totalPages]);

    return (
        <>{props.totalPages > 1 && (
            <div className={styles.container}>
                <div className={styles.title}>{'Trang: '}</div>
                {currentPage > 1 && (
                    <div
                        className={styles.text}
                        onClick={() => {
                            const newPage = currentPage - 1;
                            if (props.onClick) {
                                props.onClick(newPage);
                                setCurrentPage(newPage);
                            }
                        }}
                    >
                        {`${currentPage - 1}`}
                    </div>
                )}
                <div className={styles.current}>
                    {currentPage}
                </div>
                {currentPage < props.totalPages && (
                    <div
                        className={styles.text}
                        onClick={() => {
                            const newPage = currentPage + 1;
                            if (props.onClick) {
                                props.onClick(newPage);
                                setCurrentPage(newPage);
                            }
                        }}
                    >
                        {`${currentPage + 1}`}
                    </div>
                )}
                <div className={styles.title}>{`/ ${props.totalPages}`}</div>
            </div>
        )}</>
    );
};

export default Pagination;