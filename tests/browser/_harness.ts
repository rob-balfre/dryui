import type { Component, ComponentProps } from 'svelte';
import { flushSync, mount, unmount } from 'svelte';
import { afterEach } from 'vitest';

// Track every mounted component so the file-level afterEach can clean them up
// without every test suite having to duplicate its own book-keeping.
const mounted: ReturnType<typeof mount>[] = [];

afterEach(() => {
	for (const component of mounted.splice(0)) {
		unmount(component);
	}

	document.body.replaceChildren();
});

interface RenderOptions {
	/** Explicit mount target. Defaults to a fresh `<div>` appended to `document.body`. */
	target?: HTMLElement;
	/** Whether to run `flushSync()` after mount. Defaults to `true`. */
	flush?: boolean;
}

type PropsArg<T extends Component<any, any>> =
	{} extends ComponentProps<T>
		? [props?: ComponentProps<T>, options?: RenderOptions]
		: [props: ComponentProps<T>, options?: RenderOptions];

export interface RenderResult<T extends Component<any, any>> {
	/** The container element the component was mounted into. */
	target: HTMLElement;
	/** The raw return value of `mount()` — the component's exports. */
	instance: ReturnType<typeof mount>;
}

/**
 * Mount a Svelte component for a browser test. The component and its host
 * element are cleaned up automatically in the shared `afterEach` below.
 *
 * ```ts
 * import { render } from './_harness';
 * const { target } = render(Button, { variant: 'solid' });
 * ```
 */
export function render<T extends Component<any, any>>(
	Component: T,
	...args: PropsArg<T>
): RenderResult<T> {
	const [props, options] = args;
	const target = options?.target ?? createBodyTarget();
	const instance = mount(Component, {
		target,
		props: (props ?? {}) as ComponentProps<T>
	});

	mounted.push(instance);

	if (options?.flush !== false) {
		flushSync();
	}

	return { target, instance };
}

/** Create a fresh container and append it to `document.body`. */
export function createBodyTarget(): HTMLDivElement {
	const target = document.createElement('div');
	document.body.append(target);
	return target;
}
