<span class="logo">DRY<span class="logo-ui">ui</span></span>

<style>
	.logo {
		--_logo-gap: 0.2em;
		--_logo-badge-padding: 0.1em 0.35em;
		--_logo-badge-radius: 0.3em;
		--_logo-badge-size: 0.75em;

		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1;
		display: inline-grid;
		grid-auto-flow: column;
		align-items: center;
		gap: var(--_logo-gap);
	}

	.logo-ui {
		border: 2px solid currentColor;
		padding: var(--_logo-badge-padding);
		border-radius: var(--_logo-badge-radius);
		font-weight: 800;
		font-size: var(--_logo-badge-size);
		letter-spacing: 0.02em;
		line-height: 1;
	}
</style>
