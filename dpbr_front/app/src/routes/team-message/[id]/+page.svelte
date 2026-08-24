<script lang="ts">
	import { page } from "$app/stores";
	import { MessageCircle, ThumbsUp } from "lucide-svelte";
	import Header from "$lib/components/Header.svelte";
	import SettlementCommentsSheet from "$lib/components/SettlementCommentsSheet.svelte";
	import {
		getTeamMessageDetail,
		getTeamMessageEngagement,
		setTeamMessageLiked,
	} from "$lib/api";
	import { toast } from "$lib/stores/toast";
	import {
		DEFAULT_AVATAR_URL,
		handleImageError,
	} from "$lib/utils/image";
	import type { SettlementEngagement, TeamMessageItem } from "$lib/types";

	const teamMessageId = $derived($page.params.id ?? "");
	let teamMessage = $state<TeamMessageItem | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let engagement = $state<SettlementEngagement | null>(null);
	let liking = $state(false);
	let commentsOpen = $state(false);

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
			try {
				engagement = await getTeamMessageEngagement(teamMessageId);
			} catch (engagementError) {
				console.error("Failed to load team message engagement:", engagementError);
				engagement = null;
			}
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

	async function toggleLike() {
		if (!engagement || liking) return;

		liking = true;
		try {
			engagement = await setTeamMessageLiked(
				teamMessageId,
				!engagement.likedByMe,
			);
		} catch (likeError) {
			toast.show(
				likeError instanceof Error
					? likeError.message
					: "좋아요 처리에 실패했습니다.",
			);
		} finally {
			liking = false;
		}
	}

	function updateCommentCount(delta: number) {
		if (!engagement) return;
		engagement = {
			...engagement,
			commentCount: Math.max(0, engagement.commentCount + delta),
		};
	}

	function formatEngagementCount(count: number): string {
		if (count >= 10_000) {
			const value = count / 10_000;
			return `${Number.isInteger(value) ? value : value.toFixed(1)}만`;
		}
		if (count >= 1_000) {
			const value = count / 1_000;
			return `${Number.isInteger(value) ? value : value.toFixed(1)}천`;
		}
		return count.toLocaleString("ko-KR");
	}
</script>

<svelte:head>
	<title>{teamMessage?.name ?? "운영진 한마디"} - 단풍바람 14기</title>
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
						>닉네임</span
					>
					<span class="text-base text-yt-text"
						>@{teamMessage.nickname}</span
					>
				</div>
				<div class="flex gap-4">
					<span
						class="w-[72px] shrink-0 text-left whitespace-nowrap text-sm font-light text-yt-text-muted"
						>직위</span
					>
					<span class="text-base text-yt-text">{teamMessage.role}</span>
				</div>
			</div>

			<div class="flex items-center gap-3 px-6 pb-5">
				<button
					type="button"
					onclick={() => void toggleLike()}
					disabled={!engagement || liking}
					class="flex min-h-11 items-center gap-2 rounded-full bg-yt-surface px-4 text-sm font-medium text-yt-text hover:bg-yt-surface-hover disabled:opacity-50"
					aria-label={`좋아요 ${engagement?.likeCount ?? 0}개`}
					aria-pressed={engagement?.likedByMe ?? false}
				>
					<ThumbsUp
						size={21}
						strokeWidth={1.8}
						fill={engagement?.likedByMe ? "currentColor" : "none"}
					/>
					<span>
						{engagement?.likeCount
							? formatEngagementCount(engagement.likeCount)
							: "좋아요"}
					</span>
				</button>
				<button
					type="button"
					onclick={() => (commentsOpen = true)}
					disabled={!engagement}
					class="flex min-h-11 items-center gap-2 rounded-full bg-yt-surface px-4 text-sm font-medium text-yt-text hover:bg-yt-surface-hover disabled:opacity-50"
					aria-label={`댓글 ${engagement?.commentCount ?? 0}개`}
				>
					<MessageCircle size={21} strokeWidth={1.8} />
					<span>댓글</span>
					{#if engagement?.commentCount}
						<span>{formatEngagementCount(engagement.commentCount)}</span>
					{/if}
				</button>
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
			<p class="text-yt-text-muted">운영진 한마디를 찾을 수 없습니다.</p>
		</div>
	{/if}
</div>

{#if commentsOpen && teamMessage}
	<SettlementCommentsSheet
		{teamMessage}
		commentCount={engagement?.commentCount}
		onClose={() => (commentsOpen = false)}
		onCountChange={updateCommentCount}
	/>
{/if}
