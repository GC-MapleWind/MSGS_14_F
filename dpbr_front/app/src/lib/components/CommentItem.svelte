<script lang="ts">
	import { tick } from "svelte";
	import { EllipsisVertical, Pencil, Trash2 } from "lucide-svelte";
	import type { SettlementComment } from "$lib/types";
	import { authStore } from "$lib/stores/auth";
	import { deleteComment, updateComment } from "$lib/api";
	import ConfirmPopup from "$lib/components/ConfirmPopup.svelte";
	import { toast } from "$lib/stores/toast";

	interface Props {
		comment: SettlementComment;
		onUpdate?: (comment: SettlementComment) => void;
		onDelete?: (id: string) => void;
	}

	let { comment, onUpdate, onDelete }: Props = $props();
	let isDeleting = $state(false);
	let isSaving = $state(false);
	let showDeletePopup = $state(false);
	let isMenuOpen = $state(false);
	let isEditing = $state(false);
	let editText = $state("");
	let editTextarea = $state<HTMLTextAreaElement | null>(null);
	let firstMenuAction = $state<HTMLButtonElement | null>(null);
	const isOwnComment = $derived(
		$authStore.isAuthenticated && $authStore.user?.id === comment.userId,
	);
	const trimmedEditText = $derived(editText.trim());
	const canSave = $derived(
		trimmedEditText.length > 0 &&
		trimmedEditText !== comment.content &&
		!isSaving,
	);

	function closeMenu() {
		isMenuOpen = false;
	}

	async function toggleMenu() {
		isMenuOpen = !isMenuOpen;
		if (!isMenuOpen) return;
		await tick();
		firstMenuAction?.focus();
	}

	async function startEditing() {
		editText = comment.content;
		isMenuOpen = false;
		isEditing = true;
		await tick();
		editTextarea?.focus();
		editTextarea?.setSelectionRange(editText.length, editText.length);
	}

	function cancelEditing() {
		if (isSaving) return;
		editText = comment.content;
		isEditing = false;
	}

	async function saveEditing() {
		if (!canSave) return;

		isSaving = true;
		try {
			const updated = await updateComment(comment.id, trimmedEditText);
			const nextComment = {
				...comment,
				...updated,
				settlementId: updated.settlementId || comment.settlementId,
				authorAvatar: comment.authorAvatar,
			};
			onUpdate?.(nextComment);
			isEditing = false;
			toast.show("댓글을 수정했습니다.");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "댓글 수정에 실패했습니다.";
			toast.show(message);
		} finally {
			isSaving = false;
		}
	}

	function handleDeleteClick() {
		isMenuOpen = false;
		showDeletePopup = true;
	}

	function handleCancelDelete() {
		showDeletePopup = false;
	}

	async function handleConfirmDelete() {
		showDeletePopup = false;
		isDeleting = true;
		try {
			await deleteComment(comment.id);
			onDelete?.(comment.id);
			toast.show("댓글을 삭제했습니다.");
		} catch (e) {
			const message =
				e instanceof Error ? e.message : "삭제에 실패했습니다.";
			toast.show(message);
		} finally {
			isDeleting = false;
		}
	}

	function handleMenuKeydown(event: KeyboardEvent) {
		if (event.key !== "Escape") return;
		event.stopPropagation();
		isMenuOpen = false;
	}

	function handleEditKeydown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			event.preventDefault();
			event.stopPropagation();
			cancelEditing();
			return;
		}

		if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			void saveEditing();
		}
	}
</script>

<div
	class="relative flex flex-col gap-2 px-6 pt-4 bg-yt-bg transition-opacity {isDeleting
		? 'opacity-50'
		: ''}"
>
	<div class="flex justify-between items-center">
		<div class="flex items-center gap-2">
			<span class="text-xs font-bold text-yt-text"
				>{comment.author}</span
			>
		</div>
		{#if isOwnComment && !isEditing}
			<button
				type="button"
				onclick={() => void toggleMenu()}
				disabled={isDeleting}
				class="flex h-8 w-8 items-center justify-center rounded-full text-yt-text-muted transition-colors hover:bg-yt-surface hover:text-yt-text disabled:opacity-50"
				aria-label="댓글 메뉴"
				aria-expanded={isMenuOpen}
				aria-controls={`comment-menu-${comment.id}`}
			>
				<EllipsisVertical size={18} />
			</button>
		{/if}
	</div>
	<div class="pb-4 border-b border-yt-border flex flex-col gap-1">
		{#if isEditing}
			<label class="sr-only" for={`comment-edit-${comment.id}`}>댓글 수정</label>
			<textarea
				bind:this={editTextarea}
				bind:value={editText}
				onkeydown={handleEditKeydown}
				id={`comment-edit-${comment.id}`}
				maxlength="500"
				rows="3"
				disabled={isSaving}
				class="w-full resize-none rounded-xl border border-yt-border bg-yt-surface px-3 py-2 text-sm leading-5 text-yt-text outline-none focus:border-yt-text-muted disabled:opacity-60"
			></textarea>
			<div class="flex items-center justify-between gap-3">
				<span class="text-[11px] text-yt-text-muted" aria-live="polite">
					{editText.length}/500 · Ctrl/⌘+Enter로 저장
				</span>
				<div class="flex gap-2">
					<button
						type="button"
						onclick={cancelEditing}
						disabled={isSaving}
						class="rounded-full px-3 py-1.5 text-xs font-medium text-yt-text hover:bg-yt-surface disabled:opacity-50"
					>
						취소
					</button>
					<button
						type="button"
						onclick={() => void saveEditing()}
						disabled={!canSave}
						class="rounded-full bg-yt-chip-active px-3 py-1.5 text-xs font-medium text-yt-chip-active-text disabled:opacity-40"
						aria-busy={isSaving}
					>
						{isSaving ? "저장 중..." : "저장"}
					</button>
				</div>
			</div>
		{:else}
			<p class="whitespace-pre-wrap break-words text-sm font-medium text-yt-text">{comment.content}</p>
			<span class="text-xs font-light text-yt-text-muted text-left"
				>{comment.createdAt}</span
			>
		{/if}
	</div>

	{#if isMenuOpen && isOwnComment}
		<button
			type="button"
			onclick={closeMenu}
			class="fixed inset-0 z-10 cursor-default"
			aria-label="댓글 메뉴 닫기"
		></button>
		<div
			id={`comment-menu-${comment.id}`}
			class="absolute right-6 top-12 z-20 min-w-28 overflow-hidden rounded-xl border border-yt-border bg-yt-bg py-1 shadow-xl"
			role="menu"
			aria-label="내 댓글 관리"
			onkeydown={handleMenuKeydown}
			tabindex="-1"
		>
			<button
				bind:this={firstMenuAction}
				type="button"
				onclick={() => void startEditing()}
				class="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-yt-text hover:bg-yt-surface"
				role="menuitem"
			>
				<Pencil size={16} />
				수정
			</button>
			<button
				type="button"
				onclick={handleDeleteClick}
				class="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-yt-accent hover:bg-yt-surface"
				role="menuitem"
			>
				<Trash2 size={16} />
				삭제
			</button>
		</div>
	{/if}
</div>

{#if showDeletePopup}
	<ConfirmPopup
		title="댓글을 삭제하시겠습니까?"
		cancelText="뒤로가기"
		confirmText="삭제하기"
		onConfirm={handleConfirmDelete}
		onCancel={handleCancelDelete}
	/>
{/if}
