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
	<img
		src={inverse ? "/images/logos/logo-text-white.svg" : "/images/logos/logo-text-mono.svg"}
		alt=""
		class={`${compact ? "h-4" : "h-[18px]"} w-auto shrink-0 object-contain ${inverse ? "" : "dark:invert"}`}
		draggable="false"
	/>
</span>
