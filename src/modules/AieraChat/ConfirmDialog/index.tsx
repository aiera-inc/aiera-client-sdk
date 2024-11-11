import { MicroTrash } from '@aiera/client-sdk/components/Svg/MicroTrash';
import React, { ReactElement } from 'react';
import { Modal } from '../Modal';

interface ConfirmDialogSharedProps {
    onClose: () => void;
}

/** @notExported */
interface ConfirmDialogUIProps extends ConfirmDialogSharedProps {}

export function ConfirmDialogUI({ onClose }: ConfirmDialogUIProps): ReactElement {
    return (
        <Modal onClose={onClose} title="Confirm Delete" className="justify-center items-center" Icon={MicroTrash}>
            <p className="text-base font-semibold text-red-700 text-balance text-center">
                Are you sure you want to delete this chat?
            </p>
            <div className="flex items-center justify-center mt-2">
                <p
                    className="text-sm font-semibold mr-2 text-black cursor-pointer hover:text-blue-700"
                    onClick={onClose}
                >
                    Yes
                </p>
                <p className="text-sm font-semibold text-black cursor-pointer hover:text-blue-700" onClick={onClose}>
                    No
                </p>
            </div>
        </Modal>
    );
}

/** @notExported */
export interface ConfirmDialogProps extends ConfirmDialogSharedProps {}

export function ConfirmDialog({ onClose }: ConfirmDialogProps): ReactElement {
    return <ConfirmDialogUI onClose={onClose} />;
}
