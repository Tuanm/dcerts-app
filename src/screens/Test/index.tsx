import React, { useContext, useEffect, useState } from 'react';
import { NotificationContext } from '../../App';
import LoadingComponent from '../../components/LoadingComponent';
import NavigationBar from '../../components/NavigationBar';
import SelectionPane from '../../components/SelectionPane';
import SimpleInput from '../../components/SimpleInput';
import SubmitButton from '../../components/SubmitButton';
import styles from './index.module.scss';
import { Web3Context } from '../../components/Web3';
import { ethers } from 'ethers';

const Test = () => {
    const web3 = useContext(Web3Context);
    const [loaded, setLoaded] = useState(false);
    const [text, setText] = useState('');

    const test = async () => {
        const signature = ethers.utils.id('add(string,uint256)').slice(0, 10);
        const params = new ethers.utils.AbiCoder().encode(['string', 'uint256'], ['Hello World', 69]).substring(2);
        console.log(signature, params);
        const result = await web3.getProvider().call({
            to: '0xa85233c63b9ee964add6f2cffe00fd84eb32338f',
            data: signature + params,
        });
        console.log(result);
    };

    useEffect(() => {
        setLoaded(true);
    }, [loaded]);

    const pushNotification = useContext(NotificationContext);

    const changeText = (value: any) => {
        setText(value);
    };

    const click = () => {
        (async () => {
            await test();
            pushNotification({
                title: 'Test',
                message: text,
            });
        })();
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
