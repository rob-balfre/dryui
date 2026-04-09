<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { Card, Checkbox, Heading, Input, Select, Text } from '@dryui/ui';
	import { componentLinkResolver } from '$lib/component-links';
	import {
		createConfiguratorState,
		type ConfigControl,
		type ConfigValue,
		type ConfigValues
	} from '$lib/configurators/types';
	import DocsCodeDisclosure from '$lib/components/DocsCodeDisclosure.svelte';
	import DocsPreviewFrame from '$lib/components/DocsPreviewFrame.svelte';

	interface Props {
		title: string;
		description: string;
		controls: readonly ConfigControl[];
		code: (values: ConfigValues) => string;
		preview: Snippet<[ConfigValues]>;
	}

	let { title, description, controls, code, preview }: Props = $props();

	let values = $state<Record<string, ConfigValue>>({});
	values = untrack(() => createConfiguratorState(controls));
	let generatedCode = $derived(code(values));

	function updateValue(key: string, value: ConfigValue) {
		values[key] = value;
	}
</script>

<div class="configurator-card">
	<Card.Root>
		<Card.Header>
			<div class="header-stack">
				<Heading level={3}>{title}</Heading>
				<Text color="secondary">{description}</Text>
			</div>
		</Card.Header>

		<Card.Content>
			<div class="configurator-grid">
				<aside class="controls-panel" aria-label={`${title} controls`}>
					<div class="controls-stack">
						{#each controls as control (control.key)}
							{#if control.type === 'boolean'}
								<div class="control-group">
									<Checkbox
										size="sm"
										bind:checked={
											() => Boolean(values[control.key]), (next) => updateValue(control.key, next)
										}
									>
										{control.label}
									</Checkbox>
									{#if control.description}
										<div class="control-description">
											<Text size="sm" color="secondary">{control.description}</Text>
										</div>
									{/if}
								</div>
							{:else}
								<div class="control-group">
									<span class="control-label">{control.label}</span>
									{#if control.description}
										<div class="control-description">
											<Text size="sm" color="secondary">{control.description}</Text>
										</div>
									{/if}

									{#if control.type === 'select'}
										<Select.Root
											bind:value={
												() => String(values[control.key]), (next) => updateValue(control.key, next)
											}
											name={control.key}
										>
											<Select.Trigger size="sm" aria-label={control.label}>
												<Select.Value />
											</Select.Trigger>
											<Select.Content>
												{#each control.options as option (option.value)}
													<Select.Item value={option.value}>{option.label}</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root>
									{:else if control.type === 'number'}
										<Input
											size="sm"
											type="number"
											min={control.min}
											max={control.max}
											step={control.step ?? 1}
											aria-label={control.label}
											bind:value={
												() => String(values[control.key]),
												(next) =>
													updateValue(
														control.key,
														Number.isNaN(typeof next === 'number' ? next : Number(next))
															? 0
															: typeof next === 'number'
																? next
																: Number(next)
													)
											}
										/>
									{:else}
										<Input
											size="sm"
											type="text"
											placeholder={control.placeholder}
											aria-label={control.label}
											bind:value={
												() => String(values[control.key]), (next) => updateValue(control.key, next)
											}
										/>
									{/if}
								</div>
							{/if}
						{/each}
					</div>
				</aside>

				<DocsPreviewFrame padding="none">
					<div class="preview-panel">
						{@render preview(values)}
					</div>
				</DocsPreviewFrame>
			</div>

			<DocsCodeDisclosure
				code={generatedCode}
				language="svelte"
				label="Show generated code"
				linkResolver={componentLinkResolver}
			/>
		</Card.Content>
	</Card.Root>
</div>

<style>
	.header-stack {
		display: grid;
		gap: var(--dry-space-2);
	}

	.configurator-grid {
		display: grid;
		grid-template-columns: minmax(16rem, 18rem) minmax(0, 1fr);
		gap: var(--dry-space-4);
		align-items: start;
		margin-bottom: var(--dry-space-4);
		container-type: inline-size;
	}

	@container (max-width: 40rem) {
		.configurator-grid {
			grid-template-columns: 1fr;
		}
	}

	.controls-stack {
		display: grid;
		gap: var(--dry-space-2);
	}

	.control-group {
		display: grid;
		gap: var(--dry-space-2);
	}

	.configurator-card {
		overflow: hidden;
	}

	.controls-panel {
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		background: var(--dry-color-bg-raised);
		padding: var(--dry-space-4);
	}

	.preview-panel {
		min-height: 17rem;
		display: grid;
		align-items: center;
		padding: var(--dry-space-6);
		background:
			radial-gradient(
				circle at top left,
				color-mix(in srgb, var(--dry-color-fill-brand) 10%, transparent),
				transparent 45%
			),
			var(--dry-color-bg-base);
	}

	.control-label {
		font-size: var(--dry-text-sm-size);
		font-weight: 600;
	}

	.control-description {
		font-size: var(--dry-text-sm-size);
		line-height: 1.5;
	}
</style>
