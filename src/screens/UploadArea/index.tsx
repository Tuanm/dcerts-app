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
import { DashRoute, SearchRoute, UploadAreaRoute, VotingAreaRoute } from '../../Routes';
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
    const [peekingContent, setPeekingContent] = useState<{
        id: number,
        title: string,
        content: {
            type: string,
            data: any,
        },
    }>();
    const [files, setFiles] = useState<File[]>([]);

    useEffect(() => {
        if (loaded) {
            setIPFS(IPFS.create());
        }
    }, [loaded, group]);

    const handleError = (err: any) => {
        pushNotification({
            title: 'Ối!',
            message: web3.getRevertReason(err?.message),
            type: 'error',
        });
    };

    const handleSuccess = (data?: any) => {
        pushNotification({
            title: 'Quá tuyệt vời!',
            message: data,
            type: 'success',
        });
    };

    const getTagFromFileName = (file: File) => {
        return file.name.substring(0, file.name.lastIndexOf('.'));
    };

    const upload = async () => {
        setWaiting(true);
        try {
            if (group && files.length && ipfs) {
                const contents = [] as {
                    cid: string,
                    tag: string,
                }[];
                for (const file of files) {
                    const tag = getTagFromFileName(file);
                    const text = await file.text();
                    const cid = (await ipfs.add(text)).toV1().toString();
                    contents.push({ cid, tag });
                }
                await web3.send(group, 'addBatch', ['(string,string)[]'], [
                    ...contents.map((content) => [content.cid, content.tag]),
                ]);
                setFiles([]);
                handleSuccess('Đã tạo một cuộc bỏ phiếu để cấp phát nội dung này.');
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
                        path: SearchRoute.path.replace(':group', group || ''),
                        text: SearchRoute.text,
                    },
                    {
                        path: VotingAreaRoute.path.replace(':group', group || ''),
                        text: VotingAreaRoute.text,
                    },
                    {
                        path: UploadAreaRoute.path.replace(':group', group || ''),
                        text: UploadAreaRoute.text,
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
                            placeholder={'Thêm nội dung!'}
                            onChange={(fileList: FileList) => {
                                try {
                                    for (const file of Array.from(fileList)) {
                                        if (file.type !== 'application/json') {
                                            throw new Error('Chỉ chấp nhận tệp tin có định dạng JSON!');
                                        }
                                    }
                                    setFiles([...files, ...Array.from(fileList)]);
                                    setUploaded(true);
                                } catch (err: any) {
                                    handleError(err);
                                }
                            }}
                            accept={['.json']}
                        />
                        {uploaded && files.length > 0 && (
                            <div className={styles.pane}>
                                {files.map((file, index) => (
                                    <NewsIcon
                                        key={index}
                                        title={file.name.replace(/.json$/, '')}
                                        hoverTitle={'Xem chi tiết!'}
                                        onClick={async () => {
                                            const content = JSON.parse((await file.text()).replaceAll(/[\r\n]/g, '')) as {
                                                type: string,
                                                data: any,
                                            };
                                            setPeekingContent({
                                                id: parseInt(getTagFromFileName(file)),
                                                title: content.type,
                                                content: content,
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
                                <SubmitButton title={'Cấp phát!'} onClick={upload} />
                            </div>
                        )}
                    </div>
                    {peeking && peekingContent !== undefined && (
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
            {loaded && !ipfs && <LoadingComponent text={'Đang kết nối với IPFS...'} />}
        </>
    );
};

export default UploadArea;
