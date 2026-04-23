const THEME_CLASSES = ['theme-auto', 'theme-dark', 'theme-light'] as const;
const PREVIOUS_CLASS_ATTR = 'data-dryui-benchmark-previous-class';
const PREVIOUS_THEME_ATTR = 'data-dryui-benchmark-previous-theme';
const HAD_THEME_ATTR = 'data-dryui-benchmark-had-theme';

export function applyVisualBenchmarkTheme(root: HTMLElement = document.documentElement): void {
	if (!root.hasAttribute(PREVIOUS_CLASS_ATTR)) {
		root.setAttribute(PREVIOUS_CLASS_ATTR, root.className);
		root.setAttribute(HAD_THEME_ATTR, root.hasAttribute('data-theme') ? '1' : '0');

		const previousTheme = root.getAttribute('data-theme');
		if (previousTheme !== null) {
			root.setAttribute(PREVIOUS_THEME_ATTR, previousTheme);
		} else {
			root.removeAttribute(PREVIOUS_THEME_ATTR);
		}
	}

	root.classList.remove(...THEME_CLASSES);
	root.classList.add('theme-light');
	root.setAttribute('data-theme', 'light');
}

export function restoreVisualBenchmarkTheme(root: HTMLElement = document.documentElement): void {
	const previousClass = root.getAttribute(PREVIOUS_CLASS_ATTR);
	if (previousClass !== null) {
		root.className = previousClass;
	} else {
		root.classList.remove('theme-light');
	}

	if (root.getAttribute(HAD_THEME_ATTR) === '1') {
		root.setAttribute('data-theme', root.getAttribute(PREVIOUS_THEME_ATTR) ?? '');
	} else {
		root.removeAttribute('data-theme');
	}

	root.removeAttribute(PREVIOUS_CLASS_ATTR);
	root.removeAttribute(PREVIOUS_THEME_ATTR);
	root.removeAttribute(HAD_THEME_ATTR);
}
