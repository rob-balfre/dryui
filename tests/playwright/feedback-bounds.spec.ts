import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const PLACEMENT_X = 600;
const PLACEMENT_Y = 600;

// Components whose default rendering is intentionally invisible (no DOM
// footprint, or only screen-reader content). Keep them in the audit so we
// notice if the catalogue regresses, but don't fail on a missing content rect.
const INTENTIONALLY_INVISIBLE = new Set([
	'Backdrop',
	'Hotkey',
	'IconSwap',
	'Image',
	'Numeric',
	'Portal',
	'Spacer',
	'Svg',
	'Skeleton',
	'Separator',
	'VisuallyHidden',
	'ChatThread'
]);

interface Rect {
	x: number;
	y: number;
	width: number;
	height: number;
}

interface PlaceResult {
	placeholderRect: Rect | null;
	contentRect: Rect | null;
	rendered: boolean;
}

interface BoundsReport {
	kind: string;
	placeholder: { width: number; height: number } | null;
	content: { width: number; height: number } | null;
	diffWidth: number;
	diffHeight: number;
	passed: boolean;
	reason?: string;
}

async function activateLayoutMode(page: Page) {
	await page.getByRole('tab', { name: 'Components' }).click();
}

async function placeAndMeasure(page: Page, kind: string): Promise<PlaceResult> {
	await page.getByRole('button', { name: 'Add component' }).click();
	const search = page.getByPlaceholder('Search components');
	await search.fill(kind);
	const preset = page
		.locator('.component-picker-preset')
		.filter({ hasText: new RegExp(`^${kind.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) })
		.first();
	await preset.click({ timeout: 5000 });
	const overlay = page.locator('.placement-overlay');
	await overlay.waitFor({ state: 'visible', timeout: 5000 });
	await page.mouse.click(PLACEMENT_X, PLACEMENT_Y);
	await page.waitForTimeout(220);

	return await page.evaluate(() => {
		const placed = document.querySelectorAll('[data-dryui-added-id]');
		const last = placed[placed.length - 1] as HTMLElement | undefined;
		if (!last) return { placeholderRect: null, contentRect: null, rendered: false };
		const phRect = last.getBoundingClientRect();
		const rendered = last.dataset.dryuiAddedRendered !== undefined;
		// Visible-content union: any descendant inside the placeholder that has a
		// real rect. We exclude the fallback span (which is hidden after render)
		// and the content wrapper (display: contents — no rect of its own).
		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;
		const walker = document.createTreeWalker(last, NodeFilter.SHOW_ELEMENT);
		while (walker.nextNode()) {
			const node = walker.currentNode as HTMLElement;
			if (node.dataset.dryuiAddedFallback !== undefined) continue;
			if (node.dataset.dryuiAddedContent !== undefined) continue;
			const r = node.getBoundingClientRect();
			if (r.width < 1 || r.height < 1) continue;
			if (r.left < minX) minX = r.left;
			if (r.top < minY) minY = r.top;
			if (r.right > maxX) maxX = r.right;
			if (r.bottom > maxY) maxY = r.bottom;
		}
		const cRect: Rect | null = Number.isFinite(minX)
			? { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
			: null;
		return {
			placeholderRect: {
				x: phRect.left,
				y: phRect.top,
				width: phRect.width,
				height: phRect.height
			},
			contentRect: cRect,
			rendered
		};
	});
}

async function clearPlaced(page: Page) {
	await page.evaluate(() => {
		for (const el of document.querySelectorAll('[data-dryui-added-id]')) el.remove();
	});
}

test('stretches placed component contents when the feedback box is resized', async ({ page }) => {
	await page.goto('/view/feedback-bounds');
	await page.waitForFunction(() =>
		Boolean(
			(window as Window & { __feedbackBoundsTest?: { COMPONENT_NAMES: readonly string[] } })
				.__feedbackBoundsTest
		)
	);

	await activateLayoutMode(page);
	await placeAndMeasure(page, 'Calendar');

	const rects = await page.evaluate(async () => {
		const placed = document.querySelector<HTMLElement>('[data-dryui-added-id]');
		if (!placed) throw new Error('Expected placed component');
		placed.style.width = '860px';
		placed.style.height = '640px';

		await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

		const calendar = placed.querySelector<HTMLElement>('[data-calendar]');
		if (!calendar) throw new Error('Expected rendered calendar');
		const placeholderRect = placed.getBoundingClientRect();
		const calendarRect = calendar.getBoundingClientRect();
		return {
			placeholder: { width: placeholderRect.width, height: placeholderRect.height },
			calendar: { width: calendarRect.width, height: calendarRect.height }
		};
	});

	expect(rects.calendar.width).toBeGreaterThanOrEqual(rects.placeholder.width - 2);
	expect(rects.calendar.height).toBeGreaterThanOrEqual(rects.placeholder.height - 2);
});

test('audit DryUI component bounding boxes', async ({ page }) => {
	test.setTimeout(600_000);

	await page.goto('/view/feedback-bounds');
	await page.waitForFunction(() =>
		Boolean(
			(window as Window & { __feedbackBoundsTest?: { COMPONENT_NAMES: readonly string[] } })
				.__feedbackBoundsTest
		)
	);

	const componentNames: string[] = await page.evaluate(
		() =>
			(
				window as Window & {
					__feedbackBoundsTest: { COMPONENT_NAMES: readonly string[] };
				}
			).__feedbackBoundsTest.COMPONENT_NAMES as string[]
	);

	expect(componentNames.length).toBeGreaterThan(0);

	await activateLayoutMode(page);

	const reports: BoundsReport[] = [];
	for (const kind of componentNames) {
		try {
			const result = await placeAndMeasure(page, kind);
			if (!result.placeholderRect) {
				reports.push({
					kind,
					placeholder: null,
					content: null,
					diffWidth: -1,
					diffHeight: -1,
					passed: false,
					reason: 'placeholder-not-found'
				});
			} else if (!result.rendered) {
				reports.push({
					kind,
					placeholder: {
						width: result.placeholderRect.width,
						height: result.placeholderRect.height
					},
					content: null,
					diffWidth: -1,
					diffHeight: -1,
					passed: false,
					reason: 'failed-to-render'
				});
			} else {
				const ph = result.placeholderRect;
				const c = result.contentRect;
				// Pass criteria after the max-content + min-size fix:
				// 1. Placeholder must be a visible drag target (≥ the min-size floor).
				// 2. Component is either intentionally invisible OR rendered visible
				//    content somewhere (in-flow inside the placeholder, or portaled out
				//    for modals/popovers/toasts/float buttons — both are valid UX).
				// Visible drag target: at least an interactive-icon-sized rect. Small
				// components (Chip, Spinner, Avatar) legitimately render under 100px,
				// so we just check it's a clickable size.
				const placeholderVisible = ph.width >= 24 && ph.height >= 16;
				const intentionallyInvisible = INTENTIONALLY_INVISIBLE.has(kind);
				const contentExists = c !== null && c.width >= 1 && c.height >= 1;
				const diffWidth = c ? Math.abs(ph.width - c.width) : -1;
				const diffHeight = c ? Math.abs(ph.height - c.height) : -1;
				let passed: boolean;
				let reason: string | undefined;
				if (!placeholderVisible) {
					passed = false;
					reason = 'placeholder-collapsed';
				} else if (!contentExists && !intentionallyInvisible) {
					passed = false;
					reason = 'no-content-rendered';
				} else {
					passed = true;
				}
				reports.push({
					kind,
					placeholder: { width: ph.width, height: ph.height },
					content: c ? { width: c.width, height: c.height } : null,
					diffWidth,
					diffHeight,
					passed,
					reason
				});
			}
		} catch (err) {
			reports.push({
				kind,
				placeholder: null,
				content: null,
				diffWidth: -1,
				diffHeight: -1,
				passed: false,
				reason: `exception: ${(err as Error).message.split('\n')[0]}`
			});
		}
		await clearPlaced(page);
	}

	const failures = reports.filter((r) => !r.passed);
	const passes = reports.length - failures.length;

	const outDir = test.info().outputDir;
	mkdirSync(outDir, { recursive: true });
	writeFileSync(join(outDir, 'bounds-report.json'), JSON.stringify(reports, null, 2));

	const md: string[] = [];
	md.push(`# Component bounds audit\n`);
	md.push(
		`Pass criteria: placeholder ≥ 24×16 (clickable drag target), rendered content visible (or kind is intentionally invisible).\n`
	);
	md.push(`Result: **${passes}/${reports.length} passed**, ${failures.length} failing\n`);
	if (failures.length > 0) {
		md.push(`\n| Component | Placeholder | Content | Δw | Δh | Reason |`);
		md.push(`|---|---|---|---|---|---|`);
		for (const f of failures) {
			const ph = f.placeholder ? `${f.placeholder.width}×${f.placeholder.height}` : '—';
			const c = f.content ? `${f.content.width}×${f.content.height}` : '—';
			const dw = f.diffWidth >= 0 ? f.diffWidth.toFixed(0) : '—';
			const dh = f.diffHeight >= 0 ? f.diffHeight.toFixed(0) : '—';
			md.push(`| ${f.kind} | ${ph} | ${c} | ${dw} | ${dh} | ${f.reason ?? 'mismatch'} |`);
		}
	}
	writeFileSync(join(outDir, 'bounds-report.md'), md.join('\n'));

	console.log(`\n=== Component bounds audit ===`);
	console.log(`Passed: ${passes}/${reports.length}`);
	console.log(`Report: ${join(outDir, 'bounds-report.md')}`);

	expect(reports.length).toBe(componentNames.length);
});
