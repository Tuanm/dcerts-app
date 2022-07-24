import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Web3Value from '../../utils/web3';
import API from '../../services';
import { useNavigate } from 'react-router-dom';
import { HomeRoute } from '../../Routes';
import LoadingComponent from '../LoadingComponent';

export const Web3Context = React.createContext({} as Web3Value);

interface Web3Props {
    children: React.ReactNode,
    onConnected?: () => void,
    onFailed?: () => void,
}

const Web3 = (props: Web3Props) => {
    const [web3, setWeb3] = useState({} as Web3Value);
    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);
    const navigate = useNavigate();

    const requestAccounts = async (provider: ethers.providers.Web3Provider) => {
        await provider.send('eth_requestAccounts', []);
    };

    const connect = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await requestAccounts(provider);
        const web3Value = Web3Value.of(provider);
        let currentAccount = (await web3Value.accounts()).at(0);
        setInterval(async () => {
            if (!window.ethereum) {
                setFailed(true);
            } else {
                const accountChanged = currentAccount && currentAccount !== (await web3Value.accounts()).at(0);
                if (accountChanged) {
                    API.clearToken();
                    navigate(HomeRoute.path);
                    currentAccount = undefined;
                }
            }
        }, 100);
        setWeb3(web3Value);
    };

    useEffect(() => {
        (async () => {
            if (window.ethereum) {
                await connect();
                setLoaded(true);
                setFailed(false);
            } else {
                setLoaded(false);
                setFailed(true);
                if (props.onFailed) {
                    props.onFailed();
                }
            }
        })();
    }, [window.ethereum]);

    return (
        <>
            {!failed && (
                <>
                    {/* {!loaded && (
                        <LoadingComponent
                            text={'Connecting to MetaMask...'}
                        />
                    )} */}
                    {loaded && (
                        <Web3Context.Provider value={web3}>
                            {props.children}
                        </Web3Context.Provider>
                    )}
                </>
            )}
            {failed && (
                <LoadingComponent
                    text={'Vui lòng sử dụng MetaMask và'}
                    cancelText={'Tải lại trang!'}
                    onCancel={() => {
                        window.location.reload();
                    }}
                />
            )}
        </>
    );
};

export default Web3;
