import { afterEach, describe, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import PromptInput from '../../packages/primitives/src/prompt-input/prompt-input.svelte';

const mountedComponents: ReturnType<typeof mount>[] = [];

afterEach(() => {
	for (const component of mountedComponents.splice(0)) {
		unmount(component);
	}

	document.body.replaceChildren();
});

function renderPromptInput(onpromptsubmit?: (value: string) => void) {
	const target = document.createElement('div');
	document.body.append(target);

	const component = mount(PromptInput, {
		target,
		props: {
			onpromptsubmit
		}
	});

	mountedComponents.push(component);
	flushSync();

	const textarea = target.querySelector<HTMLTextAreaElement>('textarea[data-part="input"]');
	const submit = target.querySelector<HTMLButtonElement>('button[data-part="submit"]');
	if (!textarea || !submit) {
		throw new Error('Expected prompt input controls');
	}

	return { textarea, submit };
}

describe('PromptInput', () => {
	it('keeps the submit action enabled and focuses the textarea when empty', () => {
		const { textarea, submit } = renderPromptInput();

		expect(submit.disabled).toBe(false);
		expect(submit.textContent).toContain('Send');

		submit.click();
		flushSync();

		expect(document.activeElement).toBe(textarea);
	});

	it('submits trimmed content', () => {
		let submitted = '';
		const { textarea, submit } = renderPromptInput((value) => {
			submitted = value;
		});

		textarea.value = '  hello dryui  ';
		textarea.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();

		submit.click();
		flushSync();

		expect(submitted).toBe('hello dryui');
	});
});
