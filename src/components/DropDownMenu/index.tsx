import classNames from 'classnames';
import React, { useState } from 'react';
import styles from './index.module.scss';

interface DropDownMenuProps {
    text: string;
    options: string[];
    onOptionChanged?: (option: string) => void;
}

const DropDownMenu = (props: DropDownMenuProps) => {
    const [options, setOptions] = useState(props.options);
    const [selectedOption, setSelectedOption] = useState<string>();
    const [inputElement, setInputElement] = useState<HTMLInputElement>();
    const [focused, setFocused] = useState(false);
    const focusDelay = 200;
    const typingDelay = 500;

    const search = (text?: string) => {
        if (text == undefined || text.trim() === '') {
            setOptions(props.options);
        } else {
            setOptions(
                props.options.filter((option) => {
                    return option
                        .trim()
                        .toLowerCase()
                        .includes(text.trim().toLowerCase());
                }),
            );
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.input}>
                <input
                    placeholder={props.text}
                    onFocus={(e) => {
                        setTimeout(() => {
                            if (!focused) {
                                setInputElement(e.target);
                                setFocused(true);
                            }
                        }, focusDelay);
                    }}
                    onBlur={(e) => {
                        setTimeout(() => {
                            if (focused) {
                                setInputElement(e.target);
                                setFocused(false);
                            }
                        }, focusDelay);
                    }}
                    onChange={(e) => {
                        setTimeout(() => {
                            setSelectedOption(e.target.value);
                            search(e.target.value);
                        }, typingDelay);
                    }}
                />
            </div>
            {focused && options.length > 0 && (
                <div className={styles.pane}>
                    <div className={styles.options}>
                        {options.map((option, index) => (
                            <div
                                className={classNames(styles.option, {
                                    [styles.selected]:
                                        option === selectedOption,
                                })}
                                onClick={() => {
                                    setSelectedOption(option);
                                    if (props.onOptionChanged) {
                                        props.onOptionChanged(option);
                                    }
                                    if (inputElement) {
                                        inputElement.value = option;
                                    }
                                }}
                                key={index}
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DropDownMenu;
