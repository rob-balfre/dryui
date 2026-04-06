export type BinaryMask = Uint8Array;

export interface KernelOffset {
	dx: number;
	dy: number;
}

export function createDiskKernel(radius = 2): KernelOffset[] {
	const offsets: KernelOffset[] = [];

	for (let y = -radius; y <= radius; y += 1) {
		for (let x = -radius; x <= radius; x += 1) {
			if (x * x + y * y <= radius * radius) {
				offsets.push({ dx: x, dy: y });
			}
		}
	}

	return offsets;
}

function sample(mask: BinaryMask, width: number, height: number, x: number, y: number): number {
	if (x < 0 || y < 0 || x >= width || y >= height) {
		return 0;
	}

	return mask[y * width + x] ?? 0;
}

export function dilate(
	mask: BinaryMask,
	width: number,
	height: number,
	kernel: KernelOffset[] = createDiskKernel()
): BinaryMask {
	const output = new Uint8Array(mask.length);

	for (let y = 0; y < height; y += 1) {
		for (let x = 0; x < width; x += 1) {
			let on = 0;
			for (const offset of kernel) {
				if (sample(mask, width, height, x + offset.dx, y + offset.dy)) {
					on = 1;
					break;
				}
			}
			output[y * width + x] = on;
		}
	}

	return output;
}

export function erode(
	mask: BinaryMask,
	width: number,
	height: number,
	kernel: KernelOffset[] = createDiskKernel()
): BinaryMask {
	const output = new Uint8Array(mask.length);

	for (let y = 0; y < height; y += 1) {
		for (let x = 0; x < width; x += 1) {
			let on = 1;
			for (const offset of kernel) {
				if (!sample(mask, width, height, x + offset.dx, y + offset.dy)) {
					on = 0;
					break;
				}
			}
			output[y * width + x] = on;
		}
	}

	return output;
}

export function open(
	mask: BinaryMask,
	width: number,
	height: number,
	kernel: KernelOffset[] = createDiskKernel()
): BinaryMask {
	return dilate(erode(mask, width, height, kernel), width, height, kernel);
}

export function close(
	mask: BinaryMask,
	width: number,
	height: number,
	kernel: KernelOffset[] = createDiskKernel()
): BinaryMask {
	return erode(dilate(mask, width, height, kernel), width, height, kernel);
}
