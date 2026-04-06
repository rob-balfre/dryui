import { afterEach, expect, test } from 'vitest';

afterEach(() => {
	document.body.replaceChildren();
});

test('browser runner can exercise native DOM interactions', () => {
	const button = document.createElement('button');
	button.textContent = 'Launch';

	let clicks = 0;
	button.addEventListener('click', () => {
		clicks += 1;
	});

	document.body.append(button);
	button.click();

	expect(clicks).toBe(1);
	expect(document.body.contains(button)).toBe(true);
});
