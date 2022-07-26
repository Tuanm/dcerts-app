import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NotificationContext } from '../../App';
import AuthFilter from '../../components/AuthFilter';
import styles from './index.module.scss';
import ContentArea from '../../components/ContentArea';
import { Web3Context } from '../../components/Web3';
import IPFS from '../../services/ipfs';
import GoBackIcon from '../../components/GoBackIcon';
import LoadingComponent from '../../components/LoadingComponent';

const PreviewArea = () => {
    const web3 = useContext(Web3Context);
    const pushNotification = useContext(NotificationContext);
    const { cid } = useParams();
    const [loaded, setLoaded] = useState(false);
    const [content, setContent] = useState<{
        tag: string,
        type: string,
        data: any,
    }>();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const isPopUp = () => window.opener && window.opener !== window;

    const contentFromIPFS = async (cid: string) => {
        const content = await IPFS.get(cid);
        if (typeof content === 'string') return JSON.parse(content);
        return content;
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
                if (cid) {
                    setContent(await contentFromIPFS(cid));
                } else {
                    throw new Error('Có gì đó sai sai!');
                }
            } catch (err: any) {
                handleError(err);
            }
            setLoading(false);
        })();
    }, [cid]);

    return (
        <>
            <AuthFilter
                setLoaded={setLoaded}
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
                                {content && (
                                    <ContentArea
                                        id={content.tag}
                                        title={content.type}
                                        content={content}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
        </>
    );
};

export default PreviewArea;