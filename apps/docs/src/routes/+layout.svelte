<script lang="ts">
	import { Feedback } from '@dryui/feedback';
	import { browser, dev } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { Badge, Button, Container, Drawer, Heading, Link } from '@dryui/ui';
	import { Menu } from 'lucide-svelte';
	import GithubIcon from '$lib/components/GithubIcon.svelte';
	import GlobalSearch from '$lib/components/GlobalSearch.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { BUILD_TIMESTAMP, DRYUI_VERSION, GITHUB_URL, SITE_DESCRIPTION } from '$lib/site-meta';
	import { withBase, withQueryParam } from '$lib/utils';
	import '../app.css';

	let { children: routeChildren } = $props();
	let mobileNavOpen = $state(false);
	let feedbackEnabled = $state(false);

	const DEFAULT_FEEDBACK_SERVER_URL = 'http://127.0.0.1:4748';
	const FEEDBACK_QUERY_PARAM = 'dryui-feedback';
	const FEEDBACK_SESSION_KEY = 'dryui-feedback-enabled';

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
	let isThemeWizardRoute = $derived(isThemeWizardPath(page.url.pathname));
	let isHomeRoute = $derived(page.url.pathname === '/' || page.url.pathname === withBase('/'));
	let shouldPreserveFeedbackMode = $derived(
		feedbackEnabled || (browser && page.url.searchParams.get(FEEDBACK_QUERY_PARAM) === '1')
	);
	let themeWizardHref = $derived(
		withQueryParam(
			withBase('/theme-wizard'),
			FEEDBACK_QUERY_PARAM,
			shouldPreserveFeedbackMode ? '1' : null
		)
	);

	function getHashTarget(hash: string): HTMLElement | null {
		if (!hash.startsWith('#') || hash.length <= 1) return null;

		let id = hash.slice(1);
		try {
			id = decodeURIComponent(id);
		} catch {
			// Malformed percent-encoding should not break route navigation.
		}

		return document.getElementById(id);
	}

	afterNavigate((navigation) => {
		if (dev && typeof window !== 'undefined') {
			if (page.url.searchParams.get(FEEDBACK_QUERY_PARAM) === '1') {
				window.sessionStorage.setItem(FEEDBACK_SESSION_KEY, '1');
				feedbackEnabled = true;
			} else {
				feedbackEnabled = window.sessionStorage.getItem(FEEDBACK_SESSION_KEY) === '1';
			}
		}

		if (typeof document === 'undefined') return;
		if (navigation.type === 'popstate') return;
		const fromPath = navigation.from?.url.pathname;
		const toPath = navigation.to?.url.pathname;
		if (fromPath === toPath) return;
		const hash = navigation.to?.url.hash;
		if (hash) {
			requestAnimationFrame(() => {
				getHashTarget(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
			});
			return;
		}
		document.querySelector('main.docs-content')?.scrollTo({ top: 0, behavior: 'instant' });
	});
</script>

<svelte:head>
	<meta name="description" content={SITE_DESCRIPTION} />
</svelte:head>

{#snippet homeMiniNav()}
	<div class="home-mini-nav" aria-label="Docs navigation">
		<div class="home-mini-nav-brand">
			<Link href={withBase('/')}>
				<Heading level={2}>
					<Logo />
				</Heading>
			</Link>
		</div>
		<div class="home-mini-nav-search">
			<GlobalSearch />
		</div>
		<div class="home-mini-nav-actions">
			<Button variant="ghost" size="sm" href={GITHUB_URL} target="_blank" rel="noreferrer">
				<GithubIcon size={16} /> GitHub
			</Button>
			<span class="home-mini-nav-cta">
				<Button variant="solid" color="primary" size="sm" href={withBase('/getting-started')}
					>Get Started</Button
				>
			</span>
			<ThemeToggle />
		</div>
	</div>
{/snippet}

{#snippet docsShell()}
	<div class="docs-shell-frame">
		<div class="docs-shell" data-home={isHomeRoute || undefined}>
			{#if isHomeRoute}
				{@render homeMiniNav()}
			{/if}
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
													{themeWizardHref}
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
				<Sidebar currentPath={page.url.pathname} {themeWizardHref} />
			</nav>

			<main class="docs-content">
				{@render routeChildren?.()}
				<footer class="docs-footer">
					<p class="footer-credit">
						Made by <a
							class="footer-link"
							href="https://robertbalfre.dev/"
							target="_blank"
							rel="noreferrer">Robert Balfré</a
						>
						in Sydney 🐨
						<span class="footer-sep" aria-hidden="true">•</span>
						{publishedLabel}
					</p>
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

{#if dev && feedbackEnabled}
	<Feedback serverUrl={DEFAULT_FEEDBACK_SERVER_URL} scrollRoot="main.docs-content" />
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

	.docs-shell[data-home] .mobile-nav,
	.docs-shell[data-home] .docs-nav,
	.docs-shell[data-home] .docs-header {
		display: none;
	}

	.docs-shell[data-home] {
		grid-template-areas: 'content';
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: 1fr;
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
			grid-template-areas: 'brand . search theme';
			grid-template-columns: var(--docs-sidebar-width) 1fr minmax(16rem, 22rem) 1fr;
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
		display: grid;
		gap: var(--dry-space-1);
		justify-items: center;
		padding: var(--dry-space-6) var(--dry-space-4) var(--dry-space-5);
		text-align: center;
	}

	.footer-credit {
		margin: 0;
		font-size: 0.75rem;
		color: var(--dry-color-text-weak);
		line-height: 1.8;
	}

	.footer-link {
		color: var(--dry-color-text-strong);
		font-weight: 600;
		text-decoration: none;
		border-block-end: 1px solid color-mix(in srgb, var(--dry-color-fill-brand) 60%, transparent);
		transition:
			border-color 150ms,
			color 150ms;
	}

	.footer-link:hover {
		color: var(--dry-color-fill-brand);
		border-block-end-color: var(--dry-color-fill-brand);
	}

	.footer-sep {
		color: color-mix(in srgb, var(--dry-color-text-weak) 60%, transparent);
		margin-inline: 0.25em;
	}

	.home-mini-nav {
		position: fixed;
		inset-block-start: 0;
		inset-inline: 0;
		z-index: 10;
		container-type: inline-size;
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(min-content, 22rem) minmax(0, 1fr);
		align-items: center;
		gap: var(--dry-space-3);
		padding: var(--dry-space-3) var(--dry-space-4);
		background: color-mix(in srgb, var(--dry-color-bg-base, #0b0b0b) 72%, transparent);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border-block-end: 1px solid var(--dry-color-stroke-weak, transparent);
		opacity: 0;
		transform: translateY(-6px);
		animation: home-mini-nav-in 320ms cubic-bezier(0.16, 1, 0.3, 1) 120ms forwards;
	}

	.home-mini-nav-brand {
		display: inline-grid;
		place-items: center;
		justify-self: start;
	}

	.home-mini-nav-search {
		justify-self: stretch;
	}

	.home-mini-nav-actions {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
		justify-self: end;
	}

	@keyframes home-mini-nav-in {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.home-mini-nav {
			animation: none;
			opacity: 1;
			transform: none;
		}
	}

	@container (max-width: 40rem) {
		.home-mini-nav {
			grid-template-columns: auto 1fr auto;
			padding: var(--dry-space-2) var(--dry-space-3);
		}
		.home-mini-nav-search {
			display: none;
		}
		.home-mini-nav-cta {
			display: none;
		}
	}

	.docs-shell[data-home] .docs-content {
		scroll-padding-block-start: var(--dry-space-14);
		padding-block-start: var(--dry-space-16);
	}

	@container (max-width: 40rem) {
		.docs-shell[data-home] .docs-content {
			padding-block-start: var(--dry-space-12);
		}
	}
</style>
