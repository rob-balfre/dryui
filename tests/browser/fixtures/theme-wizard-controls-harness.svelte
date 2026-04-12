<script lang="ts">
	import { MegaMenu, ToggleGroup } from '../../../packages/ui/src/index.js';
	import {
		FONT_STACKS,
		setDensity,
		setFontPreset,
		setPersonality,
		setRadiusPreset,
		setTypeScale,
		wizardState
	} from '../../../packages/theme-wizard/src/index.js';

	function syncSingleToggleSelection<T extends string>(
		selection: string[],
		current: T,
		apply: (value: T) => void
	) {
		const next = selection[0];
		if (next && next !== current) {
			apply(next as T);
		}
	}
</script>

<MegaMenu.Root>
	<MegaMenu.Item>
		<MegaMenu.Trigger>Typography</MegaMenu.Trigger>
		<MegaMenu.Panel>
			<MegaMenu.Column title="Font family">
				<ToggleGroup.Root
					type="single"
					size="sm"
					bind:value={
						() => [wizardState.typography.fontPreset],
						(selection) =>
							syncSingleToggleSelection(selection, wizardState.typography.fontPreset, setFontPreset)
					}
					orientation="horizontal"
				>
					{#each Object.keys(FONT_STACKS) as name (name)}
						<ToggleGroup.Item value={name}>{name}</ToggleGroup.Item>
					{/each}
				</ToggleGroup.Root>
			</MegaMenu.Column>
			<MegaMenu.Column title="Type scale">
				<ToggleGroup.Root
					type="single"
					size="sm"
					bind:value={
						() => [wizardState.typography.scale],
						(selection) =>
							syncSingleToggleSelection(selection, wizardState.typography.scale, setTypeScale)
					}
					orientation="vertical"
				>
					{#each [['compact', 'Compact'], ['default', 'Default'], ['spacious', 'Spacious']] as const as [value, label] (value)}
						<ToggleGroup.Item {value}>{label}</ToggleGroup.Item>
					{/each}
				</ToggleGroup.Root>
			</MegaMenu.Column>
		</MegaMenu.Panel>
	</MegaMenu.Item>

	<MegaMenu.Item>
		<MegaMenu.Trigger>Shape</MegaMenu.Trigger>
		<MegaMenu.Panel>
			<MegaMenu.Column title="Style">
				<ToggleGroup.Root
					type="single"
					size="sm"
					bind:value={
						() => [wizardState.personality],
						(selection) =>
							syncSingleToggleSelection(selection, wizardState.personality, setPersonality)
					}
					orientation="vertical"
				>
					{#each [{ value: 'minimal', label: 'Minimal' }, { value: 'clean', label: 'Clean' }, { value: 'structured', label: 'Structured' }, { value: 'rich', label: 'Rich' }] as option (option.value)}
						<ToggleGroup.Item value={option.value}>{option.label}</ToggleGroup.Item>
					{/each}
				</ToggleGroup.Root>
			</MegaMenu.Column>
			<MegaMenu.Column title="Corners">
				<ToggleGroup.Root
					type="single"
					size="sm"
					bind:value={
						() => [wizardState.shape.radiusPreset],
						(selection) =>
							syncSingleToggleSelection(selection, wizardState.shape.radiusPreset, setRadiusPreset)
					}
					orientation="horizontal"
				>
					{#each [{ value: 'sharp', label: 'Sharp' }, { value: 'soft', label: 'Soft' }, { value: 'rounded', label: 'Rounded' }, { value: 'pill', label: 'Pill' }] as option (option.value)}
						<ToggleGroup.Item value={option.value}>{option.label}</ToggleGroup.Item>
					{/each}
				</ToggleGroup.Root>
			</MegaMenu.Column>
			<MegaMenu.Column title="Spacing">
				<ToggleGroup.Root
					type="single"
					size="sm"
					bind:value={
						() => [wizardState.shape.density],
						(selection) =>
							syncSingleToggleSelection(selection, wizardState.shape.density, setDensity)
					}
					orientation="vertical"
				>
					{#each [{ value: 'compact', label: 'Compact' }, { value: 'default', label: 'Default' }, { value: 'spacious', label: 'Spacious' }] as option (option.value)}
						<ToggleGroup.Item value={option.value}>{option.label}</ToggleGroup.Item>
					{/each}
				</ToggleGroup.Root>
			</MegaMenu.Column>
		</MegaMenu.Panel>
	</MegaMenu.Item>
</MegaMenu.Root>
