import React from 'react';
import { HomeRoute } from '../../Routes';
import API from '../../services';
import GoBackIcon from '../GoBackIcon';

const LogoutButton = () => {
    return (
        <GoBackIcon
            to={HomeRoute.path}
            onClick={() => {
                API.clearToken();
            }}
            text={'Log out'}
        />
    );
};

export default LogoutButton;