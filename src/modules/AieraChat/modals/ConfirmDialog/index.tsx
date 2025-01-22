import React, { MouseEvent, ReactElement } from 'react';
import { MicroTrash } from '@aiera/client-sdk/components/Svg/MicroTrash';
import { Modal } from '../Modal';
import { Button } from '@aiera/client-sdk/components/Button';

interface ConfirmDialogProps {
    onDelete: (e: MouseEvent) => void;
    onClose: () => void;
}

export function ConfirmDialog({ onClose, onDelete }: ConfirmDialogProps): ReactElement {
    return (
        <Modal onClose={onClose} title="Confirm Delete" className="justify-center items-center" Icon={MicroTrash}>
            <p className="text-base mt-1 leading-5 text-slate-600 text-balance text-center">
                Are you sure you want to delete this chat?
            </p>
            <div className="flex items-center justify-center mt-6">
                <Button kind="primary" onClick={onDelete}>
                    Delete
                </Button>
                <Button kind="secondary" onClick={onClose} className="ml-2">
                    Cancel
                </Button>
            </div>
        </Modal>
    );
}
