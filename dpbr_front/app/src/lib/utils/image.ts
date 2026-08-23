/**
 * 이미지 URL 유틸리티
 */

export const DEFAULT_AVATAR_URL = '/images/icons/symbol-logo-color.svg';

/**
 * 이미지 URL이 유효하지 않을 때 기본 이미지를 반환
 */
export function getImageUrl(url: string | null | undefined): string {
	if (!url || url.trim() === '') {
		return DEFAULT_AVATAR_URL;
	}
	return url;
}

/**
 * 이미지 로드 에러 시 기본 이미지로 대체
 */
export function handleImageError(event: Event): void {
	const img = event.currentTarget as HTMLImageElement;
	if (img.dataset.fallbackApplied === 'true') return;

	img.dataset.fallbackApplied = 'true';
	img.src = DEFAULT_AVATAR_URL;
}
