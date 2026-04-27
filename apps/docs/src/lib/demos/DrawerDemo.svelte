<script lang="ts">
	import { Button, Drawer } from '@dryui/ui';
</script>

<div class="stage">
	<div class="scene">
		<p class="eyebrow">dryui-studio</p>
		<p class="scene-title">Workspace overview</p>
		<p class="note">Drawer slides in from the edge while the page stays visible beneath.</p>
		<Drawer.Root side="right">
			<Drawer.Trigger>
				<Button variant="outline">Open settings</Button>
			</Drawer.Trigger>
			<Drawer.Content>
				<Drawer.Header>Workspace settings</Drawer.Header>
			</Drawer.Content>
		</Drawer.Root>
	</div>

	<section class="preview" aria-label="Drawer preview">
		<header class="head">
			<p class="eyebrow">Drawer</p>
			<p class="preview-title">Workspace settings</p>
		</header>

		<div class="group">
			<p class="group-head">Alerts and activity</p>
			<div class="setting">
				<div class="copy">
					<p class="setting-title">Release updates</p>
					<p class="setting-note">Ship notes to the team channel.</p>
				</div>
				<span class="pill on">On</span>
			</div>
			<div class="setting">
				<div class="copy">
					<p class="setting-title">Weekly digest</p>
					<p class="setting-note">Monday summary of approvals.</p>
				</div>
				<span class="pill">Off</span>
			</div>
		</div>

		<div class="group">
			<p class="group-head">Privacy</p>
			<div class="setting">
				<div class="copy">
					<p class="setting-title">Hide collaborator emails</p>
					<p class="setting-note">Mask emails in mentions.</p>
				</div>
				<span class="pill on">On</span>
			</div>
			<div class="setting">
				<div class="copy">
					<p class="setting-title">Public profile</p>
					<p class="setting-note">Show your workspace handle.</p>
				</div>
				<span class="pill">Off</span>
			</div>
		</div>
	</section>
</div>

<style>
	.stage {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: var(--dry-space-5);
		align-items: start;
	}

	.scene {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-4);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 45%, transparent);
		justify-items: start;
	}

	.eyebrow,
	.group-head {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.scene-title,
	.preview-title,
	.setting-title {
		margin: 0;
		font-size: var(--dry-text-base-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.note,
	.setting-note {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
	}

	.preview {
		display: grid;
		gap: var(--dry-space-4);
		padding: var(--dry-space-4);
		border-radius: var(--dry-radius-lg);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 70%, transparent);
		box-shadow: 0 18px 40px color-mix(in srgb, var(--dry-color-text-strong) 35%, transparent);
	}

	.head {
		display: grid;
		gap: var(--dry-space-1);
	}
	.group {
		display: grid;
		gap: var(--dry-space-3);
	}
	.copy {
		display: grid;
		gap: 2px;
	}

	.setting {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.pill {
		padding: 2px var(--dry-space-2);
		border-radius: 999px;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 55%, transparent);
	}

	.pill.on {
		color: var(--dry-color-text-strong);
		background: color-mix(in srgb, var(--dry-color-fill-brand) 22%, transparent);
		border-color: color-mix(in srgb, var(--dry-color-fill-brand) 45%, transparent);
	}
</style>
