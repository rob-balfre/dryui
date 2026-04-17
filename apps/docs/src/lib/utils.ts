import { base } from '$app/paths';

export function withBase(path: string): string {
	return `${base}${path}`;
}

export function withQueryParam(
	path: string,
	key: string,
	value: string | null | undefined
): string {
	const url = new URL(path, 'https://dryui.dev');

	if (value == null) {
		url.searchParams.delete(key);
	} else {
		url.searchParams.set(key, value);
	}

	return `${url.pathname}${url.search}${url.hash}`;
}
