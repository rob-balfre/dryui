<script lang="ts">
	import { TableOfContents } from '@dryui/ui';
</script>

<div class="demo-layout">
	<div class="demo-article" id="toc-demo-content">
		<!-- dryui-allow raw-heading: docs demo content intentionally renders native headings. -->
		<h2 id="toc-introduction">Introduction</h2>
		<p>Overview of the project and its goals.</p>
		<!-- dryui-allow raw-heading: docs demo content intentionally renders native headings. -->
		<h2 id="toc-getting-started">Getting Started</h2>
		<p>Installation steps and initial setup guide.</p>
		<!-- dryui-allow raw-heading: docs demo content intentionally renders native headings. -->
		<h3 id="toc-prerequisites">Prerequisites</h3>
		<p>Required tools and dependencies.</p>
		<!-- dryui-allow raw-heading: docs demo content intentionally renders native headings. -->
		<h3 id="toc-installation">Installation</h3>
		<p>Step-by-step installation instructions.</p>
		<!-- dryui-allow raw-heading: docs demo content intentionally renders native headings. -->
		<h2 id="toc-configuration">Configuration</h2>
		<p>Configuring the project for your environment.</p>
	</div>
	<TableOfContents.Root selector="#toc-demo-content">
		<TableOfContents.List />
	</TableOfContents.Root>
</div>

<style>
	.demo-layout {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: var(--dry-space-6);
		align-items: start;
	}

	.demo-article {
		display: grid;
		gap: var(--dry-space-2);
		font-family: var(--dry-font-sans);
	}

	.demo-article h2,
	.demo-article h3 {
		margin: 0;
		color: var(--dry-color-text-strong);
	}

	.demo-article h2 {
		font-size: var(--dry-text-lg-size);
		margin-top: var(--dry-space-3);
	}

	.demo-article h3 {
		font-size: var(--dry-text-base-size);
	}

	.demo-article h2:first-child {
		margin-top: 0;
	}

	.demo-article p {
		margin: 0;
		color: var(--dry-color-text-weak);
		font-size: var(--dry-text-sm-size);
	}
</style>
