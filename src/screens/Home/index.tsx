import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../../App';
import AuthFilter from '../../components/AuthFilter';
import WaitingForTransaction from '../../components/WaitingForTransaction';
import Web3LoginButton from '../../components/Web3LoginButton';
import { DashRoute } from '../../Routes';
import styles from './index.module.scss';

const Home = () => {
    const pushNotification = useContext(NotificationContext);
    const [loaded, setLoaded] = useState(false);
    const navigate = useNavigate();
    const [signing, setSigning] = useState(false);

    const isPopUp = () => window.opener && window.opener !== window;

    useEffect(() => {
        if (loaded && isPopUp()) {
            setSigning(true);
        }
    }, [loaded]);

    return (
        <>
            <AuthFilter
                setLoaded={setLoaded}
                successUrl={DashRoute.path}
            />
            {loaded && (
                <div className={styles.container}>
                    <div className={styles.text}>{'Đăng nhập với'}</div>
                    <Web3LoginButton
                        title={'MetaMask'}
                        onSuccess={() => navigate(DashRoute.path)}
                        onFailure={() => {
                            pushNotification({
                                title: 'Ối!',
                                message: 'Có lỗi xảy ra',
                                type: 'error',
                            });
                            setSigning(false);
                        }}
                        onClick={() => {
                            setSigning(true);
                        }}
                    />
                </div>
            )}
            {loaded && signing && (
                <WaitingForTransaction />
            )}
        </>
    )
};

export default Home;