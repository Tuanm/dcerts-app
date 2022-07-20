import React from 'react';
import { useRoutes } from 'react-router-dom';
import NotFound from './screens/NotFound';
import Test from './screens/Test';
import UploadArea from './screens/UploadArea';

export const TestRoute = {
    text: 'Test',
    path: '/test',
    element: <Test />,
};

export const UploadAreaRoute = {
    text: 'Upload',
    path: '/upload',
    element: <UploadArea />,
};

export const NotFoundRoute = {
    text: 'Not Found',
    path: '*',
    element: <NotFound />,
};

const Routes = () => {
    const routes = useRoutes([
        TestRoute,
        UploadAreaRoute,
        NotFoundRoute, // let it be the last route
    ]);

    return <>{routes}</>;
};

export default Routes;
