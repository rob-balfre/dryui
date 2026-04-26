import { describe, test, expect } from 'bun:test';
import { reviewComponent, type ComponentDef } from './component-checker.js';
import spec from './spec.json' assert { type: 'json' };

const mockSpec = {
	components: {
		Button: {
			compound: false,
			props: {
				variant: { type: 'string', required: false },
				size: { type: 'string', required: false },
				disabled: { type: 'boolean', required: false }
			},
			cssVars: {}
		},
		Card: {
			compound: true,
			parts: {
				Root: {
					props: {
						as: { type: "'div' | 'button' | 'a'", required: false },
						variant: { type: 'string', required: false }
					}
				},
				Header: { props: {} },
				Content: { props: {} },
				Footer: { props: {} }
			},
			cssVars: {}
		},
		Alert: {
			compound: true,
			parts: {
				Root: { props: { variant: { type: 'AlertVariant', required: false } } },
				Icon: { props: {} },
				Title: { props: {} },
				Description: { props: {} },
				Close: { props: {} }
			},
			cssVars: {}
		},
		Input: {
			compound: false,
			props: {
				type: { type: 'string', required: false },
				placeholder: { type: 'string', required: false }
			},
			cssVars: {}
		},
		Avatar: {
			compound: false,
			props: {
				src: { type: 'string', required: true },
				alt: { type: 'string', required: false },
				fallback: { type: 'string', required: false }
			},
			cssVars: {}
		},
		Container: { compound: false, props: {}, cssVars: {} },
		Separator: { compound: false, props: {}, cssVars: {} },
		Field: {
			compound: true,
			parts: { Root: { props: {} } },
			cssVars: {}
		},
		Label: { compound: false, props: {}, cssVars: {} },
		Tabs: {
			compound: true,
			parts: {
				Root: { props: { value: { type: 'string', required: false } } },
				List: { props: {} },
				Trigger: { props: { value: { type: 'string', required: true } } },
				Content: { props: { value: { type: 'string', required: true } } }
			},
			cssVars: {}
		},
		Dialog: {
			compound: false,
			props: {
				children: { type: 'Snippet', required: true },
				title: { type: 'string', required: true }
			},
			cssVars: {}
		},
		Combobox: {
			compound: true,
			parts: {
				Root: { props: { value: { type: 'string', required: false } } },
				Input: { props: { placeholder: { type: 'string', required: false } } },
				Content: { props: {} },
				Item: {
					props: {
						value: { type: 'string', required: true },
						index: { type: 'number', required: true }
					}
				},
				Empty: { props: {} }
			},
			cssVars: {}
		},
		Typography: {
			compound: true,
			parts: {
				Heading: {
					props: {
						level: { type: '1 | 2 | 3 | 4 | 5 | 6', required: false }
					}
				},
				Text: {
					props: {
						color: { type: `'default' | 'muted' | 'secondary'`, required: false },
						size: { type: `'sm' | 'md' | 'lg'`, required: false }
					}
				},
				Code: { props: {} },
				Blockquote: { props: {} }
			},
			cssVars: {}
		}
	}
} satisfies { components: Record<string, ComponentDef> };

describe('Spec Compliance (errors)', () => {
	test('flags bare compound component as error', () => {
		const code = `<script>
  import { Card } from '@dryui/ui';
</script>
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Content><p>Body</p></Card.Content>
</Card>`;
		const result = reviewComponent(code, mockSpec);
		expect(
			result.issues.some(
				(i) =>
					i.severity === 'error' && i.message.includes('<Card>') && i.message.includes('compound')
			)
		).toBe(true);
	});

	test('flags bare namespaced component as error with part guidance', () => {
		const code = `<script>
  import { Typography } from '@dryui/ui';
</script>
<Typography />`;
		const result = reviewComponent(code, mockSpec);
		expect(
			result.issues.some(
				(i) =>
					i.severity === 'error' &&
					i.message.includes('namespaced component') &&
					i.message.includes('Typography.Heading')
			)
		).toBe(true);
	});

	test('flags unknown DryUI component', () => {
		const code = `<script>
  import { Foobar } from '@dryui/ui';
</script>
<Foobar>content</Foobar>`;
		const result = reviewComponent(code, mockSpec);
		expect(
			result.issues.some(
				(i) =>
					i.severity === 'error' &&
					i.message.includes('Foobar') &&
					i.message.includes('not a known')
			)
		).toBe(true);
	});

	test('flags invalid part name', () => {
		const code = `<script>
  import { Card } from '@dryui/ui';
</script>
<Card.Root>
  <Card.Body>content</Card.Body>
</Card.Root>`;
		const result = reviewComponent(code, mockSpec);
		expect(
			result.issues.some(
				(i) =>
					i.severity === 'error' &&
					i.message.includes('Body') &&
					i.message.includes('not a valid part')
			)
		).toBe(true);
	});

	test('does not flag HTML global attributes as invalid props', () => {
		const code = `<script>
  import { Button } from '@dryui/ui';
</script>
<Button class="primary" id="btn" onclick={handler} aria-label="Save" data-testid="save">Save</Button>`;
		const result = reviewComponent(code, mockSpec);
		expect(result.issues.filter((i) => i.severity === 'error').length).toBe(0);
	});

	test('flags missing required prop', () => {
		const code = `<script>
  import { Avatar } from '@dryui/ui';
</script>
<Avatar fallback="JD" />`;
		const result = reviewComponent(code, mockSpec);
		expect(
			result.issues.some(
				(i) => i.severity === 'error' && i.message.includes('src') && i.message.includes('required')
			)
		).toBe(true);
	});

	test('accepts Svelte shorthand for required props', () => {
		const code = `<script>
  import { Avatar } from '@dryui/ui';
  const src = '/avatar.png';
</script>
<Avatar {src} fallback="JD" />`;
		const result = reviewComponent(code, mockSpec);
		expect(result.issues.some((i) => i.code === 'missing-required-prop')).toBe(false);
	});

	test('spread suppresses missing required prop check', () => {
		const code = `<script>
  import { Avatar } from '@dryui/ui';
</script>
<Avatar {...props} />`;
		const result = reviewComponent(code, mockSpec);
		expect(result.issues.filter((i) => i.message.includes('required')).length).toBe(0);
	});

	test('flags missing required prop on compound part', () => {
		const code = `<script>
  import { Tabs } from '@dryui/ui';
</script>
<Tabs.Root>
  <Tabs.List>
    <Tabs.Trigger>Tab 1</Tabs.Trigger>
  </Tabs.List>
</Tabs.Root>`;
		const result = reviewComponent(code, mockSpec);
		expect(
			result.issues.some(
				(i) =>
					i.severity === 'error' && i.message.includes('value') && i.message.includes('required')
			)
		).toBe(true);
	});

	test('does not flag missing children on non-self-closing tag', () => {
		const code = `<script>
  import { Dialog } from '@dryui/ui';
</script>
<Dialog title="Confirm">Are you sure?</Dialog>`;
		const result = reviewComponent(code, mockSpec);
		expect(
			result.issues.some(
				(i) =>
					i.severity === 'error' && i.message.includes('children') && i.message.includes('required')
			)
		).toBe(false);
	});

	test('flags missing children on self-closing tag', () => {
		const code = `<script>
  import { Dialog } from '@dryui/ui';
</script>
<Dialog title="Confirm" />`;
		const result = reviewComponent(code, mockSpec);
		expect(
			result.issues.some(
				(i) =>
					i.severity === 'error' && i.message.includes('children') && i.message.includes('required')
			)
		).toBe(true);
	});
});

describe('Structural (errors)', () => {
	test('reports template issue lines after multiline scripts', () => {
		const code = `<script>
  import { Foobar } from '@dryui/ui';
  const copy = [
    'one',
    'two',
    'three',
    'four'
  ].join('\\n');
</script>
<Foobar>content</Foobar>`;
		const result = reviewComponent(code, mockSpec);
		const issue = result.issues.find((i) => i.code === 'unknown-component');
		expect(issue?.line).toBe(10);
	});

	test('accepts BorderBeam from the generated spec', () => {
		const code = `<script>
  import { BorderBeam } from '@dryui/ui';
</script>
<BorderBeam size="sm" colorVariant="colorful" borderRadius={8}>Content</BorderBeam>`;
		const result = reviewComponent(code, spec);
		expect(result.issues.some((i) => i.code === 'unknown-component')).toBe(false);
	});

	test('flags orphaned compound part', () => {
		const code = `<script>
  import { Card } from '@dryui/ui';
</script>
<Card.Header>Title</Card.Header>`;
		const result = reviewComponent(code, mockSpec);
		expect(
			result.issues.some(
				(i) =>
					i.severity === 'error' &&
					i.message.includes('Card.Header') &&
					i.message.includes('without')
			)
		).toBe(true);
	});

	test('does not flag rootless namespace parts as orphaned', () => {
		const code = `<script>
  import { Typography } from '@dryui/ui';
</script>
<Typography.Heading level={3}>Incident digest</Typography.Heading>
<Typography.Text color="muted">Last updated 12 minutes ago</Typography.Text>`;
		const result = reviewComponent(code, mockSpec);
		expect(result.issues.some((i) => i.code === 'orphaned-part')).toBe(false);
		expect(result.issues.some((i) => i.code === 'invalid-prop')).toBe(false);
	});

	test('accepts Heading display variant from generated spec', () => {
		const code = `<script>
  import { Heading, Typography } from '@dryui/ui';
</script>
<Heading level={1} variant="display">Studio overview</Heading>
<Typography.Heading level={1} variant="display">Incident digest</Typography.Heading>`;
		const result = reviewComponent(code, spec);
		expect(result.issues.some((i) => i.code === 'invalid-prop')).toBe(false);
	});

	test('flags Input without accessible label', () => {
		const code = `<script>
  import { Input } from '@dryui/ui';
</script>
<Input type="text" />`;
		const result = reviewComponent(code, mockSpec);
		expect(result.issues.some((i) => i.severity === 'error' && i.message.includes('label'))).toBe(
			true
		);
	});

	test('flags Combobox.Input without accessible label', () => {
		const code = `<script>
  import { Combobox } from '@dryui/ui';
</script>
<Combobox.Root>
  <Combobox.Input />
  <Combobox.Content>
    <Combobox.Empty>No results</Combobox.Empty>
  </Combobox.Content>
</Combobox.Root>`;
		const result = reviewComponent(code, mockSpec);
		expect(
			result.issues.some(
				(i) =>
					i.severity === 'error' &&
					i.code === 'missing-label' &&
					i.message.includes('Combobox.Input')
			)
		).toBe(true);
	});

	test('does not flag Input inside Field.Root', () => {
		const code = `<script>
  import { Field, Label, Input } from '@dryui/ui';
</script>
<Field.Root>
  <Label>Name</Label>
  <Input type="text" />
</Field.Root>`;
		const result = reviewComponent(code, mockSpec);
		expect(result.issues.filter((i) => i.message.includes('label')).length).toBe(0);
	});

	test('flags Input not wrapped in Field.Root even when Field.Root exists elsewhere', () => {
		const code = `<script>
  import { Field, Label, Input } from '@dryui/ui';
</script>
<Field.Root>
  <Label>Name</Label>
  <Input type="text" />
</Field.Root>
<Input type="email" />`;
		const result = reviewComponent(code, mockSpec);
		const labelIssues = result.issues.filter(
			(i) => i.severity === 'error' && i.message.includes('label')
		);
		expect(labelIssues.length).toBe(1);
		const firstLabelIssue = labelIssues[0];
		expect(firstLabelIssue).toBeDefined();
		if (firstLabelIssue) expect(firstLabelIssue.message).toContain('Input');
	});

	test('flags Avatar without alt or fallback', () => {
		const code = `<script>
  import { Avatar } from '@dryui/ui';
</script>
<Avatar src="/jane.png" />`;
		const result = reviewComponent(code, mockSpec);
		expect(result.issues.some((i) => i.code === 'missing-alt')).toBe(true);
	});
});

describe('Clean pass', () => {
	test('returns no issues for clean component', () => {
		const code = `<script>
  import { Card, Button } from '@dryui/ui';
</script>
<Card.Root>
  <Card.Header>Title</Card.Header>
  <Card.Content>
    <p>Body</p>
    <Button variant="solid">Action</Button>
  </Card.Content>
</Card.Root>`;
		const result = reviewComponent(code, mockSpec);
		expect(result.issues.length).toBe(0);
		expect(result.summary).toBe('No issues found');
	});

	test('includes filename in result when provided', () => {
		const code = `<Button>OK</Button>`;
		const result = reviewComponent(code, mockSpec, 'MyComponent.svelte');
		expect(result.filename).toBe('MyComponent.svelte');
	});

	test('summary counts by severity', () => {
		const code = `<script>
  import { Card } from '@dryui/ui';
</script>
<Card>
  <Card.Header>Title</Card.Header>
</Card>`;
		const result = reviewComponent(code, mockSpec);
		expect(result.summary).toMatch(/\d+ error/);
		expect(result.summary).toMatch(/0 warnings/);
	});
});

describe('Nested brace handling', () => {
	test('onclick handler with nested braces does not pollute prop extraction', () => {
		const code = `<script>
  import { Button } from '@dryui/ui';
</script>
<Button onclick={() => { doStuff(); }}>Click</Button>`;
		const result = reviewComponent(code, mockSpec);
		// Should not flag any invalid prop - onclick is a native event handler
		// and nested braces should not leak inner tokens as prop names.
		expect(result.issues.filter((i) => i.code === 'invalid-prop').length).toBe(0);
	});
});

describe('Issue code property', () => {
	test('every issue has a code property', () => {
		const code = `<script>
  import { Card, Input } from '@dryui/ui';
</script>
<Card>
  <Card.Header>Title</Card.Header>
</Card>
<Input type="text" />`;
		const result = reviewComponent(code, mockSpec);
		expect(result.issues.length).toBeGreaterThan(0);
		for (const issue of result.issues) {
			expect(typeof issue.code).toBe('string');
			expect(issue.code.length).toBeGreaterThan(0);
		}
	});

	test('bare compound has code bare-compound', () => {
		const code = `<script>
  import { Card } from '@dryui/ui';
</script>
<Card><Card.Header>T</Card.Header></Card>`;
		const result = reviewComponent(code, mockSpec);
		expect(result.issues.some((i) => i.code === 'bare-compound')).toBe(true);
	});
});
