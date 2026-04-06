export type WizardLayoutId = 'sidebar-main' | 'header-content-footer' | 'header-sidebar-main';
export type WizardRegionId = 'sidebar' | 'header' | 'main' | 'footer';
export type WizardQuestionType = 'multi-choice' | 'text' | 'confirm';
export type WizardConnectionStatus = 'local' | 'connecting' | 'connected' | 'error';

export interface WizardQuestionOption {
	label: string;
	value: string;
	description?: string;
}

export interface WizardQuestion {
	id: string;
	prompt: string;
	questionType: WizardQuestionType;
	options?: WizardQuestionOption[];
}

export interface WizardServerConnectedMessage {
	type: 'connected';
	sessionId: string;
}

export interface WizardServerQuestionMessage extends WizardQuestion {
	type: 'question';
}

export type WizardServerMessage = WizardServerConnectedMessage | WizardServerQuestionMessage;

export interface WizardSelections {
	layout: WizardLayoutId;
	regions: Record<WizardRegionId, string[]>;
}

export interface WizardLayoutRegion {
	id: WizardRegionId;
	label: string;
	description: string;
	defaults: string[];
}

export interface WizardLayoutDefinition {
	id: WizardLayoutId;
	name: string;
	description: string;
	regions: WizardLayoutRegion[];
}

export interface WizardComponentDefinition {
	name: string;
	description: string;
	category: string;
	tags: string[];
	regions: WizardRegionId[];
	previewable: boolean;
	compound: boolean;
	importPath: string;
}

export interface WizardClientAnswerLayoutMessage {
	type: 'answer';
	step: 'layout';
	value: WizardLayoutId;
}

export interface WizardClientAnswerComponentsMessage {
	type: 'answer';
	step: 'components';
	value: Record<WizardRegionId, string[]>;
}

export interface WizardClientConfirmMessage {
	type: 'confirm';
	selections: WizardSelections;
}

export interface WizardClientQuestionAnswerMessage {
	type: 'answer';
	questionId: string;
	value: string | boolean;
}

export type WizardClientMessage =
	| WizardClientAnswerLayoutMessage
	| WizardClientAnswerComponentsMessage
	| WizardClientConfirmMessage
	| WizardClientQuestionAnswerMessage;
