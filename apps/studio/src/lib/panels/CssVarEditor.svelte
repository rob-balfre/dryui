<script lang="ts">
	import { Input } from '@dryui/ui';
	import type { InspectorControl } from '../studio-data';

	interface Props {
		control: InspectorControl;
		onChange: (control: InspectorControl, value: string | boolean) => void;
	}

	let { control, onChange }: Props = $props();
</script>

<label class="field">
	<span class="field-label">{control.label}</span>
	<div class="token-inputs">
		<input
			type="color"
			value={typeof control.value === 'string' && control.value ? control.value : '#ffffff'}
			aria-label={control.label}
			oninput={(event) => onChange(control, (event.currentTarget as HTMLInputElement).value)}
		/>
		<Input
			size="sm"
			value={typeof control.value === 'string' ? control.value : ''}
			oninput={(event) => onChange(control, (event.currentTarget as HTMLInputElement).value)}
		/>
	</div>
</label>

<style>
	.field {
		display: grid;
		gap: var(--dry-space-2);
	}

	.field-label {
		font-size: var(--dry-text-sm-size);
		font-weight: 650;
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
