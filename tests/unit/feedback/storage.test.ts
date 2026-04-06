import { describe, test, expect, beforeEach } from 'bun:test';

// Polyfill localStorage and window for bun test environment (no DOM)
if (typeof globalThis.localStorage === 'undefined') {
	const store: Record<string, string> = {};
	const localStorageMock = {
		getItem: (key: string) => store[key] ?? null,
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			for (const k in store) delete store[k];
		},
		get length() {
			return Object.keys(store).length;
		},
		key: (i: number) => Object.keys(store)[i] ?? null
	};
	(globalThis as unknown as Record<string, unknown>).localStorage = localStorageMock;
	(globalThis as unknown as Record<string, unknown>).window = { localStorage: localStorageMock };
}

import {
	clearDesignPlacements,
	clearDesignPlacementsForUrl,
	clearRearrangeState,
	clearRearrangeStateForUrl,
	clearSessionId,
	clearSettings,
	clearSyncMarkers,
	clearWireframeState,
	clearWireframeStateForUrl,
	getSessionStorageKey,
	loadAnnotations,
	loadDesignPlacements,
	loadDesignPlacementsForUrl,
	loadRearrangeState,
	loadRearrangeStateForUrl,
	loadSessionId,
	saveAnnotations,
	saveAnnotationsWithSyncMarker,
	saveDesignPlacements,
	saveDesignPlacementsForUrl,
	saveRearrangeState,
	saveRearrangeStateForUrl,
	saveSessionId,
	clearAnnotations,
	getStorageKey,
	loadSettings,
	saveSettings,
	loadWireframeState,
	loadWireframeStateForUrl,
	saveWireframeState,
	saveWireframeStateForUrl,
	getUnsyncedAnnotations
} from '../../../packages/feedback/src/utils/storage';
import { DEFAULT_SETTINGS } from '../../../packages/feedback/src/constants';
import type {
	Annotation,
	DesignPlacement,
	FeedbackSettings,
	RearrangeState,
	WireframeState
} from '../../../packages/feedback/src/types';

function makeAnnotation(overrides: Partial<Annotation> = {}): Annotation {
	return {
		id: 'test-1',
		x: 50,
		y: 100,
		isFixed: false,
		timestamp: Date.now(),
		element: 'button "Click"',
		elementPath: 'div > button',
		comment: 'Fix this',
		kind: 'feedback',
		color: 'brand',
		...overrides
	};
}

describe('getStorageKey', () => {
	test('prefixes pathname with dryui-feedback-', () => {
		expect(getStorageKey('/about')).toBe('dryui-feedback-/about');
	});

	test('handles root path', () => {
		expect(getStorageKey('/')).toBe('dryui-feedback-/');
	});
});

describe('saveAnnotations / loadAnnotations', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	test('round-trips annotations through localStorage', () => {
		const annotations = [makeAnnotation()];
		saveAnnotations('/test', annotations);
		const loaded = loadAnnotations('/test');
		expect(loaded).toHaveLength(1);
		expect(loaded[0].id).toBe('test-1');
		expect(loaded[0].comment).toBe('Fix this');
	});

	test('returns empty array when nothing stored', () => {
		expect(loadAnnotations('/empty')).toEqual([]);
	});

	test('filters annotations older than 7 days', () => {
		const old = makeAnnotation({
			id: 'old',
			timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000
		});
		const recent = makeAnnotation({ id: 'recent', timestamp: Date.now() });
		saveAnnotations('/test', [old, recent]);
		const loaded = loadAnnotations('/test');
		expect(loaded).toHaveLength(1);
		expect(loaded[0].id).toBe('recent');
	});

	test('tracks sync markers separately from unsynced annotations', () => {
		const annotations = [makeAnnotation(), makeAnnotation({ id: 'second' })];
		saveAnnotationsWithSyncMarker('/test', annotations, 'session-1');
		expect(getUnsyncedAnnotations('/test')).toEqual([]);
		expect(getUnsyncedAnnotations('/test', 'session-2').map((annotation) => annotation.id)).toEqual(
			['test-1', 'second']
		);
		clearSyncMarkers('/test');
		expect(getUnsyncedAnnotations('/test').map((annotation) => annotation.id)).toEqual([
			'test-1',
			'second'
		]);
	});
});

describe('clearAnnotations', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	test('removes annotations for a path', () => {
		saveAnnotations('/test', [makeAnnotation()]);
		clearAnnotations('/test');
		expect(loadAnnotations('/test')).toEqual([]);
	});
});

describe('saveSettings / loadSettings', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	test('round-trips settings', () => {
		const settings: FeedbackSettings = {
			outputDetail: 'detailed',
			autoClearAfterCopy: true,
			annotationColor: 'info',
			blockInteractions: true,
			svelteDetection: true,
			markerClickBehavior: 'edit',
			theme: 'light',
			webhookUrl: 'https://example.com/hook',
			webhooksEnabled: false
		};
		saveSettings(settings);
		expect(loadSettings()).toEqual(settings);
	});

	test('returns defaults when nothing stored', () => {
		const defaults = loadSettings();
		expect(defaults).toEqual(DEFAULT_SETTINGS);
	});

	test('clears stored settings', () => {
		saveSettings({
			outputDetail: 'standard',
			autoClearAfterCopy: false,
			annotationColor: 'brand',
			blockInteractions: true,
			svelteDetection: true,
			markerClickBehavior: 'edit',
			theme: 'dark',
			webhookUrl: '',
			webhooksEnabled: true
		});
		clearSettings();
		expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
	});
});

describe('layout mode storage', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	test('round-trips design placements', () => {
		const placements: DesignPlacement[] = [
			{
				id: 'dp-1',
				type: 'navigation',
				x: 12,
				y: 18,
				width: 900,
				height: 64,
				scrollY: 0,
				timestamp: Date.now(),
				note: 'Top navigation shell'
			}
		];

		saveDesignPlacements('/layout', placements);
		expect(loadDesignPlacements('/layout')).toEqual(placements);

		clearDesignPlacements('/layout');
		expect(loadDesignPlacements('/layout')).toEqual([]);
	});

	test('keeps design placements isolated per URL', () => {
		const urlA = 'https://example.com/a';
		const urlB = 'https://example.com/b';
		const placementA: DesignPlacement[] = [
			{
				id: 'dp-a',
				type: 'navigation',
				x: 12,
				y: 18,
				width: 900,
				height: 64,
				scrollY: 0,
				timestamp: Date.now()
			}
		];
		const placementB: DesignPlacement[] = [
			{
				id: 'dp-b',
				type: 'hero',
				x: 30,
				y: 90,
				width: 1100,
				height: 420,
				scrollY: 0,
				timestamp: Date.now()
			}
		];

		saveDesignPlacementsForUrl(urlA, placementA);
		saveDesignPlacementsForUrl(urlB, placementB);

		expect(loadDesignPlacementsForUrl(urlA)).toEqual(placementA);
		expect(loadDesignPlacementsForUrl(urlB)).toEqual(placementB);

		clearDesignPlacementsForUrl(urlA);
		expect(loadDesignPlacementsForUrl(urlA)).toEqual([]);
		expect(loadDesignPlacementsForUrl(urlB)).toEqual(placementB);
	});

	test('round-trips rearrange state', () => {
		const state: RearrangeState = {
			detectedAt: Date.now(),
			originalOrder: ['section-1'],
			sections: [
				{
					id: 'section-1',
					label: 'Hero',
					tagName: 'section',
					selector: 'main > section:nth-child(1)',
					role: null,
					className: 'hero',
					textSnippet: 'Welcome',
					originalRect: { x: 0, y: 100, width: 800, height: 300 },
					currentRect: { x: 0, y: 120, width: 800, height: 320 },
					originalIndex: 0
				}
			]
		};

		saveRearrangeState('/layout', state);
		expect(loadRearrangeState('/layout')).toEqual(state);

		clearRearrangeState('/layout');
		expect(loadRearrangeState('/layout')).toBeNull();
	});

	test('keeps rearrange state isolated per URL', () => {
		const urlA = 'https://example.com/a';
		const urlB = 'https://example.com/b';
		const stateA: RearrangeState = {
			detectedAt: Date.now(),
			originalOrder: ['section-a'],
			sections: [
				{
					id: 'section-a',
					label: 'Hero',
					tagName: 'section',
					selector: '#hero',
					role: null,
					className: null,
					textSnippet: null,
					originalRect: { x: 0, y: 0, width: 800, height: 200 },
					currentRect: { x: 0, y: 0, width: 800, height: 200 },
					originalIndex: 0
				}
			]
		};
		const stateB: RearrangeState = {
			detectedAt: Date.now(),
			originalOrder: ['section-b'],
			sections: [
				{
					id: 'section-b',
					label: 'Footer',
					tagName: 'footer',
					selector: '#footer',
					role: null,
					className: null,
					textSnippet: null,
					originalRect: { x: 0, y: 600, width: 800, height: 120 },
					currentRect: { x: 0, y: 620, width: 800, height: 120 },
					originalIndex: 1
				}
			]
		};

		saveRearrangeStateForUrl(urlA, stateA);
		saveRearrangeStateForUrl(urlB, stateB);

		expect(loadRearrangeStateForUrl(urlA)).toEqual(stateA);
		expect(loadRearrangeStateForUrl(urlB)).toEqual(stateB);

		clearRearrangeStateForUrl(urlB);
		expect(loadRearrangeStateForUrl(urlA)).toEqual(stateA);
		expect(loadRearrangeStateForUrl(urlB)).toBeNull();
	});

	test('round-trips wireframe state', () => {
		const state: WireframeState = {
			rearrange: null,
			placements: [],
			purpose: 'new-page',
			prompt: 'Sketch a new landing page'
		};

		saveWireframeState('/layout', state);
		expect(loadWireframeState('/layout')).toEqual(state);

		clearWireframeState('/layout');
		expect(loadWireframeState('/layout')).toBeNull();
	});

	test('keeps wireframe state isolated per URL', () => {
		const urlA = 'https://example.com/a';
		const urlB = 'https://example.com/b';
		const stateA: WireframeState = {
			rearrange: null,
			placements: [],
			purpose: 'replace-current',
			prompt: 'Fix the current page'
		};
		const stateB: WireframeState = {
			rearrange: null,
			placements: [],
			purpose: 'new-page',
			prompt: 'Create a new page'
		};

		saveWireframeStateForUrl(urlA, stateA);
		saveWireframeStateForUrl(urlB, stateB);

		expect(loadWireframeStateForUrl(urlA)).toEqual(stateA);
		expect(loadWireframeStateForUrl(urlB)).toEqual(stateB);

		clearWireframeStateForUrl(urlA);
		expect(loadWireframeStateForUrl(urlA)).toBeNull();
		expect(loadWireframeStateForUrl(urlB)).toEqual(stateB);
	});
});

describe('session storage', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	test('round-trips session ids', () => {
		saveSessionId('/app', 'session-123');
		expect(getSessionStorageKey('/app')).toBe('dryui-feedback-session-/app');
		expect(loadSessionId('/app')).toBe('session-123');
		clearSessionId('/app');
		expect(loadSessionId('/app')).toBeNull();
	});
});
