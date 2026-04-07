<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import { Badge, Container, Heading, Stepper, Text } from '@dryui/ui';
	import type { WizardController } from '../wizard-state.svelte';

	interface Props {
		controller: WizardController;
		children: Snippet;
	}

	let { controller, children }: Props = $props();

	const steps = [
		{ label: 'Layout', href: '/step-1' },
		{ label: 'Regions', href: '/step-2' },
		{ label: 'Preview', href: '/step-3' },
		{ label: 'Follow-up', href: '/follow-up' }
	] as const;

	const currentStep = $derived.by(() => {
		const index = steps.findIndex((step) => page.url.pathname.endsWith(step.href));
		return index >= 0 ? index : 0;
	});

	const statusTone = $derived(
		controller.connectionStatus === 'connected'
			? 'success'
			: controller.connectionStatus === 'connecting'
				? 'warning'
				: controller.connectionStatus === 'error'
					? 'danger'
					: 'gray'
	);

	function goToStep(index: number): void {
		const next = steps[index];
		if (!next) {
			return;
		}

		void goto(next.href);
	}
</script>

<div class="wizard-shell">
	<header class="wizard-header">
		<Container size="xl">
			<div class="wizard-header-inner">
				<div class="wizard-banner">
					<div>
						<Badge
							variant="outline"
							color={statusTone}
							pulse={controller.connectionStatus === 'connecting'}
						>
							{controller.connectionStatus}
						</Badge>
						<Heading level={1} data-wizard-title>DryUI Wizard</Heading>
						<Text as="p" size="sm" color="secondary">
							Compose a page layout, assign components, preview the result, then hand control back
							to Claude.
						</Text>
					</div>

					<div class="wizard-meta-badges">
						<Badge variant="soft" color="gray"
							>{controller.activeLayout?.name ?? 'Choose a layout'}</Badge
						>
						<Badge variant="soft" color="gray">
							{controller.sessionId ? `session ${controller.sessionId.slice(0, 8)}` : 'no session'}
						</Badge>
					</div>
				</div>

				<Stepper.Root activeStep={currentStep}>
					<Stepper.List>
						{#each steps as step, index (step.href)}
							<Stepper.Step step={index} clickable onclick={() => goToStep(index)}>
								{step.label}
							</Stepper.Step>
							{#if index < steps.length - 1}
								<Stepper.Separator step={index} />
							{/if}
						{/each}
					</Stepper.List>
				</Stepper.Root>
			</div>
		</Container>
	</header>

	<main class="wizard-content">
		<Container size="xl">
			{@render children()}
		</Container>
	</main>
</div>

<style>
	.wizard-shell {
		min-height: 100dvh;
		container-type: inline-size;
	}

	.wizard-header {
		position: sticky;
		top: 0;
		z-index: 10;
		padding: var(--dry-space-5) 0;
		backdrop-filter: blur(12px);
		background: color-mix(in srgb, var(--dry-color-surface) 88%, transparent);
		border-bottom: 1px solid var(--dry-color-border);
		box-shadow: var(--wizard-shell-shadow);
	}

	.wizard-header-inner {
		display: grid;
		gap: var(--dry-space-4);
	}

	.wizard-meta-badges {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		justify-content: end;
		gap: var(--dry-space-2);
	}

	.wizard-banner [data-wizard-title] {
		margin: var(--dry-space-1) 0 0;
		font-size: clamp(1.4rem, 3vw, 2rem);
		line-height: 1.1;
	}

	.wizard-banner {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: var(--dry-space-4);
		align-items: start;
	}

	.wizard-content {
		padding: var(--dry-space-8) 0;
	}

	@container (max-width: 767px) {
		.wizard-header {
			padding: var(--dry-space-4) 0;
		}

		.wizard-content {
			padding: var(--dry-space-4) 0;
		}

		.wizard-banner {
			grid-template-columns: 1fr;
		}
	}
</style>
