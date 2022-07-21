import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthFilter from '../../components/AuthFilter';
import DropDownMenu from '../../components/DropDownMenu';
import NavigationBar from '../../components/NavigationBar';
import SubmitButton from '../../components/SubmitButton';
import { DashRoute, SearchRoute } from '../../Routes';
import styles from './index.module.scss';

const Dashboard = () => {
    const [loaded, setLoaded] = useState(false);
    const [groups, setGroups] = useState<string[]>([]);
    const [group, setGroup] = useState<string>();
    const navigate = useNavigate();

    const goToGroup = () => {
        if (group) navigate(SearchRoute.path.replace(':group', group));
    };

    return (
        <>
            <NavigationBar
                links={[
                    DashRoute,
                ]}
            />
            <AuthFilter
                setLoaded={setLoaded}
                setGroups={setGroups}
            />
            {loaded && (
                <div className={styles.container}>
                    <DropDownMenu
                        text={'You can search your groups here...'}
                        options={groups}
                        onOptionChanged={setGroup}
                    />
                    {group && (
                        <SubmitButton title={'Go!'} onClick={goToGroup} />
                    )}
                </div>
            )}
        </>
    );
};

export default Dashboard;