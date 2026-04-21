import { expect, type Locator, type Page } from '@playwright/test';
import { allComponentNames, toSlug } from '../../apps/docs/src/lib/nav.ts';

export type DocsVisualRouteKind = 'component' | 'smoke';

export interface DocsVisualRoute {
	kind: DocsVisualRouteKind;
	name: string;
	path: string;
	selector: string;
	headingText?: string;
}

export const docsVisualRoutes: DocsVisualRoute[] = allComponentNames().map((name) => ({
	kind: 'component' as const,
	name,
	path: `/components/${toSlug(name)}`,
	selector: '.demo-surface',
	headingText: name
}));

export const docsSmokeRoutes: DocsVisualRoute[] = [
	{
		kind: 'smoke',
		name: 'Theme Wizard Preview',
		path: '/theme-wizard/preview',
		selector: '.preview-container',
		headingText: 'Preview & Export'
	},
	{
		kind: 'smoke',
		name: 'Visual Benchmark',
		path: '/view/bench/visual',
		selector: '[data-benchmark-root]',
		headingText: 'DryUI component scene'
	}
];

export async function openDocsRoute(page: Page, path: string): Promise<Response | null> {
	const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
	await forceLightTheme(page);
	await waitForFonts(page);
	await waitForHydration(page);
	return response;
}

export async function expectDocsRoute(page: Page, route: DocsVisualRoute): Promise<Locator> {
	const runtimeErrors = watchRouteErrors(page);
	const response = await openDocsRoute(page, route.path);
	expect(response?.ok(), `expected ${route.path} to return a successful response`).toBeTruthy();

	const target = page.locator(route.selector).first();
	await expect(target, `expected ${route.path} to render ${route.selector}`).toBeVisible();

	if (route.headingText) {
		await expect(
			page.getByRole('heading', { level: 1, name: route.headingText }).first()
		).toBeVisible();
	}

	if (route.kind === 'component') {
		const overflow = await findVisibleOverflow(page, '.demo-surface');
		expect(overflow, `expected ${route.path} demo content to stay inside .demo-surface`).toBeNull();
		await assertComponentHealth(page, route);
	}

	runtimeErrors.dispose();
	expect(
		runtimeErrors.messages,
		formatRuntimeErrorMessage(route.path, runtimeErrors.messages)
	).toEqual([]);
	return target;
}

export function screenshotName(route: DocsVisualRoute): string {
	return `${route.kind}-${route.path.replace(/^\//, '').replace(/[^a-zA-Z0-9]+/g, '-')}.png`;
}

async function forceLightTheme(page: Page): Promise<void> {
	await page.evaluate(() => {
		document.documentElement.classList.remove('theme-auto', 'theme-dark');
		document.documentElement.classList.add('theme-light');
	});

	await page.waitForFunction(() => document.documentElement.classList.contains('theme-light'));
}

async function waitForFonts(page: Page): Promise<void> {
	await page.waitForFunction(() => document.fonts?.status !== 'loading');
}

async function waitForHydration(page: Page): Promise<void> {
	await page.evaluate(
		() =>
			new Promise<void>((resolve) => {
				requestAnimationFrame(() => {
					requestAnimationFrame(() => resolve());
				});
			})
	);
}

function watchRouteErrors(page: Page) {
	const messages: string[] = [];
	const onPageError = (error: Error) => {
		messages.push(`pageerror: ${error.message}`);
	};
	const onConsole = (message: { type(): string; text(): string }) => {
		if (message.type() === 'error') {
			messages.push(`console.error: ${message.text()}`);
		}
	};

	page.on('pageerror', onPageError);
	page.on('console', onConsole);

	return {
		messages,
		dispose() {
			page.off('pageerror', onPageError);
			page.off('console', onConsole);
		}
	};
}

function formatRuntimeErrorMessage(path: string, messages: string[]) {
	if (messages.length === 0) return undefined;
	return `${path} logged runtime errors:\n${messages.join('\n')}`;
}

async function assertComponentHealth(page: Page, route: DocsVisualRoute): Promise<void> {
	const slug = route.path.split('/').at(-1);
	if (!slug) return;

	if (slug === 'progress') {
		const indicator = page.locator('.demo-surface [data-part="indicator"]').first();
		await expect(indicator).toBeVisible();
		const indicatorWidth = await indicator.evaluate((node) => node.getBoundingClientRect().width);
		expect(indicatorWidth, `${route.path} should render a visible progress fill`).toBeGreaterThan(
			0
		);
		return;
	}

	if (slug === 'scroll-area') {
		const scrollArea = page.locator('.demo-surface [data-scroll-area]').first();
		await expect(scrollArea).toBeVisible();

		const metrics = await scrollArea.evaluate((node) => ({
			clientHeight: node.clientHeight,
			scrollHeight: node.scrollHeight,
			scrollTop: node.scrollTop
		}));

		expect(metrics.scrollHeight, `${route.path} should render scrollable content`).toBeGreaterThan(
			metrics.clientHeight
		);
		await scrollArea.hover();
		await page.mouse.wheel(0, 320);
		await expect
			.poll(async () => scrollArea.evaluate((node) => node.scrollTop))
			.toBeGreaterThan(metrics.scrollTop);
		return;
	}

	if (slug === 'splitter') {
		const panels = page.locator('.demo-surface [data-part="panel"]');
		const root = page.locator('.demo-surface [data-part="root"]').first();

		await expect(root).toBeVisible();
		await expect(panels).toHaveCount(2);

		const beforeWidths = await panels.evaluateAll((nodes) =>
			nodes.map((node) => Math.round(node.getBoundingClientRect().width))
		);
		const heights = await panels.evaluateAll((nodes) =>
			nodes.map((node) => Math.round(node.getBoundingClientRect().height))
		);
		const templateToken = await root.getAttribute('data-template-token');

		expect(
			beforeWidths[0],
			`${route.path} left panel should occupy a meaningful width`
		).toBeGreaterThan(250);
		expect(
			beforeWidths[1],
			`${route.path} right panel should occupy a meaningful width`
		).toBeGreaterThan(250);
		expect(
			heights[0],
			`${route.path} left panel should render a meaningful preview height`
		).toBeGreaterThan(180);
		expect(
			heights[1],
			`${route.path} right panel should render a meaningful preview height`
		).toBeGreaterThan(180);
		expect(templateToken, `${route.path} should render track sizing declaratively`).toContain(
			'splitter-horizontal'
		);
	}
}

async function findVisibleOverflow(page: Page, selector: string) {
	return page.evaluate((containerSelector) => {
		const container = document.querySelector(containerSelector);
		if (!(container instanceof HTMLElement)) {
			return { reason: 'missing-container', selector: containerSelector };
		}

		const containerRect = container.getBoundingClientRect();

		function clipRect(
			rect: { top: number; right: number; bottom: number; left: number },
			clip: DOMRect,
			clipX: boolean,
			clipY: boolean
		) {
			return {
				top: clipY ? Math.max(rect.top, clip.top) : rect.top,
				right: clipX ? Math.min(rect.right, clip.right) : rect.right,
				bottom: clipY ? Math.min(rect.bottom, clip.bottom) : rect.bottom,
				left: clipX ? Math.max(rect.left, clip.left) : rect.left
			};
		}

		function getClassName(element: Element) {
			if ('className' in element) {
				const value = (element as HTMLElement | SVGElement).className;
				if (typeof value === 'string') return value;
				if (value && typeof value === 'object' && 'baseVal' in value) return value.baseVal;
			}

			return '';
		}

		let worstOverflow: {
			tag: string;
			className: string;
			amount: number;
			overflow: { top: number; right: number; bottom: number; left: number };
		} | null = null;

		for (const element of container.querySelectorAll('*')) {
			const rawRect = element.getBoundingClientRect();
			if (rawRect.width === 0 || rawRect.height === 0) continue;

			let visibleRect = {
				top: rawRect.top,
				right: rawRect.right,
				bottom: rawRect.bottom,
				left: rawRect.left
			};

			let ancestor: Element | null = element.parentElement;
			while (ancestor) {
				if (ancestor instanceof HTMLElement) {
					const style = getComputedStyle(ancestor);
					const clipsX = style.overflowX !== 'visible';
					const clipsY = style.overflowY !== 'visible';

					if (clipsX || clipsY) {
						visibleRect = clipRect(visibleRect, ancestor.getBoundingClientRect(), clipsX, clipsY);
						if (visibleRect.right <= visibleRect.left || visibleRect.bottom <= visibleRect.top) {
							break;
						}
					}
				}

				if (ancestor === container) break;
				ancestor = ancestor.parentElement;
			}

			if (visibleRect.right <= visibleRect.left || visibleRect.bottom <= visibleRect.top) continue;

			const overflow = {
				top: Math.max(0, containerRect.top - visibleRect.top),
				right: Math.max(0, visibleRect.right - containerRect.right),
				bottom: Math.max(0, visibleRect.bottom - containerRect.bottom),
				left: Math.max(0, containerRect.left - visibleRect.left)
			};

			const amount = Math.max(overflow.top, overflow.right, overflow.bottom, overflow.left);
			if (amount <= 2) continue;

			if (!worstOverflow || amount > worstOverflow.amount) {
				worstOverflow = {
					tag: element.tagName.toLowerCase(),
					className: getClassName(element),
					amount: Math.round(amount),
					overflow: {
						top: Math.round(overflow.top),
						right: Math.round(overflow.right),
						bottom: Math.round(overflow.bottom),
						left: Math.round(overflow.left)
					}
				};
			}
		}

		return worstOverflow;
	}, selector);
}
