<script lang="ts">
	import type { TeamMessageItem } from "$lib/types";
	import {
		DEFAULT_AVATAR_URL,
		handleImageError,
	} from "$lib/utils/image";

	interface Props {
		item: TeamMessageItem;
	}

	let { item }: Props = $props();
</script>

<a
	href="/team-message/{item.id}"
	class="flex items-center gap-4 px-6 py-4 bg-yt-bg border-b border-yt-border hover:bg-yt-surface focus:bg-yt-surface transition-none last:border-b-0"
>
	<div
		class="w-[4.5rem] h-[4.5rem] shrink-0 rounded-2xl overflow-hidden bg-yt-surface shadow-sm"
	>
		<img
			src={item.imageUrl || DEFAULT_AVATAR_URL}
			alt={item.name}
			onerror={handleImageError}
			class={item.imageUrl
				? "w-full h-full object-cover"
				: "w-10 h-10 object-contain mx-auto mt-5"}
		/>
	</div>

	<div class="flex flex-col grow min-w-0 gap-1 ml-2">
		<span
			class="text-[17px] leading-tight text-yt-text font-semibold truncate"
			>{item.title}</span
		>
		<span class="text-[13px] font-normal text-yt-text-muted"
			>{item.name} {item.role}</span
		>
	</div>
</a>
