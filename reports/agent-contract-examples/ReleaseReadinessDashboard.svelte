<script>
	import '@dryui/ui/themes/default.css';
	import '@dryui/ui/themes/dark.css';

	import { Badge, Button, Card, Container, Heading, Progress, Separator, Text } from '@dryui/ui';

	const metrics = [
		{ label: 'Deploy confidence', value: '94%', trend: '12 checks passed', tone: 'green' },
		{ label: 'Open blockers', value: '2', trend: '1 needs design review', tone: 'yellow' },
		{ label: 'Coverage delta', value: '+4.8%', trend: 'unit lane improved', tone: 'blue' }
	];

	const checks = [
		{ id: 'contract', label: 'Agent contract drift', owner: 'MCP', state: 'complete' },
		{ id: 'prompt', label: 'Prompt command smoke', owner: 'CLI', state: 'complete' },
		{ id: 'docs', label: 'Docs and llms sync', owner: 'Docs', state: 'review' },
		{ id: 'visual', label: 'Visual examples', owner: 'Codex', state: 'active' }
	];

	let selectedTrack = $state('agent-contract');

	let completedChecks = $derived(checks.filter((check) => check.state === 'complete').length);
	let completion = $derived(Math.round((completedChecks / checks.length) * 100));
</script>

<Container size="xl">
	<div class="dashboard-shell">
		<div class="dashboard-heading">
			<div class="heading-copy">
				<Badge variant="soft" color="blue">Agent contract dogfood</Badge>
				<Heading level={1}>Release readiness</Heading>
				<Text color="secondary">
					Generated from contract-backed DryUI prompts, then checked as copy-pasteable Svelte.
				</Text>
			</div>

			<div class="heading-actions">
				<Button variant="outline">Share report</Button>
				<Button>Run checks</Button>
			</div>
		</div>

		<div class="metric-grid">
			{#each metrics as metric (metric.label)}
				<Card.Root>
					<Card.Header>
						<Text color="muted" size="sm">{metric.label}</Text>
					</Card.Header>
					<Card.Content>
						<Heading level={2}>{metric.value}</Heading>
					</Card.Content>
					<Card.Footer>
						<Badge variant="soft" color={metric.tone}>{metric.trend}</Badge>
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>

		<div class="content-grid">
			<Card.Root>
				<Card.Header>
					<div class="section-heading">
						<Heading level={2}>Validation lane</Heading>
						<Badge variant="outline">{completion}% complete</Badge>
					</div>
				</Card.Header>
				<Card.Content>
					<div class="progress-stack">
						<Progress value={completion} max={100} showLabel="outside" />
						<Separator />
						<div class="check-list">
							{#each checks as check (check.id)}
								<div class="check-row" data-state={check.state}>
									<div>
										<Text weight="semibold">{check.label}</Text>
										<Text color="muted" size="sm">{check.owner}</Text>
									</div>
									<Badge variant="soft">{check.state}</Badge>
								</div>
							{/each}
						</div>
					</div>
				</Card.Content>
				<Card.Footer>
					<div class="footer-actions">
						<Button variant="outline">View logs</Button>
						<Button>Approve lane</Button>
					</div>
				</Card.Footer>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Heading level={2}>Prompt track</Heading>
				</Card.Header>
				<Card.Content>
					<div class="track-grid">
						<Button
							variant={selectedTrack === 'agent-contract' ? 'solid' : 'outline'}
							onclick={() => (selectedTrack = 'agent-contract')}
						>
							Agent contract
						</Button>
						<Button
							variant={selectedTrack === 'docs-parity' ? 'solid' : 'outline'}
							onclick={() => (selectedTrack = 'docs-parity')}
						>
							Docs parity
						</Button>
						<Button
							variant={selectedTrack === 'repair-loop' ? 'solid' : 'outline'}
							onclick={() => (selectedTrack = 'repair-loop')}
						>
							Repair loop
						</Button>
					</div>
				</Card.Content>
				<Card.Footer>
					<Text color="muted" size="sm">Selected track: {selectedTrack}</Text>
				</Card.Footer>
			</Card.Root>
		</div>
	</div>
</Container>

<style>
	.dashboard-shell {
		container-type: inline-size;
		display: grid;
		gap: var(--dry-space-6);
		padding-block: var(--dry-space-6);
	}

	.dashboard-heading,
	.section-heading,
	.footer-actions {
		display: grid;
		gap: var(--dry-space-4);
	}

	.heading-copy,
	.progress-stack,
	.check-list,
	.track-grid {
		display: grid;
		gap: var(--dry-space-3);
	}

	.heading-actions {
		display: grid;
		gap: var(--dry-space-3);
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.metric-grid,
	.content-grid {
		display: grid;
		gap: var(--dry-space-4);
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
	}

	.check-row {
		align-items: center;
		background: var(--dry-color-surface);
		border: var(--dry-border-default);
		border-radius: var(--dry-radius-md);
		display: grid;
		gap: var(--dry-space-3);
		grid-template-columns: 1fr auto;
		padding: var(--dry-space-3);
	}

	.check-row[data-state='complete'] {
		background: var(--dry-color-fill-success-weak);
	}

	@container (min-width: 44rem) {
		.dashboard-heading,
		.footer-actions {
			align-items: center;
			grid-template-columns: 1fr auto;
		}
	}
</style>
