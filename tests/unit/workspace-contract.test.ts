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
const validateWorkflow = await Bun.file(
	new URL('../../.github/workflows/validate.yml', import.meta.url)
).text();
const docsVisualWorkflow = await Bun.file(
	new URL('../../.github/workflows/docs-visual.yml', import.meta.url)
).text();
const testUnitScript = await Bun.file(
	new URL('../../scripts/test-unit.ts', import.meta.url)
).text();

test('unit test contract points at the local unit suite', () => {
	expect(packageJson.scripts['test:unit']).toBe('bun run ./scripts/test-unit.ts');
});

test('unit suite includes the stable package-local tests that feed coverage', () => {
	expect(testUnitScript).toContain('tests/unit/**/*.test.ts');
	expect(testUnitScript).toContain('packages/cli/src/__tests__/*.test.ts');
	expect(testUnitScript).toContain('packages/feedback-server/tests/**/*.test.ts');
	expect(testUnitScript).toContain('packages/lint/src/*.test.ts');
	expect(testUnitScript).toContain('packages/mcp/src/**/*.test.ts');
	expect(testUnitScript).toContain('packages/theme-wizard/src/engine/*.test.ts');
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
		'vitest --browser --run --coverage --coverage.provider=v8 --coverage.reportsDirectory=coverage/browser --coverage.reporter=text --coverage.reporter=html --coverage.reporter=json-summary tests/browser'
	);
	expect(packageJson.scripts['test:coverage']).toBe(
		'bun run test:coverage:unit && bun run test:coverage:browser && bun run coverage:summary'
	);
	expect(packageJson.scripts['coverage:summary']).toBe('bun run ./scripts/coverage-summary.ts');
	expect(packageJson.scripts['coverage:check']).toBe(
		'bun run ./scripts/check-coverage-baseline.ts'
	);
	expect(packageJson.scripts['coverage:matrix']).toBe(
		'bun run ./scripts/generate-component-coverage-matrix.ts'
	);
	expect(packageJson.scripts['check:interactive-coverage']).toBe(
		'bun run ./scripts/check-interactive-coverage.ts'
	);
});

test('release scripts require validation before publish', () => {
	expect(packageJson.scripts.check).toContain('check:packages');
	expect(packageJson.scripts.check).toContain('check:docs');
	expect(packageJson.scripts.check).toContain('check:mcp');
	expect(packageJson.scripts.build).toBe('bun run build:packages && bun run build:docs');
	const buildPackages = packageJson.scripts['build:packages'];
	const requiredPackages = [
		'@dryui/lint',
		'@dryui/primitives',
		'@dryui/ui',
		'@dryui/feedback',
		'@dryui/theme-wizard',
		'@dryui/mcp',
		'@dryui/feedback-server',
		'@dryui/cli'
	];
	for (const pkg of requiredPackages) {
		expect(buildPackages).toContain(`--filter '${pkg}' build`);
	}
	expect(packageJson.scripts.validate).toBe('bun run ./scripts/validate.ts');
});

test('CI workflow runs a dedicated coverage lane and uploads retained artifacts', () => {
	expect(validateWorkflow).toContain('coverage:');
	expect(validateWorkflow).toContain('- run: bun run test:coverage');
	expect(validateWorkflow).toContain('- run: bun run coverage:check');
	expect(validateWorkflow).toContain('- run: bun run coverage:matrix');
	expect(validateWorkflow).toContain('name: coverage-${{ github.sha }}');
	expect(validateWorkflow).toContain('coverage/summary');
	expect(validateWorkflow).toContain('coverage/unit');
	expect(validateWorkflow).toContain('coverage/browser');
	expect(validateWorkflow).toContain('reports/component-coverage-matrix.json');
	expect(validateWorkflow).toContain('reports/component-coverage-matrix.md');
	expect(validateWorkflow).toContain('DRYUI_BASE_REF: origin/${{ github.base_ref }}');
	expect(validateWorkflow).toContain('DRYUI_PR_BODY: ${{ github.event.pull_request.body }}');
	expect(validateWorkflow).toContain('retention-days: 14');
});

test('docs visual coverage runs in its own slower workflow', () => {
	expect(docsVisualWorkflow).toContain('name: Docs Visual');
	expect(docsVisualWorkflow).toContain('workflow_dispatch:');
	expect(docsVisualWorkflow).toContain('schedule:');
	expect(docsVisualWorkflow).toContain('- run: bun run test:docs-visual');
	expect(docsVisualWorkflow).not.toContain('pull_request:');
	expect(docsVisualWorkflow).toContain('name: docs-visual-${{ github.sha }}');
});
