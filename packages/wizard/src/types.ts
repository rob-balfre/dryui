export const WIZARD_LAYOUT_IDS = [
	'sidebar-main',
	'header-content-footer',
	'header-sidebar-main'
] as const;
export type WizardLayoutId = (typeof WIZARD_LAYOUT_IDS)[number];

export const WIZARD_REGION_IDS = ['sidebar', 'header', 'main', 'footer'] as const;
export type WizardRegionId = (typeof WIZARD_REGION_IDS)[number];

export const WIZARD_QUESTION_TYPES = ['multi-choice', 'text', 'confirm'] as const;
export type WizardQuestionType = (typeof WIZARD_QUESTION_TYPES)[number];

export interface WizardRegionDefinition {
	readonly id: WizardRegionId;
	readonly label: string;
	readonly description: string;
}

export interface WizardLayoutDefinition {
	readonly id: WizardLayoutId;
	readonly name: string;
	readonly description: string;
	readonly regions: readonly WizardRegionDefinition[];
}

export interface WizardComponentDefinition {
	readonly name: string;
	readonly category: string;
	readonly description: string;
	readonly tags: readonly string[];
	readonly compound: boolean;
	readonly importPath: string;
	readonly regions: readonly WizardRegionId[];
	readonly previewable: boolean;
}

export interface WizardComponentGroup {
	readonly category: string;
	readonly label: string;
	readonly components: readonly WizardComponentDefinition[];
}

export interface WizardPhase1Selections {
	readonly layout: WizardLayoutId;
	readonly regions: Readonly<Record<WizardRegionId, readonly string[]>>;
}

export interface WizardQuestionOption {
	readonly label: string;
	readonly value: string;
	readonly description?: string;
}

export interface WizardQuestionInput {
	readonly prompt: string;
	readonly type?: WizardQuestionType;
	readonly questionType?: WizardQuestionType;
	readonly options?: readonly (string | WizardQuestionOption)[];
}

export interface WizardQuestion {
	readonly id: string;
	readonly prompt: string;
	readonly questionType: WizardQuestionType;
	readonly options?: readonly WizardQuestionOption[];
}

export interface WizardBrowserLayoutAnswerMessage {
	readonly type: 'answer';
	readonly step: 'layout';
	readonly value: WizardLayoutId;
}

export interface WizardBrowserComponentsAnswerMessage {
	readonly type: 'answer';
	readonly step: 'components';
	readonly value: Readonly<Record<WizardRegionId, readonly string[]>>;
}

export interface WizardBrowserConfirmMessage {
	readonly type: 'confirm';
	readonly selections: WizardPhase1Selections;
}

export interface WizardBrowserQuestionAnswerMessage {
	readonly type: 'answer';
	readonly questionId: string;
	readonly value: string | boolean;
}

export type WizardBrowserMessage =
	| WizardBrowserLayoutAnswerMessage
	| WizardBrowserComponentsAnswerMessage
	| WizardBrowserConfirmMessage
	| WizardBrowserQuestionAnswerMessage;

export interface WizardServerConnectedMessage {
	readonly type: 'connected';
	readonly sessionId: string;
}

export interface WizardServerQuestionMessage extends WizardQuestion {
	readonly type: 'question';
}

export type WizardServerMessage = WizardServerConnectedMessage | WizardServerQuestionMessage;

export interface WizardLayoutAnswerEvent {
	readonly type: 'answer';
	readonly step: 'layout';
	readonly value: WizardLayoutId;
}

export interface WizardComponentsAnswerEvent {
	readonly type: 'answer';
	readonly step: 'components';
	readonly value: Readonly<Record<WizardRegionId, readonly string[]>>;
}

export interface WizardQuestionAnsweredEvent {
	readonly type: 'answer';
	readonly questionId: string;
	readonly value: string | boolean;
}

export interface WizardPhase1CompleteEvent {
	readonly type: 'phase1_complete';
	readonly selections: WizardPhase1Selections;
}

export interface WizardClosedEvent {
	readonly type: 'closed';
}

export type WizardRuntimeEvent =
	| WizardLayoutAnswerEvent
	| WizardComponentsAnswerEvent
	| WizardQuestionAnsweredEvent
	| WizardPhase1CompleteEvent
	| WizardClosedEvent;
