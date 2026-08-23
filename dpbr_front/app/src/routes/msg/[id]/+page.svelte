<script lang="ts">
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import { getSettlementById } from "$lib/api";

	// 기존 결산 상세 페이지는 쇼츠 뷰어로 대체됨.
	// 기존 링크·북마크 호환을 위해 /shorts/{characterId}?item={id} 로 리다이렉트.
	const msgId = $derived($page.params.id ?? "");
	let error = $state<string | null>(null);

	$effect(() => {
		void redirect();
	});

	async function redirect() {
		if (!msgId) return;

		try {
			const settlement = await getSettlementById(msgId);
			if (settlement) {
				await goto(
					`/shorts/${settlement.characterId}?item=${settlement.id}`,
					{ replaceState: true },
				);
			} else {
				error = "결산 항목을 찾을 수 없습니다.";
			}
		} catch (e) {
			console.error("Failed to redirect to shorts:", e);
			error = "데이터를 불러오는데 실패했습니다.";
		}
	}
</script>

<svelte:head>
	<title>결산 상세 - 단풍바람 14기</title>
</svelte:head>

<div class="flex-1 flex items-center justify-center bg-yt-bg">
	<p class="text-yt-text-muted">{error ?? "로딩 중..."}</p>
</div>
