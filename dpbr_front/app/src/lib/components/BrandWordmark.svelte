<script lang="ts">
	interface Props {
		inverse?: boolean;
		compact?: boolean;
	}

	let { inverse = false, compact = false }: Props = $props();
</script>

<span class="inline-flex items-center gap-1.5 whitespace-nowrap" aria-hidden="true">
	<img
		src="/images/icons/app_favicon.png?v=17"
		alt=""
		class={compact ? "size-5 shrink-0" : "size-6 shrink-0"}
		draggable="false"
	/>
	<span
		class={`font-bold leading-none tracking-[-0.055em] ${inverse ? "text-white" : "text-yt-text"} ${compact ? "text-[18px]" : "text-xl"}`}
	>
		단풍바람
	</span>
</span>
