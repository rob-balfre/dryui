export interface CaptureFrame {
	imageData: ImageData;
	timestamp: number;
}

export interface CaptureSession {
	readonly stream: MediaStream;
	readonly video: HTMLVideoElement;
	readonly canvas: HTMLCanvasElement;
	readonly context: CanvasRenderingContext2D;
	grabFrame: () => CaptureFrame | null;
	stop: () => void;
}

export async function createCaptureSession(
	stream: MediaStream,
	video: HTMLVideoElement,
	size = { width: 320, height: 240 }
): Promise<CaptureSession> {
	const canvas = document.createElement('canvas');
	canvas.width = size.width;
	canvas.height = size.height;
	const context = canvas.getContext('2d');

	if (!context) {
		throw new Error('Unable to create 2D canvas context for hand tracking.');
	}

	video.autoplay = true;
	video.muted = true;
	video.playsInline = true;
	video.srcObject = stream;

	await video.play();

	return {
		stream,
		video,
		canvas,
		context,
		grabFrame() {
			if (video.readyState < 2) {
				return null;
			}

			context.drawImage(video, 0, 0, canvas.width, canvas.height);
			return {
				imageData: context.getImageData(0, 0, canvas.width, canvas.height),
				timestamp: performance.now()
			};
		},
		stop() {
			for (const track of stream.getTracks()) {
				track.stop();
			}
			video.pause();
			video.srcObject = null;
		}
	};
}
