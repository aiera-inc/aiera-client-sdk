import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Chevron } from '@aiera/client-sdk/components/Svg/Chevron';
import './styles.css';

interface ExpandButtonSharedProps {
    className?: string;
    onClick: () => void;
    expanded: boolean;
}

/** @notExported */
interface ExpandButtonUIProps extends ExpandButtonSharedProps {}

export function ExpandButtonUI(props: ExpandButtonUIProps): ReactElement {
    const { className = '', onClick, expanded } = props;
    return (
        <button
            title="expand"
            onClick={onClick}
            className={classNames(
                `transition-all flex-shrink-0 h-5 w-5 rounded-xl flex items-start justify-center ${className}`,
                {
                    'bg-blue-600': expanded,
                    'bg-gray-100': !expanded,
                    'hover:bg-blue-700': expanded,
                    'hover:bg-gray-200': !expanded,
                    'active:bg-blue-800': expanded,
                    'active:bg-gray-300': !expanded,
                }
            )}
        >
            <Chevron
                className={classNames('flex-shrink-0 w-2 transition-all', {
                    'mt-[7px] rotate-180 fill-current text-white': expanded,
                    'mt-[8px] opacity-30': !expanded,
                })}
            />
        </button>
    );
}

/** @notExported */
export interface ExpandButtonProps extends ExpandButtonSharedProps {}

/**
 * Renders ExpandButton
 */
export function ExpandButton(props: ExpandButtonProps): ReactElement {
    const { className, expanded, onClick } = props;
    return <ExpandButtonUI className={className} expanded={expanded} onClick={onClick} />;
}
