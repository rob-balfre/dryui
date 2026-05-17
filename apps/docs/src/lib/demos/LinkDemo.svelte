<script lang="ts">
	import { Kbd, Link } from '@dryui/ui';
</script>

<div class="link-demo">
	<p class="paragraph">
		Install the agent skills with <Link href="#install">npx skills add rob-balfre/dryui</Link>. For
		visual feedback, run <Kbd keys={['bunx']} />
		<Link href="#feedback">dryui-feedback</Link>.
	</p>

	<p class="paragraph">
		See the <Link href="https://dryui.dev/migrate/1.4" external underline="hover"
			>migration guide for 1.4</Link
		> for the three breaking changes, or follow the
		<Link href="#release-notes">release notes</Link> for the full list.
	</p>

	<p class="paragraph">
		The deprecated helper <Link disabled>legacyResolveSlot</Link> is kept for reference but cannot be
		opened from this page.
	</p>
</div>

<style>
	.link-demo {
		display: grid;
		gap: var(--dry-space-3);
	}

	.paragraph {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		line-height: 1.65;
		color: var(--dry-color-text-strong);
		max-inline-size: 62ch;
	}
</style>
