import type { HTMLAttributes } from 'svelte/elements';

/**
 * Wrapper-element HTMLAttributes restricted to the keys that should NOT
 * land on the wrapper. `oninput`/`onchange`/`onfocus`/`onblur`/`onkeydown`/
 * `onkeyup` and `autofocus`/`aria-invalid` are forwarded to the inner
 * native `<input>`/`<textarea>` instead, where their typed signatures
 * match the input element type and prevent variance errors.
 */
export type FormControlWrapperAttrs<T extends HTMLElement = HTMLSpanElement> = Omit<
	HTMLAttributes<T>,
	| 'oninput'
	| 'onchange'
	| 'onfocus'
	| 'onblur'
	| 'onkeydown'
	| 'onkeyup'
	| 'autofocus'
	| 'aria-invalid'
>;
