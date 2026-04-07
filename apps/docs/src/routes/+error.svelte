<script lang="ts">
	import { page } from '$app/state';
	import { Button, Container, Heading, Text } from '@dryui/ui';
	import { ArrowLeft, Home } from 'lucide-svelte';
	import { withBase } from '$lib/utils';

	let status = $derived(page.status);
	let message = $derived(page.error?.message ?? 'Something went wrong');

	let title = $derived(status === 404 ? 'Page not found' : 'Something went wrong');
	let description = $derived(
		status === 404
			? "The page you're looking for doesn't exist or has been moved."
			: 'An unexpected error occurred. Please try again later.'
	);
</script>

<svelte:head>
	<title>{status} — DRY ui</title>
</svelte:head>

<div class="error-page">
	<Container>
		<div class="error-content">
			<Text size="xs" color="secondary" weight="medium">{status}</Text>
			<Heading level={1}>{title}</Heading>
			<Text color="secondary">{description}</Text>

			<div class="error-actions">
				<Button variant="solid" size="md" href={withBase('/')}>
					<Home size={16} aria-hidden="true" /> Home
				</Button>
				<Button variant="outline" size="md" onclick={() => history.back()}>
					<ArrowLeft size={16} aria-hidden="true" /> Go back
				</Button>
			</div>
		</div>
	</Container>
</div>

<style>
	.error-page {
		display: grid;
		grid-template-columns: minmax(0, 72rem);
		justify-content: center;
		align-content: center;
		padding-block: clamp(var(--dry-space-8), 8vw, var(--dry-space-12));
	}

	.error-content {
		display: grid;
		gap: var(--dry-space-2);
		justify-items: start;
		padding: clamp(var(--dry-space-6), 4vw, var(--dry-space-10));
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 72%, transparent);
		border-radius: calc(var(--dry-radius-xl) * 1.2);
		background:
			radial-gradient(
				circle at top left,
				color-mix(in srgb, var(--dry-color-fill-brand) 10%, transparent),
				transparent 34%
			),
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--dry-color-bg-raised) 84%, transparent),
				color-mix(in srgb, var(--dry-color-bg-raised) 88%, transparent)
			);
	}

	.error-actions {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: auto;
		gap: var(--dry-space-3);
		padding-block-start: var(--dry-space-4);
	}
</style>
