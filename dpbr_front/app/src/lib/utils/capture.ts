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

/**
 * HTML 요소를 이미지로 캡쳐하고 다운로드합니다.
 *
 * @param element - 캡쳐할 HTML 요소
 * @param filename - 저장할 파일명 (확장자 포함)
 * @throws 캡쳐 또는 다운로드 실패 시 에러
 *
 * @example
 * ```typescript
 * const element = document.getElementById('capture-area');
 * await captureElementAsImage(element, 'my-image.png');
 * ```
 */
export async function captureElementAsImage(
	element: HTMLElement,
	filename: string
): Promise<void> {
	try {
		const blob = await captureElementAsPngBlob(element, {
			backgroundColor: '#f5f5f5'
		});
		downloadBlob(blob, filename);
	} catch (error) {
		console.error('Image capture failed:', error);
		throw error;
	}
}

/**
 * 파일명 생성 헬퍼 함수
 *
 * @param baseName - 기본 파일명
 * @returns 타임스탬프가 포함된 파일명
 *
 * @example
 * ```typescript
 * generateFilename('character-담뫄') // 'character-담뫄-1234567890.png'
 * ```
 */
export function generateFilename(baseName: string): string {
	const timestamp = Date.now();
	const sanitized = baseName.replace(/[^a-zA-Z0-9가-힣-_]/g, '-');
	return `${sanitized}-${timestamp}.png`;
}
