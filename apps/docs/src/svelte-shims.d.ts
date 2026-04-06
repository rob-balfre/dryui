declare module '*.svelte' {
	const Component: import('svelte').Component;
	export default Component;
}

declare const __DRYUI_VERSION__: string;
declare const __BUILD_TIMESTAMP__: string;
