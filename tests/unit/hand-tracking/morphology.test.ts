import { describe, expect, it } from 'bun:test';
import {
	close,
	createDiskKernel,
	dilate,
	erode,
	open
} from '../../../packages/hand-tracking/src/pipeline/morphology.js';

describe('morphology', () => {
	it('removes isolated pixels with opening', () => {
		const mask = new Uint8Array([0, 0, 0, 0, 1, 0, 0, 0, 0]);

		const result = open(mask, 3, 3, createDiskKernel(1));

		expect(Array.from(result)).toEqual(new Array(9).fill(0));
	});

	it('fills a one-pixel gap with closing', () => {
		const mask = new Uint8Array([
			0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0
		]);

		const result = close(mask, 5, 5, createDiskKernel(1));

		expect(Array.from(result)).toEqual([
			0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0
		]);
	});

	it('dilates and erodes a simple blob', () => {
		const mask = new Uint8Array([0, 1, 0, 1, 1, 1, 0, 1, 0]);

		expect(Array.from(dilate(mask, 3, 3, createDiskKernel(1)))).toEqual(new Array(9).fill(1));
		expect(Array.from(erode(mask, 3, 3, createDiskKernel(1)))).toEqual([0, 0, 0, 0, 1, 0, 0, 0, 0]);
	});
});
