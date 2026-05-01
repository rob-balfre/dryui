<span class="logo" aria-label="DryUI">
	<svg
		class="logo-mark"
		width="1em"
		height="1em"
		viewBox="0 0 48 48"
		aria-hidden="true"
		focusable="false"
	>
		<rect class="logo-mark-bg" x="4" y="4" width="40" height="40" rx="9" />
		<path
			class="logo-mark-body"
			d="M15 13h14c6.7 0 11 4.3 11 11s-4.3 11-11 11H15V13Zm8 8v6h6c1.9 0 3-1.1 3-3s-1.1-3-3-3h-6Z"
		/>
		<path class="logo-mark-signal" d="M11 36h26" />
	</svg>
	<span class="logo-word" aria-hidden="true">dry<span class="logo-ui">ui</span></span>
</span>

<style>
	.logo {
		--_logo-gap: 0.34em;
		--_logo-mark-size: 1.05em;

		display: inline-grid;
		grid-template-columns: var(--_logo-mark-size) auto;
		grid-auto-flow: column;
		align-items: center;
		gap: var(--_logo-gap);
		color: currentColor;
		font-weight: 850;
		letter-spacing: 0;
		line-height: 1;
		text-transform: lowercase;
	}

	.logo-mark {
		overflow: visible;
	}

	.logo-mark-bg {
		fill: var(--docs-logo-mark-bg, var(--dry-color-fill-brand));
	}

	.logo-mark-body {
		fill: var(--docs-logo-mark-ink, var(--dry-color-on-brand));
	}

	.logo-mark-signal {
		fill: none;
		stroke: var(--docs-logo-mark-signal, var(--dry-color-fill-accent));
		stroke-width: 3;
		stroke-linecap: round;
	}

	.logo-word {
		display: inline-grid;
		grid-auto-flow: column;
		align-items: baseline;
		gap: 0.02em;
	}

	.logo-ui {
		color: var(--dry-color-fill-brand);
	}
</style>
