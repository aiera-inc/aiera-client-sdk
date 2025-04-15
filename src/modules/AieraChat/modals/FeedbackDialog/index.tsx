import { Button } from '@aiera/client-sdk/components/Button';
import { MicroChatLeftRight } from '@aiera/client-sdk/components/Svg/MicroChatLeftRight';
import React, { MouseEvent, ReactElement, useState } from 'react';
import { Modal } from '../Modal';

interface FeedbackDialogProps {
    onSubmit?: (e: MouseEvent, formData: any) => void;
    onClose: () => void;
    messageId: string;
    prompt: string;
}

const googleSheetUrl =
    'https://script.google.com/macros/s/AKfycbxCuM7iY64onqnhxKPzd5nbHANzBbVT3v2xiDYA3TnOqSVgfSVfqlBFzPmfrNSwDlmv-Q/exec';

export function FeedbackDialog({ onClose, onSubmit, messageId, prompt }: FeedbackDialogProps): ReactElement {
    // State to track all form values and submission status
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [formData, setFormData] = useState({
        messageId,
        prompt,
        sourceSuggested: 'n',
        sourcesRelevant: '',
        sourceOrdering: '',
        relevanceCompleteness: '',
        conciseness: '',
        conversationalFlow: '',
        citationQuality: '',
        citationClickThrough: 'n',
        questionAmbiguity: 'n',
        handlingAmbiguity: '',
        knowledgeBoundaries: '',
        followUpHandling: '',
        strengths: '',
        improvements: '',
    });

    // Handle form field changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear conditional fields if parent field changes
        if (name === 'sourceSuggested' && value === 'n') {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
                sourcesRelevant: '',
                sourceOrdering: '',
            }));
        }

        if (name === 'citationQuality' && (value === '0' || value === '')) {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
                citationClickThrough: 'n',
            }));
        }

        if (name === 'questionAmbiguity' && value === 'n') {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
                handlingAmbiguity: '',
            }));
        }
    };

    // Handle the form submission
    const handleSubmit = async (e: MouseEvent) => {
        if (onSubmit) {
            onSubmit(e, formData);
        }

        // If Google Sheets integration is enabled
        if (googleSheetUrl) {
            try {
                setIsSubmitting(true);
                setSubmitError('');

                const body = JSON.stringify({
                    ...formData,
                    timestamp: new Date().toISOString(),
                });

                // Submit to Google Sheets using the Apps Script Web App URL
                await fetch(googleSheetUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': `${body.length}`,
                        Host: 'script.google.com',
                    },
                    body: body,
                });

                // Since we can't reliably check response.ok with an opaque response,
                // we'll assume success if the request doesn't throw an error
                setSubmitSuccess(true);
            } catch (error) {
                console.error('Error submitting feedback:', error);
                setSubmitError('An error occurred while submitting feedback. Please try again.');
            } finally {
                if (!submitError) {
                    onClose();
                }
                setIsSubmitting(false);
            }
        }
    };

    return (
        <Modal
            variant="minimal"
            onClose={onClose}
            title="Provide Feedback"
            className="justify-center items-center"
            Icon={MicroChatLeftRight}
        >
            <p className="text-base mt-1 mb-4 leading-5 text-slate-600 text-balance text-center">
                Please answer the following questions
            </p>
            {/* Questions Start */}
            <div className="max-h-96 overflow-y-auto px-4 py-2 space-y-4">
                {/* 1. Source Suggestion */}
                <div className="space-y-2">
                    <h3 className="font-medium text-slate-800">Source Suggestion</h3>

                    <div className="ml-2">
                        <label className="block text-sm font-medium text-slate-700">1.a. Sources were suggested:</label>
                        <div className="mt-1 flex items-center space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="sourceSuggested"
                                    value="y"
                                    checked={formData.sourceSuggested === 'y'}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600"
                                />
                                <span className="ml-2 text-sm text-slate-700">Yes</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="sourceSuggested"
                                    value="n"
                                    checked={formData.sourceSuggested === 'n'}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600"
                                />
                                <span className="ml-2 text-sm text-slate-700">No</span>
                            </label>
                        </div>
                    </div>

                    {formData.sourceSuggested === 'y' && (
                        <>
                            <div className="ml-2">
                                <label className="block text-sm font-medium text-slate-700">
                                    1.b. Sources were relevant:
                                </label>
                                <select
                                    name="sourcesRelevant"
                                    value={formData.sourcesRelevant}
                                    onChange={handleChange}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                >
                                    <option value="">Select an option</option>
                                    <option value="2">2 - Suggested sources are relevant and comprehensive</option>
                                    <option value="1">1 - Suggested sources are missing necessary sources</option>
                                    <option value="0">0 - Suggested sources are completely off-topic</option>
                                </select>
                            </div>

                            {(formData.sourcesRelevant === '1' || formData.sourcesRelevant === '2') && (
                                <div className="ml-2">
                                    <label className="block text-sm font-medium text-slate-700">
                                        1.c. Source ordering:
                                    </label>
                                    <select
                                        name="sourceOrdering"
                                        value={formData.sourceOrdering}
                                        onChange={handleChange}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                    >
                                        <option value="">Select an option</option>
                                        <option value="3">3 - Ordered from most-to-least relevant</option>
                                        <option value="2">
                                            2 - Not exactly ordered but relevant sources appear early
                                        </option>
                                        <option value="1">1 - Sources provided in seemingly random order</option>
                                        <option value="0">0 - Ordered from least-to-most relevant</option>
                                    </select>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* 2. Relevance & Completeness */}
                <div className="space-y-2">
                    <h3 className="font-medium text-slate-800">Relevance & Completeness</h3>
                    <select
                        name="relevanceCompleteness"
                        value={formData.relevanceCompleteness}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="">Select an option</option>
                        <option value="5">5 - Response fully addresses all aspects (perfect)</option>
                        <option value="4">4 - Response addresses main aspects with sufficient detail</option>
                        <option value="3">3 - Response addresses main question but misses some details</option>
                        <option value="2">2 - Response partially addresses question with significant omissions</option>
                        <option value="1">1 - Response is minimally relevant to question</option>
                        <option value="0">0 - Response is completely off-topic</option>
                    </select>
                </div>

                {/* 3. Conciseness */}
                <div className="space-y-2">
                    <h3 className="font-medium text-slate-800">Conciseness</h3>
                    <select
                        name="conciseness"
                        value={formData.conciseness}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="">Select an option</option>
                        <option value="5">5 - Optimal length and structure (perfect)</option>
                        <option value="4">4 - Clear with good organization and appropriate detail</option>
                        <option value="3">3 - Mostly clear but with some confusing elements or verbosity</option>
                        <option value="2">2 - Difficult to follow with poor organization</option>
                        <option value="1">1 - Very confusing or inappropriately lengthy/brief</option>
                        <option value="0">0 - Incomprehensible</option>
                    </select>
                </div>

                {/* 4. Conversational Flow */}
                <div className="space-y-2">
                    <h3 className="font-medium text-slate-800">Conversational Flow</h3>
                    <select
                        name="conversationalFlow"
                        value={formData.conversationalFlow}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="">Select an option</option>
                        <option value="3">3 - Natural, engaging conversation that builds rapport</option>
                        <option value="2">2 - Awkward conversation that creates friction</option>
                        <option value="1">1 - Inappropriate tone or style that hinders communication</option>
                        <option value="0">0 - Completely fails at maintaining conversation</option>
                    </select>
                </div>

                {/* 5. Citation Quality */}
                <div className="space-y-2">
                    <h3 className="font-medium text-slate-800">Citation Quality</h3>

                    <div className="ml-2">
                        <label className="block text-sm font-medium text-slate-700">
                            5.a. Generation of citations:
                        </label>
                        <select
                            name="citationQuality"
                            value={formData.citationQuality}
                            onChange={handleChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            <option value="">Select an option</option>
                            <option value="3">3 - Citations accurately reference relevant source documents</option>
                            <option value="2">2 - Citations were generated, but contain irrelevant references</option>
                            <option value="1">1 - Citations were generated, but missing critical references</option>
                            <option value="0">0 - No citations generated</option>
                        </select>
                    </div>

                    {formData.citationQuality && formData.citationQuality !== '0' && (
                        <div className="ml-2">
                            <label className="block text-sm font-medium text-slate-700">
                                5.b. When engaging with citations, did the click-through bring you to the relevant item?
                            </label>
                            <div className="mt-1 flex items-center space-x-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="citationClickThrough"
                                        value="y"
                                        checked={formData.citationClickThrough === 'y'}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                    <span className="ml-2 text-sm text-slate-700">Yes</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="citationClickThrough"
                                        value="n"
                                        checked={formData.citationClickThrough === 'n'}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                    <span className="ml-2 text-sm text-slate-700">No</span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* 6. Handling Ambiguity */}
                <div className="space-y-2">
                    <h3 className="font-medium text-slate-800">Handling Ambiguity</h3>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Did your question involve ambiguity?
                        </label>
                        <div className="mt-1 flex items-center space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="questionAmbiguity"
                                    value="y"
                                    checked={formData.questionAmbiguity === 'y'}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600"
                                />
                                <span className="ml-2 text-sm text-slate-700">Yes</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="questionAmbiguity"
                                    value="n"
                                    checked={formData.questionAmbiguity === 'n'}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600"
                                />
                                <span className="ml-2 text-sm text-slate-700">No</span>
                            </label>
                        </div>
                    </div>

                    {formData.questionAmbiguity === 'y' && (
                        <div className="ml-2">
                            <label className="block text-sm font-medium text-slate-700">
                                How did Aiera Chat handle the ambiguity?
                            </label>
                            <select
                                name="handlingAmbiguity"
                                value={formData.handlingAmbiguity}
                                onChange={handleChange}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value="">Select an option</option>
                                <option value="2">2 - Able to disambiguate or ask clarifying questions</option>
                                <option value="1">1 - Attempts to resolve ambiguity</option>
                                <option value="0">0 - Makes no attempt to resolve ambiguity</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* 7. Knowledge Boundaries */}
                <div className="space-y-2">
                    <h3 className="font-medium text-slate-800">Knowledge Boundaries</h3>
                    <label className="block text-sm font-medium text-slate-700">
                        Is Aiera Chat aware of the bounds of information it has access to?
                    </label>
                    <select
                        name="knowledgeBoundaries"
                        value={formData.knowledgeBoundaries}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="">Select an option</option>
                        <option value="2">2 - Understands and communicates knowledge boundaries</option>
                        <option value="1">1 - Unclear about information limitations</option>
                        <option value="0">0 - Misleads about knowledge boundaries</option>
                    </select>
                </div>

                {/* 8. Follow-up Handling */}
                <div className="space-y-2">
                    <h3 className="font-medium text-slate-800">Follow-up Handling</h3>
                    <select
                        name="followUpHandling"
                        value={formData.followUpHandling}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="">Select an option</option>
                        <option value="3">3 - Handles follow-up questions with context retention</option>
                        <option value="2">2 - Good handling of follow-ups with minor context issues</option>
                        <option value="1">1 - Poor follow-up handling with significant context loss</option>
                        <option value="0">0 - Unable to maintain context across interactions</option>
                        <option value="N/A">N/A - Not applicable</option>
                    </select>
                </div>

                {/* Qualitative Assessment */}
                <div className="space-y-2">
                    <h3 className="font-medium text-slate-800">Qualitative Assessment</h3>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Strengths:</label>
                        <textarea
                            name="strengths"
                            value={formData.strengths}
                            onChange={handleChange}
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Note specific strengths..."
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Areas for Improvement:</label>
                        <textarea
                            name="improvements"
                            value={formData.improvements}
                            onChange={handleChange}
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Note specific improvement opportunities..."
                        ></textarea>
                    </div>
                </div>

                {/* Questions End */}
                {/* Submission status messages */}
                {submitError && (
                    <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">{submitError}</div>
                )}

                {submitSuccess && (
                    <div className="mt-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
                        Feedback submitted successfully!
                    </div>
                )}

                <div className="flex items-center justify-center mt-6">
                    <Button kind="primary" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                    <Button kind="secondary" onClick={onClose} className="ml-2" disabled={isSubmitting}>
                        Cancel
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
