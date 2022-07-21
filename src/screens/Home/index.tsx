import React, { useContext, useState } from 'react';
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

    return (
        <>
            <AuthFilter
                setLoaded={setLoaded}
                successUrl={DashRoute.path}
            />
            {loaded && (
                <div className={styles.container}>
                    <div className={styles.text}>{'Sign in with'}</div>
                    <Web3LoginButton
                        title={'MetaMask'}
                        onSuccess={() => navigate('/dash')}
                        onFailure={() => {
                            pushNotification({
                                title: 'Whoops!',
                                message: 'Something went wrong!',
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