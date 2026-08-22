<script lang="ts">
	import { tick } from "svelte";
	import { page } from "$app/stores";
	import { Search, EllipsisVertical, ArrowLeft } from "lucide-svelte";
	import ShortsThumbnail from "$lib/components/ShortsThumbnail.svelte";
	import TeamMessageListItem from "$lib/components/TeamMessageListItem.svelte";
	import { toast } from "$lib/stores/toast";
	import { downloadBlob } from "$lib/utils/capture";
	import {
		getAdminCharacter,
		getCharacterById,
		getSettlementsByCharacterId,
		getSettlementsByCharacterIdPaginated,
		getTeamMembers,
	} from "$lib/api";
	import {
		DEFAULT_AVATAR_URL,
		handleImageError,
	} from "$lib/utils/image";
	import type {
		Character,
		SettlementItem,
		TeamMessageItem,
	} from "$lib/types";
	import type { Snapshot } from "./$types";

	const ADMIN_TEAM_INFO = {
		generation: "단풍바람 14기",
		university: "가천대학교",
		role: "비대위",
	};

	const ADMIN_TEAM_NAME = "단풍바람 14기 비대위";
	const INTERNAL_ADMIN_TEAM_NAME = "COMMUNITY_PROJECT 운영팀";
	const ADMIN_TEAM_FALLBACK_ID = "admin-team";

	const fallbackAdminCharacter: Character = {
		id: ADMIN_TEAM_FALLBACK_ID,
		name: ADMIN_TEAM_NAME,
		nickname: "비대위",
		avatarUrl: DEFAULT_AVATAR_URL,
		level: 0,
		job: "운영",
		club: "단풍바람",
		server: "-",
	};

	const characterId = $derived($page.params.id ?? "");
	let character = $state<Character | null>(null);
	let isAdminTeam = $derived(
		characterId === ADMIN_TEAM_FALLBACK_ID ||
			character?.name === ADMIN_TEAM_NAME ||
			character?.name === INTERNAL_ADMIN_TEAM_NAME,
	);
	let settlements = $state<SettlementItem[]>([]);
	let settlementsTotal = $state(0);
	let settlementsLoadingMore = $state(false);
	let settlementsHasMore = $state(false);
	let settlementsPage = $state(1);
	const settlementsLimit = 12;
	let settlementsSentinel = $state<HTMLDivElement | null>(null);
	let teamMessages = $state<TeamMessageItem[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let imageSaving = $state(false);

	let scrollContainer = $state<HTMLDivElement | null>(null);
	let restoredScrollTop = 0;
	let restoredCharacterId = "";
	let dataLoadVersion = 0;

	const sortedSettlements = $derived(
		[...settlements].sort((a, b) => {
			const diff =
				new Date(a.acquiredAt).getTime() -
				new Date(b.acquiredAt).getTime();
			if (diff !== 0) return diff;
			return Number(a.id) - Number(b.id);
		}),
	);

	function uniqueById<T extends { id: string }>(items: T[]): T[] {
		const seen = new Set<string>();
		return items.filter((item) => {
			if (seen.has(item.id)) return false;
			seen.add(item.id);
			return true;
		});
	}

	function getImageExtension(blob: Blob, sourceUrl: string): string {
		const extensionByMimeType: Record<string, string> = {
			"image/avif": "avif",
			"image/gif": "gif",
			"image/jpeg": "jpg",
			"image/png": "png",
			"image/svg+xml": "svg",
			"image/webp": "webp",
		};
		const mimeExtension = extensionByMimeType[blob.type.toLowerCase()];
		if (mimeExtension) return mimeExtension;

		const pathExtension = new URL(sourceUrl, location.href).pathname
			.split(".")
			.pop()
			?.toLowerCase();
		return pathExtension && /^(avif|gif|jpe?g|png|svg|webp)$/.test(pathExtension)
			? pathExtension.replace("jpeg", "jpg")
			: "png";
	}

	async function saveCharacterImage() {
		if (!character || imageSaving) return;

		imageSaving = true;
		try {
			const response = await fetch(character.avatarUrl, { cache: "no-store" });
			if (!response.ok) {
				throw new Error(`Image request failed: ${response.status}`);
			}

			const blob = await response.blob();
			const safeNickname = (character.nickname || character.name)
				.replace(/[^a-zA-Z0-9가-힣_-]+/g, "-")
				.replace(/^-|-$/g, "");
			const extension = getImageExtension(blob, character.avatarUrl);
			downloadBlob(
				blob,
				`단풍바람14기-${safeNickname || "캐릭터"}.${extension}`,
			);
			toast.show("캐릭터 이미지를 저장했습니다.");
		} catch (saveError) {
			console.error("Character image save failed:", saveError);
			toast.show("캐릭터 이미지 저장에 실패했습니다.");
		} finally {
			imageSaving = false;
		}
	}

	export const snapshot: Snapshot = {
		capture: () => ({
			character,
			settlements,
			settlementsTotal,
			settlementsPage,
			settlementsHasMore,
			teamMessages,
			scrollTop: scrollContainer?.scrollTop ?? 0,
			charId: characterId,
		}),
		restore: (value) => {
			character = value.character;
			settlements = uniqueById(value.settlements);
			settlementsTotal = value.settlementsTotal ?? 0;
			settlementsPage = value.settlementsPage;
			settlementsHasMore = value.settlementsHasMore;
			teamMessages = uniqueById(value.teamMessages);
			restoredScrollTop = value.scrollTop;
			restoredCharacterId = value.charId;
		},
	};

	$effect(() => {
		// characterId가 변경될 때마다 데이터 로드
		if (restoredCharacterId === characterId && character) {
			loading = false;
			if (scrollContainer && restoredScrollTop > 0) {
				tick().then(() => {
					if (scrollContainer) {
						scrollContainer.scrollTop = restoredScrollTop;
					}
				});
			}
			// Reset restored ID after use to allow normal loads if ID changes later
			restoredCharacterId = "";
			return;
		}
		loadData();
	});

	async function loadData() {
		if (!characterId) return;
		const targetCharacterId = characterId;
		const requestVersion = ++dataLoadVersion;

		loading = true;
		settlementsLoadingMore = false;
		error = null;

		try {
			if (targetCharacterId === ADMIN_TEAM_FALLBACK_ID) {
				const adminCharacter = await getAdminCharacter();
				if (requestVersion !== dataLoadVersion) return;
				if (adminCharacter.id !== null) {
					const adminData = await getCharacterById(
						adminCharacter.id.toString(),
					);
					if (requestVersion !== dataLoadVersion) return;
					character = adminData
						? {
								...adminData,
								name: ADMIN_TEAM_NAME,
								nickname: "비대위",
							}
						: fallbackAdminCharacter;
				} else {
					character = fallbackAdminCharacter;
				}
				const loadedTeamMessages = await getTeamMembers();
				if (requestVersion !== dataLoadVersion) return;
				teamMessages = uniqueById(loadedTeamMessages);

				settlements = [];
				settlementsTotal = 0;
				settlementsHasMore = false;
				return;
			}

			const charData = await getCharacterById(targetCharacterId);
			if (requestVersion !== dataLoadVersion) return;
			character = charData;
			if (!charData) {
				settlements = [];
				settlementsTotal = 0;
				settlementsHasMore = false;
				teamMessages = [];
				return;
			}

			if (
				charData.name === ADMIN_TEAM_NAME ||
				charData.name === INTERNAL_ADMIN_TEAM_NAME
			) {
				character = {
					...charData,
					name: ADMIN_TEAM_NAME,
					nickname: "비대위",
				};
				const loadedTeamMessages = await getTeamMembers();
				if (requestVersion !== dataLoadVersion) return;
				teamMessages = uniqueById(loadedTeamMessages);

				settlements = [];
				settlementsTotal = 0;
				settlementsHasMore = false;
			} else {
				teamMessages = [];
				settlements = [];
				settlementsTotal = 0;
				settlementsPage = 1;
				settlementsHasMore = true;
				await loadMoreSettlements(
					targetCharacterId,
					requestVersion,
				);
			}
		} catch (e) {
			if (requestVersion !== dataLoadVersion) return;
			console.error("Failed to load character data:", e);
			error = "데이터를 불러오는데 실패했습니다.";
		} finally {
			if (requestVersion === dataLoadVersion) {
				loading = false;
			}
		}
	}

	async function loadMoreSettlements(
		targetCharacterId: string,
		requestVersion = dataLoadVersion,
	) {
		if (
			requestVersion !== dataLoadVersion ||
			settlementsLoadingMore ||
			!settlementsHasMore
		) {
			return;
		}

		settlementsLoadingMore = true;
		try {
			const result = await getSettlementsByCharacterIdPaginated(
				targetCharacterId,
				settlementsPage,
				settlementsLimit,
			);
			if (requestVersion !== dataLoadVersion) return;

			settlements = uniqueById([...settlements, ...result.items]);
			settlementsTotal = result.total;
			settlementsHasMore =
				settlements.length < result.total && result.items.length > 0;
			if (result.items.length > 0) {
				settlementsPage += 1;
			}
		} catch (e) {
			if (requestVersion !== dataLoadVersion) return;
			if (
				e instanceof Error &&
				e.message.includes("API Error: 404") &&
				settlementsPage === 1
			) {
				const fallbackItems =
					await getSettlementsByCharacterId(targetCharacterId);
				if (requestVersion !== dataLoadVersion) return;
				settlements = uniqueById(fallbackItems);
				settlementsTotal = settlements.length;
				settlementsHasMore = false;
				return;
			}

			console.error("Failed to load settlements:", e);
			error = "데이터를 불러오는데 실패했습니다.";
			settlementsHasMore = false;
		} finally {
			if (requestVersion === dataLoadVersion) {
				settlementsLoadingMore = false;
			}
		}
	}

	$effect(() => {
		if (!settlementsSentinel || !settlementsHasMore || isAdminTeam) return;

		const currentCharacterId = characterId;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					void loadMoreSettlements(currentCharacterId);
				}
			},
			{ rootMargin: "160px 0px" },
		);

		observer.observe(settlementsSentinel);

		return () => {
			observer.disconnect();
		};
	});
</script>

<svelte:head>
	<title>{character?.name ?? "캐릭터"} - 단풍바람 14기</title>
</svelte:head>

{#if loading}
	<div class="flex-1 flex items-center justify-center bg-yt-bg">
		<p class="text-yt-text-muted">로딩 중...</p>
	</div>
{:else if error}
	<div class="flex-1 flex items-center justify-center bg-yt-bg">
		<p class="text-yt-text-muted">{error}</p>
	</div>
{:else if character}
	<div class="flex flex-col h-full bg-yt-bg">
		<!-- 상단 바: 유튜브 채널 페이지 스타일 -->
		<header
			class="flex items-center justify-between px-1 py-1 shrink-0 z-30"
		>
			<button
				type="button"
				onclick={() => history.back()}
				class="p-2 text-yt-text"
				aria-label="뒤로가기"
			>
				<ArrowLeft size={24} strokeWidth={1.8} />
			</button>
			<div class="flex items-center text-yt-text" aria-hidden="true">
				<span class="p-2"><Search size={22} strokeWidth={1.8} /></span>
				<span class="p-2"><EllipsisVertical size={22} /></span>
			</div>
		</header>

		<div
			bind:this={scrollContainer}
			class="flex-1 overflow-y-auto min-h-0 w-full lg:max-w-5xl lg:mx-auto"
		>
			<!-- 채널 배너 (데스크톱, 유튜브 채널 배너 자리) -->
			<div
				class="hidden lg:block mx-4 mt-2 h-36 rounded-2xl overflow-hidden relative bg-yt-surface"
			>
				<img
					src={isAdminTeam ? DEFAULT_AVATAR_URL : character.avatarUrl}
					alt=""
					aria-hidden="true"
					onerror={handleImageError}
					class="absolute inset-0 w-full h-full object-cover scale-150 blur-2xl opacity-70"
					draggable="false"
				/>
			</div>

			<!-- 채널 헤더 -->
			<div class="flex items-center gap-4 px-4 pt-2 pb-4 lg:pt-5">
				<div
					class="w-20 h-20 rounded-full overflow-hidden shrink-0 bg-yt-surface flex items-center justify-center"
				>
					<img
						src={isAdminTeam ? DEFAULT_AVATAR_URL : character.avatarUrl}
						alt={character.name}
						onerror={handleImageError}
						class={isAdminTeam
							? "w-14 h-14 object-contain"
							: "w-full h-full object-cover [image-rendering:pixelated]"}
					/>
				</div>
				<div class="flex flex-col gap-0.5 min-w-0">
					<span class="text-xl font-bold text-yt-text truncate"
						>{character.name}</span
					>
					<span class="text-sm text-yt-text-muted truncate"
						>@{character.nickname}</span
					>
					<span class="text-xs text-yt-text-muted">
						{#if isAdminTeam}
							{ADMIN_TEAM_INFO.generation} · {ADMIN_TEAM_INFO.university}
							· {ADMIN_TEAM_INFO.role}
						{:else}
							Lv.{character.level} · {character.server} · {character.job}
						{/if}
					</span>
					<span class="text-xs text-yt-text-muted">
						{isAdminTeam
							? `한마디 ${teamMessages.length}개`
							: `결산 ${settlementsTotal || settlements.length}개`}
					</span>
				</div>
			</div>

			<!-- 구독 버튼 자리: 캐릭터 원본 이미지 저장 -->
			{#if !isAdminTeam}
				<div class="px-4 pb-4">
					<button
						type="button"
						onclick={saveCharacterImage}
						disabled={imageSaving}
						class="flex items-center justify-center w-full h-10 rounded-full bg-yt-chip-active text-yt-chip-active-text text-sm font-medium active:opacity-80"
						aria-busy={imageSaving}
					>
						{imageSaving ? "이미지 저장 중..." : "캐릭터 이미지 저장"}
					</button>
				</div>
			{/if}

			<!-- 탭 바 -->
			<div
				class="flex items-center gap-6 px-4 border-b border-yt-border sticky top-0 bg-yt-bg z-20"
			>
				<span class="py-3 text-[15px] text-yt-text-muted">홈</span>
				<span
					class="py-3 text-[15px] font-semibold text-yt-text border-b-2 border-yt-text -mb-px"
					>{isAdminTeam ? "한마디" : "Shorts"}</span
				>
			</div>

			{#if !isAdminTeam}
				<!-- 결산은 시간의 흐름대로 고정 노출 -->
				<div class="flex items-center gap-2 px-4 py-3">
					<span
						class="px-3 py-1.5 rounded-lg text-sm bg-yt-chip-active text-yt-chip-active-text"
					>
						오름차순
					</span>
				</div>
			{/if}

			<!-- 본문: 3열 쇼츠 그리드 / 운영진 한마디 목록 -->
			{#if isAdminTeam ? teamMessages.length > 0 : settlements.length > 0}
				{#if isAdminTeam}
					<div class="flex flex-col pt-2">
						{#each teamMessages as item (item.id)}
							<TeamMessageListItem {item} />
						{/each}
					</div>
				{:else}
					<div class="grid grid-cols-3 gap-1 px-1 lg:grid-cols-5 lg:gap-2">
						{#each sortedSettlements as item (item.id)}
							<ShortsThumbnail {item} />
						{/each}
					</div>
					{#if settlementsHasMore}
						<div
							bind:this={settlementsSentinel}
							class="py-4 flex items-center justify-center"
						>
							{#if settlementsLoadingMore}
								<p class="text-yt-text-muted text-sm">
									불러오는 중...
								</p>
							{/if}
						</div>
					{/if}
				{/if}
			{:else}
				<div class="flex items-center justify-center py-12">
					<p class="text-yt-text-muted">
						{isAdminTeam
							? "운영진 정보가 없습니다."
							: "등록된 결산이 없습니다."}
					</p>
				</div>
			{/if}
		</div>
	</div>
{:else}
	<div class="flex-1 flex items-center justify-center bg-yt-bg">
		<p class="text-yt-text-muted">캐릭터를 찾을 수 없습니다.</p>
	</div>
{/if}
