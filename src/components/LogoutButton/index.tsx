import React, { useState } from 'react';
import { HomeRoute } from '../../Routes';
import API from '../../services';
import GoBackIcon from '../GoBackIcon';

const LogoutButton = () => {
    const [loggedOut, setLoggedOut] = useState(false);

    return (
        <>{!loggedOut && (
            <GoBackIcon
                to={HomeRoute.path}
                onClick={() => {
                    API.clearToken();
                    setLoggedOut(true);
                }}
                text={'Đăng xuất'}
            />
        )}</>
    );
};

export default LogoutButton;