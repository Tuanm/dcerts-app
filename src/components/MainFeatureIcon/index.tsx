import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.scss';

interface MainFeatureIconProps {
    id?: number | string;
    icon?: string;
    title: string;
    descriptions?: string[];
    to?: string;
    notificationCount?: number;
}

const MainFeatureIcon = (props: MainFeatureIconProps) => {
    const [icon, setIcon] = useState<string>();
    const navigate = useNavigate();

    useEffect(() => {
        setIcon(props.icon);
    }, [props.icon]);

    return (
        <div
            className={styles.container}
            onClick={() => {
                if (props.to) navigate(props.to);
            }}
        >
            {props.id !== undefined && (
                <div className={styles.id}>
                    {'#'}
                    {props.id}
                </div>
            )}
            <div className={styles.title}>{props.title}</div>
            {icon && (
                <img
                    src={props.icon}
                    onError={() => {
                        setIcon(undefined);
                    }}
                />
            )}
            {props.descriptions && (
                <div className={styles.descriptions}>
                    {props.descriptions.map((item, index) => (
                        <div className={styles.description} key={index}>
                            {item}
                        </div>
                    ))}
                </div>
            )}
            {props.notificationCount && (
                <div className={styles.notif}>{props.notificationCount}</div>
            )}
        </div>
    );
};

export default MainFeatureIcon;
