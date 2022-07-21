import React, { useContext } from 'react';
import { Web3Context } from '../Web3';
import Auth from '../../services/auth';
import styles from './index.module.scss';


interface Web3LoginButtonProps {
    title?: string;
    onClick?: () => void;
    onSuccess?: () => void;
    onFailure?: (err: any) => void;
}

const Web3LoginButton = (props: Web3LoginButtonProps) => {
    const web3 = useContext(Web3Context);

    const handleClick = async () => {
        if (props.onClick) props.onClick();
        const address = (await web3.accounts())[0];
        if (address) {
            try {
                const nonce = await Auth.nonce();
                const signature = await web3.sign(nonce);

                if (signature) {
                    await Auth.authenticate(
                        address,
                        signature,
                    );
                    if (props.onSuccess) props.onSuccess();
                }
            } catch (err) {
                if (props.onFailure) props.onFailure(err);
            }
        }
    };

    return (
        <button className={styles.button} onClick={handleClick}>{props.title}</button>
    );
};

export default Web3LoginButton;