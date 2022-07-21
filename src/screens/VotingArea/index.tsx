import React, { useContext, useEffect, useState } from 'react';
import ContentArea from '../../components/ContentArea';
import LoadingComponent from '../../components/LoadingComponent';
import NavigationBar from '../../components/NavigationBar';
import SimpleInput from '../../components/SimpleInput';
import WaitingForTransaction from '../../components/WaitingForTransaction';
import { Web3Context } from '../../components/Web3';
import IPFS from '../../utils/ipfs';
import styles from './index.module.scss';
import { NotificationContext } from '../../App';
import ConfirmationPane from '../../components/ConfirmationPane';
import { DashRoute, UploadAreaRoute, VotingAreaRoute } from '../../Routes';
import { useParams } from 'react-router-dom';
import AuthFilter from '../../components/AuthFilter';

const VotingArea = () => {
    const web3 = useContext(Web3Context);
    const { group, id } = useParams();
    const pushNotification = useContext(NotificationContext);
    const [loaded, setLoaded] = useState(false);
    const [ipfs, setIPFS] = useState<IPFS>();
    const [action, setAction] = useState<number>();
    const [waiting, setWaiting] = useState(false);
    const [peeking, setPeeking] = useState(false);
    const [peekingContent, setPeekingContent] = useState({
        id: 0,
        title: '',
        content: '',
    });

    useEffect(() => {
        if (loaded) {
            setIPFS(IPFS.create(process.env.REACT_APP_IPFS_URL));
            if (id && !Number.isNaN(parseInt(id))) {
                setAction(parseInt(id));
            }
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

    const vote = async (affirmed: boolean) => {
        setWaiting(true);
        try {
            if (group && Number.isInteger(action)) {
                await web3.send(group, 'vote', ['uint256', 'bool'], action, affirmed);
                handleSuccess(`Action ${action} has been voted.`);
            }
        } catch (err: any) {
            handleError(err);
        }
        setAction(undefined);
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
                            locked={id !== undefined}
                            placeholder={id || 'What action do you want to vote?'}
                            onChange={(text: string) => {
                                const parsed = parseInt(text);
                                if (Number.isInteger(parsed)) {
                                    setAction(parsed);
                                } else {
                                    setAction(undefined);
                                }
                            }}
                        />
                        {action !== undefined && (
                            <div className={styles.submit}>
                                <ConfirmationPane
                                    onConfirm={agree}
                                    onReject={disagree}
                                />
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

export default VotingArea;
