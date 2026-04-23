import { flushSync } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Feedback } from '../../packages/feedback/src/index.js';
import FeedbackOverlayHarness from './fixtures/feedback-overlay-harness.svelte';
import { render } from './_harness';

type HostKind = 'command-palette' | 'popover';

afterEach(() => {
	delete document.documentElement.dataset.theme;
	document.documentElement.classList.remove('theme-auto');
});

function mountFeedback(kind: HostKind, options?: { serverUrl?: string }) {
	document.documentElement.dataset.theme = 'dark';
	render(FeedbackOverlayHarness, { kind, serverUrl: options?.serverUrl });

	const drawButton = document.querySelector<HTMLButtonElement>('[aria-label="Draw"]');
	if (!drawButton) {
		throw new Error(`Expected feedback toolbar for ${kind}`);
	}

	drawButton.click();
	flushSync();

	const root = document.querySelector<HTMLElement>('[data-dryui-feedback]');
	const toolbar = document.querySelector<HTMLElement>('[role="toolbar"]');
	const canvas = document.querySelector<SVGSVGElement>('[aria-label="Feedback drawing canvas"]');

	if (!root || !toolbar || !canvas) {
		throw new Error(`Expected mounted feedback overlay for ${kind}`);
	}

	return { root, toolbar, canvas };
}

function expectNear(actual: number, expected: number, epsilon = 2) {
	expect(Math.abs(actual - expected)).toBeLessThanOrEqual(epsilon);
}

function drawStroke(canvas: SVGSVGElement) {
	canvas.dispatchEvent(
		new PointerEvent('pointerdown', { bubbles: true, clientX: 40, clientY: 40, pointerId: 1 })
	);
	canvas.dispatchEvent(
		new PointerEvent('pointermove', { bubbles: true, clientX: 96, clientY: 88, pointerId: 1 })
	);
	canvas.dispatchEvent(
		new PointerEvent('pointerup', { bubbles: true, clientX: 96, clientY: 88, pointerId: 1 })
	);
	flushSync();
}

function waitForAsyncWork(delay = 20) {
	return new Promise((resolve) => setTimeout(resolve, delay));
}

function canonicalTestPageUrl(): string {
	const url = new URL(window.location.href);
	url.searchParams.delete('dryui-feedback');
	url.hash = '';
	return url.toString();
}

function setupSubmissionEnvironment(options?: {
	onCapture?: () => void;
	submissionResponse?: Response;
	dispatchTargetsResponse?: Response;
}) {
	const originalMediaDevices = navigator.mediaDevices;
	const originalSetPointerCapture = (
		SVGElement.prototype as SVGElement & {
			setPointerCapture?: (pointerId: number) => void;
		}
	).setPointerCapture;
	const stopTrack = vi.fn();
	const stream = new MediaStream();
	Object.defineProperty(stream, 'getTracks', {
		configurable: true,
		value: () => [{ stop: stopTrack }]
	});

	const getDisplayMedia = vi.fn(async () => {
		options?.onCapture?.();
		return stream;
	});

	const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
		const url = input instanceof Request ? input.url : String(input);
		if (url.includes('/drawings?') && (!init?.method || init.method === 'GET')) {
			return new Response('[]', {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			});
		}
		if (url.includes('/drawings?') && init?.method === 'PUT') {
			return new Response(null, { status: 204 });
		}
		if (url.endsWith('/dispatch-targets') && (!init?.method || init.method === 'GET')) {
			return (
				options?.dispatchTargetsResponse ??
				new Response(
					JSON.stringify({
						defaultAgent: 'codex',
						configuredAgents: [
							'claude',
							'codex',
							'gemini',
							'opencode',
							'copilot',
							'copilot-vscode',
							'cursor',
							'windsurf',
							'zed'
						]
					}),
					{
						status: 200,
						headers: { 'Content-Type': 'application/json' }
					}
				)
			);
		}
		if (url.endsWith('/submissions') && init?.method === 'POST') {
			return (
				options?.submissionResponse ??
				new Response('{}', {
					status: 201,
					headers: { 'Content-Type': 'application/json' }
				})
			);
		}
		throw new Error(`Unexpected fetch: ${init?.method ?? 'GET'} ${url}`);
	});

	const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
	const getContextSpy = vi
		.spyOn(HTMLCanvasElement.prototype, 'getContext')
		.mockReturnValue({ drawImage: vi.fn() } as unknown as CanvasRenderingContext2D);
	const toDataUrlSpy = vi
		.spyOn(HTMLCanvasElement.prototype, 'toDataURL')
		.mockReturnValue('data:image/webp;base64,ZmFrZQ==');

	Object.defineProperty(navigator, 'mediaDevices', {
		configurable: true,
		value: { getDisplayMedia }
	});
	Object.defineProperty(SVGElement.prototype, 'setPointerCapture', {
		configurable: true,
		value: vi.fn()
	});

	return {
		stopTrack,
		getDisplayMedia,
		fetchSpy,
		restore() {
			if (originalMediaDevices) {
				Object.defineProperty(navigator, 'mediaDevices', {
					configurable: true,
					value: originalMediaDevices
				});
			} else {
				delete (navigator as Navigator & { mediaDevices?: unknown }).mediaDevices;
			}
			if (originalSetPointerCapture) {
				Object.defineProperty(SVGElement.prototype, 'setPointerCapture', {
					configurable: true,
					value: originalSetPointerCapture
				});
			} else {
				delete (SVGElement.prototype as SVGElement & { setPointerCapture?: unknown })
					.setPointerCapture;
			}
			playSpy.mockRestore();
			getContextSpy.mockRestore();
			toDataUrlSpy.mockRestore();
			fetchSpy.mockRestore();
		}
	};
}

describe('feedback overlay hosting', () => {
	it.each(['command-palette', 'popover'] as const)(
		'keeps the feedback overlay aligned to the viewport inside %s',
		(kind) => {
			const { root, toolbar, canvas } = mountFeedback(kind);
			const rootRect = root.getBoundingClientRect();
			const toolbarRect = toolbar.getBoundingClientRect();
			const canvasRect = canvas.getBoundingClientRect();

			expectNear(rootRect.left, 0);
			expectNear(rootRect.top, 0);
			expectNear(rootRect.width, window.innerWidth);
			expectNear(rootRect.height, window.innerHeight);
			expectNear(canvasRect.left, 0);
			expectNear(canvasRect.top, 0);
			expectNear(canvasRect.width, window.innerWidth);
			expectNear(canvasRect.height, window.innerHeight);
			expectNear(toolbarRect.right, window.innerWidth - 24);
			expectNear(toolbarRect.bottom, window.innerHeight - 24);
		}
	);

	it('hides the toolbar before capture and shows a success toast after submission', async () => {
		const env = setupSubmissionEnvironment({
			onCapture() {
				const toolbar = document.querySelector<HTMLElement>('[role="toolbar"]');
				expect(toolbar?.hasAttribute('data-hidden')).toBe(true);
			}
		});

		try {
			render(Feedback, { serverUrl: 'http://feedback.test' });

			const drawButton = document.querySelector<HTMLButtonElement>(
				'[aria-label="Draw"], [aria-label="Stop drawing"]'
			);
			if (!drawButton) throw new Error('Expected feedback draw button');

			drawButton.click();
			flushSync();

			const canvas = document.querySelector<SVGSVGElement>(
				'[aria-label="Feedback drawing canvas"]'
			);
			if (!canvas) throw new Error('Expected feedback drawing canvas');

			drawStroke(canvas);

			const submitButton = document.querySelector<HTMLButtonElement>(
				'[aria-label="Send feedback"]'
			);
			if (!submitButton) throw new Error('Expected feedback submit button');

			submitButton.click();
			await waitForAsyncWork(50);
			flushSync();

			const toolbar = document.querySelector<HTMLElement>('[role="toolbar"]');
			expect(toolbar?.hasAttribute('data-hidden')).toBe(false);
			expect(env.getDisplayMedia).toHaveBeenCalledTimes(1);
			expect(env.stopTrack).toHaveBeenCalledTimes(1);
			expect(document.body.textContent).toContain('Feedback sent');
			// Copy tracks feedback.svelte. The inline agent picker was removed in
			// `9b55ed9f Open site in feedback mode and pick agents from the dashboard`;
			// the success toast now points users at the dashboard tab.
			expect(document.body.textContent).toContain(
				'Pick which agent to launch in the dashboard tab.'
			);
			expect(
				env.fetchSpy.mock.calls.some(
					([input, init]) =>
						String(input instanceof Request ? input.url : input).endsWith('/submissions') &&
						init?.method === 'POST'
				)
			).toBe(true);
		} finally {
			env.restore();
		}
	});

	it('uses one canonical page URL for saved drawings and submitted feedback', async () => {
		const originalHref = window.location.href;
		history.pushState(null, '', '/workspace?dryui-feedback=1&tab=settings#notes');
		const expectedPageUrl = canonicalTestPageUrl();
		const env = setupSubmissionEnvironment();

		try {
			render(Feedback, { serverUrl: 'http://feedback.test' });
			await waitForAsyncWork(20);
			flushSync();

			const drawButton = document.querySelector<HTMLButtonElement>(
				'[aria-label="Draw"], [aria-label="Stop drawing"]'
			);
			if (!drawButton) throw new Error('Expected feedback draw button');
			if (drawButton.getAttribute('aria-label') === 'Draw') {
				drawButton.click();
				flushSync();
			}

			const canvas = document.querySelector<SVGSVGElement>(
				'[aria-label="Feedback drawing canvas"]'
			);
			if (!canvas) throw new Error('Expected feedback drawing canvas');
			drawStroke(canvas);

			const submitButton = document.querySelector<HTMLButtonElement>(
				'[aria-label="Send feedback"]'
			);
			if (!submitButton) throw new Error('Expected feedback submit button');
			submitButton.click();
			await waitForAsyncWork(50);
			flushSync();

			const drawingsCall = env.fetchSpy.mock.calls.find(([input, init]) => {
				const url = String(input instanceof Request ? input.url : input);
				return url.includes('/drawings?') && (!init?.method || init.method === 'GET');
			});
			expect(drawingsCall).toBeDefined();
			const drawingsRequestUrl = new URL(String(drawingsCall?.[0]));
			expect(drawingsRequestUrl.searchParams.get('url')).toBe(expectedPageUrl);

			const submissionCall = env.fetchSpy.mock.calls.find(
				([input, init]) =>
					String(input instanceof Request ? input.url : input).endsWith('/submissions') &&
					init?.method === 'POST'
			);
			expect(submissionCall).toBeDefined();
			const body = JSON.parse(String(submissionCall?.[1]?.body));
			expect(body.url).toBe(expectedPageUrl);
		} finally {
			env.restore();
			history.replaceState(null, '', originalHref);
		}
	});

	it('loads drawings again when client-side navigation changes the page key', async () => {
		const originalHref = window.location.href;
		history.pushState(null, '', '/feedback-page-one?dryui-feedback=1');
		const env = setupSubmissionEnvironment();

		try {
			render(Feedback, { serverUrl: 'http://feedback.test' });
			await waitForAsyncWork(20);
			flushSync();
			env.fetchSpy.mockClear();

			history.pushState(null, '', '/feedback-page-two?dryui-feedback=1&mode=draw#active');
			const expectedPageUrl = canonicalTestPageUrl();
			await waitForAsyncWork(20);
			flushSync();

			const drawingsCall = env.fetchSpy.mock.calls.find(([input, init]) => {
				const url = String(input instanceof Request ? input.url : input);
				return url.includes('/drawings?') && (!init?.method || init.method === 'GET');
			});
			expect(drawingsCall).toBeDefined();
			const drawingsRequestUrl = new URL(String(drawingsCall?.[0]));
			expect(drawingsRequestUrl.searchParams.get('url')).toBe(expectedPageUrl);
		} finally {
			env.restore();
			history.replaceState(null, '', originalHref);
		}
	});

	it('opens the feedback toast in the top layer above a modal host', async () => {
		const env = setupSubmissionEnvironment();

		try {
			const { canvas } = mountFeedback('command-palette', {
				serverUrl: 'http://feedback.test'
			});

			drawStroke(canvas);

			const submitButton = document.querySelector<HTMLButtonElement>(
				'[aria-label="Send feedback"]'
			);
			if (!submitButton) throw new Error('Expected feedback submit button');

			submitButton.click();
			await waitForAsyncWork(50);
			flushSync();

			const toastLayer = document.querySelector<HTMLElement>('[data-dryui-feedback-toast-layer]');
			if (!toastLayer) throw new Error('Expected feedback toast layer');

			expect(toastLayer.matches(':popover-open')).toBe(true);

			const toastRoot = toastLayer.querySelector<HTMLElement>('[data-toast-id]');
			if (!toastRoot) throw new Error('Expected feedback toast content');

			toastRoot.style.pointerEvents = 'auto';
			const rect = toastRoot.getBoundingClientRect();
			const topElement = document.elementFromPoint(
				rect.left + rect.width / 2,
				rect.top + rect.height / 2
			);
			expect(topElement instanceof Node && toastLayer.contains(topElement)).toBe(true);
		} finally {
			env.restore();
		}
	});

	it('shows an error toast when the feedback API rejects the submission', async () => {
		const env = setupSubmissionEnvironment({
			submissionResponse: new Response(JSON.stringify({ error: 'Submission rejected by API' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			})
		});

		try {
			render(Feedback, { serverUrl: 'http://feedback.test' });

			const drawButton = document.querySelector<HTMLButtonElement>('[aria-label="Draw"]');
			if (!drawButton) throw new Error('Expected feedback draw button');

			drawButton.click();
			flushSync();

			const canvas = document.querySelector<SVGSVGElement>(
				'[aria-label="Feedback drawing canvas"]'
			);
			if (!canvas) throw new Error('Expected feedback drawing canvas');

			drawStroke(canvas);

			const submitButton = document.querySelector<HTMLButtonElement>(
				'[aria-label="Send feedback"]'
			);
			if (!submitButton) throw new Error('Expected feedback submit button');

			submitButton.click();
			await waitForAsyncWork(50);
			flushSync();

			expect(document.body.textContent).toContain('Feedback failed');
			expect(document.body.textContent).toContain('Submission rejected by API');
			expect(document.querySelector('[aria-label="Sent!"]')).toBeNull();
			expect(document.querySelector('[aria-label="Send feedback"]')).not.toBeNull();
		} finally {
			env.restore();
		}
	});

	it('does not render an inline agent picker; submissions omit `agent` so the dashboard drives dispatch', async () => {
		// Removal contract: commit `9b55ed9f Open site in feedback mode and pick
		// agents from the dashboard` moved the per-submission agent selection
		// out of the overlay toolbar and onto the dashboard tab. The overlay
		// must no longer expose a dispatch-target button, and submissions must
		// not pre-bind an `agent` field.
		const env = setupSubmissionEnvironment();

		try {
			render(Feedback, { serverUrl: 'http://feedback.test' });
			await waitForAsyncWork(20);
			flushSync();

			const agentButtons = document.querySelectorAll('[aria-label^="Dispatch target:"]');
			expect(agentButtons.length).toBe(0);

			const drawButton = document.querySelector<HTMLButtonElement>('[aria-label="Draw"]');
			if (!drawButton) throw new Error('Expected feedback draw button');
			drawButton.click();
			flushSync();

			const canvas = document.querySelector<SVGSVGElement>(
				'[aria-label="Feedback drawing canvas"]'
			);
			if (!canvas) throw new Error('Expected feedback drawing canvas');
			drawStroke(canvas);

			const submitButton = document.querySelector<HTMLButtonElement>(
				'[aria-label="Send feedback"]'
			);
			if (!submitButton) throw new Error('Expected feedback submit button');

			submitButton.click();
			await waitForAsyncWork(50);
			flushSync();

			const submissionCall = env.fetchSpy.mock.calls.find(
				([input, init]) =>
					String(input instanceof Request ? input.url : input).endsWith('/submissions') &&
					init?.method === 'POST'
			);
			expect(submissionCall).toBeDefined();
			const body = JSON.parse(String(submissionCall?.[1]?.body));
			expect(body.agent).toBeUndefined();
		} finally {
			env.restore();
		}
	});
});
