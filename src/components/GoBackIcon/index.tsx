import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.scss';

interface GoBackIconProps {
    text: string;
    to?: string;
    onClick?: () => void;
}

const GoBackIcon = (props: GoBackIconProps) => {
    const navigate = useNavigate();

    return (
        <div>
            <button
                className={styles.button}
                onClick={() => {
                    if (props.onClick) props.onClick();
                    if (props.to) navigate(props.to);
                    else navigate(-1);
                }}
            >
                {props.text}
            </button>
        </div>
    );
};

export default GoBackIcon;
