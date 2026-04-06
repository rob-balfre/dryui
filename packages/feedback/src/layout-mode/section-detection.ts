import type { DetectedSection, Rect } from './types.js';

const SECTION_TAGS = new Set(['nav', 'header', 'main', 'section', 'article', 'footer', 'aside']);
const SECTION_ROLES: Record<string, string> = {
	banner: 'Header',
	navigation: 'Navigation',
	main: 'Main Content',
	contentinfo: 'Footer',
	complementary: 'Sidebar',
	region: 'Section'
};
const TAG_LABELS: Record<string, string> = {
	nav: 'Navigation',
	header: 'Header',
	main: 'Main Content',
	section: 'Section',
	article: 'Article',
	footer: 'Footer',
	aside: 'Sidebar'
};
const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'link', 'meta']);
const MIN_SECTION_HEIGHT = 40;
const MAX_UNWRAP_DEPTH = 6;

function isElementFixed(el: HTMLElement): boolean {
	let current: HTMLElement | null = el;
	while (current && current !== document.body && current !== document.documentElement) {
		const pos = window.getComputedStyle(current).position;
		if (pos === 'fixed' || pos === 'sticky') return true;
		current = current.parentElement;
	}
	return false;
}

function cleanClassName(el: HTMLElement): string | null {
	const className = el.className;
	if (typeof className !== 'string' || !className) return null;

	const meaningful = className
		.split(/\s+/)
		.map((value) => value.replace(/[_][a-zA-Z0-9]{5,}.*$/, ''))
		.find((value) => value.length > 2 && !/^[a-z]{1,2}$/.test(value));

	return meaningful || null;
}

function textSnippet(el: HTMLElement): string | null {
	const text = el.textContent?.trim();
	if (!text) return null;
	const clean = text.replace(/\s+/g, ' ');
	return clean.length <= 30 ? clean : `${clean.slice(0, 30)}...`;
}

function isSectionElement(el: HTMLElement): boolean {
	const tag = el.tagName.toLowerCase();
	if (SECTION_TAGS.has(tag)) return true;

	const role = el.getAttribute('role');
	return Boolean(role && SECTION_ROLES[role]);
}

function expandTopLevelCandidates(elements: HTMLElement[], depth: number = 0): HTMLElement[] {
	const expanded: HTMLElement[] = [];

	for (const el of elements) {
		if (!(el instanceof HTMLElement)) continue;

		const tag = el.tagName.toLowerCase();
		if (SKIP_TAGS.has(tag)) continue;
		if (el.closest('[data-dryui-feedback]')) continue;

		const style = window.getComputedStyle(el);
		if (style.display === 'none' || style.visibility === 'hidden') continue;

		if (style.display === 'contents') {
			expanded.push(
				...expandTopLevelCandidates(Array.from(el.children) as HTMLElement[], depth + 1)
			);
			continue;
		}

		expanded.push(el);
	}

	if (expanded.length !== 1 || depth >= MAX_UNWRAP_DEPTH) {
		return expanded;
	}

	const [only] = expanded;
	if (!only) {
		return expanded;
	}
	if (isSectionElement(only) || isElementFixed(only)) {
		return expanded;
	}

	const children = Array.from(only.children).filter(
		(child): child is HTMLElement => child instanceof HTMLElement
	);
	if (children.length === 0) {
		return expanded;
	}

	return expandTopLevelCandidates(children, depth + 1);
}

export function generateSelector(el: HTMLElement): string {
	const tag = el.tagName.toLowerCase();

	if (
		['nav', 'header', 'footer', 'main'].includes(tag) &&
		document.querySelectorAll(tag).length === 1
	) {
		return tag;
	}

	if (el.id) {
		return `#${CSS.escape(el.id)}`;
	}

	if (typeof el.className === 'string' && el.className) {
		const classes = el.className.split(/\s+/).filter(Boolean);
		const meaningful = classes.find(
			(value) => value.length > 2 && !/^[a-zA-Z0-9]{6,}$/.test(value) && !/^[a-z]{1,2}$/.test(value)
		);
		if (meaningful) {
			const selector = `${tag}.${CSS.escape(meaningful)}`;
			if (document.querySelectorAll(selector).length === 1) {
				return selector;
			}
		}
	}

	const parent = el.parentElement;
	if (parent) {
		const children = Array.from(parent.children);
		const index = children.indexOf(el) + 1;
		const parentSelector =
			parent === document.body ? 'body' : generateSelector(parent as HTMLElement);
		return `${parentSelector} > ${tag}:nth-child(${index})`;
	}

	return tag;
}

export function labelSection(el: HTMLElement): string {
	const tag = el.tagName.toLowerCase();

	const ariaLabel = el.getAttribute('aria-label');
	if (ariaLabel) return ariaLabel;

	const role = el.getAttribute('role');
	if (role && SECTION_ROLES[role]) return SECTION_ROLES[role];

	if (TAG_LABELS[tag]) return TAG_LABELS[tag];

	const heading = el.querySelector('h1, h2, h3, h4, h5, h6');
	if (heading) {
		const text = heading.textContent?.trim();
		if (text && text.length <= 50) return text;
		if (text) return `${text.slice(0, 47)}...`;
	}

	const text = el.textContent?.trim();
	return text ? (text.split(/\s+/)[0] ?? tag) : tag;
}

export function detectPageSections(): DetectedSection[] {
	const root = document.querySelector('main') || document.body;
	const candidates = Array.from(root.children) as HTMLElement[];
	const allCandidates =
		root !== document.body && candidates.length < 3
			? (Array.from(document.body.children) as HTMLElement[])
			: candidates;
	const topLevelCandidates = expandTopLevelCandidates(allCandidates);
	const sections: DetectedSection[] = [];

	topLevelCandidates.forEach((el, index) => {
		if (!(el instanceof HTMLElement)) return;
		const tag = el.tagName.toLowerCase();
		if (SKIP_TAGS.has(tag)) return;
		if (el.closest('[data-dryui-feedback]')) return;

		const style = window.getComputedStyle(el);
		if (style.display === 'none' || style.visibility === 'hidden') return;

		const rect = el.getBoundingClientRect();
		if (rect.height < MIN_SECTION_HEIGHT) return;

		const isSemantic = SECTION_TAGS.has(tag);
		const hasRole = Boolean(
			el.getAttribute('role') && SECTION_ROLES[el.getAttribute('role') ?? '']
		);
		const isSignificantDiv = tag === 'div' && rect.height >= 60;
		if (!isSemantic && !hasRole && !isSignificantDiv) return;

		const isFixed = isElementFixed(el);
		const sectionRect: Rect = {
			x: rect.x,
			y: isFixed ? rect.y : rect.y + window.scrollY,
			width: rect.width,
			height: rect.height
		};

		sections.push({
			id: `rs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
			label: labelSection(el),
			tagName: tag,
			selector: generateSelector(el),
			role: el.getAttribute('role'),
			className: cleanClassName(el),
			textSnippet: textSnippet(el),
			originalRect: sectionRect,
			currentRect: { ...sectionRect },
			originalIndex: index,
			isFixed
		});
	});

	return sections;
}

export function captureElement(el: HTMLElement): DetectedSection {
	const rect = el.getBoundingClientRect();
	const isFixed = isElementFixed(el);
	const sectionRect: Rect = {
		x: rect.x,
		y: isFixed ? rect.y : rect.y + window.scrollY,
		width: rect.width,
		height: rect.height
	};

	const parent = el.parentElement;
	const originalIndex = parent ? Array.from(parent.children).indexOf(el) : 0;

	return {
		id: `rs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
		label: labelSection(el),
		tagName: el.tagName.toLowerCase(),
		selector: generateSelector(el),
		role: el.getAttribute('role'),
		className: cleanClassName(el),
		textSnippet: textSnippet(el),
		originalRect: sectionRect,
		currentRect: { ...sectionRect },
		originalIndex,
		isFixed
	};
}

export function getSectionLabels(sections: readonly DetectedSection[]): string[] {
	return sections.map((section) => section.label);
}
