import { Button } from '@aiera/client-sdk/components/Button';
import { MicroFolderOpen } from '@aiera/client-sdk/components/Svg/MicroFolderOpen';
import React, { ReactElement } from 'react';
import { Modal } from '../Modal';

interface AddSourceDialogProps {
    onClose: () => void;
}

export function AddSourceDialog({ onClose }: AddSourceDialogProps): ReactElement {
    return (
        <Modal onClose={onClose} title="Add Source" className="justify-center items-center" Icon={MicroFolderOpen}>
            <p className="text-base mt-1 leading-5 text-slate-600 text-balance text-center">Find a source</p>
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
