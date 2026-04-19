import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { dryuiLint } from '@dryui/lint';

export default {
	preprocess: [dryuiLint({ strict: true, exclude: ['/dist/'] }), vitePreprocess()]
};
