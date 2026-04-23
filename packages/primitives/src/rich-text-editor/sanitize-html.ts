const allowedElements = new Set([
	'a',
	'b',
	'blockquote',
	'br',
	'code',
	'div',
	'em',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'i',
	'li',
	'ol',
	'p',
	'pre',
	's',
	'span',
	'strike',
	'strong',
	'sub',
	'sup',
	'u',
	'ul'
]);

const blockedElements = new Set([
	'base',
	'embed',
	'iframe',
	'link',
	'math',
	'meta',
	'object',
	'script',
	'style',
	'svg',
	'template'
]);

const allowedUrlProtocols = new Set(['http:', 'https:', 'mailto:', 'tel:']);

export function sanitizeRichTextUrl(url: string): string | null {
	const trimmed = url.trim();
	if (!trimmed) return null;

	if (/^(#|\/(?!\/)|\.\/|\.\.\/)/.test(trimmed)) {
		return trimmed;
	}

	try {
		const parsed = new URL(trimmed, 'https://dryui.local');
		if (allowedUrlProtocols.has(parsed.protocol)) {
			return trimmed;
		}
	} catch {
		return null;
	}

	return null;
}

function sanitizeElement(element: Element) {
	const tag = element.localName.toLowerCase();

	if (blockedElements.has(tag)) {
		element.remove();
		return;
	}

	for (const child of Array.from(element.childNodes)) {
		sanitizeNode(child);
	}

	if (!allowedElements.has(tag)) {
		element.replaceWith(...Array.from(element.childNodes));
		return;
	}

	for (const attr of Array.from(element.attributes)) {
		const name = attr.name.toLowerCase();

		if (tag === 'a' && name === 'href') {
			const safeUrl = sanitizeRichTextUrl(attr.value);
			if (safeUrl) {
				element.setAttribute('href', safeUrl);
			} else {
				element.removeAttribute(attr.name);
			}
			continue;
		}

		element.removeAttribute(attr.name);
	}

	if (tag === 'a') {
		if (element.hasAttribute('href')) {
			element.setAttribute('target', '_blank');
			element.setAttribute('rel', 'noopener noreferrer');
		} else {
			element.removeAttribute('target');
			element.removeAttribute('rel');
		}
	}
}

function sanitizeNode(node: Node) {
	if (node.nodeType === node.ELEMENT_NODE) {
		sanitizeElement(node as Element);
		return;
	}

	if (node.nodeType === node.TEXT_NODE) return;

	const parent = node.parentNode as Node | null;
	parent?.removeChild(node);
}

export function sanitizeRichTextHtml(html: string): string {
	if (!html) return '';
	if (typeof document === 'undefined') return html;

	const template = document.createElement('template');
	template.innerHTML = html;

	for (const child of Array.from(template.content.childNodes)) {
		sanitizeNode(child);
	}

	return template.innerHTML;
}

export function setSanitizedRichTextHtml(element: HTMLElement, html: string): string {
	const sanitized = sanitizeRichTextHtml(html);
	if (element.innerHTML !== sanitized) {
		element.innerHTML = sanitized;
	}
	return sanitized;
}

export function sanitizeRichTextElement(element: HTMLElement): string {
	return setSanitizedRichTextHtml(element, element.innerHTML);
}
