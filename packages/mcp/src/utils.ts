// Shared utility functions for DryUI MCP tools

export function buildLineOffsets(text: string): number[] {
	const offsets: number[] = [0];
	for (let i = 0; i < text.length; i++) {
		if (text[i] === '\n') offsets.push(i + 1);
	}
	return offsets;
}

export function lineAtOffset(lineOffsets: number[], offset: number): number {
	let lo = 0;
	let hi = lineOffsets.length - 1;
	while (lo < hi) {
		const mid = (lo + hi + 1) >> 1;
		const midVal = lineOffsets[mid];
		if (midVal !== undefined && midVal <= offset) lo = mid;
		else hi = mid - 1;
	}
	return lo + 1; // 1-based
}

export function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
