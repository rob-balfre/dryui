<script lang="ts">
	import { dev } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { Button } from '@dryui/ui/button';
	import { Container } from '@dryui/ui/container';
	import { Heading } from '@dryui/ui/heading';
	import { Link } from '@dryui/ui/link';
	import GithubIcon from '$lib/components/GithubIcon.svelte';
	import GlobalSearch from '$lib/components/GlobalSearch.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import DocsSidebar from '$lib/components/Sidebar.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { BUILD_TIMESTAMP, GITHUB_URL, SITE_DESCRIPTION } from '$lib/site-meta';
	import { docsTheme } from '$lib/theme.svelte.js';
	import { withBase } from '$lib/utils';
	import '../app.css';
	import '../layout.css';

	const DEFAULT_FEEDBACK_SERVER_URL = 'http://127.0.0.1:4748';
	const FEEDBACK_QUERY_PARAM = 'dryui-feedback';
	const FEEDBACK_SESSION_KEY = 'dryui-feedback-enabled';

	let { children: routeChildren } = $props();
	let feedbackEnabled = $state(false);
	let feedbackComponentPromise = $derived(
		dev && feedbackEnabled ? import('@dryui/feedback').then((mod) => mod.Feedback) : null
	);

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
	let isHomeRoute = $derived(page.url.pathname === '/' || page.url.pathname === withBase('/'));
	let homeTheme = $derived(docsTheme.isDark ? 'dark' : 'light');

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

{#snippet docsShell()}
	<div class="docs-shell-frame">
		<div
			class="docs-shell"
			data-home={isHomeRoute || undefined}
			data-home-theme={isHomeRoute ? homeTheme : undefined}
		>
			<header class="docs-header">
				<Container size="full" padding={false}>
					<div class="docs-header-bar">
						<div class="docs-brand">
							<div class="docs-brand-row">
								<Link href={withBase('/')} underline="none">
									<Heading level={2}>
										<Logo />
									</Heading>
								</Link>
							</div>
						</div>

						<div class="docs-search">
							<GlobalSearch compact={false} />
						</div>

						<div class="docs-actions">
							<Button
								variant="ghost"
								color="ink"
								size="sm"
								href={GITHUB_URL}
								target="_blank"
								rel="noreferrer"
								aria-label="GitHub"
							>
								<GithubIcon size={16} />
							</Button>
							<ThemeToggle />
						</div>
					</div>
				</Container>
			</header>

			<nav class="docs-nav">
				<DocsSidebar currentPath={page.url.pathname} />
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

{#if isFullWidthRoute}
	{@render routeChildren?.()}
{:else}
	{@render docsShell()}
{/if}

{#if dev && feedbackEnabled && feedbackComponentPromise}
	{#await feedbackComponentPromise then Feedback}
		<Feedback serverUrl={DEFAULT_FEEDBACK_SERVER_URL} scrollRoot="main.docs-content" />
	{/await}
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
		grid-template-areas: 'brand search actions';
		grid-template-columns: max-content minmax(5.5rem, 12rem) max-content;
		align-items: center;
		justify-content: space-between;
		gap: var(--dry-space-2);
		padding-inline: var(--dry-space-3);
	}

	.docs-brand {
		grid-area: brand;
	}

	.docs-search {
		grid-area: search;
	}

	.docs-actions {
		grid-area: actions;
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
		justify-self: end;
		--dry-btn-bg: transparent;
		--dry-btn-color: var(--dry-color-text-strong);
		--dry-btn-border: transparent;
	}

	.docs-brand-row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
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

	.docs-shell[data-home] .docs-nav {
		display: none;
	}

	.docs-shell[data-home] {
		--dry-color-brand: var(--dry-color-text-strong);
		--dry-color-text-brand: var(--dry-color-text-strong);
		--dry-color-fill-brand: var(--dry-color-text-strong);
		--dry-color-on-brand: var(--dry-color-bg-base);
		--dry-color-focus-ring: oklch(97% 0 0 / 0.28);
		--dry-color-fill-accent: var(--dry-color-text-strong);
		--dry-color-stroke-selected: var(--dry-color-text-strong);
		--dry-color-fill-weak: var(--dry-color-fill);
		--dry-color-fill-selected: var(--dry-color-text-strong);
		--docs-logo-mark-bg: var(--dry-color-text-strong);
		--docs-logo-mark-ink: var(--dry-color-bg-base);
		--docs-logo-mark-signal: var(--dry-color-text-strong);
		position: relative;
		z-index: 2;
		grid-template-areas: 'header' 'content';
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: auto 1fr;
		background: var(--dry-color-bg-base);
	}

	.docs-shell[data-home][data-home-theme='dark'] {
		--dry-color-text-strong: oklch(97% 0 0);
		--dry-color-text-weak: oklch(97% 0 0 / 0.68);
		--dry-color-icon: oklch(97% 0 0 / 0.78);
		--dry-color-stroke-strong: oklch(97% 0 0 / 0.36);
		--dry-color-stroke-weak: oklch(97% 0 0 / 0.14);
		--dry-color-fill: oklch(97% 0 0 / 0.06);
		--dry-color-fill-hover: oklch(97% 0 0 / 0.1);
		--dry-color-fill-active: oklch(97% 0 0 / 0.15);
		--dry-color-fill-brand-hover: oklch(88% 0 0);
		--dry-color-fill-brand-active: oklch(80% 0 0);
		--dry-color-fill-brand-weak: oklch(97% 0 0 / 0.1);
		--dry-color-stroke-brand: oklch(97% 0 0 / 0.36);
		--dry-color-stroke-brand-strong: oklch(97% 0 0 / 0.62);
		--dry-color-stroke-brand-weak: oklch(97% 0 0 / 0.16);
		--dry-color-focus-ring: oklch(97% 0 0 / 0.28);
		--dry-color-fill-accent-hover: oklch(88% 0 0);
		--dry-color-fill-accent-active: oklch(80% 0 0);
		--dry-color-fill-accent-weak: oklch(97% 0 0 / 0.1);
		--dry-color-stroke-accent: oklch(97% 0 0 / 0.36);
		--dry-color-stroke-accent-strong: oklch(97% 0 0 / 0.62);
		--dry-color-stroke-accent-weak: oklch(97% 0 0 / 0.16);
		--dry-color-fill-weaker: oklch(97% 0 0 / 0.03);
		--dry-color-bg-base: oklch(8% 0 0);
		--dry-color-bg-raised: oklch(12% 0 0);
		--dry-color-bg-overlay: oklch(17% 0 0);
		--dry-color-bg-sunken: oklch(5% 0 0);
		--dry-theme-toggle-icon: var(--dry-color-bg-base);
		--dry-toggle-track-bg: oklch(97% 0 0 / 0.08);
		--dry-toggle-track-stroke: oklch(97% 0 0 / 0.32);
		--dry-toggle-selected-bg: var(--dry-color-text-strong);
		--dry-toggle-selected-stroke: var(--dry-color-text-strong);
		--dry-toggle-thumb-bg: var(--dry-color-text-strong);
		--dry-toggle-hover-bg: oklch(97% 0 0 / 0.12);
		--dry-toggle-press-bg: oklch(97% 0 0 / 0.18);
	}

	.docs-shell[data-home][data-home-theme='light'] {
		--dry-color-text-strong: oklch(8% 0 0);
		--dry-color-text-weak: oklch(8% 0 0 / 0.64);
		--dry-color-icon: oklch(8% 0 0 / 0.76);
		--dry-color-stroke-strong: oklch(8% 0 0 / 0.36);
		--dry-color-stroke-weak: oklch(8% 0 0 / 0.14);
		--dry-color-fill: oklch(8% 0 0 / 0.045);
		--dry-color-fill-hover: oklch(8% 0 0 / 0.075);
		--dry-color-fill-active: oklch(8% 0 0 / 0.12);
		--dry-color-fill-brand-hover: oklch(18% 0 0);
		--dry-color-fill-brand-active: oklch(27% 0 0);
		--dry-color-fill-brand-weak: oklch(8% 0 0 / 0.08);
		--dry-color-stroke-brand: oklch(8% 0 0 / 0.36);
		--dry-color-stroke-brand-strong: oklch(8% 0 0 / 0.62);
		--dry-color-stroke-brand-weak: oklch(8% 0 0 / 0.16);
		--dry-color-focus-ring: oklch(8% 0 0 / 0.26);
		--dry-color-fill-accent-hover: oklch(18% 0 0);
		--dry-color-fill-accent-active: oklch(27% 0 0);
		--dry-color-fill-accent-weak: oklch(8% 0 0 / 0.08);
		--dry-color-stroke-accent: oklch(8% 0 0 / 0.36);
		--dry-color-stroke-accent-strong: oklch(8% 0 0 / 0.62);
		--dry-color-stroke-accent-weak: oklch(8% 0 0 / 0.16);
		--dry-color-fill-weaker: oklch(8% 0 0 / 0.03);
		--dry-color-bg-base: oklch(97% 0 0);
		--dry-color-bg-raised: oklch(94% 0 0);
		--dry-color-bg-overlay: oklch(91% 0 0);
		--dry-color-bg-sunken: oklch(95% 0 0);
		--dry-theme-toggle-icon: var(--dry-color-text-strong);
		--dry-toggle-track-bg: oklch(8% 0 0 / 0.06);
		--dry-toggle-track-stroke: oklch(8% 0 0 / 0.28);
		--dry-toggle-selected-bg: var(--dry-color-text-strong);
		--dry-toggle-selected-stroke: var(--dry-color-text-strong);
		--dry-toggle-thumb-bg: var(--dry-color-bg-base);
		--dry-toggle-hover-bg: oklch(8% 0 0 / 0.1);
		--dry-toggle-press-bg: oklch(8% 0 0 / 0.14);
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
		.docs-nav {
			display: block;
		}

		.docs-header-bar {
			grid-template-areas: 'brand search actions';
			grid-template-columns: var(--docs-sidebar-width) minmax(16rem, 24rem) max-content;
			gap: var(--dry-space-4);
			justify-content: space-between;
			padding-inline: var(--dry-space-6);
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

	.docs-shell[data-home] .docs-content {
		scroll-padding-block-start: var(--dry-space-4);
		padding-block-start: 0;
	}
</style>
