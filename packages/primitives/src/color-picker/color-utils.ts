export interface RGB {
	r: number; // 0-255
	g: number; // 0-255
	b: number; // 0-255
}

export interface HSV {
	h: number; // 0-360
	s: number; // 0-100
	v: number; // 0-100
}

export interface HSL {
	h: number; // 0-360
	s: number; // 0-100
	l: number; // 0-100
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

export function isValidHex(hex: string): boolean {
	return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex);
}

export function hexToRgb(hex: string): RGB {
	let h = hex.replace('#', '');
	if (h.length === 3) {
		h = h[0]! + h[0]! + h[1]! + h[1]! + h[2]! + h[2]!;
	}
	const n = parseInt(h, 16);
	return {
		r: (n >> 16) & 255,
		g: (n >> 8) & 255,
		b: n & 255
	};
}

export function rgbToHex(rgb: RGB): string {
	const toHex = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
	return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

export function rgbToHsv(rgb: RGB): HSV {
	const r = rgb.r / 255;
	const g = rgb.g / 255;
	const b = rgb.b / 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const delta = max - min;

	let h = 0;
	const s = max === 0 ? 0 : delta / max;
	const v = max;

	if (delta !== 0) {
		if (max === r) {
			h = ((g - b) / delta) % 6;
		} else if (max === g) {
			h = (b - r) / delta + 2;
		} else {
			h = (r - g) / delta + 4;
		}
		h = h * 60;
		if (h < 0) h += 360;
	}

	return {
		h: Math.round(h),
		s: Math.round(s * 100),
		v: Math.round(v * 100)
	};
}

export function hsvToRgb(hsv: HSV): RGB {
	const h = hsv.h / 60;
	const s = hsv.s / 100;
	const v = hsv.v / 100;

	const i = Math.floor(h);
	const f = h - i;
	const p = v * (1 - s);
	const q = v * (1 - f * s);
	const t = v * (1 - (1 - f) * s);

	let r = 0,
		g = 0,
		b = 0;

	switch (i % 6) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;
		case 1:
			r = q;
			g = v;
			b = p;
			break;
		case 2:
			r = p;
			g = v;
			b = t;
			break;
		case 3:
			r = p;
			g = q;
			b = v;
			break;
		case 4:
			r = t;
			g = p;
			b = v;
			break;
		case 5:
			r = v;
			g = p;
			b = q;
			break;
	}

	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255)
	};
}

export function rgbToHsl(rgb: RGB): HSL {
	const r = rgb.r / 255;
	const g = rgb.g / 255;
	const b = rgb.b / 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const delta = max - min;
	const l = (max + min) / 2;

	let h = 0;
	let s = 0;

	if (delta !== 0) {
		s = delta / (1 - Math.abs(2 * l - 1));

		if (max === r) {
			h = ((g - b) / delta) % 6;
		} else if (max === g) {
			h = (b - r) / delta + 2;
		} else {
			h = (r - g) / delta + 4;
		}
		h = h * 60;
		if (h < 0) h += 360;
	}

	return {
		h: Math.round(h),
		s: Math.round(s * 100),
		l: Math.round(l * 100)
	};
}

export function hslToRgb(hsl: HSL): RGB {
	const h = hsl.h;
	const s = hsl.s / 100;
	const l = hsl.l / 100;

	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = l - c / 2;

	let r = 0,
		g = 0,
		b = 0;

	if (h < 60) {
		r = c;
		g = x;
		b = 0;
	} else if (h < 120) {
		r = x;
		g = c;
		b = 0;
	} else if (h < 180) {
		r = 0;
		g = c;
		b = x;
	} else if (h < 240) {
		r = 0;
		g = x;
		b = c;
	} else if (h < 300) {
		r = x;
		g = 0;
		b = c;
	} else {
		r = c;
		g = 0;
		b = x;
	}

	return {
		r: Math.round((r + m) * 255),
		g: Math.round((g + m) * 255),
		b: Math.round((b + m) * 255)
	};
}

export function hsvToHsl(hsv: HSV): HSL {
	return rgbToHsl(hsvToRgb(hsv));
}

export function hslToHsv(hsl: HSL): HSV {
	return rgbToHsv(hslToRgb(hsl));
}

export function formatRgb(rgb: RGB): string {
	return `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
}

export function formatHsl(hsl: HSL): string {
	return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
}

export function parseColor(color: string): RGB | null {
	const trimmed = color.trim();

	// hex
	if (trimmed.startsWith('#')) {
		if (isValidHex(trimmed)) return hexToRgb(trimmed);
		return null;
	}

	// rgb(r, g, b) or rgb(r g b)
	const rgbMatch = trimmed.match(/^rgb\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)\s*\)$/i);
	if (rgbMatch) {
		const r = rgbMatch[1];
		const g = rgbMatch[2];
		const b = rgbMatch[3];
		if (!r || !g || !b) return null;
		return {
			r: clamp(parseInt(r, 10), 0, 255),
			g: clamp(parseInt(g, 10), 0, 255),
			b: clamp(parseInt(b, 10), 0, 255)
		};
	}

	// hsl(h, s%, l%) or hsl(h s% l%)
	const hslMatch = trimmed.match(
		/^hsl\(\s*(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)%[,\s]+(\d+(?:\.\d+)?)%\s*\)$/i
	);
	if (hslMatch) {
		const h = hslMatch[1];
		const s = hslMatch[2];
		const l = hslMatch[3];
		if (!h || !s || !l) return null;
		return hslToRgb({
			h: clamp(parseFloat(h), 0, 360),
			s: clamp(parseFloat(s), 0, 100),
			l: clamp(parseFloat(l), 0, 100)
		});
	}

	return null;
}
