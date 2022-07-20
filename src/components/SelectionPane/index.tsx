import classNames from 'classnames';
import React, { useState } from 'react';
import WaitingForTransaction from '../WaitingForTransaction';
import styles from './index.module.scss';

interface SelectionPaneProps {
    text: string;
    typingText?: string;
    options: string[];
    onOptionsChanged?: (...options: string[]) => void;
}

const SelectionPane = (props: SelectionPaneProps) => {
    const [options, setOptions] = useState<string[]>(props.options);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [inputElement, setInputElement] = useState<HTMLInputElement>();
    const [focused, setFocused] = useState(false);
    const focusDelay = 300;
    const typingDelay = 500;

    const search = (text?: string) => {
        if (text === undefined || text.trim() === '') {
            setOptions(props.options);
        } else {
            setOptions(
                props.options.filter((option) => {
                    return (
                        selectedOptions.includes(option) ||
                        option
                            .trim()
                            .toLowerCase()
                            .includes(text.trim().toLowerCase())
                    );
                }),
            );
        }
    };

    return (
        <>
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
                        readOnly={true}
                    />
                </div>
            </div>
            {focused && options.length > 0 && (
                <>
                    <div className={styles.pane}>
                        <WaitingForTransaction>
                            <div className={styles.input}>
                                <input
                                    placeholder={props.typingText || props.text}
                                    onChange={(e) => {
                                        setTimeout(() => {
                                            search(e.target.value);
                                        }, typingDelay);
                                    }}
                                />
                            </div>
                            <div className={styles.button}>
                                <input
                                    type={'submit'}
                                    value={'Finish!'}
                                    onClick={() => {
                                        setFocused(false);
                                        if (inputElement) {
                                            setTimeout(() => {
                                                inputElement.value =
                                                    selectedOptions.join(', ');
                                                if (props.onOptionsChanged) {
                                                    props.onOptionsChanged(
                                                        ...selectedOptions,
                                                    );
                                                }
                                            }, focusDelay);
                                        }
                                    }}
                                />
                            </div>
                            <div className={styles.options}>
                                {options.map((option, index) => (
                                    <div
                                        className={classNames(styles.option, {
                                            [styles.selected]:
                                                selectedOptions.includes(
                                                    option,
                                                ),
                                        })}
                                        onClick={() => {
                                            const currentSelectedOptions = [
                                                ...selectedOptions,
                                            ];
                                            const foundIndex =
                                                currentSelectedOptions.indexOf(
                                                    option,
                                                );
                                            if (foundIndex !== -1) {
                                                currentSelectedOptions.splice(
                                                    foundIndex,
                                                    1,
                                                );
                                                setSelectedOptions([
                                                    ...currentSelectedOptions,
                                                ]);
                                            } else {
                                                currentSelectedOptions.push(
                                                    option,
                                                );
                                                setSelectedOptions([
                                                    ...currentSelectedOptions,
                                                ]);
                                            }
                                        }}
                                        key={index}
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                        </WaitingForTransaction>
                    </div>
                </>
            )}
        </>
    );
};

export default SelectionPane;
