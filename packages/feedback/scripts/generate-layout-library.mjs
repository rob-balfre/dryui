import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..', '..');
const specPath = resolve(repoRoot, 'packages', 'mcp', 'src', 'spec.json');
const outputPath = resolve(
	repoRoot,
	'packages',
	'feedback',
	'src',
	'layout-mode',
	'generated-library.ts'
);

function component(type, section, sourceId, options = {}) {
	return { kind: 'component', type, section, sourceId, ...options };
}

function block(type, section, sourceId, options = {}) {
	return { kind: 'block', type, section, sourceId, ...options };
}

const SEEDS = [
	component('navigation', 'Frames', 'Navbar', {
		label: 'Navbar',
		keywords: ['navigation', 'nav', 'site header'],
		guidance:
			'Use Navbar for the primary site navigation shell, brand, links, and top-level actions.'
	}),
	component('header', 'Frames', 'PageHeader', {
		label: 'PageHeader',
		keywords: ['header', 'page header', 'section lead']
	}),
	block('hero', 'Frames', 'hero-sections', {
		label: 'Hero Sections',
		keywords: ['hero', 'marketing hero', 'landing'],
		guidance:
			'Start from a hero-sections block variant for the main headline, proof, and CTA stack.'
	}),
	block('section', 'Frames', 'content-sections', {
		label: 'Content Sections',
		keywords: ['section', 'content block', 'body section'],
		guidance:
			'Start from a content-sections block when the layout needs a reusable marketing or editorial section.'
	}),
	component('sidebar', 'Frames', 'Sidebar', {
		label: 'Sidebar',
		keywords: ['sidebar', 'aside', 'rail']
	}),
	block('footer', 'Frames', 'footers', {
		label: 'Footers',
		keywords: ['footer', 'site footer']
	}),
	component('modal', 'Frames', 'Dialog', {
		label: 'Dialog',
		keywords: ['modal', 'dialog', 'overlay'],
		structure: '`<Dialog.Root>` + `<Dialog.Trigger>` + `<Dialog.Content>`'
	}),
	block('banner', 'Frames', 'banners', {
		label: 'Banners',
		keywords: ['banner', 'announcement', 'promo']
	}),
	component('drawer', 'Frames', 'Drawer', {
		label: 'Drawer',
		keywords: ['drawer', 'sheet', 'slide over'],
		structure: '`<Drawer.Root>` + `<Drawer.Trigger>` + `<Drawer.Content>`'
	}),
	component('popover', 'Frames', 'Popover', {
		label: 'Popover',
		keywords: ['popover', 'floating panel'],
		structure: '`<Popover.Root>` + `<Popover.Trigger>` + `<Popover.Content>`'
	}),
	component('divider', 'Frames', 'Separator', {
		label: 'Separator',
		keywords: ['divider', 'separator', 'rule']
	}),

	component('card', 'Content', 'Card', {
		label: 'Card',
		keywords: ['card', 'surface', 'panel'],
		structure: '`<Card.Root>` + `<Card.Header>` + `<Card.Content>`',
		guidance:
			'Compose Card surfaces with Card.Root, Card.Header, and Card.Content instead of a generic container box.'
	}),
	component('text', 'Content', 'Text', {
		label: 'Text',
		keywords: ['text', 'copy', 'body']
	}),
	component('image', 'Content', 'Image', {
		label: 'Image',
		keywords: ['image', 'media', 'photo']
	}),
	component('video', 'Content', 'VideoEmbed', {
		label: 'VideoEmbed',
		keywords: ['video', 'embed', 'media']
	}),
	component('table', 'Content', 'Table', {
		label: 'Table',
		keywords: ['table', 'data table']
	}),
	component('grid', 'Content', 'Grid', {
		label: 'Grid',
		keywords: ['grid', 'columns', 'cards']
	}),
	component('list', 'Content', 'List', {
		label: 'List',
		keywords: ['list', 'items']
	}),
	component('chart', 'Content', 'Chart', {
		label: 'Chart',
		keywords: ['chart', 'analytics', 'graph']
	}),
	component('codeBlock', 'Content', 'CodeBlock', {
		label: 'CodeBlock',
		keywords: ['code', 'snippet']
	}),
	component('map', 'Content', 'Map', {
		label: 'Map',
		keywords: ['map', 'location']
	}),
	component('timeline', 'Content', 'Timeline', {
		label: 'Timeline',
		keywords: ['timeline', 'history']
	}),
	component('accordion', 'Content', 'Accordion', {
		label: 'Accordion',
		keywords: ['accordion', 'expand', 'faq']
	}),
	component('carousel', 'Content', 'Carousel', {
		label: 'Carousel',
		keywords: ['carousel', 'slider']
	}),
	component('logo', 'Content', 'LogoCloud', {
		label: 'LogoCloud',
		keywords: ['logo', 'logo cloud', 'logos']
	}),
	block('faq', 'Content', 'faqs', {
		label: 'FAQs',
		keywords: ['faq', 'questions', 'support']
	}),
	component('gallery', 'Content', 'PromoMosaic', {
		label: 'PromoMosaic',
		keywords: ['gallery', 'mosaic', 'promo grid']
	}),

	component('button', 'Forms', 'Button', {
		label: 'Button',
		keywords: ['button', 'cta', 'action']
	}),
	component('input', 'Forms', 'Input', {
		label: 'Input',
		keywords: ['input', 'field', 'text field']
	}),
	component('search', 'Forms', 'InputGroup', {
		label: 'InputGroup',
		keywords: ['search', 'search input', 'search field'],
		structure: '`<InputGroup.Root>` + `<InputGroup.Input>` + `<InputGroup.Action>`'
	}),
	component('form', 'Forms', 'Fieldset', {
		label: 'Fieldset',
		keywords: ['form', 'fieldset', 'form group'],
		guidance:
			'Compose forms with Fieldset, Field.Root, Input, Checkbox, and Button instead of a generic form rectangle.'
	}),
	component('tabs', 'Forms', 'Tabs', {
		label: 'Tabs',
		keywords: ['tabs', 'switcher'],
		structure: '`<Tabs.Root>` + `<Tabs.List>` + `<Tabs.Trigger>` + `<Tabs.Content>`'
	}),
	component('dropdown', 'Forms', 'Listbox', {
		label: 'Listbox',
		keywords: ['dropdown', 'select', 'options']
	}),
	component('toggle', 'Forms', 'Toggle', {
		label: 'Toggle',
		keywords: ['toggle', 'switch']
	}),
	component('stepper', 'Forms', 'Stepper', {
		label: 'Stepper',
		keywords: ['stepper', 'steps', 'progress steps']
	}),
	component('rating', 'Forms', 'Rating', {
		label: 'Rating',
		keywords: ['rating', 'stars']
	}),
	component('fileUpload', 'Forms', 'FileUpload', {
		label: 'FileUpload',
		keywords: ['file upload', 'drop zone', 'upload']
	}),
	component('checkbox', 'Forms', 'Checkbox', {
		label: 'Checkbox',
		keywords: ['checkbox', 'boolean']
	}),
	component('radio', 'Forms', 'RadioGroup', {
		label: 'RadioGroup',
		keywords: ['radio', 'options', 'choice'],
		structure: '`<RadioGroup.Root>` + `<RadioGroup.Item>`'
	}),
	component('slider', 'Forms', 'Slider', {
		label: 'Slider',
		keywords: ['slider', 'range']
	}),
	component('calendar', 'Forms', 'DateTimeInput', {
		label: 'DateTimeInput',
		keywords: ['calendar', 'date grid', 'calendar picker']
	}),
	component('datePicker', 'Forms', 'DateTimeInput', {
		label: 'DateTimeInput',
		keywords: ['date', 'time', 'calendar']
	}),

	component('avatar', 'Feedback', 'Avatar', {
		label: 'Avatar',
		keywords: ['avatar', 'profile photo']
	}),
	component('badge', 'Feedback', 'Badge', {
		label: 'Badge',
		keywords: ['badge', 'status', 'label']
	}),
	component('tag', 'Feedback', 'Chip', {
		label: 'Chip',
		keywords: ['tag', 'chip']
	}),
	component('breadcrumb', 'Feedback', 'Breadcrumb', {
		label: 'Breadcrumb',
		keywords: ['breadcrumb', 'path']
	}),
	component('pagination', 'Feedback', 'Pagination', {
		label: 'Pagination',
		keywords: ['pagination', 'pages']
	}),
	component('progress', 'Feedback', 'Progress', {
		label: 'Progress',
		keywords: ['progress', 'meter']
	}),
	component('alert', 'Feedback', 'Alert', {
		label: 'Alert',
		keywords: ['alert', 'warning', 'message'],
		structure: '`<Alert.Root>` + `<Alert.Title>` + `<Alert.Description>`'
	}),
	component('toast', 'Feedback', 'Toast', {
		label: 'Toast',
		keywords: ['toast', 'notification']
	}),
	component('notification', 'Feedback', 'Toast', {
		label: 'Toast',
		keywords: ['notification', 'toast'],
		guidance: 'Use Toast for transient notifications and Alert for persistent inline status.'
	}),
	component('tooltip', 'Feedback', 'Tooltip', {
		label: 'Tooltip',
		keywords: ['tooltip', 'hint'],
		structure: '`<Tooltip.Root>` + `<Tooltip.Trigger>` + `<Tooltip.Content>`'
	}),
	component('stat', 'Feedback', 'StatCard', {
		label: 'StatCard',
		keywords: ['stat', 'metric', 'kpi']
	}),
	component('skeleton', 'Feedback', 'Skeleton', {
		label: 'Skeleton',
		keywords: ['skeleton', 'loading']
	}),
	component('chip', 'Feedback', 'Chip', {
		label: 'Chip',
		keywords: ['chip', 'tag']
	}),
	component('icon', 'Feedback', 'Icon', {
		label: 'Icon',
		keywords: ['icon', 'glyph']
	}),
	component('spinner', 'Feedback', 'Spinner', {
		label: 'Spinner',
		keywords: ['spinner', 'loading']
	}),

	block('pricing', 'Blocks', 'pricing-sections', {
		label: 'Pricing Sections',
		keywords: ['pricing', 'plans']
	}),
	block('testimonial', 'Blocks', 'testimonials', {
		label: 'Testimonials',
		keywords: ['testimonial', 'quote', 'customer proof']
	}),
	block('cta', 'Blocks', 'cta-sections', {
		label: 'CTA Sections',
		keywords: ['cta', 'call to action']
	}),
	component('productCard', 'Blocks', 'Card', {
		label: 'Product Card',
		keywords: ['product card', 'commerce', 'tile'],
		structure: '`<Card.Root>` + media + pricing + CTA',
		guidance:
			'Compose a product tile with Card plus media, pricing, and CTA content instead of a generic product rectangle.'
	}),
	component('profile', 'Blocks', 'User', {
		label: 'User',
		keywords: ['profile', 'user', 'identity']
	}),
	component('feature', 'Blocks', 'FeatureSplitSection', {
		label: 'FeatureSplitSection',
		keywords: ['feature', 'split section']
	}),
	block('team', 'Blocks', 'team-sections', {
		label: 'Team Sections',
		keywords: ['team', 'people']
	}),
	component('login', 'Blocks', 'Fieldset', {
		label: 'Auth Form',
		keywords: ['login', 'auth', 'signin'],
		structure: '`<Fieldset>` + `<Input>` + `<Checkbox>` + `<Button>`',
		guidance: 'Compose login and auth layouts from Fieldset, Input, Checkbox, and Button.'
	}),
	block('contact', 'Blocks', 'contact-sections', {
		label: 'Contact Sections',
		keywords: ['contact', 'support', 'contact form']
	})
];

function capitalize(value) {
	return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function unique(values) {
	return [...new Set(values.filter(Boolean))];
}

function readSource(spec, seed) {
	if (seed.kind === 'component') {
		const source = spec.components?.[seed.sourceId];
		if (!source) {
			throw new Error(`Missing component metadata for ${seed.sourceId}`);
		}
		return source;
	}

	const source = spec.catalog?.entries?.[seed.sourceId];
	if (!source) {
		throw new Error(`Missing catalog metadata for ${seed.sourceId}`);
	}
	return source;
}

function autoStructure(seed, source) {
	if (seed.structure) return seed.structure;
	if (seed.kind === 'block') return null;
	if (!source.compound || !source.parts) {
		return `\`<${seed.sourceId} />\``;
	}

	const parts = Object.keys(source.parts).slice(0, 4);
	if (parts.length === 0) {
		return `\`<${seed.sourceId}.Root>\``;
	}

	return parts.map((part) => `\`<${seed.sourceId}.${part}>\``).join(' + ');
}

function autoGuidance(seed, source) {
	if (seed.guidance) return seed.guidance;
	if (seed.kind === 'component') {
		return source.description;
	}

	const variantNames = source.variants
		?.slice(0, 2)
		.map((variant) => variant.name)
		.join(', ');
	if (variantNames) {
		return `Start from ${source.routePath} and pick the closest block variant (${variantNames}).`;
	}

	return `Start from ${source.routePath} and adapt the closest DryUI catalog block.`;
}

function buildEntry(spec, seed) {
	const source = readSource(spec, seed);
	const description = seed.description ?? source.description;
	return {
		type: seed.type,
		label: seed.label ?? (seed.kind === 'component' ? seed.sourceId : source.name),
		description,
		sourceKind: seed.kind,
		sourceId: seed.sourceId,
		sourceName: seed.kind === 'component' ? seed.sourceId : source.name,
		sourceLabel: seed.kind === 'component' ? 'Component' : 'Block',
		sourceImport: seed.kind === 'component' ? (source.import ?? '@dryui/ui') : null,
		routePath: seed.kind === 'block' ? (source.routePath ?? null) : null,
		tags: unique([...(source.tags ?? []), ...(seed.keywords ?? [])]),
		structure: autoStructure(seed, source),
		guidance: autoGuidance(seed, source)
	};
}

function groupEntries(entries) {
	const groups = new Map();

	for (const entry of entries) {
		const bucket = groups.get(entry.section) ?? [];
		bucket.push(entry);
		groups.set(entry.section, bucket);
	}

	return [...groups.entries()].map(([section, items]) => ({
		section,
		items: items.sort((left, right) => left.label.localeCompare(right.label))
	}));
}

function serialize(data) {
	return `// Generated by packages/feedback/scripts/generate-layout-library.mjs\n// Do not edit by hand.\n\nexport const GENERATED_LAYOUT_LIBRARY = ${JSON.stringify(data, null, 2)} as const;\n`;
}

const spec = JSON.parse(await readFile(specPath, 'utf-8'));
const entries = SEEDS.map((seed) => ({
	section: seed.section,
	...buildEntry(spec, seed)
}));
const grouped = groupEntries(entries);

await writeFile(outputPath, serialize(grouped), 'utf-8');
console.log(`Generated ${outputPath.replace(`${repoRoot}/`, '')} from ${capitalize('spec.json')}`);
