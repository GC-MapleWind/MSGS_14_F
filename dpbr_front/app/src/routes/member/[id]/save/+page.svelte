<script lang="ts">
	import { page } from "$app/stores";
	import { Download } from "lucide-svelte";
	import Header from "$lib/components/Header.svelte";
	import { getCharacterById, getSettlementsByCharacterId } from "$lib/api";
	import { toast } from "$lib/stores/toast";
	import type { Character, SettlementItem } from "$lib/types";
	import {
		DEFAULT_AVATAR_URL,
		handleImageError,
	} from "$lib/utils/image";

	const characterId = $derived($page.params.id ?? "");
	let character = $state<Character | null>(null);
	let settlements = $state<SettlementItem[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let saving = $state(false);
	let loadedCharacterId = "";
	let cardElement = $state<HTMLDivElement | null>(null);

	const sortedSettlements = $derived(
		[...settlements].sort(
			(a, b) =>
				new Date(b.acquiredAt).getTime() -
				new Date(a.acquiredAt).getTime(),
		),
	);
	const recentSettlements = $derived(sortedSettlements.slice(0, 3));
	const latestSettlement = $derived(sortedSettlements[0] ?? null);
	const oldestSettlement = $derived(
		sortedSettlements[sortedSettlements.length - 1] ?? null,
	);
	const representativeImageUrl = $derived(
		character?.previewImageUrl ||
			latestSettlement?.imageUrl ||
			character?.avatarUrl ||
			DEFAULT_AVATAR_URL,
	);
	const settlementCount = $derived(
		character?.settlementCount ?? settlements.length,
	);

	$effect(() => {
		if (!characterId || loadedCharacterId === characterId) return;
		loadedCharacterId = characterId;
		void loadData();
	});

	async function loadData() {
		loading = true;
		error = null;
		settlements = [];

		try {
			character = await getCharacterById(characterId);
			if (!character) {
				error = "캐릭터를 찾을 수 없습니다.";
				return;
			}

			try {
				settlements = await getSettlementsByCharacterId(characterId);
			} catch (settlementError) {
				console.warn("Failed to load character settlements:", settlementError);
				settlements = [];
			}
		} catch (loadError) {
			console.error("Failed to load character card:", loadError);
			error = "캐릭터 카드를 불러오지 못했습니다.";
		} finally {
			loading = false;
		}
	}

	function formatDate(date: string | undefined): string {
		if (!date) return "기록 없음";
		const parsed = new Date(date);
		if (Number.isNaN(parsed.getTime())) return date;
		return [
			parsed.getFullYear(),
			String(parsed.getMonth() + 1).padStart(2, "0"),
			String(parsed.getDate()).padStart(2, "0"),
		].join(".");
	}

	function formatShortDate(date: string | undefined): string {
		if (!date) return "--.--";
		const parsed = new Date(date);
		if (Number.isNaN(parsed.getTime())) return date;
		return `${String(parsed.getMonth() + 1).padStart(2, "0")}.${String(parsed.getDate()).padStart(2, "0")}`;
	}

	function goBack() {
		if (history.length > 1) {
			history.back();
			return;
		}
		location.href = `/member/${characterId}`;
	}

	async function saveImage() {
		if (!cardElement || !character || saving) return;
		saving = true;

		try {
			const { captureElementAsPngBlob, downloadBlob } = await import(
				"$lib/utils/capture"
			);
			const blob = await captureElementAsPngBlob(cardElement, {
				backgroundColor: "#0f0f0f",
				width: 360,
				height: 640,
				scale: 2,
			});
			const safeNickname = (character.nickname || character.name)
				.replace(/[^a-zA-Z0-9가-힣_-]+/g, "-")
				.replace(/^-|-$/g, "");
			downloadBlob(
				blob,
				`단풍바람14기-${safeNickname || "캐릭터"}-캐릭터카드.png`,
			);
			toast.show("14기 캐릭터 카드를 저장했습니다.");
		} catch (saveError) {
			console.error("Character card save failed:", saveError);
			toast.show("캐릭터 카드 저장에 실패했습니다.");
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>14기 캐릭터 카드 - {character?.name ?? ""}</title>
</svelte:head>

<div
	class="absolute inset-0 z-50 flex flex-col overflow-y-auto bg-[#0f0f0f] text-white [background-image:radial-gradient(circle_at_50%_20%,rgba(255,0,51,0.13),transparent_34%)]"
>
	<Header variant="save" onCloseClick={goBack} />

	<div class="flex min-h-full flex-1 flex-col items-center px-4 pb-8 pt-2">
		{#if loading}
			<div class="flex flex-1 items-center justify-center">
				<p class="text-sm text-white/65">캐릭터 카드를 만드는 중...</p>
			</div>
		{:else if error || !character}
			<div class="flex flex-1 flex-col items-center justify-center gap-4 text-center">
				<p class="text-sm text-white/65">{error ?? "캐릭터를 찾을 수 없습니다."}</p>
				<button
					type="button"
					onclick={goBack}
					class="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black"
				>
					돌아가기
				</button>
			</div>
		{:else}
			<div class="mb-3 text-center">
				<p class="text-sm font-medium">단풍바람 14기 캐릭터 카드</p>
				<p class="mt-0.5 text-xs text-white/55">미리보기 그대로 PNG로 저장됩니다</p>
			</div>

			<div
				bind:this={cardElement}
				class="relative aspect-[9/16] w-[min(360px,calc(100vw-32px))] shrink-0 overflow-hidden rounded-[24px] border border-white/10 bg-[#0f0f0f] text-white shadow-2xl"
			>
				<!-- YouTube 채널 헤더 문법: 브랜드 + 14기 배지 -->
				<div class="flex h-12 items-center justify-between px-4">
					<img
						src="/images/logos/logo-text-white.svg"
						alt="단풍바람"
						class="h-[17px] w-auto"
						draggable="false"
					/>
					<span
						class="rounded-full border border-white/15 bg-[#272727] px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] text-white/85"
					>
						14기 캐릭터 카드
					</span>
				</div>

				<!-- 대표 결산: 크롭하지 않고 16:9 전체 표시 -->
				<div class="relative aspect-video w-full overflow-hidden border-y border-white/10 bg-black">
					<img
						src={representativeImageUrl}
						alt=""
						aria-hidden="true"
						onerror={handleImageError}
						class="absolute inset-0 h-full w-full scale-125 object-cover opacity-40 blur-xl"
						draggable="false"
					/>
					<img
						src={representativeImageUrl}
						alt={`${character.name} 대표 결산`}
						onerror={handleImageError}
						class="absolute inset-0 h-full w-full object-contain"
						draggable="false"
					/>
					<div class="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/75 to-transparent"></div>
					<span class="absolute bottom-2 left-3 rounded bg-black/75 px-1.5 py-0.5 text-[9px] font-medium">
						대표 결산
					</span>
				</div>

				<div class="relative flex flex-col px-5 pb-4">
					<!-- YouTube 채널 아바타처럼 배너와 겹침 -->
					<div class="-mt-10 h-20 w-20 overflow-hidden rounded-full border-4 border-[#0f0f0f] bg-[#272727] shadow-lg">
						<img
							src={character.avatarUrl || DEFAULT_AVATAR_URL}
							alt={character.name}
							onerror={handleImageError}
							class="h-full w-full object-cover [image-rendering:pixelated]"
							draggable="false"
						/>
					</div>

					<div class="mt-1 min-w-0">
						<h1 class="truncate text-[24px] font-bold leading-tight tracking-[-0.02em]">
							{character.name}
						</h1>
						<p class="mt-0.5 truncate text-[12px] text-white/60">
							@{character.nickname || character.name} · 단풍바람 14기 멤버
						</p>
					</div>

					<div class="mt-4 grid grid-cols-2 gap-2">
						<div class="rounded-xl bg-[#212121] px-3 py-2.5">
							<p class="text-[10px] text-white/50">14기 결산</p>
							<p class="mt-0.5 text-[18px] font-bold">{settlementCount}<span class="ml-0.5 text-[11px] font-medium text-white/60">개</span></p>
						</div>
						<div class="rounded-xl bg-[#212121] px-3 py-2.5">
							<p class="text-[10px] text-white/50">최근 기록</p>
							<p class="mt-1 text-[13px] font-semibold">{formatDate(latestSettlement?.acquiredAt)}</p>
						</div>
					</div>

					<div class="mt-4 flex items-end justify-between">
						<div>
							<p class="text-[10px] font-semibold tracking-[0.12em] text-white/55">최근 결산</p>
							<p class="mt-0.5 text-[9px] text-white/35">
								{formatShortDate(oldestSettlement?.acquiredAt)} — {formatShortDate(latestSettlement?.acquiredAt)}
							</p>
						</div>
						<span class="h-0.5 w-8 rounded-full bg-[#ff0033]"></span>
					</div>

					{#if recentSettlements.length > 0}
						<div class="mt-2 grid grid-cols-3 gap-1.5">
							{#each recentSettlements as item (item.id)}
								<div class="relative aspect-video overflow-hidden rounded-md bg-[#212121]">
									<img
										src={item.imageUrl}
										alt={item.title}
										onerror={handleImageError}
										class="h-full w-full object-cover"
										draggable="false"
									/>
									<div class="absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-black/80 to-transparent"></div>
									<span class="absolute bottom-1 left-1 right-1 truncate text-[8px] font-medium">{item.title}</span>
								</div>
							{/each}
						</div>
					{:else}
						<div class="mt-2 flex h-[58px] items-center justify-center rounded-lg bg-[#212121] text-[10px] text-white/45">
							아직 등록된 결산이 없습니다
						</div>
					{/if}

					<div class="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[9px] text-white/40">
						<span>가천대 메이플스토리 동아리</span>
						<span>2026 · 단풍바람 14기</span>
					</div>
				</div>
			</div>

			<button
				type="button"
				onclick={saveImage}
				disabled={saving}
				class="mt-4 flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-black transition-opacity active:opacity-80 disabled:cursor-wait disabled:opacity-55"
				aria-busy={saving}
			>
				<Download size={17} strokeWidth={1.8} />
				{saving ? "PNG 만드는 중..." : "캐릭터 카드 저장"}
			</button>
		{/if}
	</div>
</div>
