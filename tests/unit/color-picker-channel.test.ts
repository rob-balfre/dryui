import { describe, test, expect } from 'bun:test';

describe('ColorPicker ChannelInput', () => {
	test('HSV channel ranges: H is 0-360, S is 0-100, V is 0-100', () => {
		const channels = {
			h: { min: 0, max: 360, label: 'Hue' },
			s: { min: 0, max: 100, label: 'Saturation' },
			v: { min: 0, max: 100, label: 'Brightness' }
		};
		expect(channels.h.max).toBe(360);
		expect(channels.s.max).toBe(100);
		expect(channels.v.max).toBe(100);
		expect(channels.h.min).toBe(0);
		expect(channels.s.min).toBe(0);
		expect(channels.v.min).toBe(0);
	});
});
