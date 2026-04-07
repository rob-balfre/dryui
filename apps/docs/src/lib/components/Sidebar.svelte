<script lang="ts">
	import { Sidebar } from '@dryui/ui';
	import type { Attachment } from 'svelte/attachments';
	import {
		Home,
		Rocket,
		Palette,
		Terminal,
		Cpu,
		FileText,
		LayoutGrid,
		Grid3x3
	} from 'lucide-svelte';
	import { categories, toSlug } from '$lib/nav';
	import { withBase } from '$lib/utils';
	import NavGroup from './NavGroup.svelte';

	interface Props {
		currentPath: string;
		onnavigate?: () => void;
	}

	let { currentPath, onnavigate }: Props = $props();
	const totalComponents = categories.reduce((sum, c) => sum + c.items.length, 0);

	function isComponentsActive(): boolean {
		return currentPath.includes('/components/');
	}

	function isCategoryActive(category: (typeof categories)[number]): boolean {
		return category.items.some(
			(item) => currentPath === withBase(`/components/${toSlug(item.name)}`)
		);
	}

	function scrollActiveItem(_path: string): Attachment<HTMLDivElement> {
		return (node) => {
			let frame = requestAnimationFrame(() => {
				const active = node.querySelector('[data-active]');
				if (active instanceof HTMLElement) {
					active.scrollIntoView({ block: 'nearest', behavior: 'instant' });
				}
			});

			return () => {
				cancelAnimationFrame(frame);
			};
		};
	}

	const staticLinks: { label: string; href: string; icon: typeof Home }[] = [
		{ label: 'Home', href: withBase('/'), icon: Home },
		{ label: 'Getting Started', href: withBase('/getting-started'), icon: Rocket },
		{ label: 'Theme Wizard', href: withBase('/theme-wizard'), icon: Palette },
		{ label: 'CLI', href: withBase('/cli'), icon: Terminal },
		{ label: 'MCP Server', href: withBase('/mcp'), icon: Cpu },
		{ label: 'Changelog', href: withBase('/changelog'), icon: FileText },
		{ label: 'Grid Rules', href: withBase('/grid-rules'), icon: Grid3x3 }
	];
</script>

<div class="docs-sidebar">
	<Sidebar.Root
		aria-label="Main navigation"
		--dry-sidebar-radius="0"
		--dry-sidebar-shadow="none"
		--dry-sidebar-width="100%"
	>
		<Sidebar.Content --dry-sidebar-content-scrollbar-gutter="stable">
			<div {@attach scrollActiveItem(currentPath)} class="scroll-root">
				<Sidebar.Group>
					{#each staticLinks as link (link.href)}
						<Sidebar.Item
							href={link.href}
							active={currentPath === link.href}
							aria-current={currentPath === link.href ? 'page' : undefined}
							onclick={onnavigate}
						>
							<link.icon size={16} aria-hidden="true" />
							{link.label}
						</Sidebar.Item>
					{/each}

					<NavGroup label="Components" count={totalComponents} open={isComponentsActive()}>
						{#snippet icon()}<LayoutGrid size={16} aria-hidden="true" />{/snippet}
						{#each categories as category (category.label)}
							<NavGroup
								label={category.label}
								count={category.items.length}
								open={isCategoryActive(category)}
							>
								{#each category.items as item (item.name)}
									{@const href = withBase(`/components/${toSlug(item.name)}`)}
									<Sidebar.Item
										{href}
										active={currentPath === href}
										aria-current={currentPath === href ? 'page' : undefined}
										onclick={onnavigate}
									>
										{item.name}
									</Sidebar.Item>
								{/each}
							</NavGroup>
						{/each}
					</NavGroup>
				</Sidebar.Group>
			</div>
		</Sidebar.Content>
	</Sidebar.Root>
</div>

<style>
	.docs-sidebar {
		height: 100%;
	}

	.scroll-root {
		display: contents;
	}
</style>
