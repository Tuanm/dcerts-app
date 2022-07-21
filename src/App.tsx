import React, { useState } from 'react';
import Routes from './Routes';
import Notification from './components/Notification';
import './App.scss';
import ReactDOM from 'react-dom';
import Web3 from './components/Web3';
import LoadingComponent from './components/LoadingComponent';

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
    const [web3Failed, setWeb3Failed] = useState(false);

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
            <Web3
                onFailed={() => setWeb3Failed(true)}
            >
                <div className={'background'}></div>
                <div className={'container'}>
                    {!web3Failed && <Routes />}
                    {web3Failed && (
                        <LoadingComponent
                            text={'You should consider using MetaMask.'}
                        />
                    )}
                    <div ref={popupContainer}></div>
                </div>
            </Web3>
        </NotificationContext.Provider>
    );
};

export default App;
