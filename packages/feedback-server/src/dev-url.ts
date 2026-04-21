const FEEDBACK_QUERY_PARAM = 'dryui-feedback';

export function normalizeDevUrl(value: string | null | undefined): string | null {
	if (!value?.trim()) return null;

	try {
		const url = new URL(value.trim());
		url.searchParams.set(FEEDBACK_QUERY_PARAM, '1');
		return url.toString();
	} catch {
		return value.trim();
	}
}
