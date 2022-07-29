import React, { useContext, useState } from 'react';
import { NotificationContext } from '../../App';
import styles from './index.module.scss';
import ContentArea from '../../components/ContentArea';
import { Web3Context } from '../../components/Web3';
import IPFS from '../../services/ipfs';
import SimpleInput from '../../components/SimpleInput';
import SubmitButton from '../../components/SubmitButton';
import ContentPool from '../../contracts/ContentPool';
import WaitingForTransaction from '../../components/WaitingForTransaction';
import groups from '../../groups.json';
import TextShortCut from '../../components/TextShortCut';
import classNames from 'classnames';

const Test = () => {
    const web3 = useContext(Web3Context);
    const pushNotification = useContext(NotificationContext);
    const [id, setId] = useState<number>();
    const [content, setContent] = useState<{
        tag: string,
        type: string,
        data: any,
    }>();
    const [loading, setLoading] = useState(false);
    const [author, setAuthor] = useState<string>();

    const groupName = (id: string) => {
        for (const group of groups) {
            if (group.id === id) {
                return group.name;
            }
        }
    };

    const contentPool = () => {
        const poolAddress = process.env.REACT_APP_CONTENT_POOL_ADDRESS;
        if (poolAddress) {
            return ContentPool.attach(poolAddress, web3);
        } else {
            throw new Error('Không kết nối được đến kho lưu trữ nội dung.');
        }
    };

    const contentFromIPFS = async (cid: string) => {
        const content = await IPFS.get(cid);
        if (typeof content === 'string') return JSON.parse(content);
        return content;
    };

    const handleError = (err: any) => {
        pushNotification({
            title: 'Ối!',
            message: 'Tra cứu không thành công!',
            type: 'error',
        });
    };

    const test = async () => {
        setLoading(true);
        try {
            if (id && Number.isInteger(Number(id))) {
                const pool = contentPool();
                const { cid, author } = await pool.get(id);
                setContent(await contentFromIPFS(cid));
                setAuthor(groupName(author));
            } else throw new Error();
        } catch (err: any) {
            setContent(undefined);
            setAuthor(undefined);
            handleError(err);
        }
        setLoading(false);
    };

    return (
        <>
            <div className={styles.container}>
                <SimpleInput
                    placeholder={'Mã số nội dung'}
                    onChange={async (text: string) => {
                        const parsed = parseInt(text);
                        if (Number.isInteger(parsed)) {
                            setId(parsed);
                        } else {
                            setId(undefined);
                        }
                    }}
                />
                <SubmitButton
                    title={'Tra cứu!'}
                    onClick={test}
                />
                {!loading && (
                    <>
                        {content && (
                            <>
                                {author && (
                                    <div className={styles.text}>
                                        {`Nội dung này được cấp phát bởi `}
                                        <TextShortCut
                                            text={author}
                                        />
                                        {'.'}
                                    </div>
                                )}
                                {!author && (
                                    <div className={styles.text}>
                                        {'Nội dung này được cấp phát bởi một cơ sở chưa xác thực.'}
                                    </div>
                                )}
                                <div className={classNames({
                                    [styles.unverified]: !author,
                                })}>
                                    <ContentArea
                                        id={content.tag}
                                        title={content.type}
                                        content={content}
                                    />
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
            {loading && (
                <WaitingForTransaction />
            )}
        </>
    );
};

export default Test;