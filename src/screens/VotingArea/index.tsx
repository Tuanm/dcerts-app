import React, { useEffect, useState } from 'react';
import LoadingComponent from '../../components/LoadingComponent';
import NavigationBar from '../../components/NavigationBar';
import SimpleInput from '../../components/SimpleInput';
import IPFS from '../../utils/ipfs';
import styles from './index.module.scss';
import { DashRoute, SearchRoute, UploadAreaRoute } from '../../Routes';
import { useParams } from 'react-router-dom';
import AuthFilter from '../../components/AuthFilter';
import SubmitButton from '../../components/SubmitButton';

const VotingArea = () => {
    const { group } = useParams();
    const [loaded, setLoaded] = useState(false);
    const [ipfs, setIPFS] = useState<IPFS>();
    const [action, setAction] = useState<number>();

    useEffect(() => {
        if (loaded) {
            setIPFS(IPFS.create());
        }
    }, [loaded, group]);

    const peek = async () => {
        window.open(window.location.origin + `/${group}/peek/${action}`, '_blank', 'popup=true');
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
                            </>
                        )}
                    </div>
                </>
            )}
            {loaded && !ipfs && <LoadingComponent text={'Đang kết nối với IPFS...'} />}
        </>
    );
};

export default VotingArea;
