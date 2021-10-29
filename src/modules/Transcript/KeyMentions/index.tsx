import React, { ReactElement, useState, Dispatch, SetStateAction } from 'react';
import classNames from 'classnames';
import { ExpandButton } from '@aiera/client-sdk/components/ExpandButton';
import { ArrowLeft } from '@aiera/client-sdk/components/Svg/ArrowLeft';

import './styles.css';

interface KeyMentionsSharedProps {
    keyMentionsExpanded: boolean;
    toggleKeyMentions: () => void;
}

/** @notExported */
interface KeyMentionsUIProps extends KeyMentionsSharedProps {
    selectedTerm: string;
    selectTerm: Dispatch<SetStateAction<string>>;
}

const exampleData = [
    {
        term: 'NFL',
        matches: [
            {
                time: 1635773178649,
                transcript:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus facilisis consequat. Curabitur tincidunt porta faucibus. Aenean quis dictum nibh. Donec dignissim aliquam metus ut volutpat. In aliquet, purus sed rutrum ultricies, felis velit gravida dolor, vel eleifend neque risus eu elit. Pellentesque fringilla, erat nec lacinia vestibulum, massa dui sagittis orci, non ultrices nisl felis condimentum metus. Ut lorem ex, rhoncus eu molestie vitae, dictum eget eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum faucibus dapibus augue sed ullamcorper.',
                id: 1,
            },
            {
                time: 1635773178649,
                transcript:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus facilisis consequat. Curabitur tincidunt porta faucibus. Aenean quis dictum nibh. Donec dignissim aliquam metus ut volutpat. In aliquet, purus sed rutrum ultricies, felis velit gravida dolor, vel eleifend neque risus eu elit. Pellentesque fringilla, erat nec lacinia vestibulum, massa dui sagittis orci, non ultrices nisl felis condimentum metus. Ut lorem ex, rhoncus eu molestie vitae, dictum eget eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum faucibus dapibus augue sed ullamcorper.',
                id: 2,
            },
        ],
    },
    {
        term: 'Chicken',
        matches: [
            {
                time: 1635773178649,
                transcript:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus facilisis consequat. Curabitur tincidunt porta faucibus. Aenean quis dictum nibh. Donec dignissim aliquam metus ut volutpat. In aliquet, purus sed rutrum ultricies, felis velit gravida dolor, vel eleifend neque risus eu elit. Pellentesque fringilla, erat nec lacinia vestibulum, massa dui sagittis orci, non ultrices nisl felis condimentum metus. Ut lorem ex, rhoncus eu molestie vitae, dictum eget eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum faucibus dapibus augue sed ullamcorper.',
                id: 3,
            },
            {
                time: 1635773178649,
                transcript:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus facilisis consequat. Curabitur tincidunt porta faucibus. Aenean quis dictum nibh. Donec dignissim aliquam metus ut volutpat. In aliquet, purus sed rutrum ultricies, felis velit gravida dolor, vel eleifend neque risus eu elit. Pellentesque fringilla, erat nec lacinia vestibulum, massa dui sagittis orci, non ultrices nisl felis condimentum metus. Ut lorem ex, rhoncus eu molestie vitae, dictum eget eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum faucibus dapibus augue sed ullamcorper.',
                id: 4,
            },
        ],
    },
    {
        term: 'Aquatics',
        matches: [
            {
                time: 1635773178649,
                transcript:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus facilisis consequat. Curabitur tincidunt porta faucibus. Aenean quis dictum nibh. Donec dignissim aliquam metus ut volutpat. In aliquet, purus sed rutrum ultricies, felis velit gravida dolor, vel eleifend neque risus eu elit. Pellentesque fringilla, erat nec lacinia vestibulum, massa dui sagittis orci, non ultrices nisl felis condimentum metus. Ut lorem ex, rhoncus eu molestie vitae, dictum eget eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum faucibus dapibus augue sed ullamcorper.',
                id: 5,
            },
            {
                time: 1635773178649,
                transcript:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus facilisis consequat. Curabitur tincidunt porta faucibus. Aenean quis dictum nibh. Donec dignissim aliquam metus ut volutpat. In aliquet, purus sed rutrum ultricies, felis velit gravida dolor, vel eleifend neque risus eu elit. Pellentesque fringilla, erat nec lacinia vestibulum, massa dui sagittis orci, non ultrices nisl felis condimentum metus. Ut lorem ex, rhoncus eu molestie vitae, dictum eget eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum faucibus dapibus augue sed ullamcorper.',
                id: 6,
            },
        ],
    },
    {
        term: 'Metaverse',
        matches: [
            {
                time: 1635773178649,
                transcript:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus facilisis consequat. Curabitur tincidunt porta faucibus. Aenean quis dictum nibh. Donec dignissim aliquam metus ut volutpat. In aliquet, purus sed rutrum ultricies, felis velit gravida dolor, vel eleifend neque risus eu elit. Pellentesque fringilla, erat nec lacinia vestibulum, massa dui sagittis orci, non ultrices nisl felis condimentum metus. Ut lorem ex, rhoncus eu molestie vitae, dictum eget eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum faucibus dapibus augue sed ullamcorper.',
                id: 7,
            },
            {
                time: 1635773178649,
                transcript:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus facilisis consequat. Curabitur tincidunt porta faucibus. Aenean quis dictum nibh. Donec dignissim aliquam metus ut volutpat. In aliquet, purus sed rutrum ultricies, felis velit gravida dolor, vel eleifend neque risus eu elit. Pellentesque fringilla, erat nec lacinia vestibulum, massa dui sagittis orci, non ultrices nisl felis condimentum metus. Ut lorem ex, rhoncus eu molestie vitae, dictum eget eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum faucibus dapibus augue sed ullamcorper.',
                id: 8,
            },
        ],
    },
    {
        term: 'Ocular',
        matches: [
            {
                time: 1635773178649,
                transcript:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus facilisis consequat. Curabitur tincidunt porta faucibus. Aenean quis dictum nibh. Donec dignissim aliquam metus ut volutpat. In aliquet, purus sed rutrum ultricies, felis velit gravida dolor, vel eleifend neque risus eu elit. Pellentesque fringilla, erat nec lacinia vestibulum, massa dui sagittis orci, non ultrices nisl felis condimentum metus. Ut lorem ex, rhoncus eu molestie vitae, dictum eget eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum faucibus dapibus augue sed ullamcorper.',
                id: 9,
            },
            {
                time: 1635773178649,
                transcript:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus facilisis consequat. Curabitur tincidunt porta faucibus. Aenean quis dictum nibh. Donec dignissim aliquam metus ut volutpat. In aliquet, purus sed rutrum ultricies, felis velit gravida dolor, vel eleifend neque risus eu elit. Pellentesque fringilla, erat nec lacinia vestibulum, massa dui sagittis orci, non ultrices nisl felis condimentum metus. Ut lorem ex, rhoncus eu molestie vitae, dictum eget eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum faucibus dapibus augue sed ullamcorper.',
                id: 10,
            },
        ],
    },
    {
        term: 'Biofuel',
        matches: [
            {
                time: 1635773178649,
                transcript:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus facilisis consequat. Curabitur tincidunt porta faucibus. Aenean quis dictum nibh. Donec dignissim aliquam metus ut volutpat. In aliquet, purus sed rutrum ultricies, felis velit gravida dolor, vel eleifend neque risus eu elit. Pellentesque fringilla, erat nec lacinia vestibulum, massa dui sagittis orci, non ultrices nisl felis condimentum metus. Ut lorem ex, rhoncus eu molestie vitae, dictum eget eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum faucibus dapibus augue sed ullamcorper.',
                id: 11,
            },
            {
                time: 1635773178649,
                transcript:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus facilisis consequat. Curabitur tincidunt porta faucibus. Aenean quis dictum nibh. Donec dignissim aliquam metus ut volutpat. In aliquet, purus sed rutrum ultricies, felis velit gravida dolor, vel eleifend neque risus eu elit. Pellentesque fringilla, erat nec lacinia vestibulum, massa dui sagittis orci, non ultrices nisl felis condimentum metus. Ut lorem ex, rhoncus eu molestie vitae, dictum eget eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum faucibus dapibus augue sed ullamcorper.',
                id: 12,
            },
        ],
    },
    {
        term: 'Turbine',
        matches: [
            {
                time: 1635773178649,
                transcript:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus facilisis consequat. Curabitur tincidunt porta faucibus. Aenean quis dictum nibh. Donec dignissim aliquam metus ut volutpat. In aliquet, purus sed rutrum ultricies, felis velit gravida dolor, vel eleifend neque risus eu elit. Pellentesque fringilla, erat nec lacinia vestibulum, massa dui sagittis orci, non ultrices nisl felis condimentum metus. Ut lorem ex, rhoncus eu molestie vitae, dictum eget eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum faucibus dapibus augue sed ullamcorper.',
                id: 13,
            },
            {
                time: 1635773178649,
                transcript:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus facilisis consequat. Curabitur tincidunt porta faucibus. Aenean quis dictum nibh. Donec dignissim aliquam metus ut volutpat. In aliquet, purus sed rutrum ultricies, felis velit gravida dolor, vel eleifend neque risus eu elit. Pellentesque fringilla, erat nec lacinia vestibulum, massa dui sagittis orci, non ultrices nisl felis condimentum metus. Ut lorem ex, rhoncus eu molestie vitae, dictum eget eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum faucibus dapibus augue sed ullamcorper.',
                id: 14,
            },
        ],
    },
    {
        term: 'Sprocket',
        matches: [
            {
                time: 1635773178649,
                transcript:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus facilisis consequat. Curabitur tincidunt porta faucibus. Aenean quis dictum nibh. Donec dignissim aliquam metus ut volutpat. In aliquet, purus sed rutrum ultricies, felis velit gravida dolor, vel eleifend neque risus eu elit. Pellentesque fringilla, erat nec lacinia vestibulum, massa dui sagittis orci, non ultrices nisl felis condimentum metus. Ut lorem ex, rhoncus eu molestie vitae, dictum eget eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum faucibus dapibus augue sed ullamcorper.',
                id: 15,
            },
            {
                time: 1635773178649,
                transcript:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus facilisis consequat. Curabitur tincidunt porta faucibus. Aenean quis dictum nibh. Donec dignissim aliquam metus ut volutpat. In aliquet, purus sed rutrum ultricies, felis velit gravida dolor, vel eleifend neque risus eu elit. Pellentesque fringilla, erat nec lacinia vestibulum, massa dui sagittis orci, non ultrices nisl felis condimentum metus. Ut lorem ex, rhoncus eu molestie vitae, dictum eget eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum faucibus dapibus augue sed ullamcorper.',
                id: 16,
            },
        ],
    },
    {
        term: 'Robocop',
        matches: [
            {
                time: 1635773178649,
                transcript:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus facilisis consequat. Curabitur tincidunt porta faucibus. Aenean quis dictum nibh. Donec dignissim aliquam metus ut volutpat. In aliquet, purus sed rutrum ultricies, felis velit gravida dolor, vel eleifend neque risus eu elit. Pellentesque fringilla, erat nec lacinia vestibulum, massa dui sagittis orci, non ultrices nisl felis condimentum metus. Ut lorem ex, rhoncus eu molestie vitae, dictum eget eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum faucibus dapibus augue sed ullamcorper.',
                id: 17,
            },
            {
                time: 1635773178649,
                transcript:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus facilisis consequat. Curabitur tincidunt porta faucibus. Aenean quis dictum nibh. Donec dignissim aliquam metus ut volutpat. In aliquet, purus sed rutrum ultricies, felis velit gravida dolor, vel eleifend neque risus eu elit. Pellentesque fringilla, erat nec lacinia vestibulum, massa dui sagittis orci, non ultrices nisl felis condimentum metus. Ut lorem ex, rhoncus eu molestie vitae, dictum eget eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum faucibus dapibus augue sed ullamcorper.',
                id: 18,
            },
        ],
    },
    {
        term: 'Bezos',
        matches: [
            {
                time: 1635773178649,
                transcript:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus facilisis consequat. Curabitur tincidunt porta faucibus. Aenean quis dictum nibh. Donec dignissim aliquam metus ut volutpat. In aliquet, purus sed rutrum ultricies, felis velit gravida dolor, vel eleifend neque risus eu elit. Pellentesque fringilla, erat nec lacinia vestibulum, massa dui sagittis orci, non ultrices nisl felis condimentum metus. Ut lorem ex, rhoncus eu molestie vitae, dictum eget eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum faucibus dapibus augue sed ullamcorper.',
                id: 19,
            },
            {
                time: 1635773178649,
                transcript:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus facilisis consequat. Curabitur tincidunt porta faucibus. Aenean quis dictum nibh. Donec dignissim aliquam metus ut volutpat. In aliquet, purus sed rutrum ultricies, felis velit gravida dolor, vel eleifend neque risus eu elit. Pellentesque fringilla, erat nec lacinia vestibulum, massa dui sagittis orci, non ultrices nisl felis condimentum metus. Ut lorem ex, rhoncus eu molestie vitae, dictum eget eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum faucibus dapibus augue sed ullamcorper.',
                id: 20,
            },
        ],
    },
    {
        term: 'Prime Numbers',
        matches: [
            {
                time: 1635773178649,
                transcript:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus facilisis consequat. Curabitur tincidunt porta faucibus. Aenean quis dictum nibh. Donec dignissim aliquam metus ut volutpat. In aliquet, purus sed rutrum ultricies, felis velit gravida dolor, vel eleifend neque risus eu elit. Pellentesque fringilla, erat nec lacinia vestibulum, massa dui sagittis orci, non ultrices nisl felis condimentum metus. Ut lorem ex, rhoncus eu molestie vitae, dictum eget eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum faucibus dapibus augue sed ullamcorper.',
                id: 21,
            },
            {
                time: 1635773178649,
                transcript:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus facilisis consequat. Curabitur tincidunt porta faucibus. Aenean quis dictum nibh. Donec dignissim aliquam metus ut volutpat. In aliquet, purus sed rutrum ultricies, felis velit gravida dolor, vel eleifend neque risus eu elit. Pellentesque fringilla, erat nec lacinia vestibulum, massa dui sagittis orci, non ultrices nisl felis condimentum metus. Ut lorem ex, rhoncus eu molestie vitae, dictum eget eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum faucibus dapibus augue sed ullamcorper.',
                id: 22,
            },
        ],
    },
    {
        term: 'Hyooloo',
        matches: [
            {
                time: 1635773178649,
                transcript:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus facilisis consequat. Curabitur tincidunt porta faucibus. Aenean quis dictum nibh. Donec dignissim aliquam metus ut volutpat. In aliquet, purus sed rutrum ultricies, felis velit gravida dolor, vel eleifend neque risus eu elit. Pellentesque fringilla, erat nec lacinia vestibulum, massa dui sagittis orci, non ultrices nisl felis condimentum metus. Ut lorem ex, rhoncus eu molestie vitae, dictum eget eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum faucibus dapibus augue sed ullamcorper.',
                id: 23,
            },
            {
                time: 1635773178649,
                transcript:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus facilisis consequat. Curabitur tincidunt porta faucibus. Aenean quis dictum nibh. Donec dignissim aliquam metus ut volutpat. In aliquet, purus sed rutrum ultricies, felis velit gravida dolor, vel eleifend neque risus eu elit. Pellentesque fringilla, erat nec lacinia vestibulum, massa dui sagittis orci, non ultrices nisl felis condimentum metus. Ut lorem ex, rhoncus eu molestie vitae, dictum eget eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum faucibus dapibus augue sed ullamcorper.',
                id: 24,
            },
        ],
    },
    {
        term: 'Cloud',
        matches: [
            {
                time: 1635773178649,
                transcript:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus facilisis consequat. Curabitur tincidunt porta faucibus. Aenean quis dictum nibh. Donec dignissim aliquam metus ut volutpat. In aliquet, purus sed rutrum ultricies, felis velit gravida dolor, vel eleifend neque risus eu elit. Pellentesque fringilla, erat nec lacinia vestibulum, massa dui sagittis orci, non ultrices nisl felis condimentum metus. Ut lorem ex, rhoncus eu molestie vitae, dictum eget eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum faucibus dapibus augue sed ullamcorper.',
                id: 25,
            },
            {
                time: 1635773178649,
                transcript:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus facilisis consequat. Curabitur tincidunt porta faucibus. Aenean quis dictum nibh. Donec dignissim aliquam metus ut volutpat. In aliquet, purus sed rutrum ultricies, felis velit gravida dolor, vel eleifend neque risus eu elit. Pellentesque fringilla, erat nec lacinia vestibulum, massa dui sagittis orci, non ultrices nisl felis condimentum metus. Ut lorem ex, rhoncus eu molestie vitae, dictum eget eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum faucibus dapibus augue sed ullamcorper.',
                id: 26,
            },
        ],
    },
];

export function KeyMentionsUI(props: KeyMentionsUIProps): ReactElement {
    const { toggleKeyMentions, keyMentionsExpanded, selectTerm, selectedTerm } = props;
    const termObj = exampleData.find(({ term }) => term === selectedTerm);
    return (
        <div className="flex flex-col justify-start border-t-[1px] border-gray-100 px-3 flex-1 overflow-auto">
            <div
                className="flex items-center justify-start h-10 cursor-pointer flex-shrink-0 group"
                onClick={toggleKeyMentions}
            >
                <span className="text-sm block font-semibold w-28 mr-1">Key Mentions</span>
                <span className="text-gray-400 text-sm text-right flex-1 truncate group-hover:text-gray-600">
                    Suggested NLP Topics...
                </span>
                <ExpandButton
                    className={classNames('ml-3', {
                        'group-hover:bg-gray-200': !keyMentionsExpanded,
                        'group-hover:bg-blue-700': keyMentionsExpanded,
                        'group-active:bg-gray-400': !keyMentionsExpanded,
                        'group-active:bg-blue-900': keyMentionsExpanded,
                    })}
                    onClick={toggleKeyMentions}
                    expanded={keyMentionsExpanded}
                />
            </div>
            {keyMentionsExpanded && (
                <div className="rounded-lg border-[1px] border-gray-300 mb-3.5 overflow-auto flex-1">
                    {termObj ? (
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
                    )}
                </div>
            )}
        </div>
    );
}

/** @notExported */
export interface KeyMentionsProps extends KeyMentionsSharedProps {}

/**
 * Renders KeyMentions
 */
export function KeyMentions(props: KeyMentionsProps): ReactElement {
    const { toggleKeyMentions, keyMentionsExpanded } = props;
    const [selectedTerm, selectTerm] = useState('');
    return (
        <KeyMentionsUI
            toggleKeyMentions={toggleKeyMentions}
            keyMentionsExpanded={keyMentionsExpanded}
            selectedTerm={selectedTerm}
            selectTerm={selectTerm}
        />
    );
}
