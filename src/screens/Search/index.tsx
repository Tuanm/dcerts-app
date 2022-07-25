import React, { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { NotificationContext } from '../../App';
import SearchAPI from '../../services/search';
import AuthFilter from '../../components/AuthFilter';
import DropDownMenu from '../../components/DropDownMenu';
import NavigationBar from '../../components/NavigationBar';
import NewsIcon from '../../components/NewsIcon';
import SelectionPane from '../../components/SelectionPane';
import SubmitButton from '../../components/SubmitButton';
import WaitingForTransaction from '../../components/WaitingForTransaction';
import { DashRoute, SearchRoute, UploadAreaRoute, VotingAreaRoute } from '../../Routes';
import styles from './index.module.scss';
import Pagination from '../../components/Pagination';
import ContentArea from '../../components/ContentArea';
import ContentPool from '../../contracts/ContentPool';
import { Web3Context } from '../../components/Web3';
import IPFS from '../../services/ipfs';

const SearchTypes = {
    ACTION: 'Hành động',
    CONTENT: 'Nội dung',
};

const Collections = {
    ACTION: 'actions',
    CONTENT: 'contents',
};

const Queries = {
    ACTION: [
        {
            name: 'Chưa thực thi',
            value: {
                executed: false,
            },
        },
        {
            name: 'Đã thực thi',
            value: {
                executed: true,
            },
        },
        {
            name: 'Đã huỷ',
            value: {
                cancelled: true,
            },
        }
    ],
    CONTENT: [
        {
            name: 'Đã khoá',
            value: {
                locked: true,
            },
        },
        {
            name: 'Chưa khoá',
            value: {
                locked: false,
            },
        },
    ],
};

const Search = () => {
    const web3 = useContext(Web3Context);
    const pushNotification = useContext(NotificationContext);
    const { group } = useParams();
    const [loaded, setLoaded] = useState(false);
    const [searching, setSearching] = useState(false);
    const [collection, setCollection] = useState<string>();
    const [query, setQuery] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [result, setResult] = useState<{
        id: number,
        [key: string]: any
    }[]>([]);
    const [peeking, setPeeking] = useState(false);
    const [peekingContent, setPeekingContent] = useState<{
        id: string,
        title: string,
        content: {
            tag: string,
            type: string,
            data: any,
        },
    }>();

    const search = async (page: number) => {
        setSearching(true);
        try {
            if (!collection) {
                throw new Error('Vui lòng chọn nội dung bạn muốn tìm kiếm!');
            }
            const pageSize = 20;
            const paginationQuery = {
                ...query,
                page: page,
                limit: pageSize,
            };
            const response = await SearchAPI.forCollection(collection, paginationQuery) as {
                data: { id: number }[],
                total: number,
            };
            setCurrentPage(page);
            setTotalPages(Math.ceil(response.total / pageSize));
            setResult(response.data);
            if (response.data.length === 0) throw new Error('Không tìm thấy!');
        } catch (err: any) {
            pushNotification({
                title: 'Ối!',
                message: err?.message,
                type: 'error',
            });
        }
        setSearching(false);
    };

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

    const handleError = (err: any) => {
        pushNotification({
            title: 'Ối!',
            message: web3.getRevertReason(err?.message),
            type: 'error',
        });
    };

    const click = (id: any) => {
        if (collection === Collections.ACTION) {
            window.open(window.location.origin + `/${group}/peek/${id}`, '_blank', 'popup=true');
        }
        if (collection === Collections.CONTENT) {
            (async () => {
                try {
                    const pool = contentPool();
                    const { cid, tag } = await pool.get(id);
                    const content = await contentFromIPFS(cid) as {
                        tag: string,
                        type: string,
                        data: any,
                    };
                    setPeekingContent({
                        id: tag,
                        title: content.type,
                        content: content,
                    });
                    setPeeking(true);
                } catch (err: any) {
                    handleError(err);
                }
            })();
        }
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
            {loaded && (
                <div className={styles.container}>
                    <DropDownMenu
                        text={'Bạn muốn tra cứu gì?'}
                        options={[
                            SearchTypes.ACTION,
                            SearchTypes.CONTENT,
                        ]}
                        onOptionChanged={(option) => {
                            setQuery({});
                            setResult([]);
                            if (option === SearchTypes.ACTION) {
                                setCollection(Collections.ACTION);
                            } else if (option === SearchTypes.CONTENT) {
                                setCollection(Collections.CONTENT);
                            }
                        }}
                    />
                    {collection === Collections.ACTION && (
                        <SelectionPane
                            text={'Bạn có thể chọn bộ lọc để tra cứu'}
                            options={[...Queries.ACTION.map((action) => action.name)]}
                            onOptionsChanged={(...options: string[]) => {
                                setQuery({});
                                for (const action of Queries.ACTION) {
                                    if (options.includes(action.name)) {
                                        setQuery({
                                            ...query,
                                            ...action.value,
                                        });
                                    }
                                }
                            }}
                        />
                    )}
                    {collection === Collections.CONTENT && (
                        <SelectionPane
                            text={'Bạn có thể chọn bộ lọc để tra cứu'}
                            options={[...Queries.CONTENT.map((content) => content.name)]}
                            onOptionsChanged={(...options: string[]) => {
                                setQuery({});
                                for (const content of Queries.CONTENT) {
                                    if (options.includes(content.name)) {
                                        setQuery({
                                            ...query,
                                            ...content.value,
                                        });
                                    }
                                }
                            }}
                        />
                    )}
                    <SubmitButton
                        title={'Tra cứu!'}
                        onClick={async () => {
                            await search(1);
                        }}
                    />
                    {result.length > 0 && (
                        <>
                            {result.map((res, index) => (
                                <div key={index}>
                                    {collection === Collections.ACTION && (
                                        <NewsIcon
                                            title={res.id.toString()}
                                            hoverTitle={'Xem chi tiết!'}
                                            onClick={() => click(res.id)}
                                            highlight={res.executed === true}
                                            warnable={res.cancelled === true}
                                        />
                                    )}
                                    {collection === Collections.CONTENT && (
                                        <NewsIcon
                                            title={res.id.toString()}
                                            hoverTitle={'Xem chi tiết!'}
                                            onClick={() => click(res.id)}
                                            highlight={res.locked === false}
                                            warnable={res.locked === true}
                                        />
                                    )}
                                </div>
                            ))}
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onClick={async (page) => {
                                    await search(page);
                                }}
                            />
                        </>
                    )}
                </div>
            )}
            {peeking && peekingContent !== undefined && (
                <WaitingForTransaction
                    onClickOut={() => {
                        setPeeking(false);
                        setPeekingContent(undefined);
                    }}
                >
                    <ContentArea
                        id={peekingContent.id}
                        title={peekingContent.title}
                        content={peekingContent.content}
                    />
                </WaitingForTransaction>
            )}
            {searching && (
                <WaitingForTransaction />
            )}
        </>
    );
};

export default Search;