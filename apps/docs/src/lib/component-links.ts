import { base } from '$app/paths';
import { allComponentNames, toSlug } from './nav';

const slugByName = new Map<string, string>();
for (const name of allComponentNames()) {
	slugByName.set(name, toSlug(name));
}

/** Strips `.Root`, `.Header` etc. to get the base component name. */
function baseComponentName(text: string): string {
	const dot = text.indexOf('.');
	return dot > 0 ? text.slice(0, dot) : text;
}

/**
 * Link resolver for CodeBlock: turns DryUI component tokens
 * into links to their docs pages.
 */
export function componentLinkResolver(text: string, type: string): string | undefined {
	if (type !== 'component') return undefined;
	const name = baseComponentName(text);
	const slug = slugByName.get(name);
	return slug ? `${base}/components/${slug}` : undefined;
}
