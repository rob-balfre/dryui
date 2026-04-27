<script lang="ts">
	import { Button, Dialog, Field, Input, Label, Select } from '@dryui/ui';

	let email = $state('morgan@acme.dev');
	let role = $state('member');
</script>

<div class="stage">
	<div class="scene">
		<p class="eyebrow">Team settings</p>
		<p class="scene-title">4 members on dryui-studio</p>
		<div class="member-rows">
			<div class="member"><span>Martina Alves</span><span class="role">Admin</span></div>
			<div class="member"><span>Jules Park</span><span class="role">Member</span></div>
			<div class="member"><span>Sam Lee</span><span class="role">Member</span></div>
		</div>
		<Dialog.Root>
			<Dialog.Trigger>
				<Button variant="solid">Invite teammate</Button>
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>Invite to dryui-studio</Dialog.Header>
				<Dialog.Body>
					<div class="form">
						<Field.Root>
							<Label>Work email</Label>
							<Input type="email" bind:value={email} placeholder="teammate@company.com" />
						</Field.Root>
						<Field.Root>
							<Label>Role</Label>
							<Select.Root bind:value={role}>
								<Select.Trigger><Select.Value placeholder="Choose a role" /></Select.Trigger>
								<Select.Content>
									<Select.Item value="member">Member. Can deploy</Select.Item>
									<Select.Item value="admin">Admin. Can manage billing</Select.Item>
									<Select.Item value="viewer">Viewer. Read-only</Select.Item>
								</Select.Content>
							</Select.Root>
						</Field.Root>
					</div>
				</Dialog.Body>
				<Dialog.Footer>
					<Button variant="ghost">Cancel</Button>
					<Button variant="solid">Send invite</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	</div>

	<section class="preview" aria-label="Dialog preview">
		<p class="eyebrow">Dialog preview</p>
		<p class="preview-title">Invite to dryui-studio</p>
		<div class="fields">
			<Field.Root>
				<Label>Work email</Label>
				<Input value="morgan@acme.dev" readonly />
			</Field.Root>
			<Field.Root>
				<Label>Role</Label>
				<Input value="Member. Can deploy" readonly />
			</Field.Root>
		</div>
		<div class="actions">
			<Button variant="ghost" size="sm">Cancel</Button>
			<Button variant="solid" size="sm">Send invite</Button>
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
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.scene-title,
	.preview-title {
		margin: 0;
		font-size: var(--dry-text-base-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.member-rows {
		display: grid;
		gap: var(--dry-space-2);
	}

	.member {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-3);
		padding: var(--dry-space-2) var(--dry-space-3);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 55%, transparent);
		border-radius: var(--dry-radius-md);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}

	.role {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
	}

	.form {
		display: grid;
		gap: var(--dry-space-3);
	}

	.preview {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-4);
		border-radius: var(--dry-radius-lg);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 70%, transparent);
		box-shadow: 0 18px 40px color-mix(in srgb, var(--dry-color-text-strong) 35%, transparent);
	}

	.fields {
		display: grid;
		gap: var(--dry-space-3);
	}

	.actions {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		justify-content: end;
		gap: var(--dry-space-2);
	}
</style>
