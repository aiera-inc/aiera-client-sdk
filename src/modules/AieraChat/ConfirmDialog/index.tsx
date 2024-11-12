import { MicroTrash } from '@aiera/client-sdk/components/Svg/MicroTrash';
import React, { ReactElement } from 'react';
import { Modal } from '../Modal';
import { Button } from '@aiera/client-sdk/components/Button';

interface ConfirmDialogSharedProps {
    onClose: () => void;
}

/** @notExported */
interface ConfirmDialogUIProps extends ConfirmDialogSharedProps {}

export function ConfirmDialogUI({ onClose }: ConfirmDialogUIProps): ReactElement {
    return (
        <Modal onClose={onClose} title="Confirm Delete" className="justify-center items-center" Icon={MicroTrash}>
            <p className="text-base mt-1 leading-5 text-slate-600 text-balance text-center">
                Are you sure you want to delete this chat?
            </p>
            <div className="flex items-center justify-center mt-6">
                <Button kind="primary" onClick={onClose}>
                    Delete
                </Button>
                <Button kind="secondary" onClick={onClose} className="ml-2">
                    Cancel
                </Button>
            </div>
        </Modal>
    );
}

/** @notExported */
export interface ConfirmDialogProps extends ConfirmDialogSharedProps {}

export function ConfirmDialog({ onClose }: ConfirmDialogProps): ReactElement {
    return <ConfirmDialogUI onClose={onClose} />;
}
