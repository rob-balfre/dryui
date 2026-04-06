import type { WizardLayoutDefinition, WizardLayoutId, WizardRegionDefinition } from './types.js';

const SIDEBAR: WizardRegionDefinition = {
	id: 'sidebar',
	label: 'Sidebar',
	description: 'Supporting navigation, filters, and secondary context.'
};

const HEADER: WizardRegionDefinition = {
	id: 'header',
	label: 'Header',
	description: 'Title, summary, and top-level actions.'
};

const MAIN: WizardRegionDefinition = {
	id: 'main',
	label: 'Main',
	description: 'Primary page content and the main workflow.'
};

const FOOTER: WizardRegionDefinition = {
	id: 'footer',
	label: 'Footer',
	description: 'Supporting actions, notes, or low-priority content.'
};

export const WIZARD_LAYOUTS = [
	{
		id: 'sidebar-main',
		name: 'Sidebar + Main',
		description:
			'Dashboard or admin surfaces with a persistent side rail and a primary content pane.',
		regions: [SIDEBAR, MAIN]
	},
	{
		id: 'header-content-footer',
		name: 'Header + Content + Footer',
		description: 'Marketing, landing pages, and narrative pages with a clear content stack.',
		regions: [HEADER, MAIN, FOOTER]
	},
	{
		id: 'header-sidebar-main',
		name: 'Header + Sidebar + Main',
		description:
			'App shells and SaaS surfaces with a top bar, side navigation, and main workspace.',
		regions: [HEADER, SIDEBAR, MAIN]
	}
] as const satisfies readonly WizardLayoutDefinition[];

export function getWizardLayout(id: WizardLayoutId): WizardLayoutDefinition {
	const layout = WIZARD_LAYOUTS.find((entry) => entry.id === id);
	if (!layout) {
		throw new Error(`Unknown wizard layout: ${id}`);
	}

	return layout;
}
