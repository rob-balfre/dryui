<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { Toggle } from '../../../packages/ui/src/toggle';
</script>

<div data-testid="toggle-harness">
	<div data-testid="medium">
		<Toggle size="md">Label</Toggle>
	</div>

	<div data-testid="small">
		<Toggle size="sm">Label</Toggle>
	</div>

	<div data-testid="selected">
		<Toggle pressed>Label</Toggle>
	</div>

	<div data-testid="disabled-off">
		<Toggle disabled>Label</Toggle>
	</div>

	<div data-testid="disabled-on">
		<Toggle disabled pressed>Label</Toggle>
	</div>
</div>
