import type { ScenarioDefinition } from '../../../scripts/e2e/scenario-harness.ts';

export const shoppingScenario: ScenarioDefinition = {
	name: 'shopping',
	prompt: [
		'Build a minimalist premium-fashion e-commerce landing page. This project is a freshly scaffolded SvelteKit + DryUI app — replace src/routes/+page.svelte with a single polished page.',
		'',
		'Character: boutique / premium / editorial e-comm. Think COS / Everlane / Aesop. Clean, lots of whitespace, disciplined typographic hierarchy, product-first, monochrome with one accent. A shopping cart affordance in the nav. NOT a dense admin and NOT an aspirational hero-heavy travel page.',
		'',
		'Use the DryUI component surface generously. Pick from:',
		'  NavigationMenu, Breadcrumb, Heading, Text, Button, Input, Badge, Chip, ChipGroup,',
		'  AspectRatio, Image, Card, Carousel, StarRating, Rating, FormatNumber, Separator,',
		'  Tabs, SegmentedControl, Icon, HoverCard, Skeleton.',
		'Import lucide-svelte icons: `ShoppingBag`, `Search`, `Heart`, `User` for the nav and a leading icon on each Button.',
		'Everything must be static markup that renders at page-load. Do NOT use Drawer, Dialog, Popover, Tooltip, Tour, or any other component that requires an open/close trigger — the cart affordance is just an icon + Badge count, not a working panel. SSR must render the page with no hydration dependence on stateful overlays.',
		'Real imagery is unavailable — use AspectRatio="4/5" tiles with CSS gradient backgrounds (solid warm earth tones / muted monochromes are the right vibe) as stand-ins. Do NOT hotlink external image URLs.',
		'',
		'Required structure:',
		'  1. A top NavigationMenu with brand wordmark "Atelier", section links "Men", "Women", "New", "Journal", and on the right a Search icon-button, Wishlist (Heart) icon, and a ShoppingBag icon-button with a Badge showing "2" (cart count).',
		'  2. A small ChipGroup of category chips under the nav: "All", "Knitwear", "Bags", "Shoes", "Accessories". "All" selected by default.',
		'  3. A compact Heading (level={1}) with the exact text "Shop the New Collection" and a one-sentence lede.',
		'  4. A 3-column responsive product grid (each tile uses AspectRatio="4/5" for the image region). The three products must include the exact names "Merino Wool Sweater", "Canvas Tote", "Leather Loafer". Each tile: image-area gradient backdrop, small category Text, bold product Heading, price rendered via FormatNumber or a plain "$189" string, a tiny StarRating or Rating. Below each tile (or inside footer) a minimal outline Button labelled "Add to Cart" with the ShoppingBag icon.',
		'  5. A Separator, then a short testimonial / editorial row with 2-3 quotes (just static Text for now).',
		'',
		'Do not modify any other file. Do not run the dev server or build. You MUST use at least 8 distinct DryUI components beyond the 5 you used previously. The previous output was flat and generic — this one must feel like a real premium boutique storefront.',
		'',
		"If a specific component is not exported from @dryui/ui in this version, pick a sensible substitute from the inventory above — don't fail the task over it."
	].join('\n'),
	codexTimeoutMs: 10 * 60 * 1_000,
	assertions: [
		{ kind: 'file-exists', path: 'src/routes/+page.svelte' },
		{ kind: 'file-contains', path: 'src/routes/+page.svelte', needle: 'Shop the New Collection' },
		{ kind: 'file-contains', path: 'src/routes/+page.svelte', needle: '@dryui/ui' },
		{ kind: 'html-contains', needle: 'Shop the New Collection' },
		{ kind: 'html-contains', needle: 'Atelier' },
		{ kind: 'html-contains', needle: 'Merino Wool' },
		{ kind: 'html-contains', needle: 'Canvas Tote' },
		{ kind: 'html-contains', needle: 'Leather Loafer' },
		{ kind: 'html-contains', needle: 'Add to Cart' }
	]
};
