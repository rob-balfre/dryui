import { describe, expect, it } from 'bun:test';
import { createPipelineRunner } from '../../../packages/hand-tracking/src/engine/pipeline-runner.js';

function createFrame(
	width: number,
	height: number,
	background: [number, number, number, number]
): Uint8ClampedArray {
	const frame = new Uint8ClampedArray(width * height * 4);

	for (let index = 0; index < width * height; index += 1) {
		const offset = index * 4;
		frame[offset] = background[0];
		frame[offset + 1] = background[1];
		frame[offset + 2] = background[2];
		frame[offset + 3] = background[3];
	}

	return frame;
}

function fillRect(
	frame: Uint8ClampedArray,
	width: number,
	x: number,
	y: number,
	rectWidth: number,
	rectHeight: number,
	color: [number, number, number, number]
): void {
	for (let row = y; row < y + rectHeight; row += 1) {
		for (let column = x; column < x + rectWidth; column += 1) {
			const offset = (row * width + column) * 4;
			frame[offset] = color[0];
			frame[offset + 1] = color[1];
			frame[offset + 2] = color[2];
			frame[offset + 3] = color[3];
		}
	}
}

function fillEllipse(
	frame: Uint8ClampedArray,
	width: number,
	height: number,
	cx: number,
	cy: number,
	rx: number,
	ry: number,
	color: [number, number, number, number]
): void {
	for (let row = Math.floor(cy - ry); row <= Math.ceil(cy + ry); row += 1) {
		for (let column = Math.floor(cx - rx); column <= Math.ceil(cx + rx); column += 1) {
			if (column < 0 || row < 0 || column >= width || row >= height) {
				continue;
			}

			const dx = (column - cx) / rx;
			const dy = (row - cy) / ry;
			if (dx * dx + dy * dy > 1) {
				continue;
			}

			const offset = (row * width + column) * 4;
			frame[offset] = color[0];
			frame[offset + 1] = color[1];
			frame[offset + 2] = color[2];
			frame[offset + 3] = color[3];
		}
	}
}

function fillSyntheticHandWithForearm(
	frame: Uint8ClampedArray,
	width: number,
	x: number,
	y: number,
	color: [number, number, number, number]
): void {
	fillRect(frame, width, x + 6, y + 36, 34, 40, color);
	fillRect(frame, width, x, y + 12, 7, 28, color);
	fillRect(frame, width, x + 9, y + 4, 7, 36, color);
	fillRect(frame, width, x + 18, y, 7, 40, color);
	fillRect(frame, width, x + 27, y + 6, 7, 34, color);
	fillRect(frame, width, x + 36, y + 16, 7, 24, color);
	fillRect(frame, width, x + 6, y + 76, 20, 28, color);
}

describe('pipeline runner', () => {
	it('ignores face-like blobs without fingertip peaks', () => {
		const runner = createPipelineRunner();
		const rgba = createFrame(160, 120, [18, 18, 18, 255]);
		const skin: [number, number, number, number] = [198, 140, 90, 255];

		fillEllipse(rgba, 160, 120, 112, 54, 18, 24, skin);

		const result = runner.run({
			rgba,
			width: 160,
			height: 120,
			timestamp: 0
		});

		expect(result.hands).toHaveLength(0);
		expect(result.debug.candidateCount).toBe(0);
	});

	it('ignores frame-wide false positives', () => {
		const runner = createPipelineRunner();
		const rgba = createFrame(64, 64, [194, 167, 146, 255]);

		const result = runner.run({
			rgba,
			width: 64,
			height: 64,
			timestamp: 0
		});

		expect(result.hands).toHaveLength(0);
		expect(result.debug.candidateCount).toBe(0);
	});

	it('detects a synthetic open hand blob', () => {
		const runner = createPipelineRunner();
		const rgba = createFrame(96, 96, [18, 18, 18, 255]);
		const skin: [number, number, number, number] = [198, 140, 90, 255];

		fillRect(rgba, 96, 34, 38, 28, 34, skin);
		fillRect(rgba, 96, 28, 16, 7, 24, skin);
		fillRect(rgba, 96, 37, 10, 7, 30, skin);
		fillRect(rgba, 96, 46, 6, 7, 34, skin);
		fillRect(rgba, 96, 55, 12, 7, 28, skin);
		fillRect(rgba, 96, 64, 22, 7, 20, skin);

		const result = runner.run({
			rgba,
			width: 96,
			height: 96,
			timestamp: 0
		});

		expect(result.hands).toHaveLength(1);
		expect(result.hands[0]?.points).toHaveLength(21);
		expect(result.debug.contourCount).toBeGreaterThan(0);
		expect(result.debug.candidateCount).toBeGreaterThan(0);
	});

	it('prefers a hand over a face-like blob in the same frame', () => {
		const runner = createPipelineRunner();
		const rgba = createFrame(180, 140, [18, 18, 18, 255]);
		const skin: [number, number, number, number] = [198, 140, 90, 255];

		fillEllipse(rgba, 180, 140, 124, 52, 18, 24, skin);
		fillSyntheticHandWithForearm(rgba, 180, 30, 16, skin);

		const result = runner.run({
			rgba,
			width: 180,
			height: 140,
			timestamp: 0
		});

		expect(result.hands).toHaveLength(1);
		expect(result.hands[0]?.boundingBox.x).toBeLessThan(90);
	});

	it('detects a fallback-path hand with a visible forearm', () => {
		const runner = createPipelineRunner();
		const rgba = createFrame(180, 140, [18, 18, 18, 255]);
		const skin: [number, number, number, number] = [198, 140, 90, 255];

		fillSyntheticHandWithForearm(rgba, 180, 30, 16, skin);

		const result = runner.run({
			rgba,
			width: 180,
			height: 140,
			timestamp: 0
		});

		expect(result.hands).toHaveLength(1);
		expect(result.debug.candidateCount).toBeGreaterThan(0);
	});
});
