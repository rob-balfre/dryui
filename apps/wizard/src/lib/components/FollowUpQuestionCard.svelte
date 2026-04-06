<script lang="ts">
	import { Alert, Button, Card, Heading, Input, Label, Text } from '@dryui/ui';
	import type { WizardQuestion, WizardQuestionOption } from '../types';
	import type { WizardController } from '../wizard-state.svelte';

	interface Props {
		controller: WizardController;
		question: WizardQuestion;
		onSubmitted?: (question: WizardQuestion) => void;
	}

	let { controller, question, onSubmitted }: Props = $props();

	let textAnswer = $state('');
	let selectedAnswer = $state('');
	let submitted = $state(false);

	function markSubmitted(): void {
		submitted = true;
		onSubmitted?.(question);
	}

	function choose(option: WizardQuestionOption): void {
		selectedAnswer = option.value;
		markSubmitted();
		controller.setQuestionAnswer(question.id, option.value);
	}

	function confirmChoice(value: boolean): void {
		markSubmitted();
		controller.setQuestionAnswer(question.id, value);
	}

	function submitText(): void {
		markSubmitted();
		controller.setQuestionAnswer(question.id, textAnswer);
	}
</script>

<Card.Root>
	<Card.Header>
		<Heading level={3}>{question.prompt}</Heading>
	</Card.Header>
	<Card.Content>
		{#if question.questionType === 'multi-choice'}
			<div class="options-stack">
				{#each question.options ?? [] as option (option.value)}
					<Button
						type="button"
						variant={selectedAnswer === option.value ? 'solid' : 'outline'}
						onclick={() => choose(option)}
					>
						<span class="choice">
							<span class="choice-title">{option.label}</span>
							{#if option.description}
								<span class="choice-description">{option.description}</span>
							{/if}
						</span>
					</Button>
				{/each}
			</div>
		{:else if question.questionType === 'confirm'}
			<div class="confirm-actions">
				<Button type="button" variant="outline" onclick={() => confirmChoice(false)}>No</Button>
				<Button type="button" variant="solid" onclick={() => confirmChoice(true)}>Yes</Button>
			</div>
		{:else}
			<div class="text-answer-stack">
				<div class="text-answer">
					<Label>
						<div class="answer-field">
							<Text as="span" size="sm" color="secondary">Your answer</Text>
							<Input
								aria-label="Follow-up answer"
								autofocus
								type="text"
								bind:value={textAnswer}
								placeholder="Type the follow-up detail"
							/>
						</div>
					</Label>
				</div>
				<Button type="button" variant="solid" onclick={submitText}>Send answer</Button>
			</div>
		{/if}
	</Card.Content>
</Card.Root>

{#if submitted}
	<Alert.Root variant="success">
		<Alert.Description
			>Answer sent. Claude can request another follow-up if needed.</Alert.Description
		>
	</Alert.Root>
{/if}

<!-- svelte-ignore css_unused_selector -->
<style>
	.options-stack {
		display: grid;
		gap: var(--dry-space-4);
	}

	.confirm-actions {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2);
	}

	.text-answer-stack {
		display: grid;
		gap: var(--dry-space-4);
	}

	.answer-field {
		display: grid;
		gap: var(--dry-space-2);
	}

	.choice {
		display: grid;
		gap: var(--dry-space-1);
		text-align: left;
	}

	.choice-title {
		font-weight: 600;
	}

	.choice-description {
		color: var(--dry-color-text-muted);
		font-size: var(--dry-text-sm-size);
	}

	.text-answer {
		display: contents;
	}
</style>
