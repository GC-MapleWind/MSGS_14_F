<script lang="ts">
	import { onMount, tick } from "svelte";
	import { page as pageStore } from "$app/stores";
	import Header from "$lib/components/Header.svelte";
	import VideoCard from "$lib/components/VideoCard.svelte";
	import { getCharactersPaginated } from "$lib/api";
	import type { Character } from "$lib/types";
	import type { Snapshot } from "./$types";

	let characters = $state<Character[]>([]);
	let loading = $state(true);
	let loadingMore = $state(false);
	let hasMore = $state(true);
	let error = $state<string | null>(null);
	let page = $state(1);
	const limit = 12;
	let sentinel = $state<HTMLDivElement | null>(null);
	let scrollContainer = $state<HTMLDivElement | null>(null);
	let restoredScrollTop = 0;
	let restoredSearchQuery = "";
	let loadedSearchQuery = $state("");
	let hasMounted = $state(false);
	let requestVersion = 0;

	// 검색은 서버 페이지네이션, 서버 칩은 현재 결과에서 클라이언트 필터링
	let selectedServer = $state<string | null>(null);
	const searchQuery = $derived(
		($pageStore.url.searchParams.get("q") ?? "").trim(),
	);
	const servers = $derived(
		[...new Set(characters.map((c) => c.server))].filter(
			(server) => server !== "에오스",
		),
	);
	const visibleCharacters = $derived(
		characters.filter((c) => !selectedServer || c.server === selectedServer),
	);

	function uniqueById<T extends { id: string }>(items: T[]): T[] {
		const seen = new Set<string>();
		return items.filter((item) => {
			if (seen.has(item.id)) return false;
			seen.add(item.id);
			return true;
		});
	}

	export const snapshot: Snapshot = {
		capture: () => ({
			characters,
			page,
			hasMore,
			searchQuery: loadedSearchQuery,
			scrollTop: scrollContainer?.scrollTop ?? 0,
		}),
		restore: (value) => {
			characters = uniqueById(value.characters);
			page = value.page;
			hasMore = value.hasMore;
			restoredSearchQuery = value.searchQuery ?? "";
			restoredScrollTop = value.scrollTop;
		},
	};

	async function loadMoreCharacters(
		query = loadedSearchQuery,
		version = requestVersion,
	) {
		if (loadingMore || !hasMore) return;

		loadingMore = true;
		try {
			const result = await getCharactersPaginated(page, limit, query);
			if (version !== requestVersion) return;

			if (page === 1) {
				characters = uniqueById(result.items);
			} else {
				characters = uniqueById([...characters, ...result.items]);
			}

			hasMore =
				characters.length < result.total && result.items.length > 0;
			if (result.items.length > 0) {
				page += 1;
			}
		} catch (e) {
			if (version !== requestVersion) return;
			console.error("Failed to load characters:", e);
			error = "캐릭터 목록을 불러오는데 실패했습니다.";
			hasMore = false;
		} finally {
			if (version === requestVersion) {
				loading = false;
				loadingMore = false;
			}
		}
	}

	async function resetCharacters(query: string) {
		requestVersion += 1;
		const version = requestVersion;
		loadedSearchQuery = query;
		selectedServer = null;
		characters = [];
		page = 1;
		hasMore = true;
		error = null;
		loading = true;
		loadingMore = false;
		await loadMoreCharacters(query, version);
	}

	onMount(async () => {
		hasMounted = true;
		const restoredPageCount =
			characters.length > 0 && restoredSearchQuery === searchQuery
				? Math.max(1, page - 1)
				: 1;

		// SvelteKit snapshot은 뒤로가기에 유용하지만 회원 정보까지 오래 보관한다.
		// 화면에 돌아올 때 현재 API 데이터를 다시 읽고, 필요한 페이지만 복원한다.
		await resetCharacters(searchQuery);
		while (page <= restoredPageCount && hasMore) {
			await loadMoreCharacters(searchQuery, requestVersion);
		}

		if (scrollContainer && restoredScrollTop > 0) {
			await tick();
			scrollContainer.scrollTop = restoredScrollTop;
		}
	});

	$effect(() => {
		const nextQuery = searchQuery;
		if (!hasMounted || nextQuery === loadedSearchQuery) return;
		void resetCharacters(nextQuery);
	});

	$effect(() => {
		if (!sentinel || !hasMore || loading) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					void loadMoreCharacters();
				}
			},
			{ rootMargin: "200px 0px" },
		);

		observer.observe(sentinel);

		return () => {
			observer.disconnect();
		};
	});
</script>

<svelte:head>
	<title>단풍바람 14기 - 메생결산</title>
</svelte:head>

<div class="flex flex-col h-full bg-yt-bg">
	<!-- 모바일 전용 헤더 (데스크톱은 레이아웃 셸 헤더 사용) -->
	<div class="lg:hidden shrink-0">
		<Header variant="main" />
	</div>

	<!-- 유튜브 홈 스타일 비디오 카드 피드 -->
	<div
		bind:this={scrollContainer}
		class="flex-1 overflow-y-auto min-h-0"
	>
		{#if loading}
			<div class="flex items-center justify-center h-full">
				<p class="text-yt-text-muted">로딩 중...</p>
			</div>
		{:else if error}
			<div class="flex items-center justify-center h-full">
				<p class="text-yt-text-muted">{error}</p>
			</div>
		{:else}
			<!-- 칩 행 (유튜브 홈 필터 칩) -->
			{#if servers.length > 0}
				<div
					class="hidden lg:flex items-center gap-3 px-6 py-3 sticky top-0 bg-yt-bg z-20 max-w-[1400px] mx-auto w-full"
				>
					{#each servers as server (server)}
						<button
							type="button"
							onclick={() => (selectedServer = server)}
							class={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
								selectedServer === server
									? "bg-yt-chip-active text-yt-chip-active-text"
									: "bg-yt-chip text-yt-text hover:bg-yt-surface-hover"
							}`}
						>
							{server}
						</button>
					{/each}
				</div>
			{/if}

			{#if visibleCharacters.length === 0}
				<div class="flex items-center justify-center py-20">
					<p class="text-yt-text-muted">검색 결과가 없습니다.</p>
				</div>
			{/if}

			<div
				class="flex flex-col lg:grid lg:grid-cols-3 xl:grid-cols-4 lg:gap-x-4 lg:gap-y-4 lg:px-6 lg:pt-4 lg:pb-10 lg:max-w-[1400px] lg:mx-auto lg:w-full"
			>
				{#each visibleCharacters as character (character.id)}
					<VideoCard {character} />
				{/each}
			</div>
			{#if hasMore}
				<div
					bind:this={sentinel}
					class="h-10 flex items-center justify-center"
				>
					{#if loadingMore}
						<p class="text-yt-text-muted text-sm">불러오는 중...</p>
					{/if}
				</div>
			{/if}
		{/if}
	</div>
</div>
