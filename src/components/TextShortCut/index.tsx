import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.scss';

interface TextShortCutProps {
    header?: string;
    text: string;
    to?: string;
    url?: string;
    onClick?: () => void;
    onLoad?: () => void;
}

const TextShortCut = (props: TextShortCutProps) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (props.onLoad) props.onLoad();
    }, []);

    return (
        <>
            {props.header && <span>{props.header}</span>}
            <span
                className={styles.text}
                onClick={() => {
                    if (props.onClick) props.onClick();
                    if (props.to) navigate(props.to);
                    else if (props.url) window.location.href = props.url;
                }}
            >
                {props.text}
            </span>
        </>
    );
};

export default TextShortCut;
