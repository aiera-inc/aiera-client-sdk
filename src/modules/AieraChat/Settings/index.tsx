import { MicroCheck } from '@aiera/client-sdk/components/Svg/MicroCheck';
import { MicroClose } from '@aiera/client-sdk/components/Svg/MicroClose';
import { MicroGear } from '@aiera/client-sdk/components/Svg/MicroGear';
import { MicroTrash } from '@aiera/client-sdk/components/Svg/MicroTrash';
import { useConfig } from '@aiera/client-sdk/lib/config';
import classNames from 'classnames';
import React, { Fragment, ReactElement, useState } from 'react';

interface AieraChatSharedProps {
    onClose: () => void;
}

/** @notExported */
interface AieraChatUIProps extends AieraChatSharedProps {
    sourceMode: SourceMode;
    onSetSourceMode: (m: SourceMode) => void;
    onDelete: (o?: boolean) => void;
    confirmDelete: boolean;
    onConfirmDelete: () => void;
}

interface SourceModeType {
    id: SourceMode;
    label: string;
    description: string;
}

const sourceModes: SourceModeType[] = [
    {
        id: 'suggest',
        label: 'Automatic Sources',
        description: 'Sources will be suggested for your approval based on each question asked.',
    },
    {
        id: 'manual',
        label: 'Manual Sources',
        description: 'All questions will run against the sources you define in the source panel.',
    },
];

export function SettingsUI({
    onClose,
    sourceMode,
    onSetSourceMode,
    onDelete,
    confirmDelete,
    onConfirmDelete,
}: AieraChatUIProps): ReactElement {
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
                'fixed inset-0 z-10 flex flex-col items-center justify-center overflow-hidden',
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
                    <MicroGear className="w-4 mr-1.5" />
                    <p className="text-base font-semibold flex-1">Chat Settings</p>
                    <div onClick={onClose} className="cursor-pointer hover:text-blue-700">
                        <MicroClose className="w-4" />
                    </div>
                </div>
                <div className="bg-slate-100 rounded-lg px-4 py-4 mt-4">
                    {sourceModes.map(({ id, label, description }, index) => (
                        <Fragment key={id}>
                            <div
                                onClick={() => onSetSourceMode(id)}
                                className={classNames('cursor-pointer group', {
                                    'border-t border-t-slate-200 pt-3 mt-3': index !== 0,
                                })}
                            >
                                <div
                                    className={classNames('flex items-center', {
                                        'text-blue-700': sourceMode === id,
                                        'text-black group-hover:text-blue-700': sourceMode !== id,
                                    })}
                                >
                                    <div className="w-6 pr-2 flex-shrink-0">
                                        {sourceMode === id && <MicroCheck className="w-4" />}
                                    </div>
                                    <p className={classNames('font-bold text-sm antialiased')}>{label}</p>
                                </div>
                                <p className="text-slate-600 text-sm leading-4 ml-6 text-balance mt-1">{description}</p>
                            </div>
                        </Fragment>
                    ))}
                </div>
                <div className="mt-4 flex items-center justify-between">
                    {confirmDelete ? (
                        <div className="flex items-center justify-between text-red-700 ">
                            <MicroTrash className="w-4 mr-1.5" />
                            <p className="text-sm font-semibold mr-2">Are you sure?</p>
                            <p
                                className="text-sm font-semibold mr-2 text-black cursor-pointer hover:text-blue-700"
                                onClick={onConfirmDelete}
                            >
                                Yes
                            </p>
                            <p
                                className="text-sm font-semibold text-black cursor-pointer hover:text-blue-700"
                                onClick={() => onDelete(false)}
                            >
                                No
                            </p>
                        </div>
                    ) : (
                        <div
                            className="flex items-center justify-between text-red-700 cursor-pointer"
                            onClick={() => onDelete()}
                        >
                            <MicroTrash className="w-4 mr-1.5" />
                            <p className="text-sm font-semibold flex-1">Delete Chat</p>
                        </div>
                    )}
                    <p className="text-sm cursor-pointer text-slate-700" onClick={onClose}>
                        Done
                    </p>
                </div>
            </div>
        </div>
    );
}

/** @notExported */
export interface AieraChatProps extends AieraChatSharedProps {}

type SourceMode = 'suggest' | 'manual';

/**
 * Renders AieraChat
 */
export function Settings({ onClose }: AieraChatProps): ReactElement {
    const [sourceMode, setSourceMode] = useState<SourceMode>('suggest');
    const [confirmDelete, setConfirmDelete] = useState(false);
    // const config = useConfig();
    // const scrollRef = useRef<HTMLDivElement>(null);
    // useAutoTrack('View', 'AieraChat', { widgetUserId: config.tracking?.userId }, [config.tracking?.userId]);
    return (
        <SettingsUI
            onClose={onClose}
            sourceMode={sourceMode}
            onDelete={(override?: boolean) => setConfirmDelete(typeof override === 'boolean' ? override : true)}
            confirmDelete={confirmDelete}
            onConfirmDelete={onClose}
            onSetSourceMode={setSourceMode}
        />
    );
}
