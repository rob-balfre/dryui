<script lang="ts">
	import type { ThemePreference, ThemeToken } from '../studio-data';
	import { Badge, Button, Card, Input, Separator } from '@dryui/ui';

	interface Props {
		preference: ThemePreference;
		tokens: ThemeToken[];
		onPreferenceChange: (preference: ThemePreference) => void;
		onTokenChange: (name: ThemeToken['name'], value: string) => void;
	}

	let { preference, tokens, onPreferenceChange, onTokenChange }: Props = $props();
</script>

<section class="panel">
	<Card.Root>
		<div class="panel-header">
			<Card.Header>
				<div class="header-copy">
					<Badge variant="outline" color="blue">Theme</Badge>
					<h2>Theme editor</h2>
				</div>
				<p>Adjust the semantic palette that the entire workspace inherits.</p>
			</Card.Header>
		</div>

		<div class="panel-body">
			<Card.Content>
				<div class="mode-row">
					{#each ['system', 'light', 'dark'] as mode (mode)}
						<Button
							type="button"
							variant={preference === mode ? 'solid' : 'outline'}
							onclick={() => onPreferenceChange(mode as ThemePreference)}>{mode}</Button
						>
					{/each}
				</div>

				<Separator />

				<div class="token-stack">
					{#each tokens as token (token.name)}
						<label class="token-row">
							<span class="token-meta">
								<strong>{token.label}</strong>
								<span>{token.name}</span>
							</span>
							<div class="token-inputs">
								<input
									type="color"
									value={token.value}
									aria-label={token.label}
									oninput={(event) =>
										onTokenChange(token.name, (event.currentTarget as HTMLInputElement).value)}
								/>
								<Input
									size="sm"
									value={token.value}
									oninput={(event) =>
										onTokenChange(token.name, (event.currentTarget as HTMLInputElement).value)}
								/>
							</div>
						</label>
					{/each}
				</div>
			</Card.Content>
		</div>
	</Card.Root>
</section>

<style>
	.panel {
		height: 100%;
	}

	.panel-header {
		display: grid;
		gap: var(--dry-space-2);
	}

	.header-copy {
		display: flex;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.header-copy h2,
	.token-meta strong {
		margin: 0;
	}

	.panel-header p {
		margin: 0;
		color: var(--dry-color-text-muted);
	}

	.panel-body {
		display: grid;
		gap: var(--dry-space-4);
	}

	.mode-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--dry-space-2);
	}

	.token-stack {
		display: grid;
		gap: var(--dry-space-3);
	}

	.token-row {
		display: grid;
		gap: var(--dry-space-2);
	}

	.token-meta {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--dry-space-3);
	}

	.token-meta span {
		color: var(--dry-color-text-muted);
		font-size: var(--dry-text-xs-size);
	}

	.token-inputs {
		display: grid;
		grid-template-columns: 88px 1fr;
		gap: var(--dry-space-2);
		align-items: center;
	}

	.token-inputs input[type='color'] {
		width: 100%;
		height: 2.5rem;
		padding: 0;
		border: 1px solid var(--dry-color-border);
		border-radius: var(--dry-radius-md);
		background: var(--dry-color-surface-raised);
	}
</style>
