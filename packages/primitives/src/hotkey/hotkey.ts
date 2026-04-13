export interface HotkeyConfig {
	keys: string;
	handler: () => void;
	enabled?: boolean;
	preventDefault?: boolean;
}

interface ParsedHotkey {
	mod: boolean;
	ctrl: boolean;
	alt: boolean;
	shift: boolean;
	meta: boolean;
	key: string;
}

function isShiftAgnosticKey(key: string): boolean {
	return key.length === 1 && /[^a-z0-9]/i.test(key);
}

export function parseKeys(keys: string): ParsedHotkey {
	const parts = keys
		.toLowerCase()
		.split('+')
		.map((p) => p.trim());
	const parsed: ParsedHotkey = {
		mod: false,
		ctrl: false,
		alt: false,
		shift: false,
		meta: false,
		key: ''
	};

	for (const part of parts) {
		switch (part) {
			case 'mod':
			case '$mod':
				parsed.mod = true;
				break;
			case 'ctrl':
			case 'control':
				parsed.ctrl = true;
				break;
			case 'alt':
				parsed.alt = true;
				break;
			case 'shift':
				parsed.shift = true;
				break;
			case 'meta':
			case 'cmd':
			case 'command':
				parsed.meta = true;
				break;
			default:
				parsed.key = part;
		}
	}

	return parsed;
}

export function matchesEvent(event: KeyboardEvent, parsed: ParsedHotkey): boolean {
	if (parsed.mod) {
		if (!event.ctrlKey && !event.metaKey) return false;
	} else if (event.ctrlKey !== parsed.ctrl) {
		return false;
	}

	if (event.altKey !== parsed.alt) return false;
	if (!parsed.mod && event.metaKey !== parsed.meta) return false;

	if (event.key.toLowerCase() !== parsed.key) return false;
	if (!parsed.shift && isShiftAgnosticKey(parsed.key)) return true;

	return event.shiftKey === parsed.shift;
}

export function createHotkey(shortcuts: HotkeyConfig[]): { destroy: () => void } {
	const parsed = shortcuts.map((s) => ({
		...s,
		parsed: parseKeys(s.keys)
	}));

	function handleKeydown(event: KeyboardEvent) {
		for (const shortcut of parsed) {
			if (shortcut.enabled === false) continue;
			if (matchesEvent(event, shortcut.parsed)) {
				if (shortcut.preventDefault !== false) {
					event.preventDefault();
				}
				shortcut.handler();
				break;
			}
		}
	}

	document.addEventListener('keydown', handleKeydown);

	return {
		destroy() {
			document.removeEventListener('keydown', handleKeydown);
		}
	};
}
