/**
 * QR Code encoder — zero-dependency implementation.
 *
 * Supports:
 *  - Byte mode encoding (UTF-8)
 *  - Versions 1-40
 *  - Error correction levels L, M, Q, H
 *  - All 8 mask patterns with penalty scoring
 *
 * Returns a boolean[][] matrix where `true` = dark module.
 */
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
export interface QRCodeOptions {
    errorCorrection?: ErrorCorrectionLevel;
}
/**
 * Encode a string to a QR code matrix.
 * Returns a 2D boolean array where `true` = dark module.
 */
export declare function encodeQR(data: string, options?: QRCodeOptions): boolean[][];
