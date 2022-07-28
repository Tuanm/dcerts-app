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
    const [verified, setVerified] = useState(false);

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
                const name = groupName(author);
                if (name) {
                    setAuthor(name);
                    setVerified(true);
                }
            } else throw new Error();
        } catch (err: any) {
            setContent(undefined);
            setAuthor(undefined);
            setVerified(false);
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
            {loading && (
                <WaitingForTransaction />
            )}
        </>
    );
};

export default Test;