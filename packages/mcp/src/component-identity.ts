export interface ComponentIdentity {
	readonly publicName: string;
	readonly publicSubpath: string;
	readonly docsSlug: string;
	readonly metadataDir: string;
	readonly implementationDir: string;
}

const PUBLIC_SUBPATH_OVERRIDES: Readonly<Record<string, string>> = {
	QRCode: 'qr-code'
};

const IMPLEMENTATION_DIR_OVERRIDES: Readonly<Record<string, string>> = {
	Enter: 'motion',
	Exit: 'motion',
	Stagger: 'motion'
};

const PUBLIC_NAME_OVERRIDES: Readonly<Record<string, string>> = {
	'qr-code': 'QRCode'
};

function simpleKebab(name: string): string {
	return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function acronymAwareKebab(name: string): string {
	return name
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
		.toLowerCase();
}

export function componentPublicSubpath(name: string): string {
	return PUBLIC_SUBPATH_OVERRIDES[name] ?? acronymAwareKebab(name);
}

export function componentDocsSlug(name: string): string {
	return simpleKebab(name);
}

export function componentMetadataDir(name: string): string {
	return componentPublicSubpath(name);
}

export function componentImplementationDir(name: string): string {
	return IMPLEMENTATION_DIR_OVERRIDES[name] ?? componentPublicSubpath(name);
}

export function componentNameFromPublicSubpath(subpath: string): string {
	return (
		PUBLIC_NAME_OVERRIDES[subpath] ??
		subpath
			.split('-')
			.map((part) => part[0]!.toUpperCase() + part.slice(1))
			.join('')
	);
}

export function componentIdentity(name: string): ComponentIdentity {
	const publicSubpath = componentPublicSubpath(name);
	return {
		publicName: name,
		publicSubpath,
		docsSlug: componentDocsSlug(name),
		metadataDir: componentMetadataDir(name),
		implementationDir: componentImplementationDir(name)
	};
}

export function componentRootImport(name: string, packageName: string): string {
	return `import { ${name} } from '${packageName}'`;
}

export function componentSubpathImport(name: string, packageName: string): string {
	return `import { ${name} } from '${packageName}/${componentPublicSubpath(name)}'`;
}
