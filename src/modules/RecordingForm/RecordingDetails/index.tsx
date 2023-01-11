import React, { FocusEventHandler, ReactElement } from 'react';
import { Button } from '@aiera/client-sdk/components/Button';
import { Checkbox } from '@aiera/client-sdk/components/Checkbox';
import { CompanyFilterResult } from '@aiera/client-sdk/components/CompanyFilterButton';
import { CompanySelect } from '@aiera/client-sdk/components/CompanySelect';
import { FormField } from '@aiera/client-sdk/components/FormField';
import { FormFieldInput } from '@aiera/client-sdk/components/FormField/FormFieldInput';
import { getPrimaryQuote } from '@aiera/client-sdk/lib/data';
import { useChangeHandlers } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import { InputErrorState, RecordingFormStateChangeHandler } from '@aiera/client-sdk/modules/RecordingForm/types';
import { ChangeHandler } from '@aiera/client-sdk/types';
import './styles.css';
import { Close } from '@aiera/client-sdk/components/Svg/Close';

interface RecordingDetailsSharedProps {
    errors: InputErrorState;
    onBlur: FocusEventHandler;
    onChange: RecordingFormStateChangeHandler;
    onCompleteEmailCreator: boolean;
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
        errors,
        onBlur,
        onChange,
        onChangeCompanySearchTerm,
        onCompleteEmailCreator,
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
                error={errors.title}
                label="Title*"
                name="title"
                onBlur={onBlur}
                onChange={onChange}
                value={title}
            />
            <FormField className="mt-5 px-4 py-3">
                <p className="font-semibold text-base text-black form-field__label">Company</p>
                <p className="font-light leading-4 pt-0.5 text-slate-400 text-sm  form-field__description">
                    Associate with a specific company
                </p>
                {selectedCompany ? (
                    <Button
                        className="mt-3"
                        kind="default"
                        onClick={(event) => {
                            onChange(event, { name: 'selectedCompany', value: null });
                            onChangeCompanySearchTerm(event, { value: '' });
                        }}
                    >
                        <div className="font-bold">{getPrimaryQuote(selectedCompany)?.localTicker}</div>
                        <div className="font-light truncate mx-2">{selectedCompany.commonName}</div>
                        <div className="w-4 flex-shrink-0">
                            <Close />
                        </div>
                    </Button>
                ) : (
                    <CompanySelect
                        className="mt-3 shadow-none w-full"
                        name="selectedCompany"
                        onChange={onChange}
                        onChangeSearchTerm={onChangeCompanySearchTerm}
                        searchTerm={companySearchTerm}
                    />
                )}
            </FormField>
            <FormField className="mt-5 px-4 py-3">
                <p className="font-semibold text-base text-black form-field__label">Email transcript</p>
                <p className="font-light leading-4 pt-0.5 text-slate-400 text-sm  form-field__description">
                    After the recording ends, we will email you a copy of the transcript
                </p>
                <Checkbox
                    checked={onCompleteEmailCreator}
                    className="flex-shrink-0 ml-auto mt-3"
                    label="Email me a copy of the transcript"
                    name="onCompleteEmailCreator"
                    onChange={onChange}
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
    const { errors, onBlur, onChange, onCompleteEmailCreator, selectedCompany, title } = props;
    return (
        <RecordingDetailsUI
            companySearchTerm={state.companySearchTerm}
            errors={errors}
            onBlur={onBlur}
            onChange={onChange}
            onChangeCompanySearchTerm={handlers.companySearchTerm}
            onCompleteEmailCreator={onCompleteEmailCreator}
            selectedCompany={selectedCompany}
            title={title}
        />
    );
}
