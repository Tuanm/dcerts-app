import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingComponent from '../../components/LoadingComponent';
import NavigationBar from '../../components/NavigationBar';
import { DashRoute } from '../../Routes';
import styles from './index.module.scss';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <>
            <NavigationBar links={[
                DashRoute,
            ]} />
            <LoadingComponent
                text={'Trang này không tồn tại.'}
                cancelText={'Về Trang chủ!'}
                onCancel={() => {
                    navigate('/');
                }}
            />
        </>
    );
};

export default NotFound;
