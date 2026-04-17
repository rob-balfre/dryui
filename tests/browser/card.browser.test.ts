import { describe, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import CardHarness from './fixtures/card-harness.svelte';
import { render } from './_harness';

function getCard(testId: string): HTMLElement {
	const wrapper = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
	if (!wrapper) throw new Error(`Expected wrapper ${testId}`);
	const card = wrapper.querySelector<HTMLElement>('[data-card]');
	if (!card) throw new Error(`Expected [data-card] in ${testId}`);
	return card;
}

describe('Card', () => {
	it('renders as a <div> by default with data-card attribute and no variant/size attrs', () => {
		render(CardHarness);

		const card = getCard('default');
		expect(card.tagName).toBe('DIV');
		expect(card.hasAttribute('data-card')).toBe(true);
		expect(card.getAttribute('data-variant')).toBeNull();
		expect(card.getAttribute('data-size')).toBeNull();
	});

	it('renders Header/Content/Footer subcomponents in source order', () => {
		render(CardHarness);

		const header = document.querySelector<HTMLElement>('[data-testid="default-header"]');
		const content = document.querySelector<HTMLElement>('[data-testid="default-content"]');
		const footer = document.querySelector<HTMLElement>('[data-testid="default-footer"]');

		expect(header?.hasAttribute('data-card-header')).toBe(true);
		expect(content?.hasAttribute('data-card-content')).toBe(true);
		expect(footer?.hasAttribute('data-card-footer')).toBe(true);

		expect(
			header &&
				content &&
				header.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
		expect(
			content &&
				footer &&
				content.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	});

	it('propagates variant and size props as data attributes', () => {
		render(CardHarness);

		const card = getCard('variant');
		expect(card.getAttribute('data-variant')).toBe('elevated');
		expect(card.getAttribute('data-size')).toBe('sm');
	});

	it('marks selected cards with data-selected', () => {
		render(CardHarness);

		const card = getCard('selected');
		expect(card.hasAttribute('data-selected')).toBe(true);
	});

	it('reflects orientation on data-orientation', () => {
		render(CardHarness);

		const card = getCard('horizontal');
		expect(card.getAttribute('data-orientation')).toBe('horizontal');
	});

	it('renders as a <button type="button"> when as="button" and triggers onclick', () => {
		const onButtonClick = vi.fn();
		render(CardHarness, { onButtonClick });

		const card = getCard('button-card-wrap');
		expect(card).toBeInstanceOf(HTMLButtonElement);
		expect((card as HTMLButtonElement).type).toBe('button');

		(card as HTMLButtonElement).click();
		flushSync();

		expect(onButtonClick).toHaveBeenCalledTimes(1);
	});

	it('disables the button form with aria-disabled and data-disabled', () => {
		const onButtonClick = vi.fn();
		render(CardHarness, { onButtonClick });

		const card = getCard('disabled-button-wrap') as HTMLButtonElement;
		expect(card.disabled).toBe(true);
		expect(card.getAttribute('aria-disabled')).toBe('true');
		expect(card.hasAttribute('data-disabled')).toBe(true);

		card.click();
		flushSync();

		expect(onButtonClick).not.toHaveBeenCalled();
	});

	it('respects the noPadding prop on Card.Content', () => {
		render(CardHarness);

		const content = document.querySelector<HTMLElement>('[data-testid="no-padding-content"]');
		expect(content?.hasAttribute('data-no-padding')).toBe(true);
	});
});
