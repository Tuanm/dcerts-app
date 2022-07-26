import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NotificationContext } from '../../App';
import AuthFilter from '../../components/AuthFilter';
import SubmitButton from '../../components/SubmitButton';
import WaitingForTransaction from '../../components/WaitingForTransaction';
import styles from './index.module.scss';
import ContentArea from '../../components/ContentArea';
import ContentPool from '../../contracts/ContentPool';
import { Web3Context } from '../../components/Web3';
import IPFS from '../../services/ipfs';
import GoBackIcon from '../../components/GoBackIcon';
import LoadingComponent from '../../components/LoadingComponent';
import Search from '../../services/search';

const LockingArea = () => {
    const web3 = useContext(Web3Context);
    const pushNotification = useContext(NotificationContext);
    const { group, id } = useParams();
    const [loaded, setLoaded] = useState(false);
    const [content, setContent] = useState<{
        tag: string,
        type: string,
        data: any,
    }>();
    const [contentLocked, setContentLocked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const navigate = useNavigate();

    const isPopUp = () => window.opener && window.opener !== window;

    const contentPool = () => {
        if (process.env.REACT_APP_CONTENT_POOL_ADDRESS) {
            return ContentPool.attach(
                process.env.REACT_APP_CONTENT_POOL_ADDRESS,
                web3,
            );
        } else {
            throw new Error('Không kết nối được đến kho lưu trữ nội dung.');
        }
    };

    const contentFromIPFS = async (cid: string) => {
        const content = await IPFS.get(cid);
        if (typeof content === 'string') return JSON.parse(content);
        return content;
    };

    const handleSuccess = (data?: any) => {
        pushNotification({
            title: 'Quá tuyệt vời!',
            message: data,
            type: 'success',
        });
    };

    const handleError = (err: any) => {
        pushNotification({
            title: 'Ối!',
            message: web3.getRevertReason(err?.message),
            type: 'error',
        });
    };

    useEffect(() => {
        if (!isPopUp()) {
            navigate(-1);
        }
        (async () => {
            setLoading(true);
            try {
                if (group && Number.isInteger(Number(id))) {
                    const found = await Search.forCollection('contents', {
                        group,
                        id: Number(id),
                    });
                    if (found.data.length) {
                        const { locked } = found.data[0] as {
                            locked: boolean,
                        };
                        if (!locked) {
                            const pool = contentPool();
                            const { cid } = await pool.get(Number(id));
                            setContent(await contentFromIPFS(cid));
                        }
                        setContentLocked(locked);
                    }
                } else {
                    throw new Error('Có gì đó sai sai!');
                }
            } catch (err: any) {
                handleError(err);
            }
            setLoading(false);
        })();
    }, [group, id]);

    const lock = async () => {
        setWaiting(true);
        try {
            console.log(group, id);
            if (group && Number.isInteger(Number(id))) {
                await web3.send(group, 'lock', ['uint256'], id);
                handleSuccess(`Đã tạo hành động để khoá nội dung ${id}.`);
            }
        } catch (err: any) {
            handleError(err);
        }
        setWaiting(false);
    };

    return (
        <>
            <AuthFilter
                setLoaded={setLoaded}
                group={group}
            />
            {loaded && (
                <>
                    <GoBackIcon
                        text={'Đóng'}
                        onClick={() => {
                            window.close();
                        }}
                    />
                    <div className={styles.container}>
                        {loading && (
                            <LoadingComponent
                                text={'Đợi chút...'}
                            />
                        )}
                        {!loading && (
                            <>
                                {contentLocked && (
                                    <LoadingComponent
                                        text={'Nội dung đã bị khoá!'}
                                    />
                                )}
                                {!contentLocked && content && (
                                    <>
                                        <div className={styles.submit}>
                                            <SubmitButton
                                                title={'Khoá!'}
                                                onClick={lock}
                                            />
                                        </div>
                                        <ContentArea
                                            id={content.tag}
                                            title={content.type}
                                            content={content}
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </div>
                    {waiting && (
                        <WaitingForTransaction />
                    )}
                </>
            )}
        </>
    );
};

export default LockingArea;