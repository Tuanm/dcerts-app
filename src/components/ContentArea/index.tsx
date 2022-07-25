import React, { useState } from 'react';
import TextShortCut from '../TextShortCut';
import styles from './index.module.scss';

interface ContentAreaProps {
    id: string;
    title: string;
    content?: {
        type: string,
        data: any,
    };
    children?: React.ReactNode;
}

interface ContentProps {
    data: any,
    depth: number,
}

const Content = (props: ContentProps) => {
    const [hidden, setHidden] = useState<{
        [key: string]: boolean,
    }>({});

    return (
        <div className={styles.text} style={{
            marginLeft: `${props.depth * 6.9}%`,
        }}>
            {props.data && Object.keys(props.data).map((key, index) => (
                <div key={index}>
                    {props.data[key] !== Object(props.data[key]) && (
                        <>{`${key}: `}{props.data[key]}</>
                    )}
                    {props.data[key] === Object(props.data[key]) && (
                        <>
                            <TextShortCut
                                text={`${key}: `}
                                onClick={() => {
                                    const current = { ...hidden };
                                    current[key] = !current[key];
                                    setHidden({ ...current });
                                }}
                            />
                            {!hidden[key] && (
                                <Content
                                    depth={props.depth + 1}
                                    data={props.data[key]}
                                />
                            )}
                            {!!hidden[key] && (
                                <>{'[...]'}</>
                            )}
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}

const ContentArea = (props: ContentAreaProps) => {
    return (
        <>
            <div className={styles.container}>
                <div className={styles.id}>
                    {'#'}
                    {props.id}
                </div>
                <div className={styles.title}>{props.title}</div>
                {props.content && (
                    <Content data={props.content.data} depth={0} />
                )}
                {props.children && (
                    <div className={styles.text}>{props.children}</div>
                )}
            </div>
        </>
    );
};

export default ContentArea;
