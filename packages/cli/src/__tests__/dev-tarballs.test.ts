import { describe, expect, test } from 'bun:test';
import {
	injectOverridesIntoPackageJson,
	type DevTarballsManifest
} from '../commands/dev-tarballs.js';

const manifest: DevTarballsManifest = {
	generatedAt: '2026-04-29T00:00:00.000Z',
	packages: {
		'@dryui/feedback': {
			version: '0.5.2',
			tarball: '/abs/reports/e2e-tarballs/dryui-feedback-0.5.2.tgz'
		},
		'@dryui/ui': {
			version: '2.0.2',
			tarball: '/abs/reports/e2e-tarballs/dryui-ui-2.0.2.tgz'
		},
		'@dryui/lint': {
			version: '0.7.1',
			tarball: '/abs/reports/e2e-tarballs/dryui-lint-0.7.1.tgz'
		}
	}
};

describe('injectOverridesIntoPackageJson', () => {
	// npm 11 errors with EOVERRIDE if a direct dependency's specifier differs
	// from the override target. Rewriting the dependency to the same bare-path
	// value (the shape `bun add /abs/path.tgz` writes) keeps both bun and npm
	// happy when the scaffold is consumed by impeccable (which shells out to
	// npm) or any other npm-based tooling.
	test('rewrites direct deps to match the override target as a bare absolute path', () => {
		const original = JSON.stringify({
			name: 'scaffolded',
			dependencies: {
				'@dryui/feedback': '^0.5.2',
				'@dryui/ui': '^2.0.2',
				lodash: '^4.17.0'
			},
			devDependencies: {
				'@dryui/lint': '^0.7.0',
				prettier: '^3.0.0'
			}
		});

		const result = JSON.parse(injectOverridesIntoPackageJson(original, manifest));

		expect(result.dependencies['@dryui/feedback']).toBe(
			'/abs/reports/e2e-tarballs/dryui-feedback-0.5.2.tgz'
		);
		expect(result.dependencies['@dryui/ui']).toBe('/abs/reports/e2e-tarballs/dryui-ui-2.0.2.tgz');
		expect(result.dependencies.lodash).toBe('^4.17.0');
		expect(result.devDependencies['@dryui/lint']).toBe(
			'/abs/reports/e2e-tarballs/dryui-lint-0.7.1.tgz'
		);
		expect(result.devDependencies.prettier).toBe('^3.0.0');
	});

	test('emits overrides + resolutions that match the direct deps byte-for-byte', () => {
		const original = JSON.stringify({
			name: 'scaffolded',
			dependencies: { '@dryui/feedback': '^0.5.2' }
		});

		const result = JSON.parse(injectOverridesIntoPackageJson(original, manifest));

		expect(result.overrides['@dryui/feedback']).toBe(
			'/abs/reports/e2e-tarballs/dryui-feedback-0.5.2.tgz'
		);
		expect(result.overrides['@dryui/feedback']).toBe(result.dependencies['@dryui/feedback']);
		expect(result.resolutions['@dryui/feedback']).toBe(result.overrides['@dryui/feedback']);
		expect(result.overrides['@dryui/feedback']).not.toMatch(/^file:/);
	});

	test('leaves packages not present in the manifest untouched', () => {
		const original = JSON.stringify({
			name: 'scaffolded',
			dependencies: { '@some/unrelated': '^1.0.0' }
		});

		const result = JSON.parse(injectOverridesIntoPackageJson(original, manifest));

		expect(result.dependencies['@some/unrelated']).toBe('^1.0.0');
	});
});
