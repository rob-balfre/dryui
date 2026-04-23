import { describe, expect, test } from 'bun:test';
import spec from '../../../packages/mcp/src/spec.json' assert { type: 'json' };
import { reviewComponent } from '../../../packages/mcp/src/reviewer.ts';

describe('reviewer typography namespace handling', () => {
	test('does not require a Root wrapper for Typography parts', () => {
		const code = `<script>
  import { Typography } from '@dryui/ui';
</script>
<Typography.Heading>Heading</Typography.Heading>`;

		const result = reviewComponent(code, spec);
		expect(result.issues.some((issue) => issue.code === 'bare-compound')).toBe(false);
		expect(result.issues.some((issue) => issue.code === 'orphaned-part')).toBe(false);
	});
});

describe('reviewer Svelte attribute handling', () => {
	test('allows Svelte CSS custom-property attributes on DryUI components', () => {
		const code = `<script>
  import { Drawer } from '@dryui/ui';
  let open = $state(false);
</script>

<Drawer.Root bind:open --dry-drawer-size="34rem">
  <Drawer.Trigger>Open</Drawer.Trigger>
  <Drawer.Content>
    <Drawer.Header>Settings</Drawer.Header>
  </Drawer.Content>
</Drawer.Root>`;

		const result = reviewComponent(code, spec);
		expect(
			result.issues.some(
				(issue) => issue.code === 'invalid-prop' && issue.message.includes('--dry-drawer-size')
			)
		).toBe(false);
		expect(
			result.issues.some(
				(issue) => issue.code === 'invalid-prop' && issue.message.includes('dry-drawer-size')
			)
		).toBe(false);
	});

	test('validates callback-style on* props against the component spec', () => {
		const code = `<script>
  import { Button, Rating } from '@dryui/ui';
</script>

<Button onValueChange={() => {}}>Save</Button>
<Rating onValueChange={(value) => value} />`;

		const result = reviewComponent(code, spec);
		const invalidOnValueChange = result.issues.filter(
			(issue) => issue.code === 'invalid-prop' && issue.message.includes('onValueChange')
		);
		expect(invalidOnValueChange).toHaveLength(1);
		expect(invalidOnValueChange[0]!.message).toContain('Button');
	});

	test('preserves native Svelte event attributes on DryUI components', () => {
		const code = `<script>
  import { Button } from '@dryui/ui';
</script>

<Button onclick={() => {}} onclickcapture={() => {}}>Save</Button>`;

		const result = reviewComponent(code, spec);
		expect(
			result.issues.some(
				(issue) =>
					issue.code === 'invalid-prop' &&
					(issue.message.includes('onclick') || issue.message.includes('onclickcapture'))
			)
		).toBe(false);
	});
});
