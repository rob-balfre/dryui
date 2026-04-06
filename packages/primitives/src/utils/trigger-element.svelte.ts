const TRIGGER_SELECTOR = [
	'button',
	'[href]',
	'input:not([type="hidden"])',
	'select',
	'textarea',
	'[tabindex]:not([tabindex="-1"])',
	'[contenteditable="true"]',
	'summary'
].join(', ');

export function getTriggerElement(wrapper: HTMLElement | null | undefined): HTMLElement | null {
	if (!wrapper) {
		return null;
	}

	if (wrapper.matches(TRIGGER_SELECTOR)) {
		return wrapper;
	}

	return wrapper.querySelector<HTMLElement>(TRIGGER_SELECTOR);
}

export function setOptionalAttribute(
	element: HTMLElement,
	name: string,
	value: string | undefined
) {
	if (value === undefined) {
		element.removeAttribute(name);
		return;
	}

	element.setAttribute(name, value);
}
