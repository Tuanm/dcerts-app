import React from 'react';
import Routes from './Routes';
import Notification from './components/Notification';
import './App.scss';
import ReactDOM from 'react-dom';
import Web3 from './components/Web3';

export const NotificationContext = React.createContext(
    (notification: Notif) => {
        console.log(notification);
    },
);

interface Notif {
    title: string;
    message: string;
    type?: string;
    action?: () => void;
    popupTime?: number;
}

const App = () => {
    const popupContainer = React.useRef<HTMLDivElement>(null);
    const popupTime = 4000;

    const pushNotification = (notif: Notif) => {
        const notifElement = (
            <Notification
                title={notif.title}
                message={notif.message}
                type={notif.type}
                action={notif.action}
            />
        );

        const notifDiv = document.createElement('div');
        ReactDOM.render(notifElement, notifDiv);

        if (popupContainer.current) {
            popupContainer.current.appendChild(notifDiv);

            setTimeout(() => {
                if (popupContainer.current) {
                    popupContainer.current.removeChild(notifDiv);
                }
            }, notif.popupTime || popupTime);
        }
    };

    return (
        <NotificationContext.Provider value={pushNotification}>
            <Web3>
                <div className={'background'}></div>
                <div className={'container'}>
                    <Routes />
                    <div ref={popupContainer}></div>
                </div>
            </Web3>
        </NotificationContext.Provider>
    );
};

export default App;
