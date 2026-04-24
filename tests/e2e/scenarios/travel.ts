import type { ScenarioDefinition } from '../../../scripts/e2e/scenario-harness.ts';

export const travelScenario: ScenarioDefinition = {
	name: 'travel',
	prompt: [
		'Build an editorial travel site home page. This project is a freshly scaffolded SvelteKit + DryUI app — replace src/routes/+page.svelte with a single polished page.',
		'',
		'Character: magazine-style, aspirational, warm. Think Airbnb Plus / Condé Nast Traveler / a luxury boutique travel site. LARGE display typography, full-bleed hero, rich background texture, generous whitespace, serif-feeling headings. This is NOT an admin layout and NOT a card-in-a-row product page.',
		'',
		'Use the DryUI component surface generously. Pick from:',
		'  Container (full-bleed hero), NavigationMenu, Heading, Text, Button, Badge,',
		'  Aurora, GradientMesh, Noise, Glow, Spotlight, Shimmer, Beam (for backdrops and',
		'  hero flair), AspectRatio, Image, Card, Carousel, Marquee, RelativeTime, Chip,',
		'  ChipGroup, Icon, Separator.',
		'Import lucide-svelte icons for destination chips, search/filter, and Button leading icons.',
		'Real imagery is unavailable — use Aurora / GradientMesh / Beam / Glow / Shimmer as decorative backdrops for destination tiles, or colored gradients via var(--dry-color-...) tokens. Do NOT hotlink external image URLs.',
		'',
		'Build rules that must pass the scaffolded DryUI lint/build pipeline:',
		'  - Do not pass class= to any Svelte component imported from @dryui/ui, including compound parts such as NavigationMenu.Root, Card.Root, Card.Content, Carousel.Root, AspectRatio, Aurora, GradientMesh, etc.',
		'  - Use class= only on native HTML elements such as div, section, header, nav, main, span, article, and wrappers around DryUI components.',
		'  - Style native wrappers with scoped <style> blocks, component props, data-* attributes, and --dry-* CSS custom properties. Do not rely on component class attributes.',
		'  - Use DryUI Heading for headings instead of raw h1/h2/h3 elements.',
		'',
		'Required structure:',
		'  1. A sticky top NavigationMenu with the brand name "Wayfarer", plus links "Stays", "Experiences", "Inspiration", "Journal". On the right: a search Button or Icon and a small language Chip (e.g. "EN").',
		'  2. A full-bleed hero region with an Aurora or GradientMesh backdrop behind a MASSIVE Heading (level={1}) containing the exact text "Plan Your Next Adventure" and a subhead <Text> of one sentence.',
		'  3. Directly below the hero: a ChipGroup of interest filters like "Mountain", "Coast", "Culture", "Wildlife", "Food".',
		'  4. Three destination tiles with AspectRatio="16/10" imagery regions (use Aurora/GradientMesh/Beam/Shimmer or CSS gradient fills as the backdrop). Each tile must include the exact city strings "Kyoto, Japan", "Santorini, Greece", "Patagonia, Chile" as Heading-level titles, one evocative sentence of copy, a small "4-day trip" style Badge, and a Button labelled "Explore".',
		'  5. A Marquee strip somewhere on the page with seasonal/trending destinations scrolling by ("Tokyo", "Lisbon", "Reykjavik", "Marrakech", "Cape Town", "Oaxaca").',
		'',
		'Do not edit any source file other than src/routes/+page.svelte. Do not run the dev server. After editing, run `bun run build` and fix any failure before finalizing. You MUST use at least 8 distinct DryUI components beyond the 5 you used previously. The previous output was flat and generic — this one must feel editorial, magazine-like, and visually ambitious.',
		'',
		"If a specific component is not exported from @dryui/ui in this version, pick a sensible substitute from the inventory above — don't fail the task over it."
	].join('\n'),
	codexTimeoutMs: 10 * 60 * 1_000,
	assertions: [
		{ kind: 'file-exists', path: 'src/routes/+page.svelte' },
		{ kind: 'file-contains', path: 'src/routes/+page.svelte', needle: 'Plan Your Next Adventure' },
		{ kind: 'file-contains', path: 'src/routes/+page.svelte', needle: '@dryui/ui' },
		{ kind: 'html-contains', needle: 'Plan Your Next Adventure' },
		{ kind: 'html-contains', needle: 'Wayfarer' },
		{ kind: 'html-contains', needle: 'Kyoto' },
		{ kind: 'html-contains', needle: 'Santorini' },
		{ kind: 'html-contains', needle: 'Patagonia' },
		{ kind: 'html-contains', needle: 'Explore' }
	]
};
