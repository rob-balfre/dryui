<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { Field } from '../../../packages/ui/src/field/index.js';
	import { Input } from '../../../packages/ui/src/input/index.js';
	import { Label } from '../../../packages/ui/src/label/index.js';
</script>

<Field.Root>
	<Label data-testid="field-label">Username</Label>
	<Input data-testid="field-input" placeholder="Enter your username" />
</Field.Root>
