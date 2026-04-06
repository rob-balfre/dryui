import { describe, expect, it } from 'bun:test';

const docsHomeSource = await Bun.file('apps/docs/src/routes/+page.svelte').text();
const docsComponentsSource = await Bun.file('apps/docs/src/routes/components/+page.svelte').text();
const launcherAppHtmlSource = await Bun.file('apps/launcher/src/app.html').text();

describe('app shell regressions', () => {
	it('uses semantic links on the docs homepage instead of goto buttons', () => {
		expect(docsHomeSource).not.toContain('goto(');
		expect(docsHomeSource).toContain("withBase('/cli')");
		expect(docsHomeSource).toContain("withBase('/components')");
		expect(docsHomeSource).toContain('variant="ghost" size="md" onclick={handleRestart}');
		expect(docsHomeSource).toContain('onpromptsubmit={() => (started = true)}');
		expect(docsHomeSource).toContain(
			'variant="outline" size="md" onclick={() => pendingBranch?.select(option)}'
		);
		expect(docsHomeSource).not.toContain('<button class="prompt-send"');
		expect(docsHomeSource).not.toContain('<button class="branch-option"');
	});

	it('keeps the component index on theme tokens instead of hard-coded palette fallbacks', () => {
		expect(docsComponentsSource).toContain("Action: 'var(--dry-color-fill-brand)'");
		expect(docsComponentsSource).toContain(
			'size="md" href={withBase(`/components/${toSlug(item.name)}`)}'
		);
		expect(docsComponentsSource).not.toContain('--dry-violet-500');
		expect(docsComponentsSource).not.toContain('--dry-teal-500');
		expect(docsComponentsSource).not.toContain('--dry-amber-500');
		expect(docsComponentsSource).not.toContain('--dry-rose-500');
		expect(docsComponentsSource).not.toContain('--dry-cyan-500');
	});

	it('wires a launcher favicon into the launcher shell instead of falling back to /favicon.ico', () => {
		expect(launcherAppHtmlSource).toContain('rel="icon"');
		expect(launcherAppHtmlSource).toContain('type="image/svg+xml"');
		expect(launcherAppHtmlSource).toContain('data:image/svg+xml');
		expect(launcherAppHtmlSource).not.toContain('/favicon.ico');
	});
});
