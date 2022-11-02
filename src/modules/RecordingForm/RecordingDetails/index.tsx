import React, { ReactElement } from 'react';
import { CompanyFilterResult } from '@aiera/client-sdk/components/CompanyFilterButton';
import { CompanySelect } from '@aiera/client-sdk/components/CompanySelect';
import { FormField } from '@aiera/client-sdk/components/FormField';
import { FormFieldInput } from '@aiera/client-sdk/components/FormField/FormFieldInput';
import { useChangeHandlers } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import { ChangeHandler } from '@aiera/client-sdk/types';
import './styles.css';

interface RecordingDetailsSharedProps {
    onChangeCompany: ChangeHandler<CompanyFilterResult>;
    onChangeTitle: ChangeHandler<string>;
    selectedCompany?: CompanyFilterResult;
    title?: string;
}

/** @notExported */
interface RecordingDetailsUIProps extends RecordingDetailsSharedProps {
    companySearchTerm: string;
    onChangeCompanySearchTerm: ChangeHandler<string>;
}

export function RecordingDetailsUI(props: RecordingDetailsUIProps): ReactElement {
    const {
        companySearchTerm,
        onChangeCompany,
        onChangeCompanySearchTerm,
        onChangeTitle,
        selectedCompany,
        title = '',
    } = props;
    return (
        <div className="py-3 recording-details">
            <p className="font-semibold mt-2 text-slate-400 text-sm tracking-widest uppercase">Recording Details</p>
            <FormFieldInput
                autoFocus
                className="mt-5 px-4 py-3"
                clearable
                description="Enter the name of the recording"
                label="Title*"
                name="title"
                onChange={onChangeTitle}
                value={title}
            />
            <FormField className="mt-5 px-4 py-3">
                <p className="font-semibold text-base text-black form-field__label">Company</p>
                <p className="font-light leading-4 pt-0.5 text-slate-400 text-sm  form-field__description">
                    Associate with a specific company
                </p>
                <CompanySelect
                    className="shadow-none w-full"
                    onChange={onChangeCompany}
                    onChangeSearchTerm={onChangeCompanySearchTerm}
                    searchTerm={companySearchTerm}
                    value={selectedCompany}
                />
            </FormField>
        </div>
    );
}

/** @notExported */
export interface RecordingDetailsProps extends RecordingDetailsSharedProps {}

interface RecordingDetailsState {
    companySearchTerm: string;
}

/**
 * Renders RecordingDetails
 */
export function RecordingDetails(props: RecordingDetailsProps): ReactElement {
    const { handlers, state } = useChangeHandlers<RecordingDetailsState>({ companySearchTerm: '' });
    const { onChangeCompany, onChangeTitle, selectedCompany, title } = props;
    return (
        <RecordingDetailsUI
            companySearchTerm={state.companySearchTerm}
            onChangeCompany={onChangeCompany}
            onChangeCompanySearchTerm={handlers.companySearchTerm}
            onChangeTitle={onChangeTitle}
            selectedCompany={selectedCompany}
            title={title}
        />
    );
}
