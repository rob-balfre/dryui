import { fileURLToPath } from 'node:url';

export function mockupPath(name: 'dashboard' | 'shopping' | 'travel'): string {
	return fileURLToPath(new URL(`../mockups/${name}.png`, import.meta.url));
}
