import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../../App';
import { HomeRoute } from '../../Routes';
import API from '../../services';
import Wall from '../../services/wall';
import GoBackIcon from '../GoBackIcon';
import LoadingComponent from '../LoadingComponent';

interface AuthProps {
    setLoaded: (loaded: boolean) => void,
    setGroups?: (groups: string[]) => void,
    fallbackUrl?: string,
    successUrl?: string,
    group?: string,
    interval?: number,
    noButtons?: boolean,
}

const AuthMessages = {
    UNAUTHORIZED: 'Bạn cần đăng nhập để tiếp tục!',
    NO_PERMISSION: 'Bạn không có quyền truy cập vào trang này.',
};

const AuthFilter = (props: AuthProps) => {
    const pushNotification = useContext(NotificationContext);
    const [group, setGroup] = useState<string>()
    const [authorized, setAuthorized] = useState(false);
    const [authorizing, setAuthorizing] = useState(false);
    const [timer, setTimer] = useState<NodeJS.Timer>();
    const navigate = useNavigate();

    const isHome = () => {
        return window.location.pathname === HomeRoute.path;
    };

    const isPopUp = () => {
        return window.opener && window.opener !== window;
    };

    const isEthereum = () => {
        return window.ethereum !== undefined;
    }

    const authorize = async () => {
        let data: string[];
        try {
            if (!isEthereum() || !API.hasToken()) {
                throw new Error();
            }
            data = (await Wall.me()).data;
        } catch (err: any) {
            throw new Error(AuthMessages.UNAUTHORIZED);
        }
        if (props.group && !data.includes(props.group)) {
            throw new Error(AuthMessages.NO_PERMISSION);
        }
        return data;
    };

    const startAuthorizing = async () => {
        try {
            const data = await authorize();
            if (!isHome() && !isPopUp()) {
                setAuthorized(true);
            }
            props.setLoaded(true);
            if (props.setGroups) props.setGroups(data);
            if (isHome() && props.successUrl) {
                if (window.location.pathname !== props.successUrl) {
                    navigate(props.successUrl);
                }
            }
        } catch(err: any) {
            const unauthorized = err?.message === AuthMessages.UNAUTHORIZED;
            if (unauthorized) {
                API.clearToken();
            }
            setAuthorized(false);
            if (isHome()) {
                props.setLoaded(true);
            } else {
                pushNotification({
                    title: 'Ối!',
                    message: err?.message,
                    type: 'error',
                });
                if (unauthorized) {
                    navigate(HomeRoute.path);
                } else if (props.fallbackUrl) {
                    navigate(props.fallbackUrl);
                } else {
                    navigate(-1);
                }
            }
            if (timer) clearInterval(timer);
            if (isPopUp()) {
                setTimeout(() => {
                    window.close();
                }, 5000);
            }
        }
    };

    useEffect(() => {
        setGroup(props.group);
        (async () => {
            setAuthorizing(true);
            await startAuthorizing();
            if (props.interval) {
                setTimer(setInterval(async () => {
                    await startAuthorizing();
                }, props.interval));
            }
            setAuthorizing(false);
        })();
    }, []);

    return (
        <>
            {authorizing && !group && (
                <LoadingComponent
                    text={'Vui lòng đợi...'}
                />
            )}
            {authorized && !props.noButtons && (
                <GoBackIcon
                    text={'Quay lại'}
                    onClick={() => navigate(-1)}
                />
            )}
        </>
    );
};

export default AuthFilter;