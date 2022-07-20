import classNames from 'classnames';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './index.module.scss';

interface NavLink {
    text: string;
    path?: string;
}

interface NavigationBarProps {
    links: NavLink[];
}

const NavigationBar = (props: NavigationBarProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const totalLinks = props.links.length;

    const getStyles = (path?: string) => {
        return classNames(styles.button, {
            [styles.highlight]: path === location.pathname,
        });
    };

    return (
        <div className={styles.container}>
            {props.links.map((link, index) => (
                <span key={index}>
                    <button
                        className={getStyles()}
                        onClick={() => {
                            if (link.path) navigate(link.path);
                        }}
                    >
                        {link.text}
                    </button>
                    {index < totalLinks - 1 && <>{'|'}</>}
                </span>
            ))}
        </div>
    );
};

export default NavigationBar;
