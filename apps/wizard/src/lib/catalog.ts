import type {
	WizardComponentDefinition,
	WizardLayoutDefinition,
	WizardLayoutId,
	WizardRegionId,
	WizardSelections
} from './types';

function createRegionRecord(): Record<WizardRegionId, string[]> {
	return {
		header: [],
		footer: [],
		main: [],
		sidebar: []
	};
}

export function createDefaultSelections(layoutId: WizardLayoutId): WizardSelections {
	return {
		layout: layoutId,
		regions: createRegionRecord()
	};
}

export function buildSelectionsSnapshot(
	selections: Record<WizardRegionId, string[]>,
	layoutId: WizardLayoutId
): WizardSelections {
	return {
		layout: layoutId,
		regions: {
			header: [...(selections.header ?? [])],
			footer: [...(selections.footer ?? [])],
			main: [...(selections.main ?? [])],
			sidebar: [...(selections.sidebar ?? [])]
		}
	};
}

export function groupComponentsByCategory(components: WizardComponentDefinition[]): Array<{
	category: string;
	components: WizardComponentDefinition[];
}> {
	const groups = new Map<string, WizardComponentDefinition[]>();

	for (const component of components) {
		const items = groups.get(component.category) ?? [];
		items.push(component);
		groups.set(component.category, items);
	}

	return [...groups.entries()]
		.sort(([left], [right]) => left.localeCompare(right))
		.map(([category, items]) => ({
			category,
			components: items.sort((left, right) => left.name.localeCompare(right.name))
		}));
}

export function normalizeLayouts(payload: unknown): WizardLayoutDefinition[] {
	if (!Array.isArray(payload)) {
		return [];
	}

	return payload.filter((entry): entry is WizardLayoutDefinition => {
		return (
			typeof entry === 'object' &&
			entry !== null &&
			'id' in entry &&
			'name' in entry &&
			'regions' in entry
		);
	});
}

export function normalizeComponents(payload: unknown): WizardComponentDefinition[] {
	if (!Array.isArray(payload)) {
		return [];
	}

	return payload.filter((entry): entry is WizardComponentDefinition => {
		return (
			typeof entry === 'object' &&
			entry !== null &&
			'name' in entry &&
			'category' in entry &&
			'regions' in entry
		);
	});
}
