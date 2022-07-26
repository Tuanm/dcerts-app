import React, { useContext, useEffect, useState } from 'react';
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
import { DashRoute, SearchRoute, UploadAreaRoute } from '../../Routes';
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
    const [files, setFiles] = useState<{
        text: string,
        tag: string,
    }[]>([]);

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

    const addToIPFS = async (text: string) => {
        if (ipfs) {
            return (await ipfs.add(text)).toV1().toString();
        } else throw new Error('Có lỗi xảy ra!');
    };

    const preview = async (text: string) => {
        try {
            const cid = await addToIPFS(text);
            window.open(window.location.origin + `/preview/${cid}`, '_blank', 'popup=true');
        } catch (err: any) {
            handleError(err);
        }
    };

    const upload = async () => {
        setWaiting(true);
        try {
            if (group && files.length && ipfs) {
                const contents = [] as {
                    cid: string,
                    tag: string,
                }[];
                for (const { text, tag } of files) {
                    const cid = await addToIPFS(text);
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
                            onChange={async (fileList: FileList) => {
                                try {
                                    for (const file of Array.from(fileList)) {
                                        if (file.type !== 'application/json') {
                                            throw new Error('Chỉ chấp nhận tập tin có định dạng JSON!');
                                        }
                                    }
                                    const newFiles = [] as {
                                        text: string,
                                        tag: string,
                                    }[];
                                    for (const file of Array.from(fileList)) {
                                        const text = await file.text();
                                        const tag = JSON.parse(text).tag;
                                        newFiles.push({
                                            text,
                                            tag,
                                        });
                                    }
                                    setFiles([...files, ...newFiles]);
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
                                        title={`#${file.tag}`}
                                        hoverTitle={'Xem chi tiết!'}
                                        onClick={async () => {
                                            await preview(file.text);
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
                    {waiting && <WaitingForTransaction />}
                </>
            )}
            {loaded && !ipfs && <LoadingComponent text={'Đang kết nối với IPFS...'} />}
        </>
    );
};

export default UploadArea;
