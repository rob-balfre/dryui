const customPreviewNames = new Set([
	'Adjust',
	'Beam',
	'ChromaticAberration',
	'Glass',
	'GodRays',
	'QRCode'
]);

export function hasCustomComponentScreenshotPreview(name: string): boolean {
	return customPreviewNames.has(name);
}
