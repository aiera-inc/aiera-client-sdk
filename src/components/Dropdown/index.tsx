import React, { MouseEvent, ReactElement, Ref, useLayoutEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { match } from 'ts-pattern';
import { Chevron } from '@aiera/client-sdk/components/Svg/Chevron';
import { Tooltip, TooltipProps } from '@aiera/client-sdk/components/Tooltip';
import { useWindowListener } from '@aiera/client-sdk/lib/hooks/useEventListener';
import { ChangeHandler, SelectOption } from '@aiera/client-sdk/types';
import './styles.css';

interface DropdownSharedProps<T> {
    className?: string;
    onChange?: ChangeHandler<T>;
    options: SelectOption<T>[];
    tooltipGrow?: TooltipProps['grow'];
    tooltipPosition?: TooltipProps['position'];
    value?: T;
}

/** @notExported */
interface DropdownUIProps<T> extends DropdownSharedProps<T> {
    hideTooltip?: (event?: MouseEvent) => void;
    scrollRef: Ref<HTMLDivElement>;
    selectedIndex: number;
    selectIndex: (index: number) => void;
    selectedLabel?: string;
    selectedOptionRef: Ref<HTMLDivElement>;
}

function TooltipContent<T>(props: DropdownUIProps<T>): ReactElement {
    const { hideTooltip, selectedIndex, selectedOptionRef, selectIndex, onChange, options, scrollRef } = props;

    // Allow scrolling, selecting, and closing the tooltip with keyboard
    useWindowListener('keydown', (event) => {
        const key = event?.key;
        match(key)
            .with('ArrowUp', () => {
                if (selectedIndex > 0) selectIndex(selectedIndex - 1);
            })
            .with('ArrowDown', () => {
                if (selectedIndex < options.length - 1) selectIndex(selectedIndex + 1);
            })
            .with('Enter', () => {
                selectIndex(0);
                onChange?.(event, { value: options[selectedIndex]?.value });
                hideTooltip?.();
            })
            .otherwise(() => true);
    });

    return (
        <div className="bg-white overflow-hidden rounded-lg shadow-md w-full dark:bg-bluegray-6 dropdown-menu">
            <div className="flex flex-col max-h-[150px] overflow-y-scroll w-full" ref={scrollRef}>
                <div className="flex-1">
                    {options.map((option, index) => (
                        <div
                            className={classNames(
                                'flex items-center h-9 tracking-wide cursor-pointer focus:outline-none',
                                {
                                    'odd:bg-gray-100 dark:odd:bg-bluegray-5': selectedIndex !== index,
                                    'bg-blue-500': selectedIndex === index,
                                    'text-white': selectedIndex === index,
                                    'text-gray-900 dark:text-white': selectedIndex !== index,
                                }
                            )}
                            key={option.label}
                            onClick={(event) => {
                                event.stopPropagation();
                                onChange?.(event, { value: option.value });
                                hideTooltip?.();
                            }}
                            onFocus={() => selectIndex(index)}
                            onMouseEnter={() => selectIndex(index)}
                            ref={selectedIndex === index ? selectedOptionRef : undefined}
                            tabIndex={0}
                        >
                            <div className="px-4 truncate flex-1 text-base">{option.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function DropdownUI<T>(props: DropdownUIProps<T>): ReactElement {
    const {
        className = '',
        selectIndex,
        selectedLabel,
        tooltipGrow = 'down-left',
        tooltipPosition = 'bottom-right',
    } = props;
    return (
        <Tooltip
            className={
                'border border-gray-200 cursor-pointer flex h-8 items-center py-1.5 px-3 rounded-lg space-between ' +
                'text-sm w-full dark:bg-bluegray-6 dark:border-bluegray-5 focus:border-1 focus:border-blue-600 ' +
                `focus:outline-none focus:shadow-input hover:border-blue-400 dropdown ${className}`
            }
            content={({ hideTooltip }) => <TooltipContent hideTooltip={hideTooltip} {...props} />}
            grow={tooltipGrow}
            onClose={() => {
                selectIndex(0);
            }}
            openOn="click"
            position={tooltipPosition}
            yOffset={5}
        >
            <div className="flex-1">{selectedLabel}</div>
            <Chevron className="w-2" />
        </Tooltip>
    );
}

/** @notExported */
export interface DropdownProps<T> extends DropdownSharedProps<T> {}

/**
 * Renders Dropdown
 */
export function Dropdown<T>(props: DropdownProps<T>): ReactElement {
    const [selectedIndex, selectIndex] = useState(0);

    const selectedOptionRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        if (selectedOptionRef.current && scrollContainerRef.current) {
            const containerPos = scrollContainerRef.current.getBoundingClientRect();
            const optionPos = selectedOptionRef.current.getBoundingClientRect();

            // Scroll into view if visibility is obstructed
            const optionTopObstructed = optionPos.top < containerPos.top;
            const optionBottomObstructed = containerPos.top + containerPos.height < optionPos.top + optionPos.height;

            if (optionTopObstructed || optionBottomObstructed) selectedOptionRef.current.scrollIntoView();
        }
    }, [selectedOptionRef?.current, scrollContainerRef?.current]);

    const { className, onChange, options, tooltipGrow, tooltipPosition, value } = props;
    const selectedLabel = useMemo(() => options.find((o) => o.value === value)?.label, [options, value]);
    return (
        <DropdownUI
            className={className}
            onChange={onChange}
            options={options}
            scrollRef={scrollContainerRef}
            selectedIndex={selectedIndex}
            selectedLabel={selectedLabel}
            selectedOptionRef={selectedOptionRef}
            selectIndex={selectIndex}
            tooltipGrow={tooltipGrow}
            tooltipPosition={tooltipPosition}
            value={value}
        />
    );
}
