<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Heading, Text } from '@dryui/ui';
	import DocsCodeDisclosure from './DocsCodeDisclosure.svelte';

	interface Props {
		/** Optional heading text shown above the demo. */
		title?: string;
		/** Optional supporting description shown below the title. */
		description?: string;
		/** Optional small uppercase kicker shown above the title. */
		eyebrow?: string;
		/** Heading level for the title. Defaults to 3. */
		level?: 2 | 3 | 4 | 5 | 6;
		/** Vertical gap between intro, body, and code toggle. */
		gap?: 'sm' | 'md' | 'lg' | 'xl';
		/** Wrap children in a bordered preview surface with padding. */
		framed?: boolean;
		/** Source code shown in an expandable disclosure below the demo. */
		code?: string;
		/** Language token for the disclosed code block. Defaults to "svelte". */
		codeLanguage?: string;
		/** Label for the code disclosure trigger. Defaults to "Show code". */
		codeLabel?: string;
		/** The demo markup. */
		children: Snippet;
		/** Optional snippet rendered in place of `title` / `description` / `eyebrow`. */
		header?: Snippet;
		/** Optional footer rendered under the demo, above any code toggle. */
		footer?: Snippet;
	}

	let {
		title,
		description,
		eyebrow,
		level = 3,
		gap = 'md',
		framed = false,
		code,
		codeLanguage = 'svelte',
		codeLabel = 'Show code',
		children,
		header,
		footer
	}: Props = $props();

	let hasIntro = $derived(
		Boolean(header) || Boolean(eyebrow) || Boolean(title) || Boolean(description)
	);
</script>

<section class="docs-demo" data-gap={gap}>
	{#if hasIntro}
		<div class="docs-demo-intro">
			{#if header}
				{@render header()}
			{:else}
				{#if eyebrow}
					<p class="docs-demo-eyebrow">{eyebrow}</p>
				{/if}
				{#if title}
					<Heading {level}>{title}</Heading>
				{/if}
				{#if description}
					<div class="docs-demo-description">
						<Text color="secondary">{description}</Text>
					</div>
				{/if}
			{/if}
		</div>
	{/if}

	<div class="docs-demo-body" data-framed={framed}>
		{@render children()}
	</div>

	{#if footer}
		<div class="docs-demo-footer">
			{@render footer()}
		</div>
	{/if}

	{#if code}
		<div class="docs-demo-code">
			<DocsCodeDisclosure {code} language={codeLanguage} label={codeLabel} />
		</div>
	{/if}
</section>

<style>
	.docs-demo,
	.docs-demo-intro,
	.docs-demo-body,
	.docs-demo-description,
	.docs-demo-footer {
		display: grid;
	}

	.docs-demo {
		container-type: inline-size;
	}

	.docs-demo[data-gap='sm'] {
		gap: var(--dry-space-2);
	}

	.docs-demo[data-gap='md'] {
		gap: var(--dry-space-4);
	}

	.docs-demo[data-gap='lg'] {
		gap: var(--dry-space-5);
	}

	.docs-demo[data-gap='xl'] {
		gap: var(--dry-space-6);
	}

	.docs-demo-intro {
		gap: var(--dry-space-2);
	}

	.docs-demo-description {
		grid-template-columns: minmax(0, 64ch);
		line-height: 1.6;
	}

	.docs-demo-eyebrow {
		margin: 0;
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.docs-demo-body[data-framed='true'] {
		padding: var(--dry-space-4);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		background: var(--dry-color-bg-base);
	}

	.docs-demo-footer {
		gap: var(--dry-space-2);
	}

	.docs-demo-code {
		display: grid;
	}
</style>
