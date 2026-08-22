<script lang="ts">
	import { get } from "svelte/store";
	import { SendHorizontal, X } from "lucide-svelte";
	import BottomSheetLogin from "$lib/components/BottomSheetLogin.svelte";
	import CommentItem from "$lib/components/CommentItem.svelte";
	import {
		createSettlementComment,
		formatCommentDateTime,
		getSettlementComments,
	} from "$lib/api";
	import { authStore } from "$lib/stores/auth";
	import { toast } from "$lib/stores/toast";
	import type { SettlementComment, SettlementItem } from "$lib/types";
	import { DEFAULT_AVATAR_URL } from "$lib/utils/image";

	interface Props {
		settlement: SettlementItem;
		onClose: () => void;
	}

	let { settlement, onClose }: Props = $props();
	let comments = $state<SettlementComment[]>([]);
	let inputText = $state("");
	let textareaEl = $state<HTMLTextAreaElement | null>(null);
	let loading = $state(true);
	let submitting = $state(false);
	let error = $state<string | null>(null);
	let showLoginBottomSheet = $state(false);
	let loadVersion = 0;

	async function loadComments() {
		const settlementId = settlement.id;
		const requestVersion = ++loadVersion;
		loading = true;
		error = null;

		try {
			const loadedComments = await getSettlementComments(settlementId);
			if (requestVersion !== loadVersion) return;
			comments = loadedComments;
		} catch (loadError) {
			if (requestVersion !== loadVersion) return;
			console.error("Failed to load settlement comments:", loadError);
			error = "댓글을 불러오지 못했습니다.";
		} finally {
			if (requestVersion === loadVersion) loading = false;
		}
	}

	$effect(() => {
		void settlement.id;
		void loadComments();
	});

	function adjustTextarea() {
		if (!textareaEl) return;
		textareaEl.style.height = "auto";
		const maxHeight = 96;
		textareaEl.style.height = `${Math.min(textareaEl.scrollHeight, maxHeight)}px`;
		textareaEl.style.overflowY =
			textareaEl.scrollHeight > maxHeight ? "auto" : "hidden";
	}

	async function submitComment() {
		const text = inputText.trim();
		if (!text || submitting) return;

		if (!get(authStore).isAuthenticated) {
			showLoginBottomSheet = true;
			return;
		}

		submitting = true;
		try {
			const created = await createSettlementComment(settlement.id, text);
			comments = [
				{
					id: created.id.toString(),
					settlementId: (created.settlement_id ?? settlement.id).toString(),
					userId: created.user_id,
					author: created.author,
					authorAvatar: DEFAULT_AVATAR_URL,
					content: created.content,
					createdAt: formatCommentDateTime(created.created_at),
				},
				...comments,
			];
			inputText = "";
			if (textareaEl) textareaEl.style.height = "auto";
		} catch (submitError) {
			console.error("Failed to create settlement comment:", submitError);
			const message =
				submitError instanceof Error
					? submitError.message
					: "댓글 작성에 실패했습니다.";

			if (message.includes("401") || message.includes("로그인이 필요합니다")) {
				showLoginBottomSheet = true;
				return;
			}

			toast.show(message);
		} finally {
			submitting = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Escape" && !showLoginBottomSheet) {
			onClose();
		}
	}

	function handleTextareaKeydown(event: KeyboardEvent) {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			void submitComment();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 lg:items-center"
	onclick={onClose}
	role="presentation"
>
	<div
		class="relative flex h-[72dvh] max-h-[760px] w-full flex-col overflow-hidden rounded-t-2xl border-t border-yt-border bg-yt-bg text-yt-text shadow-2xl lg:h-[70vh] lg:w-[440px] lg:rounded-2xl lg:border"
		onclick={(event) => event.stopPropagation()}
		role="dialog"
		aria-modal="true"
		aria-labelledby="settlement-comments-title"
		tabindex="-1"
	>
		<div class="flex justify-center pt-2 lg:hidden" aria-hidden="true">
			<div class="h-1 w-10 rounded-full bg-yt-text-muted/40"></div>
		</div>
		<header class="flex h-14 shrink-0 items-center justify-between border-b border-yt-border px-5">
			<div class="min-w-0">
				<div class="flex items-baseline gap-2">
					<h2 id="settlement-comments-title" class="text-base font-semibold">댓글</h2>
					<span class="text-xs text-yt-text-muted">{comments.length.toLocaleString()}</span>
				</div>
				<p class="max-w-[270px] truncate text-xs text-yt-text-muted">{settlement.title}</p>
			</div>
			<button
				type="button"
				onclick={onClose}
				class="flex h-10 w-10 items-center justify-center rounded-full hover:bg-yt-surface"
				aria-label="댓글 닫기"
			>
				<X size={22} />
			</button>
		</header>

		<div class="min-h-0 flex-1 overflow-y-auto">
			{#if loading}
				<div class="flex h-full items-center justify-center px-6 text-sm text-yt-text-muted">
					댓글을 불러오는 중...
				</div>
			{:else if error}
				<div class="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
					<p class="text-sm text-yt-text-muted">{error}</p>
					<button
						type="button"
						onclick={() => void loadComments()}
						class="rounded-full bg-yt-chip px-4 py-2 text-sm font-medium"
					>
						다시 시도
					</button>
				</div>
			{:else if comments.length === 0}
				<div class="flex h-full flex-col items-center justify-center gap-1 px-6 text-center">
					<p class="text-sm font-medium">첫 댓글을 남겨 보세요.</p>
					<p class="text-xs text-yt-text-muted">이 결산에 대한 응원을 기다리고 있어요.</p>
				</div>
			{:else}
				{#each comments as comment (comment.id)}
					<CommentItem
						{comment}
						onDelete={(id) => {
							comments = comments.filter((item) => item.id !== id);
						}}
					/>
				{/each}
			{/if}
		</div>

		<div class="shrink-0 border-t border-yt-border bg-yt-bg px-4 py-3">
			{#if !$authStore.isAuthenticated}
				<button
					type="button"
					onclick={() => (showLoginBottomSheet = true)}
					class="w-full rounded-full bg-yt-chip-active py-3 text-sm font-medium text-yt-chip-active-text active:opacity-80"
				>
					로그인하고 댓글 남기기
				</button>
			{:else}
				<div class="flex items-end gap-2">
					<div class="flex min-w-0 flex-1 items-end rounded-3xl bg-yt-surface px-4 py-2">
						<textarea
							bind:this={textareaEl}
							bind:value={inputText}
							oninput={adjustTextarea}
							onkeydown={handleTextareaKeydown}
							placeholder="댓글 추가..."
							maxlength="500"
							rows={1}
							class="w-full resize-none bg-transparent text-sm leading-6 text-yt-text outline-none placeholder:text-yt-text-muted"
							style="overflow-y: hidden;"
						></textarea>
					</div>
					<button
						type="button"
						onclick={() => void submitComment()}
						disabled={!inputText.trim() || submitting}
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yt-chip-active text-yt-chip-active-text disabled:opacity-40"
						aria-label="댓글 보내기"
					>
						{#if submitting}
							<span class="text-xs">...</span>
						{:else}
							<SendHorizontal size={18} />
						{/if}
					</button>
				</div>
			{/if}
		</div>

		{#if showLoginBottomSheet}
			<BottomSheetLogin
				onClose={() => (showLoginBottomSheet = false)}
				onSuccess={loadComments}
			/>
		{/if}
	</div>
</div>
