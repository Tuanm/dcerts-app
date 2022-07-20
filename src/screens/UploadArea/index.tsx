import React, { useContext, useEffect, useState } from 'react';
import ContentArea from '../../components/ContentArea';
import LoadingComponent from '../../components/LoadingComponent';
import NavigationBar from '../../components/NavigationBar';
import NewsIcon from '../../components/NewsIcon';
import SimpleInput from '../../components/SimpleInput';
import SubmitButton from '../../components/SubmitButton';
import WaitingForTransaction from '../../components/WaitingForTransaction';
import { Web3Context } from '../../components/Web3';
import IPFS from '../../utils/ipfs';
import styles from './index.module.scss';
import { signAdd } from '../../contracts/ContentPool';
import { NotificationContext } from '../../App';

const UploadArea = () => {
    const web3 = useContext(Web3Context);
    const pushNotification = useContext(NotificationContext);
    const [ipfs, setIPFS] = useState<IPFS>();
    const [uploaded, setUploaded] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [peeking, setPeeking] = useState(false);
    const [peekingContent, setPeekingContent] = useState({
        id: 0,
        title: '',
        content: '',
    });
    const [files, setFiles] = useState<File[]>([]);

    useEffect(() => {
        setIPFS(IPFS.create(process.env.REACT_APP_IPFS_URL));

    }, []);

    const upload = async () => {
        setWaiting(true);
        try {
            if (files.length && ipfs) {
                const contents = [];
                for (const file of files) {
                    contents.push(await file.text());
                }
                const cids = (await ipfs.addAll(contents)).map((cid) => cid.toString());
                const { abi } = require('../../contracts/BallotWallet.json');
                const contentPoolAddress = process.env.REACT_APP_CONTENT_POOL_ADDRESS || '';
                const contract = web3.contract('0x5fbdb2315678afecb367f032d93f642f64180aa3', abi);
                for (const cid of cids) {
                    const { functionName, parameters } = signAdd(cid)
                    console.log(cid, functionName, parameters);
                    await contract.start(
                        contentPoolAddress,
                        functionName,
                        parameters,
                    );
                }
            }
        } catch (err: any) {
            pushNotification({
                title: 'Whoops!',
                message: err?.message,
                type: 'error',
            });
        }
        setWaiting(false);
    };

    return (
        <>
            <NavigationBar
                links={[
                    {
                        path: '/test',
                        text: 'Test',
                    },
                ]}
            />
            {ipfs && (
                <>
                    <div className={styles.container}>
                        <SimpleInput
                            type={'file'}
                            placeholder={'Add files'}
                            onChange={(fileList: FileList) => {
                                setFiles([...files, ...Array.from(fileList)]);
                                setUploaded(true);
                            }}
                        />
                        {uploaded && files.length > 0 && (
                            <div className={styles.pane}>
                                {files.map((file, index) => (
                                    <NewsIcon
                                        key={index}
                                        title={file.name}
                                        onClick={async () => {
                                            setPeekingContent({
                                                id: index,
                                                title: file.name,
                                                content: await file.text(),
                                            });
                                            setPeeking(true);
                                        }}
                                        onDelete={() => {
                                            const allFiles = [...files];
                                            allFiles.splice(index, 1);
                                            setFiles([...allFiles]);
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                        <div className={styles.submit}>
                            {files.length > 0 && <SubmitButton title={'Upload!'} onClick={upload} />}
                        </div>
                    </div>
                    {peeking && (
                        <WaitingForTransaction
                            onClickOut={() => setPeeking(false)}
                        >
                            <ContentArea
                                id={peekingContent.id}
                                title={peekingContent.title}
                                content={peekingContent.content}
                            />
                        </WaitingForTransaction>
                    )}
                    {waiting && <WaitingForTransaction />}
                </>
            )}
            {!ipfs && <LoadingComponent text={'Connecting to IPFS...'} />}
        </>
    );
};

export default UploadArea;
