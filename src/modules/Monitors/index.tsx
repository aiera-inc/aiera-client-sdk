import { Button } from '@aiera/client-sdk/components/Button';
import { CompanyFilterButton } from '@aiera/client-sdk/components/CompanyFilterButton';
import { SettingsButton } from '@aiera/client-sdk/components/SettingsButton';
import { Plus } from '@aiera/client-sdk/components/Svg/Plus';
import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import './styles.css';

interface MonitorsSharedProps {
    children?: ReactNode;
}

/** @notExported */
interface MonitorsUIProps extends MonitorsSharedProps {}

export function MonitorsUI(props: MonitorsUIProps): ReactElement {
    const { children } = props;
    return (
        <div className={classNames('h-full flex flex-col')}>
            <div className="flex flex-col pt-3 pl-3 pr-3 shadow-3xl dark:shadow-3xl-dark dark:bg-bluegray-6 z-10 eventlist__header">
                <div className="flex items-center mb-3">
                    <p className="flex-1 text-base font-semibold">Monitors</p>
                    <div className="mr-2">
                        <Button kind="primary">
                            <div className="flex-shrink-0 flex items-center h-8">
                                <Plus className="w-2.5 h-3 mb-0.5 flex-shrink-0 mr-1.5" />
                                <p className="text-base antialiased font-normal">New Monitor</p>
                            </div>
                        </Button>
                    </div>
                    <SettingsButton />
                </div>
            </div>
            <div className="bg-slate-50 p-3 flex justify-between items-center">
                <div className="flex justify-between items-baseline text-slate-400">
                    <p className="text-sm font-semibold text-slate-900">1 Week</p>
                    <p className="text-sm mx-4">1 Month</p>
                    <p className="text-sm">1 Year</p>
                </div>
                <CompanyFilterButton />
            </div>
            <div className="bg-slate-50 px-3 pb-3 flex-1 flex flex-col relative overflow-y-auto">
                <div className="bg-white mb-3 p-3 shadow-sm shadow-slate-200 rounded-lg">
                    <p>Stuff</p>
                </div>
                <div className="bg-white mb-3 p-3 shadow-sm shadow-slate-200 rounded-lg">
                    <p>Stuff</p>
                </div>
                <div className="bg-white mb-3 p-3 shadow-sm shadow-slate-200 rounded-lg">
                    <p>Stuff</p>
                </div>
                <div className="bg-white mb-3 p-3 shadow-sm shadow-slate-200 rounded-lg">
                    <p>Stuff</p>
                </div>
                <div className="bg-white mb-3 p-3 shadow-sm shadow-slate-200 rounded-lg">
                    <p>Stuff</p>
                </div>
                {children || 'MonitorsUI'}
            </div>
        </div>
    );
}

/** @notExported */
export interface MonitorsProps extends MonitorsSharedProps {}

/**
 * Renders Monitors
 */
export function Monitors(props: MonitorsProps): ReactElement {
    const { children } = props;
    return <MonitorsUI>{children}</MonitorsUI>;
}
