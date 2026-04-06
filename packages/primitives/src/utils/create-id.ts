let counter = 0;
export function createId(prefix = 'dryui'): string {
	return `${prefix}-${++counter}`;
}
