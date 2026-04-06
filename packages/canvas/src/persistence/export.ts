import { validateDocument } from '../ast/validate.js';
import type { LayoutDocument } from '../ast/types.js';

export const STUDIO_EXPORT_MIME = 'application/vnd.dryui.studio+json';

export function serializeDocument(document: LayoutDocument): string {
	return JSON.stringify(document, null, 2);
}

export function deserializeDocument(source: string): LayoutDocument {
	const document = JSON.parse(source) as LayoutDocument;
	const issues = validateDocument(document).filter((issue) => issue.severity === 'error');

	if (issues.length > 0) {
		throw new Error(issues.map((issue) => issue.message).join('\n'));
	}

	return document;
}

export function createDocumentExportBlob(document: LayoutDocument): Blob {
	return new Blob([serializeDocument(document)], {
		type: STUDIO_EXPORT_MIME
	});
}
