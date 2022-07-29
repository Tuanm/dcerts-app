import React, { useContext, useEffect, useState } from 'react';
import LoadingComponent from '../../components/LoadingComponent';
import NewsIcon from '../../components/NewsIcon';
import SimpleInput from '../../components/SimpleInput';
import SubmitButton from '../../components/SubmitButton';
import WaitingForTransaction from '../../components/WaitingForTransaction';
import { Web3Context } from '../../components/Web3';
import IPFS from '../../utils/ipfs';
import styles from './index.module.scss';
import { NotificationContext } from '../../App';

const Dev = () => {
    const web3 = useContext(Web3Context);
    const pushNotification = useContext(NotificationContext);
    const [ipfs, setIPFS] = useState<IPFS>();
    const [uploaded, setUploaded] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [files, setFiles] = useState<{
        text: string,
        tag: string,
    }[]>([]);

    useEffect(() => {
        setIPFS(IPFS.create());
    }, []);

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
            if (files.length && ipfs) {
                const contents = [] as {
                    cid: string,
                    tag: string,
                }[];
                for (const { text, tag } of files) {
                    const cid = await addToIPFS(text);
                    contents.push({ cid, tag });
                }
                const poolAddress = process.env.REACT_APP_CONTENT_POOL_ADDRESS;
                if (poolAddress) {
                    await web3.send(poolAddress, 'addBatch', ['(string,string)[]'], [
                        ...contents.map((content) => [content.cid, content.tag]),
                    ]);
                }
                setFiles([]);
                handleSuccess('Cấp phát nội dung thành công!');
            }
        } catch (err: any) {
            handleError(err);
        }
        setWaiting(false);
    };

    return (
        <>
            {ipfs && (
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
            {!ipfs && <LoadingComponent text={'Đang kết nối với IPFS...'} />}
        </>
    );
};

export default Dev;
