import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../../App';
import { HomeRoute } from '../../Routes';
import API from '../../services';
import Wall from '../../services/wall';
import LoadingComponent from '../LoadingComponent';
import LogoutButton from '../LogoutButton';

interface AuthProps {
    setLoaded: (loaded: boolean) => void,
    setGroups?: (groups: string[]) => void,
    fallbackUrl?: string,
    successUrl?: string,
    group?: string,
}

const AuthMessages = {
    UNAUTHORIZED: 'You must log in first!',
    NO_PERMISSION: 'You have no permission to access this area!',
};

const AuthFilter = (props: AuthProps) => {
    const pushNotification = useContext(NotificationContext);
    const [authorized, setAuthorized] = useState(false);
    const [authorizing, setAuthorizing] = useState(false);
    const navigate = useNavigate();
    const isHome = window.location.pathname === HomeRoute.path;

    const authorize = async () => {
        const { id, data } = await Wall.me();
        if (!id) throw new Error(AuthMessages.UNAUTHORIZED);
        if (props.group && !data.includes(props.group)) {
            throw new Error(AuthMessages.NO_PERMISSION);
        }
        return data;
    };

    useEffect(() => {
        (async () => {
            setAuthorizing(true);
            try {
                const data = await authorize();
                setAuthorized(true);
                props.setLoaded(true);
                if (props.setGroups) props.setGroups(data);
                if (props.successUrl) {
                    navigate(props.successUrl);
                }
            } catch(err: any) {
                pushNotification({
                    title: 'Whoops!',
                    message: err?.message,
                    type: 'error',
                });
                if (!isHome) {
                    if (props.fallbackUrl) {
                        navigate(props.fallbackUrl);
                    } else if (err?.message === AuthMessages.NO_PERMISSION) {
                        navigate(HomeRoute.path);
                    } else {
                        navigate(-1);
                    }
                } else {
                    API.clearToken();
                    props.setLoaded(true);
                }
            }
            setAuthorizing(false);
        })();
    }, []);

    return (
        <>
            {authorizing && (
                <LoadingComponent
                    text={'Please wait...'}
                />
            )}
            {authorized && <LogoutButton />}
        </>
    );
};

export default AuthFilter;