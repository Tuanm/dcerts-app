import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NotificationContext } from '../../App';
import AuthFilter from '../../components/AuthFilter';
import LoadingComponent from '../../components/LoadingComponent';
import { Web3Context } from '../../components/Web3';
import BallotWallet from '../../contracts/BallotWallet';
import IPFS from '../../services/ipfs';
import styles from './index.module.scss';

enum Actions {
    UNKNOWN,
    ADD_BATCH,
    LOCK_BATCH,
    UNLOCK_BATCH,
    LOCK_CONTENT,
    UNLOCK_CONTENT,
}

const PeekingActionArea = () => {
    const web3 = useContext(Web3Context);
    const pushNotification = useContext(NotificationContext);
    const { group, id } = useParams();
    const [loaded, setLoaded] = useState(false);
    const [action, setAction] = useState<Actions>();
    const [contents, setContents] = useState<{
        tag: number,
        data: any;
    }[]>([]);
    const navigate = useNavigate();

    const isPopUp = () => window.opener && window.opener !== window;

    useEffect(() => {
        if (!isPopUp()) {
            // navigate(-1);
            setLoaded(false);
            pushNotification({
                title: 'Ối!',
                message: 'Có gì đó sai sai!?',
                type: 'error',
            });
        } else {
            (async () => {
                if (group && Number.isInteger(Number(id))) {
                    const contract = BallotWallet.attach(group, web3);
                    const result = await contract.peek(Number(id));
                    const parsed = [] as {
                        tag: number,
                        data: any,
                    }[];
                    const { method, inputs } = result.decodedData;
                    if (method === 'addBatch') {
                        for (const { cid, tag } of BallotWallet.parseAddBatch(inputs)) {
                            parsed.push({
                                tag,
                                data: await IPFS.get(cid),
                            });
                        }
                        setAction(Actions.ADD_BATCH);
                    } else if (method === 'lockBatch') {
                        const batchId = BallotWallet.parseLockBatch(inputs);
                        setAction(Actions.LOCK_BATCH);
                    } else if (method === 'unlockBatch') {
                        const batchId = BallotWallet.parseUnlockBatch(inputs);
                        setAction(Actions.UNLOCK_BATCH);
                    } else if (method === 'lock') {
                        const contentId = BallotWallet.parseLockContent(inputs);
                        setAction(Actions.LOCK_CONTENT);
                    } else if (method === 'unlock') {
                        const contentId = BallotWallet.parseUnlockContent(inputs);
                        setAction(Actions.UNLOCK_CONTENT);
                    }
                    setContents(parsed);
                    console.log(parsed);
                }
            })();
        }
    }, [group, id]);

    return (
        <>
            <AuthFilter
                setLoaded={setLoaded}
                group={group}
            />
            {loaded && (
                <div className={styles.container}>
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
                </div>
            )}
        </>
    );
};

export default PeekingActionArea;