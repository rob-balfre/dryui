<script lang="ts">
	import { Button, Dialog, Input, Label } from '@dryui/ui';
	import Configurator from '$lib/components/Configurator.svelte';
	import type { ConfigControl, ConfigValues } from './types';

	const controls = [
		{
			key: 'title',
			label: 'Dialog title',
			type: 'text',
			defaultValue: 'Travel policy update',
			placeholder: 'Dialog title',
			description: 'Give the surface a clear purpose so the context is announced immediately.'
		},
		{
			key: 'includeField',
			label: 'Form field',
			type: 'boolean',
			defaultValue: true,
			description: 'Preview the shell with or without a real form field.'
		},
		{
			key: 'includeFooter',
			label: 'Footer actions',
			type: 'boolean',
			defaultValue: true,
			description: 'Confirm the layout still works when the actions collapse or disappear.'
		}
	] satisfies ConfigControl[];

	let open = $state(false);

	function getCode(values: ConfigValues) {
		const title = String(values.title);
		const fieldBlock =
			values.includeField === true
				? `\n    <Dialog.Body>\n      <div class="field-stack">\n        <Label for="policy-owner">Policy owner</Label>\n        <Input id="policy-owner" placeholder="Operations lead" />\n      </div>\n    </Dialog.Body>`
				: '';
		const footerBlock =
			values.includeFooter === true
				? `\n    <Dialog.Footer>\n      <Dialog.Close>Cancel</Dialog.Close>\n      <Button variant="solid">Publish</Button>\n    </Dialog.Footer>`
				: '';

		return `<Dialog.Root>\n  <Dialog.Trigger>\n    <Button>Edit policy</Button>\n  </Dialog.Trigger>\n  <Dialog.Overlay />\n  <Dialog.Content>\n    <Dialog.Header>${title}</Dialog.Header>${fieldBlock}${footerBlock}\n  </Dialog.Content>\n</Dialog.Root>`;
	}
</script>

<Configurator
	title="Dialog Configurator"
	description="Adjust the shell before you commit to a workflow, field count, and action layout."
	{controls}
	code={getCode}
>
	{#snippet preview(values)}
		<div class="dialog-preview">
			<Dialog.Root bind:open>
				<Dialog.Trigger>
					<Button>Edit policy</Button>
				</Dialog.Trigger>
				<Dialog.Overlay />
				<Dialog.Content>
					<Dialog.Header>{String(values.title)}</Dialog.Header>
					{#if values.includeField === true}
						<Dialog.Body>
							<div class="dialog-field">
								<Label for="dialog-preview-owner">Policy owner</Label>
								<Input id="dialog-preview-owner" placeholder="Operations lead" />
							</div>
						</Dialog.Body>
					{/if}
					{#if values.includeFooter === true}
						<Dialog.Footer>
							<Dialog.Close>Cancel</Dialog.Close>
							<Button variant="solid" onclick={() => (open = false)}>Publish</Button>
						</Dialog.Footer>
					{/if}
				</Dialog.Content>
			</Dialog.Root>
			<p>
				Keep the title specific and make sure pointer and keyboard users both have a clear close
				path.
			</p>
		</div>
	{/snippet}
</Configurator>

<style>
	.dialog-preview {
		display: grid;
		gap: var(--dry-space-2);
		justify-items: center;
	}

	.dialog-field {
		display: grid;
		gap: var(--dry-space-2);
	}

	p {
		display: grid;
		grid-template-columns: minmax(0, 34ch);
		text-align: center;
	}
</style>
