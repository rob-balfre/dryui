import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import PhoneInput from '../../packages/primitives/src/phone-input/phone-input.svelte';
import { render } from './_harness';

function renderPhoneInput(props?: {
	name?: string;
	defaultCountry?: string;
	onchange?: (value: string) => void;
}) {
	const { target } = render(PhoneInput, props);

	const select = target.querySelector<HTMLSelectElement>('[data-part="country-select"]');
	const input = target.querySelector<HTMLInputElement>('input[type="tel"]');
	if (!select || !input) {
		throw new Error('Expected phone input controls');
	}

	return { target, select, input };
}

describe('PhoneInput', () => {
	it('updates the selected country and only submits the hidden E.164 field', () => {
		let lastValue = '';
		const { target, select, input } = renderPhoneInput({
			name: 'phone',
			defaultCountry: 'US',
			onchange(value) {
				lastValue = value;
			}
		});

		select.value = 'AU';
		select.dispatchEvent(new Event('change', { bubbles: true }));
		flushSync();

		input.value = '412345678';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();

		const namedInputs = target.querySelectorAll<HTMLInputElement>('[name="phone"]');
		const hiddenInput = target.querySelector<HTMLInputElement>(
			'input[type="hidden"][name="phone"]'
		);
		const dialCode = target.querySelector('[data-part="dial-code"]');

		expect(namedInputs).toHaveLength(1);
		expect(hiddenInput?.value).toBe('+61412345678');
		expect(lastValue).toBe('+61412345678');
		expect(dialCode?.textContent).toBe('+61');
	});
});
