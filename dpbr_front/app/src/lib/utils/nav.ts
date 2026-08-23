import { get } from 'svelte/store';
import { goto } from '$app/navigation';
import { authStore } from '$lib/stores/auth';
import { logoutConfirmOpen } from '$lib/stores/ui';
import { getRandomSettlement, getSettlementsPaginated } from '$lib/api';
import { toast } from '$lib/stores/toast';

let randomNavigationInFlight = false;
let chronologicalNavigationInFlight = false;

/** 내 페이지: 로그인 시 로그아웃 확인, 비로그인 시 로그인 페이지 */
export function openMyPage() {
	if (get(authStore).isAuthenticated) {
		logoutConfirmOpen.set(true);
	} else {
		void goto('/login');
	}
}

/** 전체 결산을 무작위로 계속 이어 보는 자유 재생 피드를 연다. */
export async function openRandomSettlement() {
	if (randomNavigationInFlight) return;
	randomNavigationInFlight = true;

	try {
		const settlement = await getRandomSettlement();
		if (!settlement) {
			toast.show('재생할 결산이 없습니다.');
			return;
		}

		await goto(
			`/shorts/${settlement.characterId}?item=${settlement.id}&mode=random`
		);
	} catch (error) {
		console.error('Failed to open a random settlement:', error);
		toast.show('자유 재생을 시작하지 못했습니다.');
	} finally {
		randomNavigationInFlight = false;
	}
}

/** 전체 결산을 획득일 오름차순으로 재생하고 마지막부터 랜덤 피드로 잇는다. */
export async function openChronologicalSettlements() {
	if (chronologicalNavigationInFlight) return;
	chronologicalNavigationInFlight = true;

	try {
		const result = await getSettlementsPaginated(1, 1);
		const firstSettlement = result.items[0];
		if (!firstSettlement) {
			toast.show('재생할 결산이 없습니다.');
			return;
		}

		await goto(
			`/shorts/${firstSettlement.characterId}?item=${firstSettlement.id}&mode=chronological`
		);
	} catch (error) {
		console.error('Failed to open chronological settlements:', error);
		toast.show('날짜순 재생을 시작하지 못했습니다.');
	} finally {
		chronologicalNavigationInFlight = false;
	}
}
