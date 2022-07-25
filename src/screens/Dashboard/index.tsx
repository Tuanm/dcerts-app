import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthFilter from '../../components/AuthFilter';
import DropDownMenu from '../../components/DropDownMenu';
import SubmitButton from '../../components/SubmitButton';
import { SearchRoute } from '../../Routes';
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
            <AuthFilter
                setLoaded={setLoaded}
                setGroups={setGroups}
                noButtons={true}
            />
            {loaded && (
                <div className={styles.container}>
                    <DropDownMenu
                        text={'Hãy lựa chọn nhóm của bạn...'}
                        options={groups}
                        onOptionChanged={setGroup}
                    />
                    {group && (
                        <SubmitButton title={'Truy cập!'} onClick={goToGroup} />
                    )}
                </div>
            )}
        </>
    );
};

export default Dashboard;