<script lang="ts">
	import { Marquee } from '@dryui/ui';

	const logos = [
		'Linear',
		'Vercel',
		'Supabase',
		'Fly.io',
		'Resend',
		'Clerk',
		'PlanetScale',
		'Turso',
		'Upstash'
	];
</script>

<div class="wall">
	<p class="eyebrow">Trusted by teams shipping on</p>
	<Marquee pauseOnHover fade gap="var(--dry-space-8)">
		<div class="lockup">
			{#each logos as logo (logo)}
				<span class="logo">{logo}</span>
			{/each}
		</div>
	</Marquee>
</div>

<style>
	.wall {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-5) 0;
		border-block: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 24%, transparent);
	}

	.eyebrow {
		margin: 0 var(--dry-space-5);
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.lockup {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-8);
		align-items: center;
	}

	.logo {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-lg-size);
		font-weight: 600;
		letter-spacing: -0.02em;
		color: color-mix(in srgb, var(--dry-color-text-strong) 80%, transparent);
	}
</style>
