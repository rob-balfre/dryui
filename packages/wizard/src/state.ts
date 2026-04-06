import type {
	WizardBrowserMessage,
	WizardPhase1Selections,
	WizardQuestion,
	WizardQuestionInput,
	WizardRegionId,
	WizardRuntimeEvent,
	WizardServerConnectedMessage,
	WizardServerMessage
} from './types.js';
import { normalizeComponentSelection } from './components.js';
import { encodeWizardMessage, normalizeQuestionInput } from './protocol.js';

export interface WizardBrowserConnection {
	readonly id: string;
	send(message: WizardServerMessage): void;
	close(code?: number, reason?: string): void;
}

export interface WizardRuntimeOptions {
	readonly onEvent?: (event: WizardRuntimeEvent) => void;
}

export interface WizardQueuedQuestion {
	readonly question: WizardQuestion;
	readonly answer: Promise<string | boolean>;
}

interface PendingQuestion {
	readonly question: WizardQuestion;
	readonly resolve: (value: string | boolean) => void;
	readonly reject: (reason: Error) => void;
}

function createDefaultSelections(): WizardPhase1Selections {
	return {
		layout: 'sidebar-main',
		regions: {
			header: [],
			sidebar: [],
			main: [],
			footer: []
		}
	};
}

function cloneSelections(selections: WizardPhase1Selections): WizardPhase1Selections {
	return {
		layout: selections.layout,
		regions: {
			header: [...selections.regions.header],
			sidebar: [...selections.regions.sidebar],
			main: [...selections.regions.main],
			footer: [...selections.regions.footer]
		}
	};
}

function areSelectionsEqual(left: WizardPhase1Selections, right: WizardPhase1Selections): boolean {
	return (
		left.layout === right.layout &&
		left.regions.header.join('\u0000') === right.regions.header.join('\u0000') &&
		left.regions.sidebar.join('\u0000') === right.regions.sidebar.join('\u0000') &&
		left.regions.main.join('\u0000') === right.regions.main.join('\u0000') &&
		left.regions.footer.join('\u0000') === right.regions.footer.join('\u0000')
	);
}

export class WizardRuntime {
	#browser: WizardBrowserConnection | null = null;
	#closed = false;
	#questionCounter = 0;
	#activeQuestion: PendingQuestion | null = null;
	#queuedQuestions: PendingQuestion[] = [];
	#selections: WizardPhase1Selections = createDefaultSelections();
	#phase: 'layout' | 'components' | 'preview' | 'follow-up' | 'done' = 'layout';

	constructor(private readonly options: WizardRuntimeOptions = {}) {}

	get phase(): 'layout' | 'components' | 'preview' | 'follow-up' | 'done' {
		return this.#phase;
	}

	get selections(): WizardPhase1Selections {
		return cloneSelections(this.#selections);
	}

	connectBrowser(connection: WizardBrowserConnection): void {
		if (this.#browser && this.#browser.id !== connection.id) {
			this.#browser.close(1000, 'Replaced by a newer browser connection');
		}

		this.#browser = connection;
		connection.send({
			type: 'connected',
			sessionId: connection.id
		} satisfies WizardServerConnectedMessage);
		this.flushQueuedQuestions();

		if (this.#phase === 'follow-up' && this.#activeQuestion) {
			this.sendQuestion(this.#activeQuestion.question);
		}
	}

	disconnectBrowser(connectionId: string): void {
		if (this.#browser?.id !== connectionId) {
			return;
		}

		this.#browser = null;
	}

	handleBrowserMessage(message: WizardBrowserMessage): void {
		if (this.#closed) {
			return;
		}

		switch (message.type) {
			case 'answer':
				if ('step' in message) {
					if (message.step === 'layout') {
						this.setLayout(message.value);
						return;
					}

					this.setComponentSelections(message.value);
					return;
				}

				this.answerQuestion(message.questionId, message.value);
				return;
			case 'confirm':
				this.confirmSelections(message.selections);
				return;
		}
	}

	setLayout(layout: WizardPhase1Selections['layout']): void {
		this.#phase = 'components';
		this.#selections = {
			...cloneSelections(this.#selections),
			layout
		};
		this.emit({ type: 'answer', step: 'layout', value: layout });
	}

	setComponentSelections(selections: Partial<Record<WizardRegionId, readonly string[]>>): void {
		const nextSelections: WizardPhase1Selections = {
			layout: this.#selections.layout,
			regions: {
				header: normalizeComponentSelection(selections.header ?? this.#selections.regions.header),
				sidebar: normalizeComponentSelection(
					selections.sidebar ?? this.#selections.regions.sidebar
				),
				main: normalizeComponentSelection(selections.main ?? this.#selections.regions.main),
				footer: normalizeComponentSelection(selections.footer ?? this.#selections.regions.footer)
			}
		};

		this.#phase = 'preview';
		this.#selections = nextSelections;
		this.emit({ type: 'answer', step: 'components', value: nextSelections.regions });
	}

	confirmSelections(selections: WizardPhase1Selections): void {
		if (!areSelectionsEqual(this.#selections, selections)) {
			this.#selections = cloneSelections(selections);
		}

		this.#phase = 'follow-up';
		this.emit({ type: 'phase1_complete', selections: cloneSelections(this.#selections) });
		this.flushQueuedQuestions();
	}

	ask(input: WizardQuestionInput): WizardQueuedQuestion {
		if (this.#closed) {
			throw new Error('Wizard server is closed.');
		}

		const question = normalizeQuestionInput(input, `q${++this.#questionCounter}`);

		const answer = new Promise<string | boolean>((resolve, reject) => {
			const pending: PendingQuestion = {
				question,
				resolve,
				reject
			};

			this.#queuedQuestions.push(pending);
			this.flushQueuedQuestions();
		});

		return { question, answer };
	}

	answerQuestion(questionId: string, value: string | boolean): void {
		if (this.#activeQuestion?.question.id === questionId) {
			const pending = this.#activeQuestion;
			this.#activeQuestion = null;
			pending.resolve(value);
			this.emit({ type: 'answer', questionId, value });
			this.flushQueuedQuestions();
			return;
		}

		const queuedIndex = this.#queuedQuestions.findIndex(
			(entry) => entry.question.id === questionId
		);
		if (queuedIndex === -1) {
			return;
		}

		const [pending] = this.#queuedQuestions.splice(queuedIndex, 1);
		if (!pending) {
			return;
		}

		pending.resolve(value);
		this.emit({ type: 'answer', questionId, value });
		this.flushQueuedQuestions();
	}

	close(): void {
		if (this.#closed) {
			return;
		}

		this.#closed = true;
		this.#phase = 'done';
		this.#browser?.close(1000, 'Wizard closed');
		this.#browser = null;
		this.#activeQuestion?.reject(
			new Error('Wizard server closed before the question was answered.')
		);
		for (const pending of this.#queuedQuestions) {
			pending.reject(new Error('Wizard server closed before the question was answered.'));
		}
		this.#activeQuestion = null;
		this.#queuedQuestions = [];
		this.emit({ type: 'closed' });
	}

	isClosed(): boolean {
		return this.#closed;
	}

	private sendQuestion(question: WizardQuestion): void {
		if (!this.#browser) {
			return;
		}

		if (this.#phase !== 'follow-up') {
			return;
		}

		this.#browser.send({
			type: 'question',
			id: question.id,
			prompt: question.prompt,
			questionType: question.questionType,
			...(question.options ? { options: question.options } : {})
		});
	}

	private flushQueuedQuestions(): void {
		if (
			!this.#browser ||
			this.#phase !== 'follow-up' ||
			this.#activeQuestion ||
			this.#queuedQuestions.length === 0
		) {
			return;
		}

		const next = this.#queuedQuestions.shift();
		if (!next) {
			return;
		}

		this.#activeQuestion = next;
		this.sendQuestion(next.question);
	}

	private emit(event: WizardRuntimeEvent): void {
		this.options.onEvent?.(event);
	}
}

export function createWizardRuntime(options: WizardRuntimeOptions = {}): WizardRuntime {
	return new WizardRuntime(options);
}

export function encodeWizardServerMessage(message: WizardServerMessage): string {
	return encodeWizardMessage(message);
}
