<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { useThemeOverride } from '@dryui/primitives/use-theme-override';
	import { applyRecipe, decodeRecipe, getAllTokens } from '@dryui/theme-wizard';
	import { Badge, Button, Container, Drawer, Heading, Link } from '@dryui/ui';
	import { Menu } from 'lucide-svelte';
	import GlobalSearch from '$lib/components/GlobalSearch.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { BUILD_TIMESTAMP, DRYUI_VERSION } from '$lib/site-meta';
	import { isDarkTheme } from '$lib/theme.svelte.js';
	import { withBase } from '$lib/utils';
	import '../app.css';

	let { children: routeChildren } = $props();
	let mobileNavOpen = $state(false);
	let lastAppliedRecipe: string | null = null;

	function isThemeWizardPath(pathname: string): boolean {
		return pathname.startsWith('/theme-wizard') || pathname.startsWith(withBase('/theme-wizard'));
	}

	function getRelativeTime(iso: string): string {
		const diff = Date.now() - new Date(iso).getTime();
		const seconds = Math.floor(diff / 1000);
		if (seconds < 60) return `${seconds}s ago`;
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}min ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		return `${days}d ago`;
	}

	let publishedLabel = $derived.by(() => {
		const date = new Date(BUILD_TIMESTAMP).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
		const relative = getRelativeTime(BUILD_TIMESTAMP);
		return `Last published ${date} (${relative})`;
	});

	let isFullWidthRoute = $derived(
		page.url.pathname.startsWith('/view/') || page.url.pathname.startsWith(withBase('/view/'))
	);
	let themeMode = $derived(isDarkTheme() ? 'dark' : 'light');
	let lightThemeWizardTokens = $derived.by(() => getAllTokens('light'));
	let darkThemeWizardTokens = $derived.by(() => getAllTokens('dark'));
	let activeThemeWizardTokens = $derived(
		themeMode === 'dark' ? darkThemeWizardTokens : lightThemeWizardTokens
	);
	let isThemeWizardRoute = $derived(isThemeWizardPath(page.url.pathname));

	useThemeOverride(() => (isThemeWizardRoute ? activeThemeWizardTokens : {}));

	afterNavigate(() => {
		if (!isThemeWizardPath(page.url.pathname)) {
			lastAppliedRecipe = null;
			return;
		}

		const recipe = page.url.searchParams.get('t');
		if (!recipe) {
			lastAppliedRecipe = null;
			return;
		}

		if (recipe === lastAppliedRecipe) return;

		try {
			applyRecipe(decodeRecipe(recipe));
			lastAppliedRecipe = recipe;
		} catch {
			// Ignore malformed recipe URLs and leave the current in-memory state alone.
		}
	});
</script>

{#snippet docsShell()}
	<div class="docs-shell-frame">
		<div class="docs-shell">
			<header class="docs-header">
				<Container size="full" padding={false}>
					<div class="docs-header-bar">
						<div class="docs-brand">
							<div class="docs-brand-row">
								<div class="mobile-nav">
									<Drawer.Root bind:open={mobileNavOpen} side="left">
										<Drawer.Trigger>
											<Button variant="ghost" size="md" aria-label="Open navigation">
												<Menu size={18} aria-hidden="true" />
											</Button>
										</Drawer.Trigger>

										<Drawer.Content --dry-drawer-size="min(22rem, calc(100vw - 2rem))">
											<Drawer.Body padding={false}>
												<Sidebar
													currentPath={page.url.pathname}
													onnavigate={() => (mobileNavOpen = false)}
												/>
											</Drawer.Body>
										</Drawer.Content>
									</Drawer.Root>
								</div>

								<Link href={withBase('/')}>
									<Heading level={2}>
										<Logo />
									</Heading>
								</Link>
								<span class="docs-version">
									<Badge variant="outline" color="gray" size="sm">v{DRYUI_VERSION}</Badge>
								</span>
							</div>
						</div>

						<div class="docs-search">
							<GlobalSearch compact={false} />
						</div>

						<div class="docs-theme">
							<ThemeToggle />
						</div>
					</div>
				</Container>
			</header>

			<nav class="docs-nav">
				<Sidebar currentPath={page.url.pathname} />
			</nav>

			<main class="docs-content">
				{@render routeChildren?.()}
				<footer class="docs-footer">
					<small class="docs-footer-copyright">{publishedLabel}</small>
				</footer>
			</main>
		</div>
	</div>
{/snippet}

{#if isFullWidthRoute || isThemeWizardRoute}
	{@render routeChildren?.()}
{:else}
	{@render docsShell()}
{/if}

<style>
	.docs-shell-frame {
		container-type: inline-size;
		height: 100dvh;
		overflow: hidden;
	}

	.docs-shell {
		--docs-sidebar-width: 16rem;
		display: grid;
		grid-template-areas: 'header' 'nav' 'content';
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: auto auto 1fr;
		height: 100%;
		min-height: 0;
	}

	.docs-header {
		grid-area: header;
		padding-block: var(--dry-space-3);
		background: var(--dry-app-bar-bg, transparent);
		border-block-end: 1px solid var(--dry-app-bar-border, var(--dry-color-stroke-weak));
		box-shadow: var(--dry-app-bar-shadow, none);
	}

	.docs-header-bar {
		display: grid;
		grid-template-areas:
			'brand theme'
			'search search';
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: var(--dry-space-3);
		padding-inline: var(--dry-space-4);
	}

	.docs-brand {
		grid-area: brand;
	}

	.docs-search {
		grid-area: search;
	}

	.docs-theme {
		grid-area: theme;
		justify-self: end;
	}

	.docs-version {
		display: none;
	}

	.docs-brand-row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
	}

	.mobile-nav {
		display: inline-grid;
		place-items: center;
	}

	.docs-nav {
		grid-area: nav;
		display: none;
		overflow: hidden;
		height: 100%;
		min-height: 0;
		background: var(--dry-sidebar-bg, transparent);
		border-inline-end: 1px solid var(--dry-sidebar-border, transparent);
	}

	.docs-content {
		grid-area: content;
		display: grid;
		grid-template-rows: 1fr auto;
		grid-template-columns: minmax(0, 1fr);
		container-type: inline-size;
		min-height: 0;
		overflow: auto;
	}

	@container (min-width: 60rem) {
		.mobile-nav {
			display: none;
		}

		.docs-nav {
			display: block;
		}

		.docs-header-bar {
			grid-template-areas: 'brand search theme';
			grid-template-columns: 1fr minmax(16rem, 22rem) 1fr;
			gap: var(--dry-space-4);
			padding-inline: var(--dry-space-6);
		}

		.docs-version {
			display: inline-grid;
		}

		.docs-shell {
			grid-template-areas: 'header header' 'nav content';
			grid-template-columns: var(--docs-sidebar-width) minmax(0, 1fr);
			grid-template-rows: auto 1fr;
		}
	}

	@container (min-width: 64rem) {
		.docs-shell {
			--docs-sidebar-width: 18rem;
			grid-template-columns: var(--docs-sidebar-width) minmax(0, 1fr);
		}
	}

	.docs-footer {
		padding: var(--dry-space-6) 0;
		text-align: center;
	}

	.docs-footer-copyright {
		color: var(--dry-color-text-weak);
		font-size: var(--dry-type-small-size);
	}
</style>
