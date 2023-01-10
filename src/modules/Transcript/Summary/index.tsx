import React, { ReactElement, useState, Dispatch, SetStateAction } from 'react';
import classNames from 'classnames';
import { ExpandButton } from '@aiera/client-sdk/components/ExpandButton';

import './styles.css';

interface SummarySharedProps {
    summaryExpanded: boolean;
    toggleSummary: () => void;
}

/** @notExported */
interface SummaryUIProps extends SummarySharedProps {
    selectedTerm: string;
    selectTerm: Dispatch<SetStateAction<string>>;
}

const exampleData = {
    title: 'Some event transcript stuff',
    summary: [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ac dictum arcu, vitae vestibulum felis. Nulla ultricies dui accumsan mauris molestie, nec fringilla mauris vestibulum. Praesent id massa odio. Sed cursus mi non quam finibus feugiat. Etiam non rhoncus nisi, quis pharetra sapien. Suspendisse hendrerit ornare leo, id ornare lectus fringilla nec. Duis nec placerat metus. Nam vel maximus est. Aliquam ornare elementum velit ac luctus.',
        'Aenean lobortis scelerisque urna. Fusce rhoncus eros erat, in aliquam sem blandit a. Vestibulum ultrices mauris sit amet sapien pulvinar, ut sodales augue fringilla. Quisque a luctus neque. Curabitur risus lectus, ultricies et magna nec, consequat rhoncus quam. Integer egestas diam augue, iaculis dictum nisi hendrerit id. Mauris dictum ex a diam auctor, at feugiat neque pharetra.',
        'Maecenas semper mollis condimentum. Maecenas a leo nec mauris bibendum tristique eu sed nisl. Duis pellentesque pellentesque euismod. Nam nulla tellus, vehicula sit amet sem ac, tincidunt consequat erat. Praesent nec egestas tellus. Vestibulum varius tortor at dolor dapibus hendrerit. Ut blandit, neque id sagittis auctor, sem arcu luctus sapien, eget placerat dolor leo id purus. Integer eget pretium lorem, et sodales nisl.',
        'Morbi ut risus lacinia, dictum diam quis, convallis nibh. Proin feugiat congue velit quis fermentum. Cras vitae enim eu orci consequat ultricies ac sed lectus. Fusce placerat hendrerit sem, facilisis euismod lacus. Aenean maximus posuere aliquam. Nulla metus odio, gravida a massa at, sodales pellentesque ipsum. Fusce sed lacus ac quam porttitor sodales quis eget nibh. Curabitur hendrerit tortor pellentesque, bibendum urna nec, suscipit massa. In nisi nulla, convallis ut dolor dignissim, egestas viverra justo. Aenean ultrices ex eget lorem convallis bibendum. Aliquam pulvinar ligula eu facilisis placerat. Maecenas lobortis purus a pulvinar consectetur. Nullam nec mauris ac nibh molestie condimentum. In et lacus at lorem aliquam iaculis. In molestie ut libero vitae hendrerit.',
    ],
};
export function SummaryUI(props: SummaryUIProps): ReactElement {
    const { toggleSummary, summaryExpanded } = props;
    return (
        <div className="flex flex-col justify-start border-t-[1px] border-gray-100 px-3 flex-1 overflow-auto">
            <div
                className="flex items-center justify-start h-10 cursor-pointer flex-shrink-0 group"
                onClick={toggleSummary}
            >
                <span className="text-sm block font-semibold w-32 mr-1">Automated Summary</span>
                <span className="text-gray-400 text-sm text-right flex-1 truncate group-hover:text-gray-600">
                    {!summaryExpanded && exampleData.title}
                </span>
                <ExpandButton
                    className={classNames('ml-3', {
                        'group-hover:bg-gray-200': !summaryExpanded,
                        'group-hover:bg-blue-700': summaryExpanded,
                        'group-active:bg-gray-400': !summaryExpanded,
                        'group-active:bg-blue-900': summaryExpanded,
                    })}
                    onClick={toggleSummary}
                    expanded={summaryExpanded}
                />
            </div>
            {summaryExpanded && (
                <div className="rounded-lg border-[1px] border-gray-300 mb-3.5 px-3 py-2 overflow-auto flex-1">
                    <p className="text-sm font-semibold">{exampleData.title}</p>
                    {exampleData.summary.map((summary) => (
                        <p className="text-sm mt-3" key={summary.slice(0, 20)}>
                            {summary}
                        </p>
                    ))}
                    {/* {termObj ? (
                        <div className="flex flex-col">
                            <div
                                onClick={() => selectTerm('')}
                                className="flex sticky text-sm top-0 bg-white justify-between px-3 py-2.5 border-b-[1px] border-gray-100 group cursor-pointer hover:bg-blue-50 active:bg-blue-100 active:border-gray-300 hover:border-gray-200 backdrop-filter backdrop-blur-sm bg-opacity-70"
                            >
                                <div className="flex">
                                    <ArrowLeft className="fill-current w-3 group-hover:text-blue-500" />
                                    <span className="ml-2 font-bold">{termObj?.term}</span>
                                </div>
                                <span className="text-gray-400 group-hover:text-gray-600">Back to Topics</span>
                            </div>
                            {termObj.matches.map(({ transcript, id }, index) => (
                                <div className={classNames('p-3 text-sm', { 'mt-2': index !== 0 })} key={id}>
                                    <div className="flex justify-between mb-1">
                                        <div className="flex">
                                            <span className="font-bold">1:31:34 PM</span>
                                            <span className="text-blue-500 ml-2 cursor-pointer hover:underline">
                                                View in Transcript
                                            </span>
                                        </div>
                                        <span className="text-gray-400">{`${index + 1}/${
                                            termObj?.matches.length
                                        }`}</span>
                                    </div>
                                    {transcript}
                                </div>
                            ))}
                        </div>
                    ) : (
                        exampleData.map(({ term, matches }) => (
                            <div
                                className="px-3 py-2 flex items-center justify-between odd:bg-gray-50 cursor-pointer hover:bg-blue-500 active:bg-blue-700 group"
                                key={term}
                                onClick={() => selectTerm(term)}
                            >
                                <span className="text-base font-bold group-hover:text-white">{term}</span>
                                <span className="group-hover:text-white text-sm">{matches.length}</span>
                            </div>
                        ))
                    )} */}
                </div>
            )}
        </div>
    );
}

/** @notExported */
export interface SummaryProps extends SummarySharedProps {}

/**
 * Renders KeyMentions
 */
export function Summary(props: SummaryProps): ReactElement {
    const { toggleSummary, summaryExpanded } = props;
    const [selectedTerm, selectTerm] = useState('');
    return (
        <SummaryUI
            toggleSummary={toggleSummary}
            summaryExpanded={summaryExpanded}
            selectedTerm={selectedTerm}
            selectTerm={selectTerm}
        />
    );
}
