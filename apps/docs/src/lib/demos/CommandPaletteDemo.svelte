<script lang="ts">
	import { Button, CommandPalette, Kbd } from '@dryui/ui';

	let commandOpen = $state(false);
</script>

<div class="stage">
	<div class="scene-hint">
		<p class="eyebrow" aria-hidden="true">dryui-studio</p>
		<p class="hint">Press <Kbd>Cmd+K</Kbd> anywhere to summon the palette.</p>
		<Button variant="outline" onclick={() => (commandOpen = true)}>Open command palette</Button>
		<CommandPalette.Root bind:open={commandOpen}>
			<CommandPalette.Input placeholder="Jump to action, file, or setting..." />
			<CommandPalette.List>
				<CommandPalette.Group heading="Actions">
					<CommandPalette.Item value="create-deploy">Create deploy</CommandPalette.Item>
					<CommandPalette.Item value="invite-member">Invite member</CommandPalette.Item>
					<CommandPalette.Item value="toggle-theme">Toggle theme</CommandPalette.Item>
				</CommandPalette.Group>
				<CommandPalette.Separator />
				<CommandPalette.Group heading="Navigate">
					<CommandPalette.Item value="open-settings">Open settings</CommandPalette.Item>
					<CommandPalette.Item value="search-files">Search files</CommandPalette.Item>
					<CommandPalette.Item value="go-billing">Go to billing</CommandPalette.Item>
				</CommandPalette.Group>
			</CommandPalette.List>
		</CommandPalette.Root>
	</div>

	<section class="palette" aria-label="Command palette preview">
		<div class="input" aria-hidden="true">
			<span class="glyph">/</span>
			<span class="placeholder">Jump to action, file, or setting...</span>
			<Kbd>Esc</Kbd>
		</div>
		<div class="rule" aria-hidden="true"></div>
		<p class="heading">Actions</p>
		<ul>
			<li class="item"><span class="glyph">+</span>Create deploy<Kbd>D</Kbd></li>
			<li class="item active"><span class="glyph">@</span>Invite member<Kbd>Return</Kbd></li>
			<li class="item"><span class="glyph">*</span>Toggle theme<Kbd>T</Kbd></li>
		</ul>
		<div class="rule" aria-hidden="true"></div>
		<p class="heading">Navigate</p>
		<ul>
			<li class="item"><span class="glyph">&gt;</span>Open settings</li>
			<li class="item"><span class="glyph">?</span>Search files</li>
			<li class="item"><span class="glyph">$</span>Go to billing</li>
		</ul>
	</section>
</div>

<style>
	.stage {
		display: grid;
		gap: var(--dry-space-5);
	}

	.scene-hint {
		display: grid;
		gap: var(--dry-space-2);
		justify-items: center;
	}

	.eyebrow,
	.heading {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.hint {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
	}

	.palette {
		display: grid;
		gap: var(--dry-space-2);
		padding: var(--dry-space-3);
		max-inline-size: 32em;
		justify-self: center;
		border-radius: var(--dry-radius-lg);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 72%, transparent);
		box-shadow: 0 22px 44px color-mix(in srgb, var(--dry-color-text-strong) 38%, transparent);
	}

	.input {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-2);
		padding: var(--dry-space-2) var(--dry-space-3);
		border-radius: var(--dry-radius-md);
		background: color-mix(in srgb, var(--dry-color-bg-base) 50%, transparent);
	}

	.placeholder {
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
	}

	.rule {
		block-size: 1px;
		background: color-mix(in srgb, var(--dry-color-stroke-weak) 55%, transparent);
	}

	ul {
		display: grid;
		gap: 2px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.item {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-2);
		padding: var(--dry-space-2) var(--dry-space-3);
		border-radius: var(--dry-radius-sm);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}

	.item.active {
		background: color-mix(in srgb, var(--dry-color-fill-brand) 14%, transparent);
	}

	.glyph {
		display: grid;
		place-items: center;
		block-size: 1.5em;
		aspect-ratio: 1;
		border-radius: var(--dry-radius-sm);
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
		background: color-mix(in srgb, var(--dry-color-stroke-weak) 40%, transparent);
	}
</style>
