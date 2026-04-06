import { browser } from '$app/environment';
import {
	buildSelectionsSnapshot,
	createDefaultSelections,
	groupComponentsByCategory,
	normalizeComponents,
	normalizeLayouts
} from './catalog';
import type {
	WizardClientMessage,
	WizardComponentDefinition,
	WizardConnectionStatus,
	WizardLayoutDefinition,
	WizardLayoutId,
	WizardQuestion,
	WizardRegionId,
	WizardSelections,
	WizardServerMessage
} from './types';

interface WizardTransport {
	send(message: WizardClientMessage): void;
}

export interface WizardController {
	readonly layouts: WizardLayoutDefinition[];
	readonly components: WizardComponentDefinition[];
	readonly selectedLayoutId: WizardLayoutId | null;
	readonly selections: Record<WizardRegionId, string[]>;
	readonly regionSearches: Record<WizardRegionId, string>;
	readonly connectionStatus: WizardConnectionStatus;
	readonly sessionId: string | null;
	readonly question: WizardQuestion | null;
	readonly activeLayout: WizardLayoutDefinition | null;
	readonly canPreview: boolean;
	loadCatalog(): Promise<void>;
	attachTransport(transport: WizardTransport | null): void;
	handleServerMessage(message: WizardServerMessage): void;
	setConnectionStatus(status: WizardConnectionStatus): void;
	selectLayout(layoutId: WizardLayoutId): void;
	toggleComponent(regionId: WizardRegionId, componentName: string): void;
	setRegionSelections(regionId: WizardRegionId, names: string[]): void;
	setRegionSearch(regionId: WizardRegionId, value: string): void;
	confirmPhaseOne(): void;
	setQuestionAnswer(questionId: string, value: string | boolean): void;
	selectionsSnapshot(): WizardSelections;
	getRegionGroups(regionId: WizardRegionId): Array<{
		category: string;
		components: WizardComponentDefinition[];
	}>;
	isComponentSelected(regionId: WizardRegionId, componentName: string): boolean;
}

function createEmptySelections(): Record<WizardRegionId, string[]> {
	return {
		header: [],
		footer: [],
		main: [],
		sidebar: []
	};
}

function createEmptySearches(): Record<WizardRegionId, string> {
	return {
		header: '',
		footer: '',
		main: '',
		sidebar: ''
	};
}

export function createWizardController(): WizardController {
	let layouts = $state<WizardLayoutDefinition[]>([]);
	let components = $state<WizardComponentDefinition[]>([]);
	let selectedLayoutId = $state<WizardLayoutId | null>(null);
	let selections = $state<Record<WizardRegionId, string[]>>(createEmptySelections());
	let regionSearches = $state<Record<WizardRegionId, string>>(createEmptySearches());
	let connectionStatus = $state<WizardConnectionStatus>('local');
	let sessionId = $state<string | null>(null);
	let question = $state<WizardQuestion | null>(null);
	let transport: WizardTransport | null = null;

	function send(message: WizardClientMessage): void {
		transport?.send(message);
	}

	function currentLayout(): WizardLayoutDefinition | null {
		if (!selectedLayoutId) {
			return null;
		}

		return layouts.find((layout) => layout.id === selectedLayoutId) ?? null;
	}

	function resetSelections(layoutId: WizardLayoutId): void {
		const snapshot = createDefaultSelections(layoutId);
		selectedLayoutId = layoutId;
		selections = {
			header: [...snapshot.regions.header],
			footer: [...snapshot.regions.footer],
			main: [...snapshot.regions.main],
			sidebar: [...snapshot.regions.sidebar]
		};
		regionSearches = createEmptySearches();
	}

	return {
		get layouts() {
			return layouts;
		},
		get components() {
			return components;
		},
		get selectedLayoutId() {
			return selectedLayoutId;
		},
		get selections() {
			return selections;
		},
		get regionSearches() {
			return regionSearches;
		},
		get connectionStatus() {
			return connectionStatus;
		},
		get sessionId() {
			return sessionId;
		},
		get question() {
			return question;
		},
		get activeLayout() {
			return currentLayout();
		},
		get canPreview() {
			return currentLayout() !== null && components.length > 0;
		},

		async loadCatalog(): Promise<void> {
			if (!browser) {
				return;
			}

			const [layoutResponse, componentResponse] = await Promise.all([
				fetch('/api/layouts'),
				fetch('/api/components')
			]);

			layouts = normalizeLayouts(await layoutResponse.json());
			components = normalizeComponents(await componentResponse.json());

			const selectedLayoutExists =
				selectedLayoutId !== null && layouts.some((layout) => layout.id === selectedLayoutId);

			if (!selectedLayoutExists && layouts[0]) {
				resetSelections(layouts[0].id);
			}
		},

		attachTransport(nextTransport: WizardTransport | null): void {
			transport = nextTransport;
		},

		handleServerMessage(message: WizardServerMessage): void {
			if (message.type === 'connected') {
				sessionId = message.sessionId;
				return;
			}

			const nextQuestion: WizardQuestion = {
				id: message.id,
				prompt: message.prompt,
				questionType: message.questionType
			};

			if (message.options) {
				nextQuestion.options = [...message.options];
			}

			question = nextQuestion;
		},

		setConnectionStatus(status: WizardConnectionStatus): void {
			connectionStatus = status;
		},

		selectLayout(layoutId: WizardLayoutId): void {
			resetSelections(layoutId);
		},

		toggleComponent(regionId: WizardRegionId, componentName: string): void {
			const current = selections[regionId] ?? [];
			selections = {
				...selections,
				[regionId]: current.includes(componentName)
					? current.filter((item) => item !== componentName)
					: [...current, componentName].sort((left, right) => left.localeCompare(right))
			};
		},

		setRegionSelections(regionId: WizardRegionId, names: string[]): void {
			selections = {
				...selections,
				[regionId]: [...names].sort((left, right) => left.localeCompare(right))
			};
		},

		setRegionSearch(regionId: WizardRegionId, value: string): void {
			regionSearches = {
				...regionSearches,
				[regionId]: value
			};
		},

		confirmPhaseOne(): void {
			if (!selectedLayoutId) {
				return;
			}

			send({
				type: 'confirm',
				selections: buildSelectionsSnapshot(selections, selectedLayoutId)
			});
			question = null;
		},

		setQuestionAnswer(questionId: string, value: string | boolean): void {
			if (!questionId) {
				return;
			}

			send({ type: 'answer', questionId, value });
			question = null;
		},

		selectionsSnapshot(): WizardSelections {
			return buildSelectionsSnapshot(selections, currentLayout()?.id ?? 'sidebar-main');
		},

		getRegionGroups(regionId: WizardRegionId) {
			const query = (regionSearches[regionId] ?? '').trim().toLowerCase();
			const regionComponents = components.filter((component) =>
				component.regions.includes(regionId)
			);
			const filtered = query
				? regionComponents.filter((component) => {
						const haystack = [component.name, component.description, ...component.tags]
							.join(' ')
							.toLowerCase();
						return haystack.includes(query);
					})
				: regionComponents;

			return groupComponentsByCategory(filtered);
		},

		isComponentSelected(regionId: WizardRegionId, componentName: string): boolean {
			return (selections[regionId] ?? []).includes(componentName);
		}
	};
}
