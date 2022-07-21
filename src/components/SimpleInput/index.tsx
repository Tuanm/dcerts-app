import React, { useRef } from 'react';
import styles from './index.module.scss';

interface SimpleInputProps {
    placeholder: string;
    value?: string;
    type?: string;
    accept?: string[];
    locked?: boolean;
    onChange?: (value: any) => void;
    onFocus?: () => void;
    onBlur?: () => void;
}

const SimpleInput = (props: SimpleInputProps) => {
    const isFile = props.type === 'file';

    const fileInput = useRef<HTMLInputElement>(null);

    return (
        <div className={styles.container}>
            <input
                className={isFile ? styles.pointer : ''}
                type={isFile ? 'text' : props.type}
                placeholder={props.placeholder}
                value={isFile ? props.placeholder : props.value}
                onChange={(e) => {
                    if (props.onChange) props.onChange(e.target.value);
                }}
                onFocus={(e) => {
                    if (props.onFocus) props.onFocus();
                }}
                onBlur={(e) => {
                    if (props.onBlur) props.onBlur();
                }}
                readOnly={props.locked || isFile}
                onClick={(e) => {
                    if (isFile) {
                        if (fileInput.current) fileInput.current.click();
                        (e.target as HTMLInputElement).blur();
                    }
                }}
            />
            <input
                ref={fileInput}
                type={'file'}
                accept={props.accept ? props.accept.join(',') : undefined}
                multiple={true}
                hidden={true}
                onChange={(e) => {
                    if (props.onChange) props.onChange(e.target.files);
                }}
            />
        </div>
    );
};

export default SimpleInput;
