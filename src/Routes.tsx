import React from 'react';
import { useRoutes } from 'react-router-dom';
import Dashboard from './screens/Dashboard';
import Home from './screens/Home';
import NotFound from './screens/NotFound';
import Test from './screens/Test';
import UploadArea from './screens/UploadArea';
import VotingArea from './screens/VotingArea';

export const TestRoute = {
    text: 'Test',
    path: '/test',
    element: <Test />,
};

export const HomeRoute = {
    text: 'Home',
    path: '/',
    element: <Home />,
};

export const DashRoute = {
    text: 'Dashboard',
    path: '/dash',
    element: <Dashboard />,
};

export const UploadAreaRoute = {
    text: 'Add',
    path: '/:group/add',
    element: <UploadArea />,
};

export const VotingAreaRoute = {
    text: 'Vote',
    path: '/:group/vote',
    element: <VotingArea />,
};

export const NotFoundRoute = {
    text: 'Not Found',
    path: '*',
    element: <NotFound />,
};

const Routes = () => {
    const routes = useRoutes([
        TestRoute,
        HomeRoute,
        DashRoute,
        UploadAreaRoute,
        VotingAreaRoute,
        NotFoundRoute, // let it be the last route
    ]);

    return <>{routes}</>;
};

export default Routes;
