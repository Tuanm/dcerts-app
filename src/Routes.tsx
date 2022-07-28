import React from 'react';
import { useRoutes } from 'react-router-dom';
import Dashboard from './screens/Dashboard';
import Home from './screens/Home';
import LockingArea from './screens/LockingArea';
import NotFound from './screens/NotFound';
import PeekingArea from './screens/PeekingArea';
import PreviewArea from './screens/PreviewArea';
import Search from './screens/Search';
import Test from './screens/Test';
import UploadArea from './screens/UploadArea';
import VotingArea from './screens/VotingArea';

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

export const LockingAreaRoute = {
    text: 'Khoá nội dung',
    path: '/:group/lock/:id',
    element: <LockingArea />,
};

export const PreviewAreaRoute = {
    text: 'Xem nội dung',
    path: '/preview/:cid',
    element: <PreviewArea />,
};

export const TestRoute = {
    text: 'Kiểm tra',
    path: '/test',
    element: <Test />,
};

export const NotFoundRoute = {
    text: 'Không tìm thấy',
    path: '*',
    element: <NotFound />,
};

const Routes = () => {
    const routes = useRoutes([
        HomeRoute,
        DashRoute,
        SearchRoute,
        UploadAreaRoute,
        VotingAreaRoute,
        PeekingAreaRoute,
        LockingAreaRoute,
        PreviewAreaRoute,
        TestRoute,
        NotFoundRoute, // let it be the last route
    ]);

    return <>{routes}</>;
};

export default Routes;
