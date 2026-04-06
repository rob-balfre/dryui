import { categories, toSlug } from '$lib/nav';
export interface SearchItem {
	label: string;
	href: string;
	description: string;
	keywords: string[];
}

export interface SearchSection {
	heading: string;
	items: SearchItem[];
}

const docsPages: SearchItem[] = [
	{
		label: 'Home',
		href: '/',
		description: 'Landing page for DryUI.',
		keywords: ['index', 'overview', 'landing']
	},
	{
		label: 'Getting Started',
		href: '/getting-started',
		description: 'Install DryUI, import the theme, and bootstrap your app.',
		keywords: ['install', 'setup', 'theme', 'quickstart']
	},
	{
		label: 'Components',
		href: '/components',
		description: 'Browse every published DryUI component.',
		keywords: ['component index', 'catalog']
	},
	{
		label: 'Theme Wizard',
		href: '/theme-wizard',
		description: 'Build and export DryUI semantic token themes.',
		keywords: ['tokens', 'palette', 'theme editor']
	},
	{
		label: 'Theme Lab',
		href: '/theme-lab',
		description: 'Compare sidebar active-state recipes with simple token and contrast checks.',
		keywords: ['theme', 'contrast', 'sidebar', 'active state', 'tokens']
	},
	{
		label: 'Theme Lab / Colour',
		href: '/theme-lab/colour',
		description: 'Audit the Practical UI colour rules against generated DryUI tokens and previews.',
		keywords: ['theme', 'colour', 'color', 'practical ui', 'figma', 'tokens', 'contrast']
	},
	{
		label: 'Theme Lab / Elevation',
		href: '/theme-lab/elevation',
		description: 'Verify the Practical UI elevation stack against DryUI surface and shadow tokens.',
		keywords: ['theme', 'elevation', 'shadows', 'surfaces', 'practical ui', 'figma', 'depth']
	},
	{
		label: 'Theme Lab / Typography',
		href: '/theme-lab/typography',
		description:
			'Preview the Practical UI typography scale, mode switching, and typeface override workflow in DryUI.',
		keywords: ['theme', 'typography', 'practical ui', 'type scale', 'desktop', 'mobile', 'font']
	},
	{
		label: 'Theme Lab / Grids',
		href: '/theme-lab/grids',
		description:
			'Audit the Practical UI desktop, tablet, and mobile grid rules against DryUI spacing and layout conventions.',
		keywords: ['theme', 'grids', 'grid', 'layout', 'columns', 'gutter', 'margin', 'practical ui']
	},
	{
		label: 'CLI',
		href: '/cli',
		description: 'Command-line reference for DryUI tooling.',
		keywords: ['commands', 'tooling', 'terminal']
	},
	{
		label: 'MCP Server',
		href: '/mcp',
		description: 'MCP server docs for reviewer, diagnose, and compose tools.',
		keywords: ['model context protocol', 'review', 'diagnose', 'compose']
	},
	{
		label: 'Changelog',
		href: '/changelog',
		description: 'Release notes and recent changes.',
		keywords: ['releases', 'updates', 'versions']
	}
];

function getComponentItems(): SearchItem[] {
	return categories.flatMap((category) =>
		category.items.map((item) => ({
			label: item.name,
			href: `/components/${toSlug(item.name)}`,
			description: `${category.label} component`,
			keywords: [category.label.toLowerCase(), 'component', item.kind]
		}))
	);
}

export function getSearchSections(): SearchSection[] {
	return [
		{ heading: 'Docs', items: docsPages },
		{ heading: 'Components', items: getComponentItems() }
	];
}
