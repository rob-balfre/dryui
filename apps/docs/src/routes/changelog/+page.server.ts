import type { PageServerLoad } from './$types';
import content from '../../../../../CHANGELOG.md?raw';

export const load: PageServerLoad = () => ({
	content
});
