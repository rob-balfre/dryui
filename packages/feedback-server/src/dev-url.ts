const FEEDBACK_QUERY_PARAM = 'dryui-feedback';
const FEEDBACK_SERVER_QUERY_PARAM = 'dryui-feedback-server';

export function normalizeDevUrl(
	value: string | null | undefined,
	feedbackBaseUrl?: string | null
): string | null {
	if (!value?.trim()) return null;

	try {
		const url = new URL(value.trim());
		url.searchParams.set(FEEDBACK_QUERY_PARAM, '1');
		if (feedbackBaseUrl?.trim()) {
			url.searchParams.set(FEEDBACK_SERVER_QUERY_PARAM, feedbackBaseUrl.trim());
		}
		return url.toString();
	} catch {
		return value.trim();
	}
}
