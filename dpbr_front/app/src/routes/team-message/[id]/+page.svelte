<script lang="ts">
	import { page } from "$app/stores";
	import Header from "$lib/components/Header.svelte";
	import { getTeamMessageDetail } from "$lib/api";
	import {
		DEFAULT_AVATAR_URL,
		handleImageError,
	} from "$lib/utils/image";
	import type { TeamMessageItem } from "$lib/types";

	const teamMessageId = $derived($page.params.id ?? "");
	let teamMessage = $state<TeamMessageItem | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	$effect(() => {
		if (teamMessageId) {
			loadData();
		}
	});

	async function loadData() {
		if (!teamMessageId) return;

		loading = true;
		error = null;

		try {
			teamMessage = await getTeamMessageDetail(teamMessageId);
		} catch (e) {
			console.error("Failed to load team message data:", e);
			error = "데이터를 불러오는데 실패했습니다.";
		} finally {
			loading = false;
		}
	}

	function goBack() {
		history.back();
	}
</script>

<svelte:head>
	<title>{teamMessage?.name ?? "운영팀 한마디"} - 단풍바람 14기</title>
</svelte:head>

<div class="flex flex-col h-full">
	<Header variant="close" onCloseClick={goBack} />

	{#if loading}
		<div class="flex-1 flex items-center justify-center">
			<p class="text-yt-text-muted">로딩 중...</p>
		</div>
	{:else if error}
		<div class="flex-1 flex items-center justify-center">
			<p class="text-yt-text-muted">{error}</p>
		</div>
	{:else if teamMessage}
		<div class="flex-1 flex flex-col bg-yt-bg overflow-y-auto">
			<div class="flex justify-center items-center bg-yt-bg px-6 py-4 sm:py-6">
				<img
					src={teamMessage.imageUrl || DEFAULT_AVATAR_URL}
					alt={teamMessage.name}
					onerror={handleImageError}
					class={teamMessage.imageUrl
						? "w-full h-auto max-w-[20rem] max-h-[38dvh] object-contain rounded-lg"
						: "w-1/2 h-auto max-w-48 max-h-[30dvh] object-contain rounded-lg"}
				/>
			</div>

			<div class="flex flex-col gap-4 px-6 py-4">
				<div class="flex gap-4">
					<span
						class="w-[72px] shrink-0 text-left whitespace-nowrap text-sm font-light text-yt-text-muted"
						>직책</span
					>
					<span class="text-base text-yt-text"
						>{teamMessage.role}</span
					>
				</div>
			</div>

			<hr class="border-yt-border mx-6" />

			<div class="flex flex-col gap-4 px-6 py-4">
				<div class="flex gap-4">
					<span
						class="w-[72px] shrink-0 text-left whitespace-nowrap text-sm font-light text-yt-text-muted"
						>상세 내용</span
					>
					<span
						class="text-base text-yt-text leading-relaxed whitespace-pre-line"
						>{teamMessage.content || teamMessage.title}</span
					>
				</div>
			</div>

			<hr class="border-yt-border mx-6" />
		</div>

		<div
			class="flex justify-center items-center h-[calc(100dvh*64/874)] bg-yt-bg shrink-0 mt-2"
		>
			<img
				src="/images/logos/logo-text-mono.svg"
				alt="COMMUNITY_PROJECT"
				class="h-5 opacity-40 object-contain dark:invert"
				draggable="false"
			/>
		</div>
	{:else}
		<div class="flex-1 flex items-center justify-center">
			<p class="text-yt-text-muted">운영팀 한마디를 찾을 수 없습니다.</p>
		</div>
	{/if}
</div>
