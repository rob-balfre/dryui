#!/usr/bin/env node

const DEFAULT_VIEWPORT = { width: 1440, height: 900 };

function usage() {
	console.log(`DryUI visual smoke check

Usage:
  node skills/dryui-build/scripts/visual-smoke.mjs <url-or-path> [options]

Options:
  --base <url>          Base URL for path targets. Default: http://localhost:5173
  --text <text>         Required body text. Repeat for multiple strings.
  --screenshot <path>   Write a PNG screenshot after checks.
  --viewport <WxH>      Browser viewport. Default: 1440x900
  --timeout <ms>        Navigation/check timeout. Default: 15000
  --help, -h            Show this help.

Examples:
  node skills/dryui-build/scripts/visual-smoke.mjs http://localhost:5174/prototype/travel-ai --text TravelAI
  node skills/dryui-build/scripts/visual-smoke.mjs /dashboard --base http://localhost:5174 --screenshot /tmp/dryui-dashboard.png

Checks are intentionally coarse. They catch common "looks done in SSR but is
visually broken" failures: non-200 routes, missing expected text, blank bodies,
horizontal overflow, giant topbars, zero-sized main/primary/window regions, and
obvious topbar/content overlap. It also checks that primary and window-like
regions have useful first-viewport visibility instead of being blank, clipped,
or pushed below the fold.`);
}

function fail(message) {
	console.error(message);
	process.exitCode = 1;
}

function parseArgs(argv) {
	const options = {
		target: null,
		base: 'http://localhost:5173',
		text: [],
		screenshot: null,
		viewport: DEFAULT_VIEWPORT,
		timeout: 15000
	};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === '--help' || arg === '-h') {
			options.help = true;
			continue;
		}
		if (arg === '--base') {
			options.base = requireValue(argv, (index += 1), arg);
			continue;
		}
		if (arg === '--text') {
			options.text.push(requireValue(argv, (index += 1), arg));
			continue;
		}
		if (arg === '--screenshot') {
			options.screenshot = requireValue(argv, (index += 1), arg);
			continue;
		}
		if (arg === '--viewport') {
			options.viewport = parseViewport(requireValue(argv, (index += 1), arg));
			continue;
		}
		if (arg === '--timeout') {
			const raw = requireValue(argv, (index += 1), arg);
			const timeout = Number(raw);
			if (!Number.isFinite(timeout) || timeout <= 0) {
				throw new Error(`Invalid --timeout value "${raw}".`);
			}
			options.timeout = timeout;
			continue;
		}
		if (arg.startsWith('--')) {
			throw new Error(`Unknown option "${arg}".`);
		}
		if (options.target) {
			throw new Error(`Unexpected extra target "${arg}".`);
		}
		options.target = arg;
	}

	return options;
}

function requireValue(argv, index, flag) {
	const value = argv[index];
	if (!value || value.startsWith('--')) throw new Error(`${flag} requires a value.`);
	return value;
}

function parseViewport(raw) {
	const match = /^(\d+)x(\d+)$/i.exec(raw);
	if (!match) throw new Error(`Invalid --viewport "${raw}". Use WIDTHxHEIGHT.`);
	return { width: Number(match[1]), height: Number(match[2]) };
}

function resolveTarget(target, base) {
	if (/^https?:\/\//i.test(target)) return target;
	return new URL(target.startsWith('/') ? target : `/${target}`, base).toString();
}

async function loadPlaywright() {
	try {
		return await import('playwright');
	} catch (error) {
		throw new Error(
			'Playwright is required for visual-smoke. Install project dependencies or add playwright to the workspace. ' +
				`Original error: ${error instanceof Error ? error.message : String(error)}`
		);
	}
}

function formatBox(box) {
	return `${Math.round(box.width)}x${Math.round(box.height)} at ${Math.round(box.left)},${Math.round(box.top)}`;
}

function rectsOverlap(a, b, tolerance = 8) {
	return (
		a.left < b.right - tolerance &&
		a.right > b.left + tolerance &&
		a.top < b.bottom - tolerance &&
		a.bottom > b.top + tolerance
	);
}

async function main() {
	let options;
	try {
		options = parseArgs(process.argv.slice(2));
	} catch (error) {
		fail(error instanceof Error ? error.message : String(error));
		usage();
		return;
	}

	if (options.help) {
		usage();
		return;
	}

	if (!options.target) {
		fail('Missing target URL or path.');
		usage();
		return;
	}

	const url = resolveTarget(options.target, options.base);
	const { chromium } = await loadPlaywright();
	const browser = await chromium.launch();
	const page = await browser.newPage({ viewport: options.viewport });
	const failures = [];
	const notes = [];

	try {
		const response = await page.goto(url, {
			waitUntil: 'networkidle',
			timeout: options.timeout
		});

		if (!response) {
			failures.push('Navigation did not produce a response.');
		} else if (!response.ok()) {
			failures.push(`Route returned HTTP ${response.status()} ${response.statusText()}.`);
		}

		const bodyText = await page
			.locator('body')
			.innerText({ timeout: options.timeout })
			.catch(() => '');
		for (const expected of options.text) {
			if (!bodyText.includes(expected)) failures.push(`Missing expected text: "${expected}".`);
		}

		const metrics = await page.evaluate(() => {
			const viewport = {
				width: document.documentElement.clientWidth,
				height: document.documentElement.clientHeight
			};

			function rectFor(element) {
				const rect = element.getBoundingClientRect();
				return {
					left: rect.left,
					top: rect.top,
					right: rect.right,
					bottom: rect.bottom,
					width: rect.width,
					height: rect.height
				};
			}

			function viewportIntersection(rect) {
				const left = Math.max(0, rect.left);
				const top = Math.max(0, rect.top);
				const right = Math.min(viewport.width, rect.right);
				const bottom = Math.min(viewport.height, rect.bottom);
				const width = Math.max(0, right - left);
				const height = Math.max(0, bottom - top);
				const area = width * height;
				const rectArea = Math.max(1, rect.width * rect.height);
				return {
					left,
					top,
					right,
					bottom,
					width,
					height,
					areaRatio: area / rectArea
				};
			}

			function isVisible(element) {
				const style = getComputedStyle(element);
				const rect = element.getBoundingClientRect();
				return (
					style.display !== 'none' &&
					style.visibility !== 'hidden' &&
					Number(style.opacity || '1') > 0.01 &&
					rect.width > 1 &&
					rect.height > 1
				);
			}

			function firstVisibleElement(selector) {
				for (const element of document.querySelectorAll(selector)) {
					if (isVisible(element)) return element;
				}
				return null;
			}

			function firstVisible(selector) {
				const element = firstVisibleElement(selector);
				return element ? rectFor(element) : null;
			}

			function regionContentFor(element) {
				const visibleDescendants = [...element.querySelectorAll('*')].filter(isVisible);
				const mediaCount = visibleDescendants.filter((descendant) =>
					descendant.matches('canvas, img, picture, svg, video')
				).length;
				return {
					textLength: (element.innerText || element.textContent || '').trim().length,
					visibleDescendantCount: visibleDescendants.length,
					mediaCount
				};
			}

			function allVisible(selector, predicate = () => true) {
				return [...document.querySelectorAll(selector)]
					.filter(isVisible)
					.filter(predicate)
					.map((element) => {
						const rect = rectFor(element);
						return {
							selector,
							rect,
							viewport: viewportIntersection(rect),
							...regionContentFor(element)
						};
					});
			}

			function isLikelyWindowSurface(element) {
				if (element.matches('canvas')) return true;
				if (element.hasAttribute('data-layout') || element.hasAttribute('data-ta')) return true;
				const className = String(element.getAttribute('class') ?? '').toLowerCase();
				const classTokens = className.split(/\s+/).filter(Boolean);
				const hasWindowSurfaceClass = classTokens.some(
					(token) =>
						token === 'window' ||
						token.endsWith('-window') ||
						token.includes('window-frame') ||
						token.includes('browser-window') ||
						token.includes('mockup-window')
				);
				return (
					hasWindowSurfaceClass && /^(main|section|article|figure|div)$/i.test(element.tagName)
				);
			}

			const body = document.body;
			const bodyRect = body ? rectFor(body) : null;
			const documentWidth = Math.max(
				document.documentElement.scrollWidth,
				body?.scrollWidth ?? 0,
				document.documentElement.clientWidth
			);
			const visibleElements = [...document.body.querySelectorAll('*')].filter(isVisible);
			const textLength = (document.body.innerText || '').trim().length;
			const headerRect = firstVisible(
				"[data-layout-area='topbar'], header, [role='banner'], [data-layout='topbar']"
			);
			const primaryElement = firstVisibleElement(
				"[data-layout-area='primary'], [data-layout*='primary']"
			);
			const primaryRect = primaryElement ? rectFor(primaryElement) : null;
			const primaryRegion = primaryElement
				? {
						rect: primaryRect,
						viewport: viewportIntersection(primaryRect),
						...regionContentFor(primaryElement)
					}
				: null;
			const windowRects = allVisible(
				"[data-layout*='window'], [data-layout*='canvas'], [data-layout*='viewport'], [data-ta*='window'], [class*='window'], canvas",
				isLikelyWindowSurface
			);
			const mainRect = firstVisible('main');

			return {
				viewport,
				bodyRect,
				documentWidth,
				visibleElementCount: visibleElements.length,
				textLength,
				headerRect,
				primaryRect,
				primaryRegion,
				mainRect,
				windowRects
			};
		});

		if (!metrics.bodyRect || metrics.bodyRect.width < 40 || metrics.bodyRect.height < 40) {
			failures.push('Body has a near-zero visual bounding box.');
		}
		if (metrics.textLength < 20 && metrics.visibleElementCount < 8) {
			failures.push(
				`Page looks blank: ${metrics.textLength} text characters and ${metrics.visibleElementCount} visible elements.`
			);
		}
		if (metrics.documentWidth > metrics.viewport.width + 4) {
			failures.push(
				`Horizontal overflow: document width ${metrics.documentWidth}px exceeds viewport ${metrics.viewport.width}px.`
			);
		}
		if (metrics.mainRect && (metrics.mainRect.width < 80 || metrics.mainRect.height < 80)) {
			failures.push(`Main region is suspiciously small: ${formatBox(metrics.mainRect)}.`);
		}
		if (
			metrics.primaryRect &&
			(metrics.primaryRect.width < 80 || metrics.primaryRect.height < 80)
		) {
			failures.push(`Primary region is suspiciously small: ${formatBox(metrics.primaryRect)}.`);
		}
		if (
			metrics.primaryRegion &&
			metrics.primaryRegion.textLength < 2 &&
			metrics.primaryRegion.visibleDescendantCount === 0 &&
			metrics.primaryRegion.mediaCount === 0
		) {
			failures.push('Primary region appears blank: no visible text, media, or child elements.');
		}
		if (metrics.primaryRegion && metrics.primaryRect) {
			const primaryViewport = metrics.primaryRegion.viewport;
			const primaryStartsBelowFold = metrics.primaryRect.top >= metrics.viewport.height - 32;
			const primaryBarelyVisible =
				metrics.primaryRect.height >= 80 &&
				metrics.primaryRect.top < metrics.viewport.height &&
				primaryViewport.height < Math.min(64, metrics.primaryRect.height * 0.2);
			if (primaryStartsBelowFold || primaryBarelyVisible) {
				failures.push(
					`Primary region has poor first-viewport visibility: ${formatBox(
						metrics.primaryRect
					)}, visible ${Math.round(primaryViewport.width)}x${Math.round(primaryViewport.height)}.`
				);
			}
		}
		if (
			metrics.headerRect &&
			metrics.headerRect.height > Math.max(180, metrics.viewport.height * 0.35)
		) {
			failures.push(`Topbar/header is too tall: ${formatBox(metrics.headerRect)}.`);
		}
		if (
			metrics.headerRect &&
			metrics.primaryRect &&
			rectsOverlap(metrics.headerRect, metrics.primaryRect)
		) {
			failures.push(
				`Topbar/header appears to overlap primary content: header ${formatBox(
					metrics.headerRect
				)}, primary ${formatBox(metrics.primaryRect)}.`
			);
		}

		const tinyWindows = metrics.windowRects.filter(
			(candidate) => candidate.rect.width < 80 || candidate.rect.height < 80
		);
		if (tinyWindows.length > 0) {
			failures.push(
				`Window/canvas-like region is suspiciously small: ${formatBox(tinyWindows[0].rect)}.`
			);
		}
		const clippedWindows = metrics.windowRects.filter((candidate) => {
			const rect = candidate.rect;
			const visible = candidate.viewport;
			const horizontallyClipped = rect.left < -4 || rect.right > metrics.viewport.width + 4;
			const startsInFirstViewport = rect.top < metrics.viewport.height - 16 && rect.bottom > 16;
			const mostlyOutsideViewport =
				startsInFirstViewport && rect.width * rect.height > 0 && visible.areaRatio < 0.55;
			return horizontallyClipped || mostlyOutsideViewport;
		});
		if (clippedWindows.length > 0) {
			const clipped = clippedWindows[0];
			failures.push(
				`Window/canvas-like region appears clipped in the first viewport: ${formatBox(
					clipped.rect
				)}, visible ${Math.round(clipped.viewport.width)}x${Math.round(clipped.viewport.height)}.`
			);
		}
		if (metrics.windowRects.length > 0) {
			notes.push(`${metrics.windowRects.length} window/canvas-like visible region(s)`);
		}

		if (options.screenshot) {
			await page.screenshot({ path: options.screenshot, fullPage: true });
			notes.push(`screenshot: ${options.screenshot}`);
		}

		if (failures.length > 0) {
			for (const failure of failures) console.error(`FAIL ${failure}`);
			process.exitCode = 1;
			return;
		}

		console.log(
			`ok visual-smoke ${url}: ${metrics.visibleElementCount} visible elements, ${metrics.textLength} body text chars${
				notes.length ? ` (${notes.join('; ')})` : ''
			}`
		);
	} finally {
		await browser.close();
	}
}

main().catch((error) => {
	fail(error instanceof Error ? error.message : String(error));
});
