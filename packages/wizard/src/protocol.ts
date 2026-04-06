import type {
	WizardBrowserMessage,
	WizardServerMessage,
	WizardQuestion,
	WizardQuestionOption,
	WizardQuestionInput,
	WizardQuestionType
} from './types.js';

export function encodeWizardMessage(message: WizardServerMessage | WizardBrowserMessage): string {
	return JSON.stringify(message);
}

export function decodeWizardMessage(payload: string | ArrayBufferLike): unknown {
	const text =
		typeof payload === 'string' ? payload : new TextDecoder().decode(new Uint8Array(payload));
	return JSON.parse(text);
}

export function normalizeQuestionInput(input: WizardQuestionInput, id: string): WizardQuestion {
	const questionType =
		input.type ?? input.questionType ?? (input.options?.length ? 'multi-choice' : 'text');
	const options = normalizeQuestionOptions(input.options);

	return {
		id,
		prompt: input.prompt,
		questionType,
		...(options.length > 0 ? { options } : {})
	};
}

export function normalizeQuestionOptions(
	options: WizardQuestionInput['options']
): readonly WizardQuestionOption[] {
	if (!options?.length) {
		return [];
	}

	return options.map((option) => {
		if (typeof option === 'string') {
			return { label: option, value: option };
		}

		return {
			label: option.label ?? option.value,
			value: option.value,
			...(option.description ? { description: option.description } : {})
		};
	});
}

export function isWizardQuestionType(value: unknown): value is WizardQuestionType {
	return value === 'multi-choice' || value === 'text' || value === 'confirm';
}
