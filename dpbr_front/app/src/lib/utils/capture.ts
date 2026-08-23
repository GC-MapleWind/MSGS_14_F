import { toCanvas } from 'html-to-image';

export interface CaptureImageOptions {
	baseImage?: HTMLImageElement;
	backgroundColor?: string;
	height?: number;
	quality?: number;
	scale?: number;
	width?: number;
}

function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (blob) {
					resolve(blob);
					return;
				}

				reject(new Error('Failed to create JPEG blob'));
			},
			'image/jpeg',
			quality
		);
	});
}

function drawContainedImage(
	context: CanvasRenderingContext2D,
	image: HTMLImageElement,
	canvasWidth: number,
	canvasHeight: number
): void {
	const sourceWidth = image.naturalWidth;
	const sourceHeight = image.naturalHeight;
	if (sourceWidth <= 0 || sourceHeight <= 0) {
		throw new Error('Settlement image is not available for export');
	}

	const scale = Math.min(canvasWidth / sourceWidth, canvasHeight / sourceHeight);
	const targetWidth = sourceWidth * scale;
	const targetHeight = sourceHeight * scale;
	context.drawImage(
		image,
		(canvasWidth - targetWidth) / 2,
		(canvasHeight - targetHeight) / 2,
		targetWidth,
		targetHeight
	);
}

export async function captureElementAsJpegBlob(
	element: HTMLElement,
	options: CaptureImageOptions = {}
): Promise<Blob> {
	const rect = element.getBoundingClientRect();
	const width = options.width ?? Math.round(rect.width);
	const height = options.height ?? Math.round(rect.height);
	const scale = options.scale ?? 2;
	const canvas = document.createElement('canvas');
	canvas.width = Math.round(width * scale);
	canvas.height = Math.round(height * scale);
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Canvas is not available for export');
	}

	context.fillStyle = options.backgroundColor ?? '#000000';
	context.fillRect(0, 0, canvas.width, canvas.height);
	if (options.baseImage) {
		drawContainedImage(context, options.baseImage, canvas.width, canvas.height);
	}

	const previousBackgroundColor = element.style.backgroundColor;
	element.style.backgroundColor = 'transparent';
	let overlay: HTMLCanvasElement;
	try {
		overlay = await toCanvas(element, {
			width,
			height,
			pixelRatio: scale,
			cacheBust: false,
			filter: (node) => !node.hasAttribute?.('data-share-media')
		});
	} finally {
		element.style.backgroundColor = previousBackgroundColor;
	}
	context.drawImage(overlay, 0, 0, canvas.width, canvas.height);

	return canvasToJpegBlob(canvas, options.quality ?? 0.92);
}

export function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
