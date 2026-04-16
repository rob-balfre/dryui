const customPreviewNames = new Set([
	'Adjust',
	'Beam',
	'BorderBeam',
	'ChromaticAberration',
	'Glass',
	'GodRays',
	'QRCode'
]);

export function hasCustomComponentScreenshotPreview(name: string): boolean {
	return customPreviewNames.has(name);
}
