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
import { DashRoute, UploadAreaRoute, VotingAreaRoute, WithIdVotingAreaRoute } from '../../Routes';
import styles from './index.module.scss';

const SearchTypes = {
    ACTION: 'Action',
    CONTENT: 'Content',
};

const Collections = {
    ACTION: 'actions',
    CONTENT: 'contents',
};

const Queries = {
    ACTION: [
        {
            name: 'Not executed',
            value: {
                executed: false,
            },
        },
        {
            name: 'Executed',
            value: {
                executed: true,
            },
        },
        {
            name: 'Cancelled',
            value: {
                cancelled: true,
            },
        }
    ]
}

const Search = () => {
    const pushNotification = useContext(NotificationContext);
    const { group } = useParams();
    const [loaded, setLoaded] = useState(false);
    const [searching, setSearching] = useState(false);
    const [collection, setCollection] = useState<string>();
    const [query, setQuery] = useState({});
    const [result, setResult] = useState<{ id: number }[]>([]);
    const navigate = useNavigate();

    const search = async () => {
        setSearching(true);
        try {
            if (!collection) {
                throw new Error('You must choose a type of searching!');
            }
            setResult(await SearchAPI.forCollection(collection, query));
        } catch (err: any) {
            pushNotification({
                title: 'Whoops!',
                message: err?.message,
                type: 'error',
            });
        }
        setSearching(false);
    };

    const enterVoteArea = (action: any) => {
        navigate(WithIdVotingAreaRoute.path.replace(':group', group || '').replace(':id', action));
    };

    const click = (id: any) => {
        if (collection === Collections.ACTION) {
            enterVoteArea(id);
        }
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
            {loaded && (
                <div className={styles.container}>
                    <DropDownMenu
                        text={'What are you searching for?'}
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
                            text={'Choose some filters...'}
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
                    <SubmitButton
                        title={'Search!'}
                        onClick={search}
                    />
                    {result.length > 0 && (result.map((res, index) => (
                        <NewsIcon
                            key={index}
                            title={res.id.toString()}
                            onClick={() => click(res.id)}
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