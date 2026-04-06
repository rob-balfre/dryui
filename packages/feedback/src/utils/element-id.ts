const MAX_TEXT_LENGTH = 40;
const MAX_PATH_DEPTH = 4;
const MAX_NEARBY_ELEMENTS = 4;
const SKIP_TAGS = new Set(['html', 'body', '#document']);
const DEFAULT_STYLE_VALUES = new Set([
	'',
	'none',
	'normal',
	'auto',
	'0px',
	'rgba(0, 0, 0, 0)',
	'transparent',
	'static',
	'visible'
]);
const TEXT_ELEMENTS = new Set([
	'a',
	'b',
	'blockquote',
	'caption',
	'cite',
	'code',
	'dd',
	'dt',
	'em',
	'figcaption',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'i',
	'label',
	'li',
	'p',
	'pre',
	'q',
	'span',
	'strong',
	'td',
	'th',
	'time'
]);
const FORM_INPUT_ELEMENTS = new Set(['input', 'select', 'textarea']);
const MEDIA_ELEMENTS = new Set(['canvas', 'img', 'svg', 'video']);
const CONTAINER_ELEMENTS = new Set([
	'article',
	'aside',
	'div',
	'fieldset',
	'footer',
	'form',
	'header',
	'main',
	'nav',
	'ol',
	'section',
	'ul'
]);
const FORENSIC_PROPERTIES = [
	'color',
	'backgroundColor',
	'borderColor',
	'fontSize',
	'fontWeight',
	'fontFamily',
	'lineHeight',
	'letterSpacing',
	'textAlign',
	'width',
	'height',
	'padding',
	'margin',
	'border',
	'borderRadius',
	'display',
	'position',
	'top',
	'right',
	'bottom',
	'left',
	'zIndex',
	'flexDirection',
	'justifyContent',
	'alignItems',
	'gap',
	'opacity',
	'visibility',
	'overflow',
	'boxShadow',
	'transform'
];

function truncate(text: string, max: number): string {
	const trimmed = text.trim().replace(/\s+/g, ' ');
	if (trimmed.length <= max) return trimmed;
	return trimmed.slice(0, max - 3) + '...';
}

function getParentElement(el: Element): Element | null {
	if (el.parentElement) return el.parentElement;

	const root = el.getRootNode();
	if (root instanceof ShadowRoot) {
		return root.host;
	}

	return null;
}

function getTagLabel(el: Element): string {
	const tag = el.tagName.toLowerCase();
	if (tag === 'img') return 'image';
	if (el instanceof SVGElement || tag === 'svg') return 'icon';
	return tag;
}

function getTextIdentifier(el: Element): string | undefined {
	const ariaLabel = el.getAttribute('aria-label');
	if (ariaLabel) return truncate(ariaLabel, MAX_TEXT_LENGTH);

	if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
		if (el.placeholder) return truncate(el.placeholder, MAX_TEXT_LENGTH);
	}

	if (el instanceof HTMLImageElement && el.alt) {
		return truncate(el.alt, MAX_TEXT_LENGTH);
	}

	const text = el.textContent?.trim();
	if (text && text.length > 0 && text.length < 200) {
		return truncate(text, MAX_TEXT_LENGTH);
	}

	return undefined;
}

function cleanClassName(value: string): string {
	return value.replace(/[_][a-zA-Z0-9]{5,}.*$/, '');
}

function getMeaningfulClass(el: Element): string | undefined {
	return Array.from(el.classList)
		.map((className) => cleanClassName(className))
		.find((className) => className.length > 2 && !/^[a-z]{1,2}$/.test(className));
}

function getComputedStyleValue(el: Element, cssPropertyName: string): string {
	if (typeof window === 'undefined' || !(el instanceof HTMLElement)) return '';
	return window.getComputedStyle(el).getPropertyValue(cssPropertyName).trim();
}

function getDetailedStyleProperties(tag: string, el: Element): string[] {
	if (TEXT_ELEMENTS.has(tag)) {
		return ['color', 'fontSize', 'fontWeight', 'fontFamily', 'lineHeight'];
	}

	if (tag === 'button' || (tag === 'a' && el.getAttribute('role') === 'button')) {
		return ['backgroundColor', 'color', 'padding', 'borderRadius', 'fontSize'];
	}

	if (FORM_INPUT_ELEMENTS.has(tag)) {
		return ['backgroundColor', 'color', 'padding', 'borderRadius', 'fontSize'];
	}

	if (MEDIA_ELEMENTS.has(tag)) {
		return ['width', 'height', 'objectFit', 'borderRadius'];
	}

	if (CONTAINER_ELEMENTS.has(tag)) {
		return ['display', 'padding', 'margin', 'gap', 'backgroundColor'];
	}

	return ['color', 'fontSize', 'margin', 'padding', 'backgroundColor'];
}

function toCssPropertyName(property: string): string {
	return property.replace(/([A-Z])/g, '-$1').toLowerCase();
}

function getNodeIndex(el: Element): number {
	const parent = getParentElement(el);
	if (!parent) return 1;

	const siblings = Array.from(parent.children).filter((child) => child.tagName === el.tagName);
	const index = siblings.indexOf(el);
	return index >= 0 ? index + 1 : 1;
}

export function identifyElement(el: Element): { name: string; path: string } {
	const tag = getTagLabel(el);
	const path = getElementPath(el);

	const textId = getTextIdentifier(el);
	if (textId) {
		return { name: `${tag} "${textId}"`, path };
	}

	if (el.id) {
		return { name: `${tag} #${el.id}`, path };
	}

	const firstClass = el.classList[0];
	if (firstClass) {
		return { name: `${tag} [${cleanClassName(firstClass)}]`, path };
	}

	return { name: tag, path };
}

export function getElementPath(el: Element, maxDepth: number = MAX_PATH_DEPTH): string {
	const parts: string[] = [];
	let current: Element | null = el;

	while (current && parts.length < maxDepth) {
		const tag = current.tagName.toLowerCase();
		if (SKIP_TAGS.has(tag)) break;
		parts.unshift(tag);
		current = getParentElement(current);
	}

	return parts.join(' > ');
}

export function getFullElementPath(el: Element): string {
	const parts: string[] = [];
	let current: Element | null = el;

	while (current) {
		const tag = current.tagName.toLowerCase();
		if (tag === 'html') {
			parts.unshift(tag);
			break;
		}

		let identifier = tag;
		if (current.id) {
			identifier = `${tag}#${current.id}`;
		} else {
			const className = getMeaningfulClass(current);
			if (className) {
				identifier = `${tag}.${className}`;
			} else {
				identifier = `${tag}:nth-of-type(${getNodeIndex(current)})`;
			}
		}

		if (!current.parentElement && current.getRootNode() instanceof ShadowRoot) {
			identifier = `shadow(${identifier})`;
		}

		parts.unshift(identifier);
		current = getParentElement(current);
	}

	return parts.join(' > ');
}

export function getNearbyText(el: Element): string {
	const texts: string[] = [];
	const parent = getParentElement(el);
	if (!parent) return '';

	for (const sibling of parent.children) {
		if (sibling === el) continue;
		const text = sibling.textContent?.trim();
		if (text && text.length > 0 && text.length < 100) {
			texts.push(truncate(text, 50));
		}
	}

	return texts.join(', ');
}

export function getNearbyElements(el: Element): string {
	const parent = getParentElement(el);
	if (!parent) return '';

	const siblings = Array.from(parent.children).filter((child) => child !== el);
	if (siblings.length === 0) return '';

	const labels = siblings.slice(0, MAX_NEARBY_ELEMENTS).map((sibling) => {
		const tag = sibling.tagName.toLowerCase();
		const className = getMeaningfulClass(sibling);
		const text = tag === 'button' || tag === 'a' ? sibling.textContent?.trim().slice(0, 15) : '';

		if (text) {
			return `${tag}${className ? `.${className}` : ''} "${text}"`;
		}

		return `${tag}${className ? `.${className}` : ''}`;
	});

	const parentTag = parent.tagName.toLowerCase();
	const parentClass = getMeaningfulClass(parent);
	const total = parent.children.length;
	const suffix = ` (${total} total in ${parentClass ? `.${parentClass}` : parentTag})`;

	return labels.join(', ') + suffix;
}

export function getElementClasses(el: Element): string {
	return Array.from(el.classList)
		.map((className) => cleanClassName(className))
		.filter((className, index, array) => className.length > 0 && array.indexOf(className) === index)
		.join(' ');
}

export function getDetailedComputedStyles(el: Element): Record<string, string> {
	if (typeof window === 'undefined' || !(el instanceof HTMLElement)) return {};

	const tag = el.tagName.toLowerCase();
	const result: Record<string, string> = {};
	for (const property of getDetailedStyleProperties(tag, el)) {
		const value = getComputedStyleValue(el, toCssPropertyName(property));
		if (value && !DEFAULT_STYLE_VALUES.has(value)) {
			result[property] = value;
		}
	}

	return result;
}

export function getForensicComputedStyles(el: Element): string {
	if (typeof window === 'undefined' || !(el instanceof HTMLElement)) return '';

	const parts: string[] = [];
	for (const property of FORENSIC_PROPERTIES) {
		const cssPropertyName = toCssPropertyName(property);
		const value = getComputedStyleValue(el, cssPropertyName);
		if (value && !DEFAULT_STYLE_VALUES.has(value)) {
			parts.push(`${cssPropertyName}: ${value}`);
		}
	}

	return parts.join('; ');
}

export function getAccessibilityInfo(el: Element): string {
	const parts: string[] = [];
	const role = el.getAttribute('role');
	const ariaLabel = el.getAttribute('aria-label');
	const ariaDescription = el.getAttribute('aria-describedby');
	const ariaExpanded = el.getAttribute('aria-expanded');
	const ariaPressed = el.getAttribute('aria-pressed');
	const ariaChecked = el.getAttribute('aria-checked');
	const tabIndex = el.getAttribute('tabindex');

	if (role) parts.push(`role="${role}"`);
	if (ariaLabel) parts.push(`aria-label="${ariaLabel}"`);
	if (ariaDescription) parts.push(`aria-describedby="${ariaDescription}"`);
	if (ariaExpanded) parts.push(`aria-expanded=${ariaExpanded}`);
	if (ariaPressed) parts.push(`aria-pressed=${ariaPressed}`);
	if (ariaChecked) parts.push(`aria-checked=${ariaChecked}`);
	if (tabIndex) parts.push(`tabindex=${tabIndex}`);

	if (el instanceof HTMLImageElement && el.alt) {
		parts.push(`alt="${truncate(el.alt, MAX_TEXT_LENGTH)}"`);
	}

	if (
		el.matches(
			'a, button, input, select, summary, textarea, [role="button"], [role="link"], [tabindex]'
		)
	) {
		parts.push('focusable');
	}

	return parts.join(', ');
}
