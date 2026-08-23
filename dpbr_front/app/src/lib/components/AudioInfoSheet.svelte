<script lang="ts">
	import { tick } from "svelte";
	import { ExternalLink, Music2, X } from "lucide-svelte";
	import type { SettlementItem } from "$lib/types";

	interface Props {
		settlement: SettlementItem;
		onClose: () => void;
	}

	let { settlement, onClose }: Props = $props();
	let dialogElement = $state<HTMLDivElement | null>(null);

	$effect(() => {
		const previouslyFocused =
			document.activeElement instanceof HTMLElement
				? document.activeElement
				: null;
		void tick().then(() => dialogElement?.focus());

		return () => previouslyFocused?.focus();
	});

	function formatTime(seconds: number): string {
		const wholeSeconds = Math.max(0, Math.floor(seconds));
		const minutes = Math.floor(wholeSeconds / 60);
		const remainder = wholeSeconds % 60;
		return `${minutes}:${remainder.toString().padStart(2, "0")}`;
	}

	const playbackRange = $derived.by(() => {
		const start = settlement.audioStartSeconds ?? 0;
		const duration = settlement.audioDurationSeconds ?? null;
		if (duration === null) return `${formatTime(start)}부터 재생`;
		return `${formatTime(start)}–${formatTime(start + duration)}`;
	});

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			onClose();
			return;
		}
		if (event.key !== "Tab" || !dialogElement) return;

		const focusable = [
			...dialogElement.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
			),
		];
		if (focusable.length === 0) {
			event.preventDefault();
			dialogElement.focus();
			return;
		}

		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (
			event.shiftKey &&
			(document.activeElement === first || document.activeElement === dialogElement)
		) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
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
		bind:this={dialogElement}
		class="relative w-full rounded-t-2xl border-t border-yt-border bg-yt-bg text-yt-text shadow-2xl lg:w-[420px] lg:rounded-2xl lg:border"
		onclick={(event) => event.stopPropagation()}
		role="dialog"
		aria-modal="true"
		aria-labelledby="audio-info-title"
		tabindex="-1"
	>
		<div class="flex justify-center pt-2 lg:hidden" aria-hidden="true">
			<div class="h-1 w-10 rounded-full bg-yt-text-muted/40"></div>
		</div>
		<header class="flex min-h-14 items-center justify-between border-b border-yt-border px-5 py-3">
			<div class="flex min-w-0 items-center gap-3">
				<span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yt-surface">
					<Music2 size={20} />
				</span>
				<div class="min-w-0">
					<p class="text-xs text-yt-text-muted">현재 재생 중인 BGM</p>
					<h2 id="audio-info-title" class="truncate text-base font-semibold">
						{settlement.audioTitle || "등록된 곡명 없음"}
					</h2>
				</div>
			</div>
			<button
				type="button"
				onclick={onClose}
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-yt-surface"
				aria-label="BGM 정보 닫기"
			>
				<X size={22} />
			</button>
		</header>

		<div class="space-y-4 px-5 py-5">
			{#if settlement.audioArtist}
				<div>
					<p class="text-xs text-yt-text-muted">아티스트</p>
					<p class="mt-1 text-sm">{settlement.audioArtist}</p>
				</div>
			{/if}
			<div>
				<p class="text-xs text-yt-text-muted">쇼츠 재생 구간</p>
				<p class="mt-1 text-sm tabular-nums">{playbackRange}</p>
			</div>
			{#if settlement.audioSourceUrl}
				<a
					href={settlement.audioSourceUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-yt-chip-active px-4 text-sm font-medium text-yt-chip-active-text hover:opacity-90"
				>
					원본 음원 보기
					<ExternalLink size={17} />
				</a>
			{:else}
				<p class="rounded-xl bg-yt-surface px-4 py-3 text-sm text-yt-text-muted">
					원본 음원 주소가 아직 등록되지 않았습니다.
				</p>
			{/if}
		</div>
	</div>
</div>
