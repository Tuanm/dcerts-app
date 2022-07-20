import React from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import styles from './index.module.scss';

interface NewsIconProps {
    type?: number | string;
    datum?: number | string;
    icon?: string;
    title?: string;
    hoverTitle?: string;
    url?: string;
    special?: boolean;
    highlight?: boolean;
    warnable?: boolean;
    onDelete?: () => void;
    onClick?: () => void;
}

const NewsIcon = (props: NewsIconProps) => {
    const navigate = useNavigate();

    const getTitle = () => {
        return props.title;
    };

    const getUrl = () => {
        return props.url;
    };

    const getHoverTitle = () => {
        if (!props.hoverTitle) {
            return props.warnable ? 'Verify now!' : 'Check it now!';
        }
        return props.hoverTitle;
    };

    return (
        <div
            className={classNames(styles.container, {
                [styles.special]: props.special,
                [styles.highlight]: props.highlight,
                [styles.warning]: props.warnable,
            })}
            onClick={() => {
                if (props.onClick) props.onClick();
                const url = getUrl();
                if (url) navigate(url);
            }}
        >
            {props.icon && <img src={props.icon} alt={props.title} />}
            <div className={styles.title}>{getTitle()}</div>
            <div className={styles.hidden}>{getHoverTitle()}</div>
            {props.onDelete && (
                <div
                    className={styles.removeable}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (props.onDelete) props.onDelete();
                    }}
                ></div>
            )}
        </div>
    );
};

export default NewsIcon;
