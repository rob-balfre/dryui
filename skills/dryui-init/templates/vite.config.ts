import { sveltekit } from '@sveltejs/kit/vite';
import { dryuiLayoutCss } from '@dryui/lint';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [dryuiLayoutCss(), sveltekit()]
});
