const customPreviewNames = new Set([
	'Adjust',
	'Beam',
	'BorderBeam',
	'ChromaticAberration',
	'Glass',
	'QRCode'
]);

export function hasCustomComponentScreenshotPreview(name: string): boolean {
	return customPreviewNames.has(name);
}
