import { get } from 'svelte/store';
import { goto } from '$app/navigation';
import { authStore } from '$lib/stores/auth';
import { logoutConfirmOpen } from '$lib/stores/ui';
import { getRandomSettlement } from '$lib/api';
import { toast } from '$lib/stores/toast';

let randomNavigationInFlight = false;

/** 내 페이지: 로그인 시 로그아웃 확인, 비로그인 시 로그인 페이지 */
export function openMyPage() {
	if (get(authStore).isAuthenticated) {
		logoutConfirmOpen.set(true);
	} else {
		void goto('/login');
	}
}

/** 전체 결산 중 하나를 무작위로 골라 쇼츠 딥링크로 이동한다. */
export async function openRandomSettlement() {
	if (randomNavigationInFlight) return;
	randomNavigationInFlight = true;

	try {
		const settlement = await getRandomSettlement();
		if (!settlement) {
			toast.show('재생할 결산이 없습니다.');
			return;
		}

		await goto(`/shorts/${settlement.characterId}?item=${settlement.id}`);
	} catch (error) {
		console.error('Failed to open a random settlement:', error);
		toast.show('자유 재생을 시작하지 못했습니다.');
	} finally {
		randomNavigationInFlight = false;
	}
}
