import { toBlob } from 'html-to-image';

export interface CaptureImageOptions {
	backgroundColor?: string;
	height?: number;
	scale?: number;
	width?: number;
}

export async function captureElementAsPngBlob(
	element: HTMLElement,
	options: CaptureImageOptions = {}
): Promise<Blob> {
	const rect = element.getBoundingClientRect();
	const width = options.width ?? Math.round(rect.width);
	const height = options.height ?? Math.round(rect.height);
	const blob = await toBlob(element, {
		backgroundColor: options.backgroundColor ?? '#000000',
		width,
		height,
		pixelRatio: options.scale ?? 2,
		cacheBust: true
	});

	if (!blob) {
		throw new Error('Failed to create image blob');
	}

	return blob;
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
