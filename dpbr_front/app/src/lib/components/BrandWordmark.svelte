<script lang="ts">
	interface Props {
		inverse?: boolean;
		compact?: boolean;
	}

	let { inverse = false, compact = false }: Props = $props();
</script>

<span class="inline-flex items-center gap-1.5 whitespace-nowrap" aria-hidden="true">
	<img
		src="/images/icons/symbol-logo-color.svg"
		alt=""
		class={compact ? "h-5 w-[18px] shrink-0 object-contain" : "h-6 w-[22px] shrink-0 object-contain"}
		draggable="false"
	/>
	<span
		class={`font-bold leading-none tracking-[-0.055em] ${inverse ? "text-white" : "text-yt-text"} ${compact ? "text-[18px]" : "text-xl"}`}
	>
		단풍바람
	</span>
</span>
