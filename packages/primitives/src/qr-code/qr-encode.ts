/**
 * QR Code encoder — zero-dependency implementation.
 *
 * Supports:
 *  - Byte mode encoding (UTF-8)
 *  - Versions 1-40
 *  - Error correction levels L, M, Q, H
 *  - All 8 mask patterns with penalty scoring
 *
 * Returns a boolean[][] matrix where `true` = dark module.
 */

// ── Error-correction constants ────────────────────────────────────────────────

/** EC level index: L=0, M=1, Q=2, H=3 */
const EC_INDEX: Record<string, number> = { L: 0, M: 1, Q: 2, H: 3 };

/**
 * Total data codewords capacity per version (1-40) per EC level [L, M, Q, H].
 * Each entry is the number of data codewords (total codewords minus EC codewords).
 */
const DATA_CODEWORDS: number[][] = [
	/* v1  */ [19, 16, 13, 9],
	/* v2  */ [34, 28, 22, 16],
	/* v3  */ [55, 44, 34, 26],
	/* v4  */ [80, 64, 48, 36],
	/* v5  */ [108, 86, 62, 46],
	/* v6  */ [136, 108, 76, 60],
	/* v7  */ [156, 124, 88, 66],
	/* v8  */ [194, 154, 110, 86],
	/* v9  */ [232, 182, 132, 100],
	/* v10 */ [274, 216, 154, 122],
	/* v11 */ [324, 254, 180, 140],
	/* v12 */ [370, 290, 206, 158],
	/* v13 */ [428, 334, 244, 180],
	/* v14 */ [461, 365, 261, 197],
	/* v15 */ [523, 415, 295, 223],
	/* v16 */ [589, 453, 325, 253],
	/* v17 */ [647, 507, 367, 283],
	/* v18 */ [721, 563, 397, 313],
	/* v19 */ [795, 627, 445, 341],
	/* v20 */ [861, 669, 485, 385],
	/* v21 */ [932, 714, 512, 406],
	/* v22 */ [1006, 782, 568, 442],
	/* v23 */ [1094, 860, 614, 464],
	/* v24 */ [1174, 914, 664, 514],
	/* v25 */ [1276, 1000, 718, 538],
	/* v26 */ [1370, 1062, 754, 596],
	/* v27 */ [1468, 1128, 808, 628],
	/* v28 */ [1531, 1193, 871, 661],
	/* v29 */ [1631, 1267, 911, 701],
	/* v30 */ [1735, 1373, 985, 745],
	/* v31 */ [1843, 1455, 1033, 793],
	/* v32 */ [1955, 1541, 1115, 845],
	/* v33 */ [2071, 1631, 1171, 901],
	/* v34 */ [2191, 1725, 1231, 961],
	/* v35 */ [2306, 1812, 1286, 986],
	/* v36 */ [2434, 1914, 1354, 1054],
	/* v37 */ [2566, 1992, 1426, 1096],
	/* v38 */ [2702, 2102, 1502, 1142],
	/* v39 */ [2812, 2216, 1582, 1222],
	/* v40 */ [2956, 2334, 1666, 1276]
];

/**
 * Number of EC codewords per block, and block structure per version+EC level.
 * Format: [ecCodewordsPerBlock, numBlocks_group1, dataCodewordsPerBlock_group1, numBlocks_group2, dataCodewordsPerBlock_group2]
 * group2 entries are 0 when there's only one group.
 */
const EC_BLOCKS: number[][] = [
	/* v1  L */ [7, 1, 19, 0, 0],
	/* v1  M */ [10, 1, 16, 0, 0],
	/* v1  Q */ [13, 1, 13, 0, 0],
	/* v1  H */ [17, 1, 9, 0, 0],
	/* v2  L */ [10, 1, 34, 0, 0],
	/* v2  M */ [16, 1, 28, 0, 0],
	/* v2  Q */ [22, 1, 22, 0, 0],
	/* v2  H */ [28, 1, 16, 0, 0],
	/* v3  L */ [15, 1, 55, 0, 0],
	/* v3  M */ [26, 1, 44, 0, 0],
	/* v3  Q */ [18, 2, 17, 0, 0],
	/* v3  H */ [22, 2, 13, 0, 0],
	/* v4  L */ [20, 1, 80, 0, 0],
	/* v4  M */ [18, 2, 32, 0, 0],
	/* v4  Q */ [26, 2, 24, 0, 0],
	/* v4  H */ [16, 4, 9, 0, 0],
	/* v5  L */ [26, 1, 108, 0, 0],
	/* v5  M */ [24, 2, 43, 0, 0],
	/* v5  Q */ [18, 2, 15, 2, 16],
	/* v5  H */ [22, 2, 11, 2, 12],
	/* v6  L */ [18, 2, 68, 0, 0],
	/* v6  M */ [16, 4, 27, 0, 0],
	/* v6  Q */ [24, 4, 19, 0, 0],
	/* v6  H */ [28, 4, 15, 0, 0],
	/* v7  L */ [20, 2, 78, 0, 0],
	/* v7  M */ [18, 4, 31, 0, 0],
	/* v7  Q */ [18, 2, 14, 4, 15],
	/* v7  H */ [26, 4, 13, 1, 14],
	/* v8  L */ [24, 2, 97, 0, 0],
	/* v8  M */ [22, 2, 38, 2, 39],
	/* v8  Q */ [22, 4, 18, 2, 19],
	/* v8  H */ [26, 4, 14, 2, 15],
	/* v9  L */ [30, 2, 116, 0, 0],
	/* v9  M */ [22, 3, 36, 2, 37],
	/* v9  Q */ [20, 4, 16, 4, 17],
	/* v9  H */ [24, 4, 12, 4, 13],
	/* v10 L */ [18, 2, 68, 2, 69],
	/* v10 M */ [26, 4, 43, 1, 44],
	/* v10 Q */ [24, 6, 19, 2, 20],
	/* v10 H */ [28, 6, 15, 2, 16],
	/* v11 L */ [20, 4, 81, 0, 0],
	/* v11 M */ [30, 1, 50, 4, 51],
	/* v11 Q */ [28, 4, 22, 4, 23],
	/* v11 H */ [24, 3, 12, 8, 13],
	/* v12 L */ [24, 2, 92, 2, 93],
	/* v12 M */ [22, 6, 36, 2, 37],
	/* v12 Q */ [26, 4, 20, 6, 21],
	/* v12 H */ [28, 7, 14, 4, 15],
	/* v13 L */ [26, 4, 107, 0, 0],
	/* v13 M */ [22, 8, 37, 1, 38],
	/* v13 Q */ [24, 8, 20, 4, 21],
	/* v13 H */ [22, 12, 11, 4, 12],
	/* v14 L */ [30, 3, 115, 1, 116],
	/* v14 M */ [24, 4, 40, 5, 41],
	/* v14 Q */ [20, 11, 16, 5, 17],
	/* v14 H */ [24, 11, 12, 5, 13],
	/* v15 L */ [22, 5, 87, 1, 88],
	/* v15 M */ [24, 5, 41, 5, 42],
	/* v15 Q */ [30, 5, 24, 7, 25],
	/* v15 H */ [24, 11, 12, 7, 13],
	/* v16 L */ [24, 5, 98, 1, 99],
	/* v16 M */ [28, 7, 45, 3, 46],
	/* v16 Q */ [24, 15, 19, 2, 20],
	/* v16 H */ [30, 3, 15, 13, 16],
	/* v17 L */ [28, 1, 107, 5, 108],
	/* v17 M */ [28, 10, 46, 1, 47],
	/* v17 Q */ [28, 1, 22, 15, 23],
	/* v17 H */ [28, 2, 14, 17, 15],
	/* v18 L */ [30, 5, 120, 1, 121],
	/* v18 M */ [26, 9, 43, 4, 44],
	/* v18 Q */ [28, 17, 22, 1, 23],
	/* v18 H */ [28, 2, 14, 19, 15],
	/* v19 L */ [28, 3, 113, 4, 114],
	/* v19 M */ [26, 3, 44, 11, 45],
	/* v19 Q */ [26, 17, 21, 4, 22],
	/* v19 H */ [26, 9, 13, 16, 14],
	/* v20 L */ [28, 3, 107, 5, 108],
	/* v20 M */ [26, 3, 41, 13, 42],
	/* v20 Q */ [30, 15, 24, 5, 25],
	/* v20 H */ [28, 15, 15, 10, 16],
	/* v21 L */ [28, 4, 116, 4, 117],
	/* v21 M */ [26, 17, 42, 0, 0],
	/* v21 Q */ [28, 17, 22, 6, 23],
	/* v21 H */ [30, 19, 16, 6, 17],
	/* v22 L */ [28, 2, 111, 7, 112],
	/* v22 M */ [28, 17, 46, 0, 0],
	/* v22 Q */ [30, 7, 24, 16, 25],
	/* v22 H */ [24, 34, 13, 0, 0],
	/* v23 L */ [30, 4, 121, 5, 122],
	/* v23 M */ [28, 4, 47, 14, 48],
	/* v23 Q */ [30, 11, 24, 14, 25],
	/* v23 H */ [30, 16, 15, 14, 16],
	/* v24 L */ [30, 6, 117, 4, 118],
	/* v24 M */ [28, 6, 45, 14, 46],
	/* v24 Q */ [30, 11, 24, 16, 25],
	/* v24 H */ [30, 30, 16, 2, 17],
	/* v25 L */ [26, 8, 106, 4, 107],
	/* v25 M */ [28, 8, 47, 13, 48],
	/* v25 Q */ [30, 7, 24, 22, 25],
	/* v25 H */ [30, 22, 15, 13, 16],
	/* v26 L */ [28, 10, 114, 2, 115],
	/* v26 M */ [28, 19, 46, 4, 47],
	/* v26 Q */ [28, 28, 22, 6, 23],
	/* v26 H */ [30, 33, 16, 4, 17],
	/* v27 L */ [30, 8, 122, 4, 123],
	/* v27 M */ [28, 22, 45, 3, 46],
	/* v27 Q */ [30, 8, 23, 26, 24],
	/* v27 H */ [30, 12, 15, 28, 16],
	/* v28 L */ [30, 3, 117, 10, 118],
	/* v28 M */ [28, 3, 45, 23, 46],
	/* v28 Q */ [30, 4, 24, 31, 25],
	/* v28 H */ [30, 11, 15, 31, 16],
	/* v29 L */ [30, 7, 116, 7, 117],
	/* v29 M */ [28, 21, 45, 7, 46],
	/* v29 Q */ [30, 1, 23, 37, 24],
	/* v29 H */ [30, 19, 15, 26, 16],
	/* v30 L */ [30, 5, 115, 10, 116],
	/* v30 M */ [28, 19, 47, 10, 48],
	/* v30 Q */ [30, 15, 24, 25, 25],
	/* v30 H */ [30, 23, 15, 25, 16],
	/* v31 L */ [30, 13, 115, 3, 116],
	/* v31 M */ [28, 2, 46, 29, 47],
	/* v31 Q */ [30, 42, 24, 1, 25],
	/* v31 H */ [30, 23, 15, 28, 16],
	/* v32 L */ [30, 17, 115, 0, 0],
	/* v32 M */ [28, 10, 46, 23, 47],
	/* v32 Q */ [30, 10, 24, 35, 25],
	/* v32 H */ [30, 19, 15, 35, 16],
	/* v33 L */ [30, 17, 115, 1, 116],
	/* v33 M */ [28, 14, 46, 21, 47],
	/* v33 Q */ [30, 29, 24, 19, 25],
	/* v33 H */ [30, 11, 15, 46, 16],
	/* v34 L */ [30, 13, 115, 6, 116],
	/* v34 M */ [28, 14, 46, 23, 47],
	/* v34 Q */ [30, 44, 24, 7, 25],
	/* v34 H */ [30, 59, 16, 1, 17],
	/* v35 L */ [30, 12, 121, 7, 122],
	/* v35 M */ [28, 12, 47, 26, 48],
	/* v35 Q */ [30, 39, 24, 14, 25],
	/* v35 H */ [30, 22, 15, 41, 16],
	/* v36 L */ [30, 6, 121, 14, 122],
	/* v36 M */ [28, 6, 47, 34, 48],
	/* v36 Q */ [30, 46, 24, 10, 25],
	/* v36 H */ [30, 2, 15, 64, 16],
	/* v37 L */ [30, 17, 122, 4, 123],
	/* v37 M */ [28, 29, 46, 14, 47],
	/* v37 Q */ [30, 49, 24, 10, 25],
	/* v37 H */ [30, 24, 15, 46, 16],
	/* v38 L */ [30, 4, 122, 18, 123],
	/* v38 M */ [28, 13, 46, 32, 47],
	/* v38 Q */ [30, 48, 24, 14, 25],
	/* v38 H */ [30, 42, 15, 32, 16],
	/* v39 L */ [30, 20, 117, 4, 118],
	/* v39 M */ [28, 40, 47, 7, 48],
	/* v39 Q */ [30, 43, 24, 22, 25],
	/* v39 H */ [30, 10, 15, 67, 16],
	/* v40 L */ [30, 19, 118, 6, 119],
	/* v40 M */ [28, 18, 47, 31, 48],
	/* v40 Q */ [30, 34, 24, 34, 25],
	/* v40 H */ [30, 20, 15, 61, 16]
];

/** Alignment pattern center coordinates per version (2-40). Version 1 has none. */
const ALIGNMENT_POSITIONS: number[][] = [
	/* v1  */ [],
	/* v2  */ [6, 18],
	/* v3  */ [6, 22],
	/* v4  */ [6, 26],
	/* v5  */ [6, 30],
	/* v6  */ [6, 34],
	/* v7  */ [6, 22, 38],
	/* v8  */ [6, 24, 42],
	/* v9  */ [6, 26, 46],
	/* v10 */ [6, 28, 50],
	/* v11 */ [6, 30, 54],
	/* v12 */ [6, 32, 58],
	/* v13 */ [6, 34, 62],
	/* v14 */ [6, 26, 46, 66],
	/* v15 */ [6, 26, 48, 70],
	/* v16 */ [6, 26, 50, 74],
	/* v17 */ [6, 30, 54, 78],
	/* v18 */ [6, 30, 56, 82],
	/* v19 */ [6, 30, 58, 86],
	/* v20 */ [6, 34, 62, 90],
	/* v21 */ [6, 28, 50, 72, 94],
	/* v22 */ [6, 26, 50, 74, 98],
	/* v23 */ [6, 30, 54, 78, 102],
	/* v24 */ [6, 28, 54, 80, 106],
	/* v25 */ [6, 32, 58, 84, 110],
	/* v26 */ [6, 30, 58, 86, 114],
	/* v27 */ [6, 34, 62, 90, 118],
	/* v28 */ [6, 26, 50, 74, 98, 122],
	/* v29 */ [6, 30, 54, 78, 102, 126],
	/* v30 */ [6, 26, 52, 78, 104, 130],
	/* v31 */ [6, 30, 56, 82, 108, 134],
	/* v32 */ [6, 34, 60, 86, 112, 138],
	/* v33 */ [6, 30, 58, 86, 114, 142],
	/* v34 */ [6, 34, 62, 90, 118, 146],
	/* v35 */ [6, 30, 54, 78, 102, 126, 150],
	/* v36 */ [6, 24, 50, 76, 102, 128, 154],
	/* v37 */ [6, 28, 54, 80, 106, 132, 158],
	/* v38 */ [6, 32, 58, 84, 110, 136, 162],
	/* v39 */ [6, 26, 54, 82, 110, 138, 166],
	/* v40 */ [6, 30, 58, 86, 114, 142, 170]
];

// ── Galois Field GF(256) arithmetic ──────────────────────────────────────────

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

{
	let x = 1;
	for (let i = 0; i < 255; i++) {
		GF_EXP[i] = x;
		GF_LOG[x] = i;
		x = x << 1;
		if (x >= 256) x ^= 0x11d; // primitive polynomial
	}
	for (let i = 255; i < 512; i++) {
		GF_EXP[i] = GF_EXP[i - 255]!;
	}
}

function gfMul(a: number, b: number): number {
	if (a === 0 || b === 0) return 0;
	return GF_EXP[GF_LOG[a]! + GF_LOG[b]!]!;
}

/** Generate Reed-Solomon generator polynomial for `n` EC codewords */
function rsGeneratorPoly(n: number): Uint8Array {
	let gen = new Uint8Array([1]);
	for (let i = 0; i < n; i++) {
		const next = new Uint8Array(gen.length + 1);
		const factor = GF_EXP[i]!;
		for (let j = 0; j < gen.length; j++) {
			next[j]! ^= gen[j]!;
			next[j + 1] = next[j + 1]! ^ gfMul(gen[j]!, factor);
		}
		gen = next;
	}
	return gen;
}

/** Compute RS error correction codewords for `data` with `numEC` EC codewords */
function rsEncode(data: Uint8Array, numEC: number): Uint8Array {
	const gen = rsGeneratorPoly(numEC);
	const result = new Uint8Array(data.length + numEC);
	result.set(data);

	for (let i = 0; i < data.length; i++) {
		const coeff = result[i]!;
		if (coeff !== 0) {
			for (let j = 0; j < gen.length; j++) {
				result[i + j] = result[i + j]! ^ gfMul(gen[j]!, coeff);
			}
		}
	}

	return result.slice(data.length);
}

// ── Data encoding (byte mode) ────────────────────────────────────────────────

function encodeDataBits(data: string, version: number, ecLevel: number): Uint8Array {
	const utf8 = new TextEncoder().encode(data);
	const totalDataCodewords = DATA_CODEWORDS[version - 1]![ecLevel]!;

	// Character count indicator length depends on version
	const ccBits = version <= 9 ? 8 : 16;

	// Build bit stream
	const bits: number[] = [];

	const pushBits = (value: number, length: number) => {
		for (let i = length - 1; i >= 0; i--) {
			bits.push((value >> i) & 1);
		}
	};

	// Mode indicator: 0100 = byte mode
	pushBits(0b0100, 4);
	// Character count
	pushBits(utf8.length, ccBits);
	// Data
	for (const byte of utf8) {
		pushBits(byte, 8);
	}
	// Terminator (up to 4 zero bits)
	const maxBits = totalDataCodewords * 8;
	const termLen = Math.min(4, maxBits - bits.length);
	pushBits(0, termLen);

	// Pad to byte boundary
	while (bits.length % 8 !== 0) {
		bits.push(0);
	}

	// Pad with alternating 0xEC, 0x11
	const padBytes = [0xec, 0x11];
	let padIdx = 0;
	while (bits.length < maxBits) {
		pushBits(padBytes[padIdx % 2]!, 8);
		padIdx++;
	}

	// Convert to bytes
	const codewords = new Uint8Array(totalDataCodewords);
	for (let i = 0; i < totalDataCodewords; i++) {
		let byte = 0;
		for (let b = 0; b < 8; b++) {
			byte = (byte << 1) | (bits[i * 8 + b] ?? 0);
		}
		codewords[i] = byte;
	}

	return codewords;
}

// ── Interleave blocks ────────────────────────────────────────────────────────

function interleaveBlocks(data: Uint8Array, version: number, ecLevel: number): Uint8Array {
	const ecIdx = (version - 1) * 4 + ecLevel;
	const ecRow = EC_BLOCKS[ecIdx]!;
	const ecPerBlock = ecRow[0]!;
	const numG1 = ecRow[1]!;
	const dataG1 = ecRow[2]!;
	const numG2 = ecRow[3]!;
	const dataG2 = ecRow[4]!;

	const totalBlocks = numG1 + numG2;
	const dataBlocks: Uint8Array[] = [];
	const ecBlocks: Uint8Array[] = [];

	let offset = 0;

	// Group 1
	for (let i = 0; i < numG1; i++) {
		const block = data.slice(offset, offset + dataG1);
		dataBlocks.push(block);
		ecBlocks.push(rsEncode(block, ecPerBlock));
		offset += dataG1;
	}

	// Group 2
	for (let i = 0; i < numG2; i++) {
		const block = data.slice(offset, offset + dataG2);
		dataBlocks.push(block);
		ecBlocks.push(rsEncode(block, ecPerBlock));
		offset += dataG2;
	}

	// Interleave data codewords
	const result: number[] = [];
	const maxDataLen = Math.max(dataG1, dataG2);
	for (let i = 0; i < maxDataLen; i++) {
		for (let b = 0; b < totalBlocks; b++) {
			const block = dataBlocks[b];
			if (!block) continue;
			if (i < block.length) {
				const val = block[i];
				if (val !== undefined) result.push(val);
			}
		}
	}

	// Interleave EC codewords
	for (let i = 0; i < ecPerBlock; i++) {
		for (let b = 0; b < totalBlocks; b++) {
			const ecBlock = ecBlocks[b];
			if (!ecBlock) continue;
			const val = ecBlock[i];
			if (val !== undefined) result.push(val);
		}
	}

	return new Uint8Array(result);
}

// ── Matrix construction ──────────────────────────────────────────────────────

type Matrix = boolean[][];

function createMatrix(size: number): Matrix {
	return Array.from({ length: size }, () => Array<boolean>(size).fill(false));
}

/** Place finder pattern at (row, col) being the top-left corner */
function placeFinderPattern(matrix: Matrix, row: number, col: number) {
	const size = matrix.length;
	for (let r = -1; r <= 7; r++) {
		for (let c = -1; c <= 7; c++) {
			const rr = row + r;
			const cc = col + c;
			if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;

			const dark =
				(r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
				(c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
				(r >= 2 && r <= 4 && c >= 2 && c <= 4);

			matrix[rr]![cc] = dark;
		}
	}
}

/** Place alignment pattern centered at (row, col) */
function placeAlignmentPattern(matrix: Matrix, row: number, col: number) {
	for (let r = -2; r <= 2; r++) {
		for (let c = -2; c <= 2; c++) {
			const dark = Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0);
			matrix[row + r]![col + c] = dark;
		}
	}
}

/**
 * Track which modules are "reserved" (function patterns, format info, version info).
 * We use a separate boolean matrix for this so we know which modules to mask later.
 */
function createReservedMatrix(size: number, version: number): boolean[][] {
	const reserved = Array.from({ length: size }, () => Array<boolean>(size).fill(false));

	// Finder patterns + separators (8x8 areas in three corners)
	for (let r = 0; r < 9; r++) {
		for (let c = 0; c < 9; c++) {
			if (r < size && c < size) reserved[r]![c] = true; // top-left
			if (r < size && size - 1 - c >= 0) reserved[r]![size - 1 - c] = true; // top-right
			if (size - 1 - r >= 0 && c < size) reserved[size - 1 - r]![c] = true; // bottom-left
		}
	}

	// Timing patterns
	for (let i = 0; i < size; i++) {
		reserved[6]![i] = true;
		reserved[i]![6] = true;
	}

	// Alignment patterns
	if (version >= 2) {
		const positions = ALIGNMENT_POSITIONS[version - 1]!;
		for (const row of positions) {
			for (const col of positions) {
				// Skip overlap with finders
				if (
					(row <= 8 && col <= 8) ||
					(row <= 8 && col >= size - 8) ||
					(row >= size - 8 && col <= 8)
				)
					continue;
				for (let dr = -2; dr <= 2; dr++) {
					for (let dc = -2; dc <= 2; dc++) {
						reserved[row + dr]![col + dc] = true;
					}
				}
			}
		}
	}

	// Dark module
	reserved[size - 8]![8] = true;

	// Format info areas (around finders)
	for (let i = 0; i < 9; i++) {
		if (i < size) {
			reserved[8]![i] = true;
			reserved[i]![8] = true;
		}
	}
	for (let i = 0; i < 8; i++) {
		reserved[8]![size - 1 - i] = true;
		reserved[size - 1 - i]![8] = true;
	}

	// Version info (version 7+)
	if (version >= 7) {
		for (let i = 0; i < 6; i++) {
			for (let j = 0; j < 3; j++) {
				reserved[size - 11 + j]![i] = true;
				reserved[i]![size - 11 + j] = true;
			}
		}
	}

	return reserved;
}

function placeFunctionPatterns(matrix: Matrix, version: number) {
	const size = matrix.length;

	// Finder patterns (top-left, top-right, bottom-left)
	placeFinderPattern(matrix, 0, 0);
	placeFinderPattern(matrix, 0, size - 7);
	placeFinderPattern(matrix, size - 7, 0);

	// Timing patterns
	for (let i = 8; i < size - 8; i++) {
		matrix[6]![i] = i % 2 === 0;
		matrix[i]![6] = i % 2 === 0;
	}

	// Alignment patterns (version 2+)
	if (version >= 2) {
		const positions = ALIGNMENT_POSITIONS[version - 1]!;
		for (const row of positions) {
			for (const col of positions) {
				// Skip if overlaps with finder patterns
				if (
					(row <= 8 && col <= 8) ||
					(row <= 8 && col >= size - 8) ||
					(row >= size - 8 && col <= 8)
				)
					continue;
				placeAlignmentPattern(matrix, row, col);
			}
		}
	}

	// Dark module (always present)
	matrix[size - 8]![8] = true;
}

function placeDataBits(matrix: Matrix, reserved: boolean[][], data: Uint8Array) {
	const size = matrix.length;

	// Convert data to bits
	const bits: number[] = [];
	for (const byte of data) {
		for (let b = 7; b >= 0; b--) {
			bits.push((byte >> b) & 1);
		}
	}

	let bitIdx = 0;

	// Data modules are placed in 2-column strips, right to left
	let col = size - 1;
	while (col >= 0) {
		// Skip column 6 (timing pattern)
		if (col === 6) col--;

		const goingUp = ((size - 1 - col) >> 1) % 2 === 0;

		for (let cnt = 0; cnt < size; cnt++) {
			const row = goingUp ? size - 1 - cnt : cnt;
			for (let dc = 0; dc <= 1; dc++) {
				const c = col - dc;
				if (c < 0) continue;
				if (reserved[row]![c]) continue;
				if (bitIdx < bits.length) {
					matrix[row]![c] = bits[bitIdx]! === 1;
					bitIdx++;
				} else {
					matrix[row]![c] = false;
				}
			}
		}

		col -= 2;
	}
}

// ── Masking ──────────────────────────────────────────────────────────────────

type MaskFn = (row: number, col: number) => boolean;

const MASK_PATTERNS: MaskFn[] = [
	(r, c) => (r + c) % 2 === 0,
	(r) => r % 2 === 0,
	(_, c) => c % 3 === 0,
	(r, c) => (r + c) % 3 === 0,
	(r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
	(r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
	(r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
	(r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0
];

function applyMask(matrix: Matrix, maskIdx: number, reserved: boolean[][]): Matrix {
	const size = matrix.length;
	const result = matrix.map((row) => [...row]);
	const fn = MASK_PATTERNS[maskIdx]!;

	for (let r = 0; r < size; r++) {
		for (let c = 0; c < size; c++) {
			if (!reserved[r]![c] && fn(r, c)) {
				result[r]![c] = !result[r]![c];
			}
		}
	}

	return result;
}

// ── Penalty scoring ──────────────────────────────────────────────────────────

function computePenalty(matrix: Matrix): number {
	const size = matrix.length;
	let penalty = 0;

	// Rule 1: consecutive same-color modules in row/col (5+ in a row)
	for (let r = 0; r < size; r++) {
		let runColor = matrix[r]![0]!;
		let runLength = 1;
		for (let c = 1; c < size; c++) {
			if (matrix[r]![c] === runColor) {
				runLength++;
			} else {
				if (runLength >= 5) penalty += runLength - 2;
				runColor = matrix[r]![c]!;
				runLength = 1;
			}
		}
		if (runLength >= 5) penalty += runLength - 2;
	}

	for (let c = 0; c < size; c++) {
		let runColor = matrix[0]![c]!;
		let runLength = 1;
		for (let r = 1; r < size; r++) {
			if (matrix[r]![c] === runColor) {
				runLength++;
			} else {
				if (runLength >= 5) penalty += runLength - 2;
				runColor = matrix[r]![c]!;
				runLength = 1;
			}
		}
		if (runLength >= 5) penalty += runLength - 2;
	}

	// Rule 2: 2x2 blocks of same color
	for (let r = 0; r < size - 1; r++) {
		for (let c = 0; c < size - 1; c++) {
			const val = matrix[r]![c];
			if (matrix[r]![c + 1] === val && matrix[r + 1]![c] === val && matrix[r + 1]![c + 1] === val) {
				penalty += 3;
			}
		}
	}

	// Rule 3: finder-like patterns
	const p1 = [true, false, true, true, true, false, true, false, false, false, false];
	const p2 = [false, false, false, false, true, false, true, true, true, false, true];

	for (let r = 0; r < size; r++) {
		for (let c = 0; c <= size - 11; c++) {
			let match1 = true;
			let match2 = true;
			for (let k = 0; k < 11; k++) {
				if (matrix[r]![c + k] !== p1[k]) match1 = false;
				if (matrix[r]![c + k] !== p2[k]) match2 = false;
				if (!match1 && !match2) break;
			}
			if (match1 || match2) penalty += 40;
		}
	}

	for (let c = 0; c < size; c++) {
		for (let r = 0; r <= size - 11; r++) {
			let match1 = true;
			let match2 = true;
			for (let k = 0; k < 11; k++) {
				if (matrix[r + k]![c] !== p1[k]) match1 = false;
				if (matrix[r + k]![c] !== p2[k]) match2 = false;
				if (!match1 && !match2) break;
			}
			if (match1 || match2) penalty += 40;
		}
	}

	// Rule 4: proportion of dark modules
	let darkCount = 0;
	for (let r = 0; r < size; r++) {
		for (let c = 0; c < size; c++) {
			if (matrix[r]![c]) darkCount++;
		}
	}
	const percent = (darkCount / (size * size)) * 100;
	const prev5 = Math.floor(percent / 5) * 5;
	const next5 = prev5 + 5;
	penalty += Math.min(Math.abs(prev5 - 50) / 5, Math.abs(next5 - 50) / 5) * 10;

	return penalty;
}

// ── Format and version info ──────────────────────────────────────────────────

const FORMAT_MASK = 0b101010000010010;

function getFormatBits(ecLevel: number, maskPattern: number): number {
	// EC level bits: L=01, M=00, Q=11, H=10
	const ecBitsMap = [0b01, 0b00, 0b11, 0b10];
	let data = (ecBitsMap[ecLevel]! << 3) | maskPattern;

	// BCH(15,5) error correction
	let bits = data << 10;
	const generator = 0b10100110111;
	for (let i = 14; i >= 10; i--) {
		if (bits & (1 << i)) {
			bits ^= generator << (i - 10);
		}
	}

	return ((data << 10) | bits) ^ FORMAT_MASK;
}

function placeFormatInfo(matrix: Matrix, ecLevel: number, maskPattern: number) {
	const size = matrix.length;
	const bits = getFormatBits(ecLevel, maskPattern);

	// Place around top-left finder pattern
	const positions1: [number, number][] = [
		[8, 0],
		[8, 1],
		[8, 2],
		[8, 3],
		[8, 4],
		[8, 5],
		[8, 7],
		[8, 8],
		[7, 8],
		[5, 8],
		[4, 8],
		[3, 8],
		[2, 8],
		[1, 8],
		[0, 8]
	];

	for (let i = 0; i < 15; i++) {
		const [r, c] = positions1[i]!;
		matrix[r]![c] = ((bits >> i) & 1) === 1;
	}

	// Place near other finder patterns
	const positions2: [number, number][] = [];
	for (let i = 0; i < 7; i++) {
		positions2.push([size - 1 - i, 8]);
	}
	for (let i = 7; i < 15; i++) {
		positions2.push([8, size - 15 + i]);
	}

	for (let i = 0; i < 15; i++) {
		const [r, c] = positions2[i]!;
		matrix[r]![c] = ((bits >> i) & 1) === 1;
	}
}

function placeVersionInfo(matrix: Matrix, version: number) {
	if (version < 7) return;

	const size = matrix.length;

	// BCH(18,6) for version info
	const data = version;
	let bits = data << 12;
	const generator = 0b1111100100101;
	for (let i = 17; i >= 12; i--) {
		if (bits & (1 << i)) {
			bits ^= generator << (i - 12);
		}
	}

	const versionBits = (data << 12) | bits;

	// Place in two areas
	for (let i = 0; i < 6; i++) {
		for (let j = 0; j < 3; j++) {
			const bit = ((versionBits >> (i * 3 + j)) & 1) === 1;
			// Bottom-left
			matrix[size - 11 + j]![i] = bit;
			// Top-right
			matrix[i]![size - 11 + j] = bit;
		}
	}
}

// ── Public API ───────────────────────────────────────────────────────────────

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QRCodeOptions {
	errorCorrection?: ErrorCorrectionLevel;
}

/**
 * Encode a string to a QR code matrix.
 * Returns a 2D boolean array where `true` = dark module.
 */
export function encodeQR(data: string, options: QRCodeOptions = {}): boolean[][] {
	const { errorCorrection = 'M' } = options;
	const ecLevel = EC_INDEX[errorCorrection]!;

	// Determine minimum version
	const utf8 = new TextEncoder().encode(data);
	let version = 0;
	for (let v = 1; v <= 40; v++) {
		const capacity = DATA_CODEWORDS[v - 1]![ecLevel]!;
		const ccBits = v <= 9 ? 8 : 16;
		const headerBits = 4 + ccBits; // mode + character count
		const maxBytes = Math.floor((capacity * 8 - headerBits) / 8);
		if (utf8.length <= maxBytes) {
			version = v;
			break;
		}
	}

	if (version === 0) {
		throw new Error('Data too large for QR code');
	}

	const size = version * 4 + 17;

	// Step 1: Encode data
	const dataCodewords = encodeDataBits(data, version, ecLevel);

	// Step 2: Interleave with error correction
	const finalData = interleaveBlocks(dataCodewords, version, ecLevel);

	// Step 3: Create reserved mask to know which modules are function patterns
	const reserved = createReservedMatrix(size, version);

	// Step 4: Create matrix and place function patterns
	const baseMatrix = createMatrix(size);
	placeFunctionPatterns(baseMatrix, version);

	// Step 5: Place data bits (skipping reserved modules)
	placeDataBits(baseMatrix, reserved, finalData);

	// Step 6: Try all 8 masks and pick the best one
	let bestMask = 0;
	let bestPenalty = Infinity;

	for (let m = 0; m < 8; m++) {
		const masked = applyMask(baseMatrix, m, reserved);
		placeFormatInfo(masked, ecLevel, m);
		placeVersionInfo(masked, version);
		const p = computePenalty(masked);
		if (p < bestPenalty) {
			bestPenalty = p;
			bestMask = m;
		}
	}

	// Step 7: Apply best mask and finalize
	const finalMatrix = applyMask(baseMatrix, bestMask, reserved);
	placeFormatInfo(finalMatrix, ecLevel, bestMask);
	placeVersionInfo(finalMatrix, version);

	return finalMatrix;
}
