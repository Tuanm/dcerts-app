import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthFilter from '../../components/AuthFilter';
import DropDownMenu from '../../components/DropDownMenu';
import SubmitButton from '../../components/SubmitButton';
import { SearchRoute } from '../../Routes';
import styles from './index.module.scss';
import groups from '../../groups.json';

const Dashboard = () => {
    const [loaded, setLoaded] = useState(false);
    const [group, setGroup] = useState<string>();
    const [groupNames, setGroupNames] = useState<{
        [key: string]: string,
    }>({});
    const navigate = useNavigate();

    const groupWithName = (name: string) => {
        for (const id of Object.keys(groupNames)) {
            if (groupNames[id] === name) return id;
        }
    };

    const goToGroup = () => {
        if (group) navigate(SearchRoute.path.replace(':group', group));
    };

    return (
        <>
            <AuthFilter
                setLoaded={setLoaded}
                setGroups={(values) => {
                    const names = {} as {
                        [key: string]: string,
                    };
                    for (const group of values) {
                        names[group] = ((groups || []).filter((gr: {
                            id: string,
                            name: string,
                        }) => gr.id === group)[0] || {}).name;
                    }
                    setGroupNames(names);
                }}
                noButtons={true}
            />
            {loaded && (
                <div className={styles.container}>
                    <DropDownMenu
                        text={'Hãy lựa chọn nhóm của bạn...'}
                        options={Object.values(groupNames)}
                        onOptionChanged={(value) => {
                            setGroup(groupWithName(value));
                        }}
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