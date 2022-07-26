import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NotificationContext } from '../../App';
import AuthFilter from '../../components/AuthFilter';
import ConfirmationPane from '../../components/ConfirmationPane';
import ContentArea from '../../components/ContentArea';
import GoBackIcon from '../../components/GoBackIcon';
import LoadingComponent from '../../components/LoadingComponent';
import WaitingForTransaction from '../../components/WaitingForTransaction';
import { Web3Context } from '../../components/Web3';
import BallotWallet from '../../contracts/BallotWallet';
import ContentPool from '../../contracts/ContentPool';
import IPFS from '../../services/ipfs';
import Search from '../../services/search';
import styles from './index.module.scss';

enum Actions {
    UNKNOWN,
    ADD_BATCH,
    LOCK_BATCH,
    UNLOCK_BATCH,
    LOCK_CONTENT,
    UNLOCK_CONTENT,
}

const PeekingArea = () => {
    const web3 = useContext(Web3Context);
    const pushNotification = useContext(NotificationContext);
    const { group, id } = useParams();
    const [loaded, setLoaded] = useState(false);
    const [action, setAction] = useState<Actions>();
    const [contents, setContents] = useState<{
        tag: string,
        content: {
            tag: string,
            type: string,
            data: any,
        };
    }[]>([]);
    const [actionText, setActionText] = useState<string>();
    const [loading, setLoading] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [actionProperties, setActionProperties] = useState({
        executed: false,
        cancelled: false,
    });
    const navigate = useNavigate();

    const isPopUp = () => window.opener && window.opener !== window;

    const contentPool = () => {
        const poolAddress = process.env.REACT_APP_CONTENT_POOL_ADDRESS;
        if (poolAddress) {
            return ContentPool.attach(poolAddress, web3);
        } else {
            throw new Error('Không kết nối được đến kho lưu trữ nội dung.');
        }
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

    const contentFromIPFS = async (cid: string) => {
        const content = await IPFS.get(cid);
        if (typeof content === 'string') return JSON.parse(content);
        return content;
    };

    const vote = async (affirmed: boolean) => {
        setWaiting(true);
        try {
            console.log(group, id);
            if (group && Number.isInteger(Number(id))) {
                await web3.send(group, 'vote', ['uint256', 'bool'], id, affirmed);
                handleSuccess(`Đã bỏ phiếu cho hành động ${id}.`);
            }
        } catch (err: any) {
            handleError(err);
        }
        setWaiting(false);
    };

    const actionProps = async (actionId: number) => {
        const found = await Search.forCollection('actions', {
            group,
            id: actionId,
        });
        if (found.data.length) {
            return found.data[0] as {
                executed: boolean,
                cancelled: boolean,
            };
        } else throw new Error('Không tìm thấy!');
    };

    useEffect(() => {
        if (!isPopUp()) {
            navigate(-1);
        }
        (async () => {
            setLoading(true);
            try {
                if (group && Number.isInteger(Number(id))) {
                    setActionProperties(await actionProps(Number(id)));
                    const pool = contentPool();
                    const contract = BallotWallet.attach(group, web3);
                    const result = await contract.peek(Number(id));
                    const parsed = [] as {
                        tag: string,
                        content: {
                            tag: string,
                            type: string,
                            data: any,
                        },
                    }[];
                    const { method, inputs } = result.decodedData;
                    let tempAction = Actions.UNKNOWN;
                    if (method === 'addBatch') {
                        for (const { cid, tag } of BallotWallet.parseAddBatch(inputs)) {
                            parsed.push({
                                tag,
                                content: await contentFromIPFS(cid),
                            });
                        }
                        tempAction = Actions.ADD_BATCH;
                    } else if (method === 'lockBatch') {
                        const batchId = BallotWallet.parseLockBatch(inputs);
                        for (const { cid, tag } of await pool.getBatch(batchId)) {
                            parsed.push({
                                tag,
                                content: await contentFromIPFS(cid),
                            });
                        }
                        tempAction = Actions.LOCK_BATCH;
                    } else if (method === 'unlockBatch') {
                        const batchId = BallotWallet.parseUnlockBatch(inputs);
                        for (const { cid, tag } of await pool.getBatch(batchId)) {
                            parsed.push({
                                tag,
                                content: await contentFromIPFS(cid),
                            });
                        }
                        tempAction = Actions.UNLOCK_BATCH;
                    } else if (method === 'lock') {
                        const contentId = BallotWallet.parseLockContent(inputs);
                        const { cid, tag } = await pool.get(contentId);
                        parsed.push({
                            tag,
                            content: await contentFromIPFS(cid),
                        });
                        tempAction = Actions.LOCK_CONTENT;
                    } else if (method === 'unlock') {
                        const contentId = BallotWallet.parseUnlockContent(inputs);
                        const { cid, tag } = await pool.get(contentId);
                        parsed.push({
                            tag,
                            content: await contentFromIPFS(cid),
                        });
                        tempAction = Actions.UNLOCK_CONTENT;
                    }
                    setAction(tempAction);
                    setActionText(actionTitle(tempAction));
                    setContents(parsed);
                } else {
                    throw new Error('Có gì đó sai sai!');
                }
            } catch (err: any) {
                handleError(err);
            }
            setLoading(false);
        })();
    }, [group, id]);

    const actionTitle = (action: Actions) => {
        if (action === Actions.ADD_BATCH) return 'Cấp phát';
        if (action === Actions.LOCK_BATCH) return 'Tạm khoá các nội dung';
        if (action === Actions.UNLOCK_BATCH) return 'Mở khoá các nội dung';
        if (action === Actions.LOCK_CONTENT) return 'Tạm khoá nội dung';
        if (action === Actions.UNLOCK_CONTENT) return 'Mở khoá nội dung';
        return 'Hoạt động không rõ ràng.';
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
                                {action === Actions.UNKNOWN && (
                                    <LoadingComponent
                                        text={'Hành động không khả dụng.'}
                                        cancelText={isPopUp() ? 'Đóng cửa sổ!' : 'Quay lại!'}
                                        onCancel={() => {
                                            if (isPopUp()) window.close();
                                            else navigate(-1);
                                        }}
                                    />
                                )}
                                {action !== Actions.UNKNOWN && (
                                    <>
                                        {actionText && (
                                            <div className={styles.title}>
                                                {actionText}
                                            </div>
                                        )}
                                        {actionProperties.executed && (
                                            <div className={styles.text}>
                                                {'Hành động này đã được thực thi.'}
                                            </div>
                                        )}
                                        {actionProperties.cancelled && (
                                            <div className={styles.text}>
                                                {'Hành động này đã bị huỷ.'}
                                            </div>
                                        )}
                                        {!actionProperties.executed && !actionProperties.cancelled && (
                                            <div className={styles.submit}>
                                                <ConfirmationPane
                                                    onConfirm={async () => {
                                                        await vote(true);
                                                    }}
                                                    onReject={async () => {
                                                        await vote(false);
                                                    }}
                                                />
                                            </div>
                                        )}
                                        {contents.map(({ tag, content }, index) => (
                                            <ContentArea
                                                key={index}
                                                id={tag}
                                                title={content.type}
                                                content={content}
                                            />
                                        ))}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                    {waiting && <WaitingForTransaction />}
                </>
            )}
        </>
    );
};

export default PeekingArea;