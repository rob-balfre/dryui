import { expect, test } from 'bun:test';

interface WorkspacePackageJson {
	scripts: Record<string, string>;
	devDependencies: Record<string, string>;
}

async function parsePackageJson(path: URL): Promise<WorkspacePackageJson> {
	const raw: unknown = JSON.parse(await Bun.file(path).text());
	if (
		typeof raw !== 'object' ||
		raw === null ||
		!('scripts' in raw) ||
		!('devDependencies' in raw)
	) {
		throw new Error('package.json missing expected fields');
	}
	return raw as WorkspacePackageJson;
}

const packageJson = await parsePackageJson(new URL('../../package.json', import.meta.url));

test('unit test contract points at the local unit suite', () => {
	expect(packageJson.scripts['test:unit']).toBe('bun run ./scripts/test-unit.ts');
});

test('browser test contract is configured for Vitest browser mode', () => {
	expect(packageJson.scripts['test:browser']).toBe('vitest --browser --run tests/browser');
	expect(packageJson.devDependencies.vitest).toBeDefined();
	expect(packageJson.devDependencies['@vitest/browser-playwright']).toBeDefined();
	expect(packageJson.devDependencies['@vitest/coverage-v8']).toBeDefined();
	expect(packageJson.devDependencies.playwright).toBeDefined();
	expect(packageJson.devDependencies.svelte).toBeDefined();
});

test('coverage scripts are available for unit and browser suites', () => {
	expect(packageJson.scripts['test:coverage:unit']).toBe(
		'bun run ./scripts/test-unit.ts --coverage --coverage-reporter=text --coverage-reporter=lcov --coverage-dir=coverage/unit'
	);
	expect(packageJson.scripts['test:coverage:browser']).toBe(
		'vitest --browser --run --coverage --coverage.provider=v8 --coverage.reportsDirectory=coverage/browser --coverage.reporter=text --coverage.reporter=html tests/browser'
	);
	expect(packageJson.scripts['test:coverage']).toBe(
		'bun run test:coverage:unit && bun run test:coverage:browser'
	);
});

test('release scripts require validation before publish', () => {
	expect(packageJson.scripts.check).toContain('check:packages');
	expect(packageJson.scripts.check).toContain('check:docs');
	expect(packageJson.scripts.check).toContain('check:mcp');
	expect(packageJson.scripts.build).toBe('bun run build:packages && bun run build:docs');
	expect(packageJson.scripts['build:packages']).toBe(
		"bun run --filter '@dryui/lint' build && bun run --filter '@dryui/primitives' build && bun run --filter '@dryui/ui' build && bun run --filter '@dryui/mcp' build && bun run --filter '@dryui/feedback-server' build && bun run --filter '@dryui/cli' build"
	);
	expect(packageJson.scripts.validate).toBe('bun run ./scripts/validate.ts');
});
