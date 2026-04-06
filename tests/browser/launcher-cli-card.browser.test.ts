import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import CliCard from '../../apps/launcher/src/lib/components/CliCard.svelte';
import { launcherState } from '../../apps/launcher/src/lib/launcher-state.svelte.ts';

const mountedComponents: ReturnType<typeof mount>[] = [];

afterEach(() => {
	for (const component of mountedComponents.splice(0)) {
		unmount(component);
	}

	document.body.replaceChildren();
	launcherState.clearSession();
});

function renderCliCard(props: Record<string, unknown>) {
	const target = document.createElement('div');
	document.body.append(target);

	const component = mount(CliCard, {
		target,
		props
	});

	mountedComponents.push(component);
	flushSync();

	const button = target.querySelector('button');

	if (!(button instanceof HTMLButtonElement)) {
		throw new Error('Expected CLI card button');
	}

	return button;
}

describe('CliCard', () => {
	it('calls the selection callback when the CLI is available', () => {
		const onSelect = vi.fn();
		launcherState.setValidationResult('codex', {
			status: 'found',
			version: '0.117.0',
			path: '/tmp/codex'
		});

		const button = renderCliCard({
			definition: {
				id: 'codex',
				name: 'Codex',
				vendor: 'OpenAI',
				installUrl: 'https://example.com/codex'
			},
			onSelect
		});

		button.click();
		flushSync();

		expect(onSelect).toHaveBeenCalledTimes(1);
	});

	it('ignores selection when the CLI is unavailable', () => {
		const onSelect = vi.fn();
		launcherState.setValidationResult('codex', {
			status: 'not-found',
			error: 'missing'
		});

		const button = renderCliCard({
			definition: {
				id: 'codex',
				name: 'Codex',
				vendor: 'OpenAI',
				installUrl: 'https://example.com/codex'
			},
			onSelect
		});

		button.click();
		flushSync();

		expect(onSelect).not.toHaveBeenCalled();
	});
});
