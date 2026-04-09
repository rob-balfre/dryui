<script lang="ts">
	import { goto } from '$app/navigation';
	import { Alert, Badge, Button, Container, Heading, Text } from '@dryui/ui';
	import { getWizardController } from '../../../lib/wizard-context.svelte';
	import type { WizardQuestion } from '../../../lib/types';
	import FollowUpQuestionCard from '../../../lib/components/FollowUpQuestionCard.svelte';

	const controller = getWizardController();
	const question = $derived(controller.question);

	let lastAnsweredQuestion = $state<WizardQuestion | null>(null);

	function rememberSubmission(nextQuestion: WizardQuestion): void {
		lastAnsweredQuestion = nextQuestion;
	}
</script>

<svelte:head>
	<title>Wizard Follow-up - dryui</title>
</svelte:head>

<Container size="lg">
	<div class="page-stack">
		<section class="intro-section">
			<Badge variant="outline">Phase 2</Badge>
			<Heading level={2}>Follow-up question</Heading>
			<Text size="lg" color="secondary">
				Claude can keep asking for missing details while the browser stays connected.
			</Text>
		</section>

		{#if question}
			{#key question.id}
				<FollowUpQuestionCard {controller} {question} onSubmitted={rememberSubmission} />
			{/key}
		{:else}
			{#if lastAnsweredQuestion}
				<Alert.Root variant="success">
					<Alert.Description>
						Answer sent for "{lastAnsweredQuestion.prompt}". Claude can request another follow-up if
						needed.
					</Alert.Description>
				</Alert.Root>
			{/if}

			<div class="empty-state">
				<h3 class="empty-state-title">Waiting for a question</h3>
				<p class="empty-state-description">
					The browser will render the next Claude follow-up here once the server sends it.
				</p>
			</div>
		{/if}

		<div class="page-actions">
			<Button type="button" variant="outline" onclick={() => void goto('/step-3')}
				>Back to preview</Button
			>
		</div>
	</div>
</Container>

<style>
	.page-stack {
		display: grid;
		gap: var(--dry-space-8);
	}

	.intro-section {
		display: grid;
		gap: var(--dry-space-4);
	}

	.page-actions {
		display: grid;
		justify-items: start;
	}

	.empty-state {
		display: grid;
		grid-template-columns: minmax(0, 36ch);
		justify-content: center;
		justify-items: center;
		text-align: center;
		gap: var(--dry-space-4);
		padding: var(--dry-space-8);
	}

	.empty-state-title {
		font-weight: 600;
		color: var(--dry-color-text-strong);
		margin: 0;
	}

	.empty-state-description {
		color: var(--dry-color-text-weak);
		margin: 0;
	}
</style>
