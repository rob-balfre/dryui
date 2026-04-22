<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { ChipGroup } from '../../../packages/ui/src/chip-group/index.js';
	import { Badge } from '../../../packages/ui/src/badge/index.js';
</script>

<div data-testid="default">
	<ChipGroup.Root>
		<Badge variant="soft">Svelte</Badge>
		<Badge variant="soft">Vite</Badge>
		<Badge variant="soft">Bun</Badge>
	</ChipGroup.Root>
</div>

<div data-testid="with-label">
	<ChipGroup.Root gap="lg" justify="center">
		<ChipGroup.Label data-testid="works-with-label">WORKS WITH</ChipGroup.Label>
		<Badge variant="soft">OpenAI</Badge>
		<Badge variant="soft">Anthropic</Badge>
	</ChipGroup.Root>
</div>

<div data-testid="gap-sm">
	<ChipGroup.Root gap="sm">
		<Badge>A</Badge>
		<Badge>B</Badge>
	</ChipGroup.Root>
</div>

<div data-testid="justify-between">
	<ChipGroup.Root justify="between">
		<Badge>Left</Badge>
		<Badge>Right</Badge>
	</ChipGroup.Root>
</div>
