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
import { NotificationContext } from '../../App';
import { DashRoute, UploadAreaRoute, VotingAreaRoute } from '../../Routes';
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
    };

    const getTagFromFileName = (file: File) => {
        const tag = file.name.substring(0, file.name.lastIndexOf('.'));
        return parseInt(tag);
    };

    const upload = async () => {
        setWaiting(true);
        try {
            if (group && files.length && ipfs) {
                const contents = [] as {
                    cid: string,
                    tag: number,
                }[];
                for (const file of files) {
                    const tag = getTagFromFileName(file);
                    if (Number.isNaN(tag)) {
                        throw new Error('File name must be a number!');
                    }
                    const text = await file.text();
                    const cid = (await ipfs.add(text)).toString();
                    contents.push({ cid, tag });
                }
                await web3.send(group, 'addBatch', ['(string,uint256)[]'], [
                    ...contents.map((content) => [content.cid, content.tag]),
                ]);
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
                    {
                        path: VotingAreaRoute.path.replace(':group', group || ''),
                        text: 'Vote',
                    },
                    {
                        path: UploadAreaRoute.path.replace(':group', group || ''),
                        text: 'Upload',
                    },
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
                                                id: getTagFromFileName(file),
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
