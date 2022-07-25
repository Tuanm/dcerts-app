import React from 'react';
import { useRoutes } from 'react-router-dom';
import Dashboard from './screens/Dashboard';
import Home from './screens/Home';
import NotFound from './screens/NotFound';
import PeekingArea from './screens/PeekingArea';
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
    text: 'Trang chủ',
    path: '/',
    element: <Home />,
};

export const DashRoute = {
    text: 'Trang chủ',
    path: '/dash',
    element: <Dashboard />,
};

export const SearchRoute = {
    text: 'Tra cứu',
    path: '/:group/search',
    element: <Search />,
};

export const UploadAreaRoute = {
    text: 'Cấp phát',
    path: '/:group/add',
    element: <UploadArea />,
};

export const VotingAreaRoute = {
    text: 'Bỏ phiếu',
    path: '/:group/vote',
    element: <VotingArea />,
};

export const PeekingAreaRoute = {
    text: 'Xem hành động',
    path: '/:group/peek/:id',
    element: <PeekingArea />
};

export const NotFoundRoute = {
    text: 'Không tìm thấy',
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
        PeekingAreaRoute,
        NotFoundRoute, // let it be the last route
    ]);

    return <>{routes}</>;
};

export default Routes;
