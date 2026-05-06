// Minimal ANSI styling for human-facing CLI output.
// Auto-disabled when stdout is not a TTY, when NO_COLOR is set, or when TERM=dumb.

const ESC = '\x1b[';

function detectColorSupport(): boolean {
	if (process.env['NO_COLOR']) return false;
	if (process.env['FORCE_COLOR']) return true;
	if (process.env['TERM'] === 'dumb') return false;
	return Boolean(process.stdout.isTTY);
}

let enabled = detectColorSupport();

export function setColorEnabled(value: boolean): void {
	enabled = value;
}

export function isColorEnabled(): boolean {
	return enabled;
}

function code(open: string, close: string): (text: string) => string {
	return (text: string) => (enabled ? `${ESC}${open}m${text}${ESC}${close}m` : text);
}

export const dim = code('2', '22');
export const bold = code('1', '22');
export const cyan = code('36', '39');
export const green = code('32', '39');
export const yellow = code('33', '39');
export const magenta = code('35', '39');
export const gray = code('38;5;245', '39');

// Warm brand accents (xterm-256). 208 ≈ #FF8700 (vibrant orange), 221 ≈ #FFD75F (soft gold).
export const brand = code('1;38;5;208', '0');
export const accent = code('38;5;221', '39');

export const symbol = {
	check: '✓',
	arrow: '→',
	pointer: '↗',
	bullet: '•',
	dot: '·'
} as const;

/**
 * Pad a label so that all values in a column line up. Width is the visible
 * label length (without ANSI codes).
 */
export function padLabel(label: string, width: number): string {
	if (label.length >= width) return label;
	return label + ' '.repeat(width - label.length);
}
