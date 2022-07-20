import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Web3Value from '../../utils/web3';

export const Web3Context = React.createContext({} as Web3Value);

interface Web3Props {
    children: React.ReactNode;
}

const Web3 = (props: Web3Props) => {
    const [web3, setWeb3] = useState({} as Web3Value);

    const connect = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        setWeb3(Web3Value.of(provider));
    };

    useEffect(() => {
        connect();
    }, []);

    return (
        <Web3Context.Provider value={web3}>
            {props.children}
        </Web3Context.Provider>
    );
};

export default Web3;
