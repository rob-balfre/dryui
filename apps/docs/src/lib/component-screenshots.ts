const customPreviewNames = new Set([
	'Adjust',
	'Beam',
	'ChromaticAberration',
	'Glass',
	'GodRays',
	'QRCode',
	'Thumbnail'
]);

export function hasCustomComponentScreenshotPreview(name: string): boolean {
	return customPreviewNames.has(name);
}

export function resolveComponentThumbnailName(name: string): string {
	return name === 'QRCode' ? 'QrCode' : name;
}
