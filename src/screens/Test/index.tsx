import React, { useContext, useEffect, useState } from 'react';
import { NotificationContext } from '../../App';
import LoadingComponent from '../../components/LoadingComponent';
import NavigationBar from '../../components/NavigationBar';
import SelectionPane from '../../components/SelectionPane';
import SimpleInput from '../../components/SimpleInput';
import SubmitButton from '../../components/SubmitButton';
import styles from './index.module.scss';
import { Web3Context } from '../../components/Web3';
import { signAdd } from '../../contracts/ContentPool';

const Test = () => {
    const web3 = useContext(Web3Context);
    const [loaded, setLoaded] = useState(false);
    const [text, setText] = useState('');

    useEffect(() => {
        setLoaded(true);

        const test = async () => {
            const { abi } = require('../../contracts/BallotWallet.json');
            const contract = web3.contract('0x5fbdb2315678afecb367f032d93f642f64180aa3', abi);
            await contract.vote(13, true);
        };

        if (loaded) test();
    }, [loaded]);

    const pushNotification = useContext(NotificationContext);

    const changeText = (value: any) => {
        setText(value);
    };

    const click = () => {
        pushNotification({
            title: 'Test',
            message: text,
        });
    };

    return (
        <>
            <NavigationBar
                links={[
                    {
                        path: '/',
                        text: 'Hello',
                    },
                ]}
            />
            {loaded && (
                <div className={styles.container}>
                    <LoadingComponent text={'OK!'} />
                    <SelectionPane
                        text={'Select an option'}
                        options={[
                            'Lorem ipsum dolor sit amet',
                            'Consectetur adipiscing elit',
                            'Integer molestie lorem at massa',
                            'Facilisis in pretium nisl aliquet',
                            'Nulla volutpat aliquam velit',
                            'Phasellus iaculis neque',
                            'Purus sodales ultricies',
                            'Vestibulum laoreet porttitor sem',
                            'Ac tristique libero volutpat at',
                            'Faucibus porta lacus fringilla vel',
                            'Aenean sit amet erat nunc',
                            'Eget porttitor lorem',
                        ]}
                    />
                    <SimpleInput
                        placeholder={'Type something'}
                        onChange={changeText}
                    />
                    <SubmitButton title={'Submit!'} onClick={click} />
                </div>
            )}
        </>
    );
};

export default Test;
