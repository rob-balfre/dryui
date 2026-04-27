<script lang="ts">
	import {
		Avatar,
		Badge,
		Button,
		ButtonGroup,
		Card,
		Checkbox,
		DragAndDrop,
		Field,
		Input,
		Label,
		NumberInput,
		Progress,
		PromptInput,
		RichTextEditor,
		Select,
		Slider,
		Spinner,
		Text,
		Toggle
	} from '@dryui/ui';
	import {
		CirclePlus,
		ChevronRight,
		Globe,
		LockKeyhole,
		Mic,
		Paperclip,
		Search,
		ShieldCheck,
		Smile
	} from 'lucide-svelte';

	const activityLabels = [
		{ label: 'Syncing', tone: 'info' as const },
		{ label: 'Updating', tone: 'success' as const },
		{ label: 'Loading', tone: 'warning' as const }
	];

	type PageModule = {
		id: string;
		title: string;
	};

	let aboveFoldModules = $state<PageModule[]>([
		{
			id: 'hero',
			title: 'Hero statement'
		},
		{
			id: 'search-rail',
			title: 'Search rail'
		},
		{
			id: 'signal-strip',
			title: 'Signal strip'
		}
	]);

	let coreModules = $state<PageModule[]>([
		{
			id: 'feature-grid',
			title: 'Feature grid'
		},
		{
			id: 'pricing-cards',
			title: 'Pricing cards'
		},
		{
			id: 'comparison-table',
			title: 'Comparison table'
		}
	]);

	let followThroughModules = $state<PageModule[]>([
		{
			id: 'customer-quotes',
			title: 'Customer quotes'
		},
		{
			id: 'faq-stack',
			title: 'FAQ stack'
		},
		{
			id: 'closing-cta',
			title: 'Closing CTA'
		}
	]);

	let budget = $state(640);
	let gpuCount = $state(8);
	let tintWallpaper = $state(true);
	let chatPrompt = $state('');
	let searchQuery = $state('');
	let assistantPrompt = $state('');

	function getModuleList(id: string): PageModule[] {
		if (id === 'above-fold') return aboveFoldModules;
		if (id === 'core') return coreModules;
		return followThroughModules;
	}

	function setModuleList(id: string, items: PageModule[]) {
		if (id === 'above-fold') aboveFoldModules = items;
		else if (id === 'core') coreModules = items;
		else followThroughModules = items;
	}

	function moveModule(fromId: string, fromIndex: number, toId: string, toIndex: number) {
		const source = [...getModuleList(fromId)];
		const [module] = source.splice(fromIndex, 1);
		if (!module) return;
		setModuleList(fromId, source);

		const target = [...getModuleList(toId)];
		target.splice(toIndex, 0, module);
		setModuleList(toId, target);
	}

	const moduleColumns = [
		{
			id: 'above-fold',
			title: 'Above the fold',
			description: 'First impression.',
			tone: 'warning' as const
		},
		{
			id: 'core',
			title: 'Core',
			description: 'Main story.',
			tone: 'brand' as const
		},
		{
			id: 'follow-through',
			title: 'Trust and close',
			description: 'Proof and close.',
			tone: 'success' as const
		}
	] as const;
</script>

<div class="preview-root">
	<div class="preview-mosaic">
		<div class="preview-left-pair">
			<div class="preview-column">
				<Card.Root size="sm">
					<Card.Header>
						<div class="panel-copy">
							<Text as="span" weight="semibold">Payment Method</Text>
							<Text color="muted">All transactions are secure and encrypted.</Text>
						</div>
					</Card.Header>
					<Card.Content>
						<div class="panel-stack">
							<Field.Root>
								<Label for="preview-card-name">Name on Card</Label>
								<Input id="preview-card-name" value="John Doe" />
							</Field.Root>

							<div class="split-fields split-fields-card">
								<Field.Root>
									<Label for="preview-card-number">Card Number</Label>
									<Input id="preview-card-number" value="1234 5678 9012 3456" />
									<Text color="muted">Enter your 16-digit number.</Text>
								</Field.Root>
								<Field.Root>
									<Label for="preview-card-cvv">CVV</Label>
									<Input id="preview-card-cvv" value="123" />
								</Field.Root>
							</div>

							<div class="split-fields">
								<Field.Root>
									<Label for="preview-card-month">Month</Label>
									<div class="form-select">
										<Select.Root name="month">
											<Select.Trigger id="preview-card-month">
												<Select.Value placeholder="MM" />
											</Select.Trigger>
											<Select.Content>
												<Select.Item value="01">01</Select.Item>
												<Select.Item value="02">02</Select.Item>
												<Select.Item value="03">03</Select.Item>
											</Select.Content>
										</Select.Root>
									</div>
								</Field.Root>
								<Field.Root>
									<Label for="preview-card-year">Year</Label>
									<div class="form-select">
										<Select.Root name="year">
											<Select.Trigger id="preview-card-year">
												<Select.Value placeholder="YYYY" />
											</Select.Trigger>
											<Select.Content>
												<Select.Item value="2026">2026</Select.Item>
												<Select.Item value="2027">2027</Select.Item>
												<Select.Item value="2028">2028</Select.Item>
											</Select.Content>
										</Select.Root>
									</div>
								</Field.Root>
							</div>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root size="sm">
					<Card.Content>
						<div class="processing-panel">
							<Spinner size="md" />
							<div class="panel-copy panel-copy-center">
								<Text as="span" weight="semibold">Processing your request</Text>
								<Text color="muted">
									Please wait while we process your request. Do not refresh the page.
								</Text>
							</div>
							<div class="processing-progress">
								<Progress value={64} size="sm" />
							</div>
							<Button variant="secondary" size="sm">Cancel</Button>
						</div>
					</Card.Content>
				</Card.Root>

				<ButtonGroup size="sm">
					<Button variant="outline">Archive</Button>
					<Button variant="outline">Report</Button>
					<Button variant="outline">Snooze</Button>
				</ButtonGroup>
			</div>

			<div class="preview-column">
				<Card.Root size="sm">
					<Card.Content>
						<div class="empty-state">
							<div class="avatar-row">
								<div class="avatar-slot"><Avatar fallback="AM" size="sm" /></div>
								<div class="avatar-slot"><Avatar fallback="JL" size="sm" /></div>
								<div class="avatar-slot"><Avatar fallback="SR" size="sm" /></div>
							</div>
							<div class="panel-copy panel-copy-center">
								<Text as="span" weight="semibold">No Team Members</Text>
								<Text color="muted">Invite your team to collaborate on this project.</Text>
							</div>
							<Button variant="secondary" size="sm">
								<CirclePlus size={14} aria-hidden="true" />Invite Members
							</Button>
						</div>
					</Card.Content>
				</Card.Root>

				<div class="badge-strip">
					{#each activityLabels as { label, tone } (label)}
						<div class="activity-pill" data-tone={tone}>
							<Badge color={tone} size="sm">{label}</Badge>
						</div>
					{/each}
				</div>

				<div class="prompt-shell">
					<PromptInput
						bind:value={chatPrompt}
						placeholder="Send a message..."
						submitLabel="Reply"
						submitSize="sm"
					>
						{#snippet actions()}
							<Button variant="ghost" size="icon-sm" aria-label="Attach file">
								<Paperclip size={14} aria-hidden="true" />
							</Button>
							<Button variant="ghost" size="icon-sm" aria-label="Insert emoji">
								<Smile size={14} aria-hidden="true" />
							</Button>
							<Button variant="ghost" size="icon-sm" aria-label="Record voice note">
								<Mic size={14} aria-hidden="true" />
							</Button>
						{/snippet}
					</PromptInput>
				</div>

				<Card.Root size="sm">
					<Card.Content>
						<div class="panel-stack">
							<div class="panel-copy">
								<Text as="span" weight="semibold">Price Range</Text>
								<Text color="muted">Set your budget range ($200 - 800).</Text>
							</div>

							<Slider bind:value={budget} min={200} max={800} size="sm" />

							<Field.Root>
								<Label for="preview-search">Search</Label>
								<div class="search-shell">
									<Search size={16} aria-hidden="true" /><Input
										id="preview-search"
										bind:value={searchQuery}
										variant="ghost"
										placeholder="Search..."
									/><Text color="muted">12 results</Text>
								</div>
							</Field.Root>

							<Field.Root>
								<Label for="preview-url">Project URL</Label>
								<Input id="preview-url" value="https://example.com" />
							</Field.Root>

							<div class="usage-row">
								<Text color="muted">Storage</Text>
								<div class="usage-meter">
									<Progress value={52} size="sm" />
									<Text color="muted">52% used</Text>
								</div>
							</div>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root size="sm">
					<Card.Content>
						<div class="checkbox-row">
							<Checkbox id="preview-terms" checked />
							<Label for="preview-terms">
								<Text>I agree to the terms and conditions</Text>
							</Label>
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<div class="workflow-panel">
				<Card.Root size="sm">
					<Card.Content>
						<DragAndDrop.Group onMove={moveModule}>
							<div class="workflow-board">
								{#each moduleColumns as column (column.id)}
									<div class="workflow-column">
										<div class="workflow-column-header">
											<div class="workflow-column-title">
												<span class="workflow-column-dot" data-tone={column.tone}></span>
												<div class="workflow-column-copy">
													<Text as="span" weight="semibold">{column.title}</Text>
													<Text size="sm" color="muted">{column.description}</Text>
												</div>
											</div>
											<Badge color="gray" size="sm">{getModuleList(column.id).length}</Badge>
										</div>

										<DragAndDrop.Root
											items={getModuleList(column.id)}
											listId={column.id}
											aria-label={`${column.title} modules`}
											data-testid={`theme-wizard-module-column-${column.id}`}
											onReorder={(items) => setModuleList(column.id, items)}
										>
											{#each getModuleList(column.id) as module, index (module.id)}
												<DragAndDrop.Item {index}>
													<DragAndDrop.Handle {index} />
													<span class="workflow-module-title">{module.title}</span>
												</DragAndDrop.Item>
											{/each}
										</DragAndDrop.Root>
									</div>
								{/each}
							</div>
						</DragAndDrop.Group>
					</Card.Content>
				</Card.Root>
			</div>
		</div>

		<div class="preview-column preview-rail">
			<Card.Root size="sm">
				<Card.Content>
					<div class="panel-stack">
						<Field.Root>
							<Label for="preview-domain">Workspace URL</Label>
							<div class="icon-input">
								<Globe size={16} aria-hidden="true" /><Input
									id="preview-domain"
									value="https://"
									variant="ghost"
								/>
							</div>
						</Field.Root>

						<div class="status-card">
							<div class="status-card-copy">
								<Text as="span" weight="semibold">Two-factor authentication</Text>
								<Text color="muted">Verify via email or phone number.</Text>
							</div>
							<Button variant="secondary" size="sm">Enable</Button>
						</div>

						<div class="notice-row">
							<div class="notice-leading">
								<ShieldCheck size={15} aria-hidden="true" /><Text as="span" weight="medium"
									>Your profile has been verified.</Text
								>
							</div>
							<ChevronRight size={14} aria-hidden="true" />
						</div>

						<div class="panel-divider"></div>

						<div class="context-pill">
							<Paperclip size={14} aria-hidden="true" /><Text>Add context</Text>
						</div>

						<div class="assistant-composer">
							<div class="assistant-editor">
								<RichTextEditor.Root
									bind:value={assistantPrompt}
									placeholder="Ask, search, or make anything..."
								>
									<RichTextEditor.Toolbar>
										{#snippet children()}{/snippet}
									</RichTextEditor.Toolbar>
									<RichTextEditor.Content />
								</RichTextEditor.Root>
							</div>
							<div class="assistant-composer-actions">
								<Badge color="gray" size="sm">Auto</Badge>
								<span aria-hidden="true"></span>
								<Button variant="solid" size="sm">Go</Button>
							</div>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root size="sm">
				<Card.Header>
					<div class="panel-copy">
						<Text as="span" weight="semibold">Compute Environment</Text>
						<Text color="muted">Select the compute environment for your cluster.</Text>
					</div>
				</Card.Header>
				<Card.Content>
					<div class="panel-stack">
						<div class="choice-rows">
							<label class="choice-row" data-selected>
								<span class="choice-radio" data-selected aria-hidden="true"></span>
								<div class="choice-row-copy">
									<div class="choice-row-head">
										<Text as="span" weight="semibold">Kubernetes</Text>
										<Badge color="gray" size="sm">Default</Badge>
									</div>
									<Text color="muted">Run GPU workloads on a K8s configured cluster.</Text>
								</div>
							</label>
							<label class="choice-row">
								<span class="choice-radio" aria-hidden="true"></span>
								<div class="choice-row-copy">
									<div class="choice-row-head">
										<Text as="span" weight="semibold">Virtual Machine</Text>
										<Badge color="gray" size="sm">Soon</Badge>
									</div>
									<Text color="muted">Access a VM configured cluster to run workloads.</Text>
								</div>
							</label>
						</div>

						<div class="panel-divider"></div>

						<div class="row-between">
							<div class="panel-copy">
								<Text as="span" weight="semibold">Number of GPUs</Text>
								<Text color="muted">You can add more later.</Text>
							</div>
							<div class="number-shell">
								<NumberInput bind:value={gpuCount} min={1} max={16} step={1} size="sm" />
							</div>
						</div>

						<div class="panel-divider"></div>

						<div class="row-between">
							<div class="panel-copy">
								<Text as="span" weight="semibold">Wallpaper Tinting</Text>
								<Text color="muted">Allow the wallpaper to be tinted.</Text>
							</div>
							<Toggle bind:pressed={tintWallpaper} size="sm">{tintWallpaper ? 'On' : 'Off'}</Toggle>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<div class="copilot-row">
				<Button variant="secondary" size="sm">
					<LockKeyhole size={14} aria-hidden="true" />Copilot
				</Button>
			</div>
		</div>
	</div>
</div>

<style>
	.preview-root {
		display: grid;
		container-type: inline-size;
		container-name: preview-root;
	}

	.preview-mosaic {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--dry-space-4);
		align-items: start;
	}

	.preview-left-pair {
		grid-column: span 2;
		display: grid;
		grid-template-columns: subgrid;
		gap: var(--dry-space-4);
		align-items: start;
	}

	.preview-column {
		display: grid;
		gap: var(--dry-space-3);
	}

	.panel-stack,
	.processing-panel,
	.empty-state {
		display: grid;
		gap: var(--dry-space-3);
	}

	.panel-copy,
	.usage-meter {
		display: grid;
		gap: var(--dry-space-1);
	}

	.panel-copy-center,
	.processing-panel,
	.empty-state {
		justify-items: center;
		text-align: center;
	}

	.avatar-row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: 0;
		align-items: center;
		justify-content: start;
		--dry-avatar-size: 2rem;
		--dry-avatar-font-size: var(--dry-text-xs-size, 0.75rem);
	}

	.avatar-slot {
		border-radius: 9999px;
		background: var(--dry-color-bg-raised);
		box-shadow: 0 0 0 2px var(--dry-color-bg-raised);
	}

	.avatar-slot + .avatar-slot {
		margin-inline-start: calc(var(--dry-space-2) * -1);
	}

	.activity-pill {
		display: inline-grid;
		align-items: center;
	}

	.badge-strip {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		justify-content: start;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.copilot-row {
		display: grid;
		justify-items: start;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.workflow-panel {
		grid-column: span 2;
		display: grid;
		gap: var(--dry-space-3);
	}

	.workflow-column-copy {
		display: grid;
		gap: var(--dry-space-1);
	}

	.workflow-board {
		container-type: inline-size;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--dry-space-3);
	}

	.workflow-column {
		display: grid;
		grid-template-rows: auto 1fr;
		gap: var(--dry-space-2);
		padding: var(--dry-space-3);
		border-radius: var(--dry-radius-xl);
		background: color-mix(in srgb, var(--dry-color-bg-sunken) 88%, var(--dry-color-bg-overlay));
		border: 1px solid
			color-mix(in srgb, var(--dry-color-stroke-weak) 78%, var(--dry-color-bg-overlay));
		--dry-dnd-item-columns: auto minmax(0, 1fr);
		--dry-dnd-gap: var(--dry-space-2);
		--dry-dnd-item-gap: var(--dry-space-2);
		--dry-dnd-item-padding: var(--dry-space-2) var(--dry-space-3);
	}

	.workflow-column-header,
	.workflow-column-title {
		display: grid;
		align-items: start;
		gap: var(--dry-space-2);
	}

	.workflow-module-title {
		margin: 0;
		display: block;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		font-family: var(--dry-font-sans);
		color: var(--dry-color-text-strong);
		font-size: var(--dry-type-ui-body-size, var(--dry-type-small-size, var(--dry-text-base-size)));
		line-height: var(
			--dry-type-ui-body-leading,
			var(--dry-type-small-leading, var(--dry-text-base-leading))
		);
		font-weight: 500;
	}

	.workflow-column-header {
		grid-template-columns: minmax(0, 1fr) max-content;
	}

	.workflow-column-title {
		grid-template-columns: max-content minmax(0, 1fr);
	}

	.workflow-column-dot {
		display: grid;
		grid-template-columns: 0.625rem;
		grid-template-rows: 0.625rem;
		margin-top: calc(var(--dry-space-1) + 2px);
		border-radius: var(--dry-radius-full);
		background: var(--dry-color-fill-brand);
		box-shadow: 0 0 0 4px color-mix(in srgb, currentColor 12%, transparent);
	}

	.workflow-column-dot[data-tone='warning'] {
		color: var(--dry-color-fill-warning);
		background: var(--dry-color-fill-warning);
	}

	.workflow-column-dot[data-tone='brand'] {
		color: var(--dry-color-fill-brand);
		background: var(--dry-color-fill-brand);
	}

	.workflow-column-dot[data-tone='success'] {
		color: var(--dry-color-fill-success);
		background: var(--dry-color-fill-success);
	}

	.split-fields,
	.row-between,
	.usage-row {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--dry-space-3);
	}

	.split-fields {
		align-items: start;
	}

	.split-fields-card {
		grid-template-columns: minmax(0, 3fr) minmax(0, 1fr);
	}

	.status-card,
	.notice-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		gap: var(--dry-space-3);
	}

	.row-between,
	.status-card,
	.notice-row,
	.usage-row {
		align-items: center;
	}

	.number-shell {
		display: grid;
		justify-items: end;
	}

	.context-pill,
	.notice-leading {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.icon-input,
	.search-shell {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
		--dry-input-padding-x: 0;
	}

	.prompt-shell {
		display: grid;
		--dry-prompt-input-padding: var(--dry-space-2);
		--dry-prompt-input-gap: var(--dry-space-2);
		--dry-prompt-input-textarea-min-height: var(--dry-space-6);
	}

	.assistant-composer {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--dry-space-2);
	}

	.assistant-editor {
		--dry-rte-border: var(--dry-color-stroke-strong);
		--dry-rte-toolbar-bg: color-mix(
			in srgb,
			var(--dry-color-bg-overlay) 82%,
			var(--dry-color-bg-base)
		);
		--dry-rte-content-bg: var(--dry-color-bg-raised);
		--dry-rte-padding: var(--dry-space-3);
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}

	.assistant-composer-actions {
		display: grid;
		grid-template-columns: max-content 1fr max-content;
		align-items: center;
		gap: var(--dry-space-2);
		padding-inline: var(--dry-space-1);
	}

	.search-shell {
		grid-template-columns: max-content minmax(0, 1fr) max-content;
		padding: var(--dry-space-2) var(--dry-space-3);
		border: 1px solid var(--dry-form-control-border);
		border-radius: var(--dry-radius-lg);
		background: var(--dry-form-control-bg);
	}

	.icon-input {
		grid-template-columns: max-content minmax(0, 1fr);
		padding: var(--dry-space-2) var(--dry-space-3);
		border: 1px solid var(--dry-form-control-border);
		border-radius: var(--dry-radius-lg);
		background: var(--dry-form-control-bg);
	}

	.form-select {
		display: grid;
	}

	.checkbox-row {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		align-items: center;
		gap: var(--dry-space-3);
	}

	.choice-rows {
		display: grid;
		gap: var(--dry-space-2);
	}

	.choice-row {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		align-items: start;
		gap: var(--dry-space-3);
		padding: var(--dry-space-2_5) var(--dry-space-3);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		cursor: pointer;
	}

	.choice-row[data-selected] {
		border-color: var(--dry-color-stroke-selected, var(--dry-color-fill-brand));
		background: color-mix(in srgb, var(--dry-color-fill-brand) 8%, transparent);
	}

	.choice-row-copy {
		display: grid;
		gap: var(--dry-space-1);
	}

	.choice-row-head {
		display: grid;
		grid-template-columns: max-content max-content;
		align-items: center;
		gap: var(--dry-space-2);
		justify-content: start;
	}

	.choice-radio {
		display: inline-grid;
		grid-template-columns: 0.875rem;
		grid-template-rows: 0.875rem;
		place-items: center;
		border-radius: 9999px;
		border: 1.5px solid var(--dry-color-stroke-strong);
		background: transparent;
	}

	.choice-radio[data-selected] {
		border-color: var(--dry-color-fill-brand);
	}

	.choice-radio[data-selected]::after {
		content: '';
		grid-area: 1 / 1;
		place-self: stretch;
		margin: 2px;
		border-radius: 9999px;
		background: var(--dry-color-fill-brand);
	}

	.panel-divider {
		block-size: 1px;
		background: var(--dry-color-stroke-weak);
	}

	.processing-panel {
		padding-block: var(--dry-space-4);
	}

	.processing-progress {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		justify-self: stretch;
	}

	.context-pill {
		padding: var(--dry-space-2) var(--dry-space-3);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-full);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 78%, var(--dry-color-bg-base));
		justify-self: start;
	}

	.notice-row {
		padding: var(--dry-space-2) var(--dry-space-3);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 78%, var(--dry-color-bg-base));
	}

	.status-card-copy {
		display: grid;
		gap: var(--dry-space-1);
	}

	.search-shell,
	.icon-input {
		color: var(--dry-color-text-weak);
	}

	.notice-leading {
		grid-template-columns: max-content minmax(0, 1fr);
	}

	/* Outer mosaic — preview-root is the nearest container with no cards between. */
	@container preview-root (max-width: 64rem) {
		.preview-mosaic {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.preview-left-pair,
		.preview-rail {
			grid-column: 1 / -1;
		}

		.preview-rail {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			align-items: start;
		}

		.preview-rail > .copilot-row {
			grid-column: 1 / -1;
		}

		.workflow-board {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.workflow-board > .workflow-column:last-child:nth-child(odd) {
			grid-column: 1 / -1;
		}
	}

	@container preview-root (max-width: 48rem) {
		.preview-rail {
			grid-template-columns: 1fr;
		}
	}

	@container preview-root (max-width: 40rem) {
		.preview-mosaic {
			grid-template-columns: 1fr;
		}

		.preview-left-pair {
			grid-column: 1;
			grid-template-columns: 1fr;
		}

		.workflow-board {
			grid-template-columns: 1fr;
		}

		.workflow-board > .workflow-column:last-child:nth-child(odd) {
			grid-column: auto;
		}

		.workflow-panel {
			grid-column: 1;
		}
	}

	/* Card-scoped stacking: each Card.Root creates its own container,
	   so tight thresholds keep inner two-column rows side-by-side unless the
	   card itself is truly narrow. */
	@container (max-width: 22rem) {
		.row-between,
		.usage-row {
			grid-template-columns: 1fr;
		}

		.number-shell {
			justify-items: start;
		}
	}

	@container (max-width: 15rem) {
		.status-card,
		.notice-row {
			grid-template-columns: 1fr;
		}
	}
</style>
