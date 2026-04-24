<script lang="ts">
	import { QRCode } from '@dryui/ui';
</script>

<div class="card">
	<QRCode
		value="otpauth://totp/DryUI:rob@dryui.dev?secret=JBSWY3DPEHPK3PXP&issuer=DryUI"
		size={160}
		errorCorrection="M"
	/>
	<div class="meta">
		<p class="eyebrow">Two-factor setup</p>
		<p class="title">Scan with your authenticator app</p>
		<p class="note">
			Codes rotate every 30 seconds. Keep this code private. You can regenerate it from Settings if
			a device is lost.
		</p>
		<p class="hint">Recovery code: <span class="code">7Q9F-3B2H-XC41</span></p>
	</div>
</div>

<style>
	.card {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		align-items: center;
		gap: var(--dry-space-5);
		padding: var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
	}

	.meta {
		display: grid;
		gap: var(--dry-space-1);
	}
	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}
	.title {
		margin: 0;
		font-size: var(--dry-text-base-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}
	.note {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
	}
	.hint {
		margin: var(--dry-space-1) 0 0;
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
	}
	.code {
		font-family: var(--dry-font-mono);
		color: var(--dry-color-text-strong);
		letter-spacing: 0.04em;
	}
</style>
