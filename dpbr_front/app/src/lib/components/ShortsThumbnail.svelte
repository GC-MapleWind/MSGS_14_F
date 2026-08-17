<script lang="ts">
	import { EllipsisVertical } from "lucide-svelte";
	import type { SettlementItem } from "$lib/types";
	import { handleImageError } from "$lib/utils/image";

	interface Props {
		item: SettlementItem;
	}

	let { item }: Props = $props();

	function formatDate(dateStr: string): string {
		const d = new Date(dateStr);
		return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
	}
</script>

<a
	href="/shorts/{item.characterId}?item={item.id}"
	class="relative block aspect-[9/16] overflow-hidden rounded-lg bg-yt-surface select-none"
	draggable="false"
>
	<img
		src={item.imageUrl}
		alt={item.title}
		onerror={handleImageError}
		class="absolute inset-0 w-full h-full object-cover"
		draggable="false"
		loading="lazy"
	/>

	<!-- 우상단 ⋮ (유튜브 쇼츠 그리드 스타일) -->
	<span
		class="absolute top-1 right-0.5 text-white drop-shadow"
		aria-hidden="true"
	>
		<EllipsisVertical size={18} />
	</span>

	<!-- 하단 제목 + 획득일 오버레이 -->
	<div
		class="absolute bottom-0 left-0 right-0 px-2 pb-2 pt-8 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-0.5"
	>
		<p
			class="text-[12px] font-semibold text-white leading-tight line-clamp-2 drop-shadow"
		>
			{item.title}
		</p>
		<span class="text-[10px] text-white/80 drop-shadow"
			>{formatDate(item.acquiredAt)}</span
		>
	</div>
</a>
