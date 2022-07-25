import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingComponent from '../../components/LoadingComponent';
import { HomeRoute } from '../../Routes';
import styles from './index.module.scss';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <>
            <LoadingComponent
                text={'Trang này không tồn tại.'}
                cancelText={'Về trang chủ!'}
                onCancel={() => {
                    navigate(HomeRoute.path);
                }}
            />
        </>
    );
};

export default NotFound;
