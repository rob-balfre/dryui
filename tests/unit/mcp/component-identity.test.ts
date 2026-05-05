import { describe, expect, test } from 'bun:test';
import {
	componentDocsSlug,
	componentIdentity,
	componentImplementationDir,
	componentNameFromPublicSubpath,
	componentPublicSubpath,
	componentSubpathImport
} from '../../../packages/mcp/src/component-identity.js';

describe('component identity', () => {
	test('separates QRCode public subpath from current docs slug', () => {
		expect(componentPublicSubpath('QRCode')).toBe('qr-code');
		expect(componentDocsSlug('QRCode')).toBe('qrcode');
		expect(componentNameFromPublicSubpath('qr-code')).toBe('QRCode');
		expect(componentSubpathImport('QRCode', '@dryui/ui')).toBe(
			"import { QRCode } from '@dryui/ui/qr-code'"
		);
	});

	test('separates motion wrapper public dirs from implementation dir', () => {
		expect(componentIdentity('Enter')).toMatchObject({
			publicName: 'Enter',
			publicSubpath: 'enter',
			docsSlug: 'enter',
			metadataDir: 'enter',
			implementationDir: 'motion'
		});
		expect(componentImplementationDir('Exit')).toBe('motion');
		expect(componentImplementationDir('Stagger')).toBe('motion');
	});

	test('keeps regular component names acronym-aware for public subpaths', () => {
		expect(componentPublicSubpath('AlertDialog')).toBe('alert-dialog');
		expect(componentNameFromPublicSubpath('alert-dialog')).toBe('AlertDialog');
	});
});
