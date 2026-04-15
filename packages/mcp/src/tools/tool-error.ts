import { toonError } from '../toon.js';

export class StructuredToolError extends Error {
	readonly code: string;
	readonly suggestions: readonly string[];

	constructor(code: string, message: string, suggestions: readonly string[] = []) {
		super(message);
		this.name = 'StructuredToolError';
		this.code = code;
		this.suggestions = suggestions;
	}
}

export function toolErrorResponse(error: unknown) {
	if (error instanceof StructuredToolError) {
		return {
			content: [
				{
					type: 'text' as const,
					text: toonError(error.code, error.message, [...error.suggestions])
				}
			],
			isError: true as const
		};
	}

	const message = error instanceof Error ? error.message : String(error);
	return {
		content: [{ type: 'text' as const, text: toonError('internal-error', message) }],
		isError: true as const
	};
}
