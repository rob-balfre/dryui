import { describe, test, expect } from 'bun:test';
import { reviewComponent, type ComponentDef } from './reviewer.js';
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
				Root: { props: { variant: { type: 'string', required: false } } },
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
		Stack: { compound: false, props: { gap: { type: 'string', required: false } }, cssVars: {} },
		Flex: { compound: false, props: { justify: { type: 'string', required: false } }, cssVars: {} },
		Grid: { compound: false, props: { columns: { type: 'number', required: false } }, cssVars: {} },
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

describe('Structural (warnings)', () => {
	test('flags orphaned compound part', () => {
		const code = `<script>
  import { Card } from '@dryui/ui';
</script>
<Card.Header>Title</Card.Header>`;
		const result = reviewComponent(code, mockSpec);
		expect(
			result.issues.some(
				(i) =>
					i.severity === 'warning' &&
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
		expect(result.issues.some((i) => i.severity === 'warning' && i.message.includes('label'))).toBe(
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
					i.severity === 'warning' &&
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
			(i) => i.severity === 'warning' && i.message.includes('label')
		);
		expect(labelIssues.length).toBe(1);
		const firstLabelIssue = labelIssues[0];
		expect(firstLabelIssue).toBeDefined();
		if (firstLabelIssue) expect(firstLabelIssue.message).toContain('Input');
	});
});

describe('Dogfooding Warnings', () => {
	test('does not warn on custom CSS grid layout', () => {
		const code = `<div class="grid-wrapper">content</div>
<style>
  .grid-wrapper { display: grid; grid-template-columns: 1fr 1fr; }
</style>`;
		const result = reviewComponent(code, mockSpec);
		expect(result.issues.some((i) => i.code === 'use-grid-component')).toBe(false);
	});

	test('does not warn on display:grid without space', () => {
		const code = `<div class="g">content</div>
<style>
  .g { display:grid; }
</style>`;
		const result = reviewComponent(code, mockSpec);
		expect(result.issues.some((i) => i.code === 'use-grid-component')).toBe(false);
	});

	test('warns on custom CSS flex layout', () => {
		const code = `<div class="row">content</div>
<style>
  .row { display: flex; gap: 8px; }
</style>`;
		const result = reviewComponent(code, mockSpec);
		const issue = result.issues.find((i) => i.code === 'prefer-grid-layout');
		expect(issue).toBeDefined();
		expect(issue!.severity).toBe('warning');
		expect(issue!.message).toContain('scoped CSS grid');
		expect(issue!.fix).toBe('display: grid');
	});

	test('suppresses flex warning when grid-template-columns has >3 tracks', () => {
		const code = `<div class="table">content</div>
<style>
  .table {
    display: flex;
    grid-template-columns: auto 11rem 6rem 1fr 7rem 7rem 7rem;
  }
</style>`;
		const result = reviewComponent(code, mockSpec);
		expect(result.issues.some((i) => i.code === 'prefer-grid-layout')).toBe(false);
	});

	test('suppresses flex warning when grid-template-areas is present', () => {
		const code = `<div class="layout">content</div>
<style>
  .layout {
    display: flex;
    grid-template-areas: "header header" "sidebar main";
    grid-template-columns: 200px 1fr;
  }
</style>`;
		const result = reviewComponent(code, mockSpec);
		expect(result.issues.some((i) => i.code === 'prefer-grid-layout')).toBe(false);
	});

	test('suppresses flex warning when minmax() is used in grid tracks', () => {
		const code = `<div class="grid">content</div>
<style>
  .grid {
    display: flex;
    grid-template-columns: minmax(200px, 1fr) 2fr;
  }
</style>`;
		const result = reviewComponent(code, mockSpec);
		expect(result.issues.some((i) => i.code === 'prefer-grid-layout')).toBe(false);
	});

	test('suppresses flex warning when repeat(auto-fill/auto-fit) is used', () => {
		const code = `<div class="cards">content</div>
<style>
  .cards {
    display: flex;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
</style>`;
		const result = reviewComponent(code, mockSpec);
		expect(result.issues.some((i) => i.code === 'prefer-grid-layout')).toBe(false);
	});

	test('suppresses flex warning when subgrid is used', () => {
		const code = `<div class="nested">content</div>
<style>
  .nested {
    display: flex;
    grid-template-columns: subgrid;
  }
</style>`;
		const result = reviewComponent(code, mockSpec);
		expect(result.issues.some((i) => i.code === 'prefer-grid-layout')).toBe(false);
	});

	test('still warns on flex with simple grid (2 columns)', () => {
		const code = `<div class="row">content</div>
<style>
  .row {
    display: flex;
    grid-template-columns: 1fr 1fr;
  }
</style>`;
		const result = reviewComponent(code, mockSpec);
		expect(result.issues.some((i) => i.code === 'prefer-grid-layout')).toBe(true);
	});

	test('suppresses flex warning for complex flex with wrap + order', () => {
		const code = `<div class="complex">content</div>
<style>
  .complex {
    display: flex;
    flex-wrap: wrap;
    order: 2;
  }
</style>`;
		const result = reviewComponent(code, mockSpec);
		expect(result.issues.some((i) => i.code === 'prefer-grid-layout')).toBe(false);
	});

	test('warns on class="field" custom field markup', () => {
		const code = `<div class="field">
  <label>Name</label>
  <input type="text" />
</div>`;
		const result = reviewComponent(code, mockSpec);
		const issue = result.issues.find((i) => i.code === 'use-field-component');
		expect(issue).toBeDefined();
		expect(issue!.severity).toBe('warning');
		expect(issue!.message).toContain('<Field.Root>');
	});

	test('warns on span + input manual field pairing', () => {
		const code = `<span>Email</span>
<input type="email" />`;
		const result = reviewComponent(code, mockSpec);
		const issue = result.issues.find((i) => i.code === 'use-field-component');
		expect(issue).toBeDefined();
		expect(issue!.severity).toBe('warning');
		expect(issue!.message).toContain('<Label>');
	});

	test('warns on span + select manual field pairing', () => {
		const code = `<span class="label">Country</span>
<select>
  <option>US</option>
</select>`;
		const result = reviewComponent(code, mockSpec);
		expect(result.issues.some((i) => i.code === 'use-field-component')).toBe(true);
	});

	test('warns on raw <button class=...>', () => {
		const code = `<button class="my-btn" onclick={handler}>Click</button>`;
		const result = reviewComponent(code, mockSpec);
		const issue = result.issues.find((i) => i.code === 'use-button-component');
		expect(issue).toBeDefined();
		expect(issue!.severity).toBe('warning');
		expect(issue!.message).toContain('<Button>');
	});

	test('does not warn on raw <button> without class', () => {
		const code = `<button onclick={handler}>Click</button>`;
		const result = reviewComponent(code, mockSpec);
		expect(result.issues.some((i) => i.code === 'use-button-component')).toBe(false);
	});

	test('warns on custom max-width + margin centering', () => {
		const code = `<div class="container">content</div>
<style>
  .container { max-width: 1200px; margin: 0 auto; }
</style>`;
		const result = reviewComponent(code, mockSpec);
		const issue = result.issues.find((i) => i.code === 'use-container-component');
		expect(issue).toBeDefined();
		expect(issue!.severity).toBe('warning');
		expect(issue!.message).toContain('<Container>');
	});

	test('does not warn on max-width without margin auto', () => {
		const code = `<div class="box">content</div>
<style>
  .box { max-width: 600px; }
</style>`;
		const result = reviewComponent(code, mockSpec);
		expect(result.issues.some((i) => i.code === 'use-container-component')).toBe(false);
	});

	test('no dogfooding warnings for clean component without style block', () => {
		const code = `<script>
  import { Card, Button } from '@dryui/ui';
</script>
<Card.Root>
  <Card.Content>
    <Button variant="solid">Action</Button>
  </Card.Content>
</Card.Root>`;
		const result = reviewComponent(code, mockSpec);
		const dogfoodCodes = [
			'prefer-grid-layout',
			'use-field-component',
			'use-button-component',
			'use-container-component'
		];
		expect(result.issues.filter((i) => dogfoodCodes.includes(i.code)).length).toBe(0);
	});
});

describe('Style Suggestions', () => {
	test('does not add a second flex suggestion for manual flex', () => {
		const code = `<script>
  import { Button } from '@dryui/ui';
</script>
<div class="row"><Button>A</Button></div>
<style>
  .row { display: flex; gap: 8px; }
</style>`;
		const result = reviewComponent(code, mockSpec);
		expect(result.issues.some((i) => i.severity === 'suggestion' && i.message.includes('flex'))).toBe(
			false
		);
	});

	test('suggests Separator for raw hr', () => {
		const code = `<script>
  import { Button } from '@dryui/ui';
</script>
<Button>Above</Button>
<hr />
<Button>Below</Button>`;
		const result = reviewComponent(code, mockSpec);
		expect(
			result.issues.some((i) => i.severity === 'suggestion' && i.message.includes('Separator'))
		).toBe(true);
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
</Card>
<hr />`;
		const result = reviewComponent(code, mockSpec);
		expect(result.summary).toMatch(/\d+ error/);
		expect(result.summary).toMatch(/\d+ suggestion/);
	});
});

describe('Custom theme override detection', () => {
	test('suggests diagnose for --dry-* overrides in style block', () => {
		const code = `<script>
  import { Card } from '@dryui/ui';
  import '@dryui/ui/themes/default.css';
</script>
<Card.Root><Card.Content>Hi</Card.Content></Card.Root>
<style>
  :root {
    --dry-color-primary: #ff0000;
  }
</style>`;
		const result = reviewComponent(code, mockSpec);
		expect(
			result.issues.some((i) => i.severity === 'suggestion' && i.message.includes('diagnose'))
		).toBe(true);
	});

	test('no suggestion when style has no --dry-* overrides', () => {
		const code = `<script>
  import { Card } from '@dryui/ui';
  import '@dryui/ui/themes/default.css';
</script>
<Card.Root><Card.Content>Hi</Card.Content></Card.Root>
<style>
  .custom { color: red; }
</style>`;
		const result = reviewComponent(code, mockSpec);
		expect(result.issues.some((i) => i.message.includes('diagnose'))).toBe(false);
	});

	test('no suggestion when no style block exists', () => {
		const code = `<script>
  import { Card } from '@dryui/ui';
  import '@dryui/ui/themes/default.css';
</script>
<Card.Root><Card.Content>Hi</Card.Content></Card.Root>`;
		const result = reviewComponent(code, mockSpec);
		expect(result.issues.some((i) => i.message.includes('diagnose'))).toBe(false);
	});
});

describe('Nested brace handling', () => {
	test('onclick handler with nested braces does not pollute prop extraction', () => {
		const code = `<script>
  import { Button } from '@dryui/ui';
</script>
<Button onclick={() => { doStuff(); }}>Click</Button>`;
		const result = reviewComponent(code, mockSpec);
		// Should not flag any invalid prop — onclick is a native event handler
		// and nested braces should not leak inner tokens as prop names.
		expect(result.issues.filter((i) => i.code === 'invalid-prop').length).toBe(0);
	});
});

describe('Thumbnail check (warning)', () => {
	test('warns when component has no thumbnail', () => {
		const code = `
<script>
  import { Button } from '@dryui/ui';
</script>
<Button>Click</Button>`;

		const specWithThumbnails = {
			components: {
				...mockSpec.components
			},
			thumbnails: ['Card', 'Alert']
		};

		const result = reviewComponent(code, specWithThumbnails);
		const issue = result.issues.find((i) => i.code === 'missing-thumbnail');
		expect(issue).toBeDefined();
		expect(issue!.severity).toBe('warning');
		expect(issue!.message).toContain('Button');
		expect(issue!.message).toContain('thumbnail:create');
	});

	test('no warning when component has thumbnail', () => {
		const code = `
<script>
  import { Button } from '@dryui/ui';
</script>
<Button>Click</Button>`;

		const specWithThumbnails = {
			components: {
				...mockSpec.components
			},
			thumbnails: ['Button', 'Card']
		};

		const result = reviewComponent(code, specWithThumbnails);
		const issue = result.issues.find((i) => i.code === 'missing-thumbnail');
		expect(issue).toBeUndefined();
	});

	test('no warning when thumbnails list not provided', () => {
		const code = `
<script>
  import { Button } from '@dryui/ui';
</script>
<Button>Click</Button>`;

		const result = reviewComponent(code, mockSpec);
		const issue = result.issues.find((i) => i.code === 'missing-thumbnail');
		expect(issue).toBeUndefined();
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
<Input type="text" />
<hr />`;
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
