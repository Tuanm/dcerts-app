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
import { signAdd, signAddBatch } from '../../contracts/ContentPool';
import { NotificationContext } from '../../App';
import { DashRoute } from '../../Routes';
import AuthFilter from '../../components/AuthFilter';
import { useParams } from 'react-router-dom';

const UploadArea = () => {
    const web3 = useContext(Web3Context);
    const { group } = useParams();
    const pushNotification = useContext(NotificationContext);
    const [loaded, setLoaded] = useState(false);
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
        if (loaded) {
            setIPFS(IPFS.create(process.env.REACT_APP_IPFS_URL));
        }
    }, [loaded]);

    const handleError = (err: any) => {
        pushNotification({
            title: 'Whoops!',
            message: web3.getRevertReason(err?.message),
            type: 'error',
        });
    };

    const handleSuccess = (data?: any) => {
        pushNotification({
            title: 'Successfully!',
            message: data,
            type: 'success',
        });
    }

    const upload = async () => {
        setWaiting(true);
        try {
            if (files.length && ipfs) {
                const contents = [];
                for (const file of files) {
                    contents.push(await file.text());
                }
                const contentPoolAddress = process.env.REACT_APP_CONTENT_POOL_ADDRESS || '';
                const { abi } = require('../../contracts/BallotWallet.json');
                const contract = web3.contract('0xc6e7df5e7b4f2a278906862b61205850344d4e7d', abi);
                const cids = (await ipfs.addAll(contents)).map((cid) => cid.toString());
                const { functionName, parameters } = cids.length > 1
                    ? signAddBatch(cids)
                    : signAdd(cids[0]);
                await contract.start(
                    contentPoolAddress,
                    functionName,
                    parameters,
                );
                setFiles([]);
                handleSuccess('Uploaded.');
            }
        } catch (err: any) {
            handleError(err);
        }
        setWaiting(false);
    };

    return (
        <>
            <NavigationBar
                links={[
                    DashRoute,
                ]}
            />
            <AuthFilter
                setLoaded={setLoaded}
                group={group}
            />
            {loaded && ipfs && (
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
                        {files.length > 0 && (
                            <div className={styles.submit}>
                                <SubmitButton title={'Upload'} onClick={upload} />
                            </div>
                        )}
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
            {loaded && !ipfs && <LoadingComponent text={'Connecting to IPFS...'} />}
        </>
    );
};

export default UploadArea;
