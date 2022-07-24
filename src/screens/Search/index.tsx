import React, { useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    const pushNotification = useContext(NotificationContext);
    const { group } = useParams();
    const [loaded, setLoaded] = useState(false);
    const [searching, setSearching] = useState(false);
    const [collection, setCollection] = useState<string>();
    const [query, setQuery] = useState({});
    const [result, setResult] = useState<{
        id: number,
        [key: string]: any
    }[]>([]);
    const navigate = useNavigate();

    const search = async () => {
        setSearching(true);
        try {
            if (!collection) {
                throw new Error('Vui lòng chọn nội dung bạn muốn tìm kiếm!');
            }
            const data = await SearchAPI.forCollection(collection, query) as { id: number }[];
            setResult(data);
            if (data.length === 0) throw new Error('Không tìm thấy!');
        } catch (err: any) {
            pushNotification({
                title: 'Ối!',
                message: err?.message,
                type: 'error',
            });
        }
        setSearching(false);
    };

    const click = (id: any) => {
        let url;
        if (collection === Collections.ACTION) {
            url = `/${group}/actions/${id}`;
        }
        if (collection === Collections.CONTENT) {
            url = `/contents/${id}`;
        }
        if (url !== undefined) {
            window.open(window.location.origin + url, '_blank', 'popup=true');
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
                        onClick={search}
                    />
                    {result.length > 0 && (result.map((res, index) => (
                        <NewsIcon
                            key={index}
                            title={res.id.toString()}
                            hoverTitle={'Xem chi tiết!'}
                            onClick={() => click(res.id)}
                            highlight={collection === Collections.ACTION && res.executed}
                            warnable={collection === Collections.ACTION && res.cancelled}
                        />
                    )))}
                </div>
            )}
            {searching && (
                <WaitingForTransaction />
            )}
        </>
    );
};

export default Search;