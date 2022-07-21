import React from 'react';
import { useRoutes } from 'react-router-dom';
import Dashboard from './screens/Dashboard';
import Home from './screens/Home';
import NotFound from './screens/NotFound';
import Search from './screens/Search';
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

export const SearchRoute = {
    text: 'Search',
    path: '/:group/search',
    element: <Search />,
};

export const UploadAreaRoute = {
    text: 'Upload',
    path: '/:group/add',
    element: <UploadArea />,
};

export const VotingAreaRoute = {
    text: 'Vote',
    path: '/:group/vote',
    element: <VotingArea />,
};

export const WithIdVotingAreaRoute = {
    text: 'Vote',
    path: '/:group/vote/:id',
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
        SearchRoute,
        UploadAreaRoute,
        VotingAreaRoute,
        WithIdVotingAreaRoute,
        NotFoundRoute, // let it be the last route
    ]);

    return <>{routes}</>;
};

export default Routes;
