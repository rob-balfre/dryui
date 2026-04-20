import type { Handle } from '@sveltejs/kit';
import { themeFlashScript } from '@dryui/ui';

const THEME_FLASH_PLACEHOLDER = '%dryui.themeFlash%';
const flashScript = themeFlashScript('dryui-docs-theme');

/**
 * Injects the DryUI theme-flash script into app.html before the first paint.
 * Using the helper keeps the logic in one place (`@dryui/ui`) and ensures
 * storage-key changes stay in sync between the controller and the script.
 */
export const handle: Handle = async ({ event, resolve }) => {
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace(THEME_FLASH_PLACEHOLDER, flashScript)
	});
};
