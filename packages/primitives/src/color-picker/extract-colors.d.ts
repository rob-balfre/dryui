/**
 * Extracts dominant colors from an image file by downscaling to a small canvas
 * and bucketing pixels by hue. Returns hex color strings sorted by dominance.
 *
 * Requires a browser environment (uses Canvas API).
 */
export declare function extractColorsFromImage(file: File, count?: number): Promise<string[]>;
