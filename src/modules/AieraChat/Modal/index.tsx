import { MicroClose } from '@aiera/client-sdk/components/Svg/MicroClose';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { IconProps } from '@aiera/client-sdk/types';
import classNames from 'classnames';
import React, { ComponentType, ReactElement, ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    onClose: () => void;
    children: ReactNode;
    Icon: ComponentType<IconProps>;
    title: string;
    className?: string;
}

export function Modal({ onClose, children, Icon, title, className }: ModalProps): ReactElement | null {
    const [mounted, setMounted] = useState(false);
    const config = useConfig();
    const darkMode = config.options?.darkMode ?? false;

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const modalContent = (
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

    // Check if we're in a browser environment and the dialog container exists
    if (typeof document !== 'undefined' && mounted) {
        const dialogContainer = document.getElementById('dialog');

        if (!dialogContainer) {
            console.warn('Dialog container with id "dialog" not found. Modal will not render.');
            return null;
        }

        return createPortal(modalContent, dialogContainer);
    }

    return null;
}
