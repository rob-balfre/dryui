import { sveltekit } from '@sveltejs/kit/vite';
import { dryuiLayoutCss } from '@dryui/lint';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [dryuiLayoutCss(), sveltekit()],
	ssr: {
		// Belt-and-braces: dryuiLayoutCss() also injects this. Kept here so it's
		// visible in user vite configs and survives if the plugin is removed.
		// lucide-svelte 1.0.x ships extension-less internal imports that Node's
		// strict ESM resolver rejects unless vite bundles the package for SSR.
		noExternal: ['lucide-svelte']
	}
});
