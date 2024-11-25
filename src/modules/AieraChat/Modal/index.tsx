import { MicroClose } from '@aiera/client-sdk/components/Svg/MicroClose';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { IconProps } from '@aiera/client-sdk/types';
import classNames from 'classnames';
import React, { ComponentType, ReactElement, ReactNode } from 'react';

interface ModalProps {
    onClose: () => void;
    children: ReactNode;
    Icon: ComponentType<IconProps>;
    title: string;
    className?: string;
}

export function Modal({ onClose, children, Icon, title, className }: ModalProps): ReactElement {
    const config = useConfig();

    let darkMode = false;

    if (config.options) {
        if (config.options.darkMode !== undefined) {
            darkMode = config.options.darkMode;
        }
    }

    return (
        <div
            onClick={onClose}
            className={classNames(
                'fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden',
                {
                    dark: darkMode,
                    'bg-gray-900/20': !darkMode,
                },
                'aiera-chat'
            )}
        >
            <div
                onClick={(e) => {
                    e.stopPropagation();
                }}
                className="bg-white rounded-lg px-6 pt-4 pb-5 w-[80%] shadow-lg shadow-gray-900/10"
            >
                <div className="flex items-center justify-between">
                    <Icon className="w-4 mr-1.5" />
                    <p className="text-base font-semibold flex-1">{title}</p>
                    <div onClick={onClose} className="cursor-pointer hover:text-blue-700">
                        <MicroClose className="w-4" />
                    </div>
                </div>
                <div className={classNames('mt-4 flex flex-col', className)}>{children}</div>
            </div>
        </div>
    );
}
