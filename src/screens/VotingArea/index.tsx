import React, { useContext, useEffect, useState } from 'react';
import LoadingComponent from '../../components/LoadingComponent';
import NavigationBar from '../../components/NavigationBar';
import SimpleInput from '../../components/SimpleInput';
import WaitingForTransaction from '../../components/WaitingForTransaction';
import { Web3Context } from '../../components/Web3';
import IPFS from '../../utils/ipfs';
import styles from './index.module.scss';
import { NotificationContext } from '../../App';
import ConfirmationPane from '../../components/ConfirmationPane';
import { DashRoute, SearchRoute, UploadAreaRoute, VotingAreaRoute } from '../../Routes';
import { useParams } from 'react-router-dom';
import AuthFilter from '../../components/AuthFilter';
import SubmitButton from '../../components/SubmitButton';
import BallotWallet from '../../contracts/BallotWallet';
import Search from '../../services/search';
import MainFeatureIcon from '../../components/MainFeatureIcon';

const VotingArea = () => {
    const web3 = useContext(Web3Context);
    const { group } = useParams();
    const pushNotification = useContext(NotificationContext);
    const [loaded, setLoaded] = useState(false);
    const [ipfs, setIPFS] = useState<IPFS>();
    const [action, setAction] = useState<number>();
    const [waiting, setWaiting] = useState(false);
    const [actionProps, setActionProps] = useState<{
        method?: string,
        data?: any,
        voted: boolean,
        executed: boolean,
        cancelled: boolean,
    }>();

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
    }

    const validate = async (actionId: number, method: string) => {
        const result = await Search.forCollection('actions', {
            group: group,
            id: actionId,
        });
        if (result.length) {
            const existed = result[0] as {
                voted: boolean,
                executed: boolean,
                cancelled: boolean,
            };
            return {
                method: method,
                voted: existed.voted,
                executed: existed.executed,
                cancelled: existed.cancelled,
            };
        }
    };

    const peek = async () => {
        try {
            if (group && Number.isInteger(action)) {
                const contract = BallotWallet.attach(group, web3);
                const result = await contract.peek(Number(action));
                setActionProps(await validate(
                    Number(action),
                    result.decodedData.method,
                ));
            }
        } catch (err: any) {
            handleError(err);
            setActionProps(undefined);
        }
    };

    const peekingDescriptions = () => {
        const descriptions = [] as string[];
        if (actionProps) {
            if (actionProps.voted) {
                descriptions.push('Bạn đã bỏ phiếu cho hành động này.');
            }
            if (actionProps.executed) {
                descriptions.push('Hành động này đã được thực thi.');
            }
            if (actionProps.cancelled) {
                descriptions.push('Hành động này đã bị huỷ.');
            }
        }
        return descriptions;
    };

    const vote = async (affirmed: boolean) => {
        setWaiting(true);
        try {
            if (group && Number.isInteger(action)) {
                await web3.send(group, 'vote', ['uint256', 'bool'], action, affirmed);
                handleSuccess(`Đã bỏ phiếu cho hành động ${action}.`);
            }
        } catch (err: any) {
            handleError(err);
        }
        setAction(undefined);
        setActionProps(undefined);
        setWaiting(false);
    };

    const agree = async () => {
        await vote(true);
    };

    const disagree = async () => {
        await vote(false);
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
                            placeholder={'Bạn muốn bỏ phiếu cho hành động nào?'}
                            onChange={async (text: string) => {
                                const parsed = parseInt(text);
                                if (Number.isInteger(parsed)) {
                                    setAction(parsed);
                                } else {
                                    setAction(undefined);
                                }
                            }}
                        />
                        {action !== undefined && (
                            <>
                                <SubmitButton
                                    title={'Tra cứu!'}
                                    onClick={peek}
                                />
                                {actionProps !== undefined && (
                                    <>
                                        <MainFeatureIcon
                                            title={actionProps.method || 'unknown'}
                                            descriptions={peekingDescriptions()}
                                        />
                                        {!actionProps.voted && !actionProps.executed && !actionProps.cancelled && (
                                            <div className={styles.submit}>
                                                <ConfirmationPane
                                                    onConfirm={agree}
                                                    onReject={disagree}
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                    {waiting && <WaitingForTransaction />}
                </>
            )}
            {loaded && !ipfs && <LoadingComponent text={'Đang kết nối với IPFS...'} />}
        </>
    );
};

export default VotingArea;
