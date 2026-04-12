<script lang="ts">
	import { Sidebar } from '@dryui/ui';
	import {
		Blocks,
		BookOpenText,
		ExternalLink,
		GitCompareArrows,
		Grid2x2Check,
		History,
		House,
		ToolCase,
		WandSparkles
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

	function keepActiveItemVisible(path: string) {
		return (node: HTMLDivElement) => {
			if (!path) return;

			const frame = requestAnimationFrame(() => {
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

	const staticLinks: { label: string; href: string; icon: typeof House }[] = [
		{ label: 'Home', href: withBase('/'), icon: House },
		{ label: 'Getting Started', href: withBase('/getting-started'), icon: BookOpenText },
		{ label: 'Tools', href: withBase('/tools'), icon: ToolCase },
		{ label: 'Changelog', href: withBase('/changelog'), icon: History },
		{ label: 'Grid Rules', href: withBase('/grid-rules'), icon: Grid2x2Check },
		{ label: 'Migration Guide', href: withBase('/migration-guide'), icon: GitCompareArrows }
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
			<div class="scroll-root" {@attach keepActiveItemVisible(currentPath)}>
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
						{#snippet icon()}<Blocks size={16} aria-hidden="true" />{/snippet}
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
		<Sidebar.Footer>
			<Sidebar.Item
				href={withBase('/theme-wizard')}
				target="_blank"
				rel="noreferrer"
				title="Open Theme Wizard in a new tab"
				onclick={onnavigate}
			>
				<WandSparkles size={16} aria-hidden="true" />
				<span class="theme-wizard-label">Theme Wizard</span>
				<ExternalLink size={14} aria-hidden="true" />
			</Sidebar.Item>
		</Sidebar.Footer>
	</Sidebar.Root>
</div>

<style>
	.docs-sidebar {
		height: 100%;
		--theme-wizard-shine-duration: 9s;
		--theme-wizard-label-color: var(--dry-color-text-strong);
		--theme-wizard-label-highlight: color-mix(
			in srgb,
			var(--dry-color-fill-brand) 72%,
			var(--dry-color-on-brand) 28%
		);
	}

	.scroll-root {
		display: contents;
	}

	.theme-wizard-label {
		display: inline-grid;
	}

	@supports ((-webkit-background-clip: text) or (background-clip: text)) {
		.theme-wizard-label {
			color: transparent;
			background-image: linear-gradient(
				100deg,
				var(--theme-wizard-label-color) 0%,
				var(--theme-wizard-label-color) 44%,
				var(--theme-wizard-label-highlight) 50%,
				var(--theme-wizard-label-color) 56%,
				var(--theme-wizard-label-color) 100%
			);
			background-size: 240% 100%;
			background-position: 130% 50%;
			background-clip: text;
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			will-change: background-position, filter;
			animation: theme-wizard-label-shine var(--theme-wizard-shine-duration) linear infinite;
		}
	}

	@keyframes theme-wizard-label-shine {
		0% {
			background-position: 130% 50%;
			filter: brightness(1) saturate(1);
		}

		8% {
			background-position: -130% 50%;
			filter: brightness(1.28) saturate(1.2);
		}

		12%,
		100% {
			background-position: -130% 50%;
			filter: brightness(1) saturate(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.theme-wizard-label {
			animation: none;
			background-position: 0 50%;
		}
	}
</style>
