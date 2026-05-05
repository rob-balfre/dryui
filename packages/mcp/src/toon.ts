// Minimal TOON error serializer kept for legacy CLI/tool error adapters.

function esc(value: string): string {
	if (value.includes(',') || value.includes('\n')) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}

function header(resource: string, count: number, fields: readonly string[]): string {
	return `${resource}[${count}]{${fields.join(',')}}:`;
}

export function toonError(code: string, message: string, suggestions?: readonly string[]): string {
	const lines = [`error[1]{code,message}: ${esc(code)},${esc(message)}`];
	if (suggestions?.length) {
		lines.push(header('suggestions', suggestions.length, ['value']));
		for (const suggestion of suggestions) {
			lines.push('  ' + suggestion);
		}
	}
	return lines.join('\n');
}
