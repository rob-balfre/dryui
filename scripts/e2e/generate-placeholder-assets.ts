import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..', '..');

interface AssetDefinition {
	readonly path: string;
	readonly width: number;
	readonly height: number;
}

const ASSETS: readonly AssetDefinition[] = [
	{ path: 'tests/e2e/assets/shopping/merino-wool-sweater.png', width: 470, height: 348 },
	{ path: 'tests/e2e/assets/shopping/canvas-tote.png', width: 458, height: 348 },
	{ path: 'tests/e2e/assets/shopping/leather-loafer.png', width: 470, height: 348 },
	{ path: 'tests/e2e/assets/travel/hero-overlook.png', width: 1672, height: 470 },
	{ path: 'tests/e2e/assets/travel/kyoto-japan.png', width: 492, height: 317 },
	{ path: 'tests/e2e/assets/travel/santorini-greece.png', width: 484, height: 317 },
	{ path: 'tests/e2e/assets/travel/patagonia-chile.png', width: 502, height: 317 }
];

function readPngSize(path: string): { width: number; height: number } {
	const buffer = readFileSync(path);
	const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
	if (buffer.length < 24 || !buffer.subarray(0, 8).equals(pngSignature)) {
		throw new Error(`${path} is not a PNG file`);
	}
	return {
		width: buffer.readUInt32BE(16),
		height: buffer.readUInt32BE(20)
	};
}

let failed = false;

for (const asset of ASSETS) {
	const assetPath = resolve(repoRoot, asset.path);
	if (!existsSync(assetPath)) {
		console.error(`${asset.path} missing`);
		failed = true;
		continue;
	}

	const size = readPngSize(assetPath);
	if (size.width !== asset.width || size.height !== asset.height) {
		console.error(
			`${asset.path} expected ${asset.width}x${asset.height}, got ${size.width}x${size.height}`
		);
		failed = true;
		continue;
	}

	console.log(`${asset.path} ${size.width}x${size.height}`);
}

if (failed) {
	process.exitCode = 1;
}
