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
