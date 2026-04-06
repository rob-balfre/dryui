import { expect, test } from '@playwright/test';
import { docsVisualRoutes, openDocsRoute } from './docs-visual.helpers';
test.use({ viewport: { width: 1270, height: 765 } });

for (const route of docsVisualRoutes.filter((route) => route.kind === 'component')) {
	test(`layout ${route.name}`, async ({ page }) => {
		const response = await openDocsRoute(page, route.path);
		expect(response?.ok(), `expected ${route.path} to return a successful response`).toBeTruthy();

		const issue = await page.evaluate(() => {
			const demo = document.querySelector<HTMLElement>('.demo-surface');
			if (!demo) {
				return { type: 'missing-demo-surface' } as const;
			}

			const nextSection = demo.nextElementSibling as HTMLElement | null;
			if (!nextSection) {
				return null;
			}

			const nextTop = nextSection.getBoundingClientRect().top;
			let lowestBottom = demo.getBoundingClientRect().bottom;
			let culprit = '.demo-surface';

			function clipRect(
				rect: { top: number; right: number; bottom: number; left: number },
				clip: { top: number; right: number; bottom: number; left: number },
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

			const elements = [demo, ...demo.querySelectorAll<HTMLElement>('*')];
			for (const element of elements) {
				const rect = element.getBoundingClientRect();
				const style = getComputedStyle(element);
				let visibleRect = {
					top: rect.top,
					right: rect.right,
					bottom: rect.bottom,
					left: rect.left
				};

				if (style.position !== 'fixed') {
					let ancestor: Element | null = element.parentElement;
					while (ancestor) {
						if (ancestor instanceof HTMLElement) {
							const ancestorStyle = getComputedStyle(ancestor);
							const clipsX = ancestorStyle.overflowX !== 'visible';
							const clipsY = ancestorStyle.overflowY !== 'visible';

							if (clipsX || clipsY) {
								const ancestorRect = ancestor.getBoundingClientRect();
								visibleRect = clipRect(visibleRect, ancestorRect, clipsX, clipsY);
							}
						}

						if (ancestor === demo) break;
						ancestor = ancestor.parentElement;
					}
				}

				visibleRect = clipRect(
					visibleRect,
					{ top: 0, right: window.innerWidth, bottom: window.innerHeight, left: 0 },
					true,
					true
				);

				const isVisible =
					style.display !== 'none' &&
					style.visibility !== 'hidden' &&
					visibleRect.right > visibleRect.left &&
					visibleRect.bottom > visibleRect.top;

				if (!isVisible) continue;

				if (visibleRect.bottom > lowestBottom) {
					lowestBottom = visibleRect.bottom;
					const rawClassName =
						typeof element.className === 'string'
							? element.className
							: (element.getAttribute('class') ?? '');
					const className = rawClassName.trim().replace(/\s+/g, '.');
					const id = element.id ? `#${element.id}` : '';
					const classes = className ? `.${className}` : '';
					culprit = `${element.tagName.toLowerCase()}${id}${classes}`;
				}
			}

			const overlap = lowestBottom - nextTop;
			if (overlap <= 8) {
				return null;
			}

			return {
				type: 'overlap',
				overlap,
				culprit,
				lowestBottom,
				nextTop
			} as const;
		});

		expect(issue, issue ? `${route.path} overlaps the next section` : undefined).toBeNull();
	});
}
