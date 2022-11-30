import React, { FocusEventHandler, ReactElement, useEffect, useState } from 'react';
import 'react-phone-number-input/style.css';
import './styles.css';

interface PhoneNumberInputSharedProps {
    defaultCountry?: string;
    className?: string;
    error?: string;
    label?: string;
    name?: string;
    onBlur?: FocusEventHandler;
    onChange(value?: string): void;
    onFocus?: FocusEventHandler;
    placeholder?: string;
    value?: string;
}

/** @notExported */
// react-phone-number-input doesn't have a separate types file,
// so since we're dynamically importing it,
// we need to maintain our own list of types/interfaces
type CountryCode =
    | 'AC'
    | 'AD'
    | 'AE'
    | 'AF'
    | 'AG'
    | 'AI'
    | 'AL'
    | 'AM'
    | 'AO'
    | 'AR'
    | 'AS'
    | 'AT'
    | 'AU'
    | 'AW'
    | 'AX'
    | 'AZ'
    | 'BA'
    | 'BB'
    | 'BD'
    | 'BE'
    | 'BF'
    | 'BG'
    | 'BH'
    | 'BI'
    | 'BJ'
    | 'BL'
    | 'BM'
    | 'BN'
    | 'BO'
    | 'BQ'
    | 'BR'
    | 'BS'
    | 'BT'
    | 'BW'
    | 'BY'
    | 'BZ'
    | 'CA'
    | 'CC'
    | 'CD'
    | 'CF'
    | 'CG'
    | 'CH'
    | 'CI'
    | 'CK'
    | 'CL'
    | 'CM'
    | 'CN'
    | 'CO'
    | 'CR'
    | 'CU'
    | 'CV'
    | 'CW'
    | 'CX'
    | 'CY'
    | 'CZ'
    | 'DE'
    | 'DJ'
    | 'DK'
    | 'DM'
    | 'DO'
    | 'DZ'
    | 'EC'
    | 'EE'
    | 'EG'
    | 'EH'
    | 'ER'
    | 'ES'
    | 'ET'
    | 'FI'
    | 'FJ'
    | 'FK'
    | 'FM'
    | 'FO'
    | 'FR'
    | 'GA'
    | 'GB'
    | 'GD'
    | 'GE'
    | 'GF'
    | 'GG'
    | 'GH'
    | 'GI'
    | 'GL'
    | 'GM'
    | 'GN'
    | 'GP'
    | 'GQ'
    | 'GR'
    | 'GT'
    | 'GU'
    | 'GW'
    | 'GY'
    | 'HK'
    | 'HN'
    | 'HR'
    | 'HT'
    | 'HU'
    | 'ID'
    | 'IE'
    | 'IL'
    | 'IM'
    | 'IN'
    | 'IO'
    | 'IQ'
    | 'IR'
    | 'IS'
    | 'IT'
    | 'JE'
    | 'JM'
    | 'JO'
    | 'JP'
    | 'KE'
    | 'KG'
    | 'KH'
    | 'KI'
    | 'KM'
    | 'KN'
    | 'KP'
    | 'KR'
    | 'KW'
    | 'KY'
    | 'KZ'
    | 'LA'
    | 'LB'
    | 'LC'
    | 'LI'
    | 'LK'
    | 'LR'
    | 'LS'
    | 'LT'
    | 'LU'
    | 'LV'
    | 'LY'
    | 'MA'
    | 'MC'
    | 'MD'
    | 'ME'
    | 'MF'
    | 'MG'
    | 'MH'
    | 'MK'
    | 'ML'
    | 'MM'
    | 'MN'
    | 'MO'
    | 'MP'
    | 'MQ'
    | 'MR'
    | 'MS'
    | 'MT'
    | 'MU'
    | 'MV'
    | 'MW'
    | 'MX'
    | 'MY'
    | 'MZ'
    | 'NA'
    | 'NC'
    | 'NE'
    | 'NF'
    | 'NG'
    | 'NI'
    | 'NL'
    | 'NO'
    | 'NP'
    | 'NR'
    | 'NU'
    | 'NZ'
    | 'OM'
    | 'PA'
    | 'PE'
    | 'PF'
    | 'PG'
    | 'PH'
    | 'PK'
    | 'PL'
    | 'PM'
    | 'PR'
    | 'PS'
    | 'PT'
    | 'PW'
    | 'PY'
    | 'QA'
    | 'RE'
    | 'RO'
    | 'RS'
    | 'RU'
    | 'RW'
    | 'SA'
    | 'SB'
    | 'SC'
    | 'SD'
    | 'SE'
    | 'SG'
    | 'SH'
    | 'SI'
    | 'SJ'
    | 'SK'
    | 'SL'
    | 'SM'
    | 'SN'
    | 'SO'
    | 'SR'
    | 'SS'
    | 'ST'
    | 'SV'
    | 'SX'
    | 'SY'
    | 'SZ'
    | 'TA'
    | 'TC'
    | 'TD'
    | 'TG'
    | 'TH'
    | 'TJ'
    | 'TK'
    | 'TL'
    | 'TM'
    | 'TN'
    | 'TO'
    | 'TR'
    | 'TT'
    | 'TV'
    | 'TW'
    | 'TZ'
    | 'UA'
    | 'UG'
    | 'US'
    | 'UY'
    | 'UZ'
    | 'VA'
    | 'VC'
    | 'VE'
    | 'VG'
    | 'VI'
    | 'VN'
    | 'VU'
    | 'WF'
    | 'WS'
    | 'XK'
    | 'YE'
    | 'YT'
    | 'ZA'
    | 'ZM'
    | 'ZW';
type ReactFormatPhoneNumber = (value: string) => string;
// react-phone-number-input supports more props, but listing the main ones we'd use
type PhoneInputProps = {
    autoComplete?: string;
    className?: string;
    defaultCountry?: CountryCode;
    disabled?: boolean;
    initialValueFormat?: 'national';
    onBlur?: FocusEventHandler;
    onChange(value?: string): void;
    onFocus?: FocusEventHandler;
    placeholder?: string;
    value?: string;
};
interface PhoneInputState<Props> {
    country?: CountryCode;
    countries?: CountryCode[];
    // forceRerender is a "dummy" object that is set to `{}`
    // in order to force a rerender of the component
    forceRerender?: object;
    hasUserSelectedACountry?: boolean;
    isFocused?: boolean;
    // phoneDigits is the parsed phone number digits,
    // optionally with a leading +
    phoneDigits?: string;
    // props are stored in state in order to be able to compare
    // new props with the "previous" ones in state.props
    // in PhoneInputWithCountry.getDerivedStateFromProps()
    props: Props;
    value?: string;
}
type PhoneInputWithCountrySelectType = React.ComponentClass<PhoneInputProps, PhoneInputState<PhoneInputProps>>;

/** @notExported */
interface PhoneNumberInputUIProps extends PhoneNumberInputSharedProps {
    formatNumber?: (value: string) => string;
    ReactPhoneInput?: PhoneInputWithCountrySelectType;
}

export function PhoneNumberInputUI(props: PhoneNumberInputUIProps): ReactElement {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { className = '', error, onBlur, onChange, onFocus, placeholder, ReactPhoneInput, value } = props;
    return (
        <div className={`h-8 items-center w-full dark:text-white ${className}`}>
            {ReactPhoneInput && (
                <>
                    {error && <div className="mb-0.5 ml-auto text-red-600 text-sm">{error}</div>}
                    <ReactPhoneInput
                        autoComplete="off"
                        defaultCountry="US"
                        initialValueFormat="national"
                        onBlur={onBlur}
                        onChange={(value?: string) => onChange(value || '')}
                        onFocus={onFocus}
                        placeholder={placeholder}
                        value={value}
                    />
                </>
            )}
        </div>
    );
}

/** @notExported */
export interface PhoneNumberInputProps extends PhoneNumberInputSharedProps {}

/**
 * Renders PhoneNumberInput
 */
export function PhoneNumberInput(props: PhoneNumberInputProps): ReactElement {
    // Dynamically load react-phone-number-input package
    // We're just grabbing the input component and a formatting function
    const [formatNumber, setFormatNumber] = useState<ReactFormatPhoneNumber | undefined>(undefined);
    const [ReactPhoneInput, setReactPhoneInput] = useState<PhoneInputWithCountrySelectType | undefined>(undefined);
    useEffect(() => {
        void import('react-phone-number-input').then(({ default: ReactPhoneInput, formatPhoneNumber }) => {
            setFormatNumber(formatPhoneNumber);
            setReactPhoneInput(ReactPhoneInput);
        });
    }, []);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { className, defaultCountry, error, label, name, onBlur, onChange, onFocus, placeholder, value } = props;
    return (
        <PhoneNumberInputUI
            className={className}
            defaultCountry={defaultCountry}
            error={error}
            formatNumber={formatNumber}
            label={label}
            name={name}
            onBlur={onBlur}
            onChange={onChange}
            onFocus={onFocus}
            placeholder={placeholder}
            ReactPhoneInput={ReactPhoneInput}
            value={value}
        />
    );
}
