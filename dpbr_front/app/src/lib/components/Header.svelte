<script lang="ts">
	import { tick } from "svelte";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { ArrowLeft, Search, X } from "lucide-svelte";
	import { toast } from "$lib/stores/toast";

	interface Props {
		variant?: "main" | "detail" | "close" | "save";
		title?: string;
		subtitle?: string;
		onBackClick?: () => void;
		onCloseClick?: () => void;
	}

	let {
		variant = "main",
		title = "",
		subtitle = "",
		onBackClick,
		onCloseClick,
	}: Props = $props();

	let logoClickCount = $state(0);
	let lastLogoClickTime = 0;
	let isEasterEggActive = false;
	let mainSearchInput = $state("");
	let isMainSearchOpen = $state(false);
	let mainSearchElement = $state<HTMLInputElement | null>(null);

	$effect(() => {
		mainSearchInput = $page.url.searchParams.get("q") ?? "";
	});

	async function openMainSearch() {
		isMainSearchOpen = true;
		await tick();
		mainSearchElement?.focus();
	}

	function closeMainSearch() {
		isMainSearchOpen = false;
		mainSearchInput = $page.url.searchParams.get("q") ?? "";
	}

	async function submitMainSearch(event: SubmitEvent) {
		event.preventDefault();
		const query = mainSearchInput.trim();
		await goto(query ? `/?q=${encodeURIComponent(query)}` : "/");
		isMainSearchOpen = false;
	}

	function handleLogoClick() {
		if (isEasterEggActive) return;

		const now = Date.now();
		if (now - lastLogoClickTime < 500) {
			logoClickCount += 1;
		} else {
			logoClickCount = 1;
		}
		lastLogoClickTime = now;

		if (logoClickCount === 3) {
			isEasterEggActive = true;
			const credits = [
				"Fullstack DevOps & PM\n강민",
				"\nDesigner & PM\n강민아",
				"\nFrontend Engineer\n황현성",
				"\nBackend Engineer\n배승민 서민성 이서윤",
				"\nServer Engineer\n김형규",
			].join("\n");
			toast.show(credits, 5000, "center");
			logoClickCount = 0;

			setTimeout(() => {
				isEasterEggActive = false;
			}, 5000);
		}
	}
</script>

{#if variant === "main"}
	<!-- 모바일 홈: YouTube처럼 돋보기 클릭 시 검색 입력으로 전환 -->
	<header
		class="flex items-center min-h-12 bg-yt-bg px-3 py-2 sticky top-0 z-30 shrink-0"
	>
		{#if isMainSearchOpen}
			<div class="flex w-full items-center gap-1">
				<button
					type="button"
					onclick={closeMainSearch}
					class="shrink-0 rounded-full p-2 text-yt-text active:bg-yt-surface"
					aria-label="검색 닫기"
				>
					<ArrowLeft size={22} strokeWidth={1.8} />
				</button>
				<form
					onsubmit={submitMainSearch}
					class="flex min-w-0 flex-1"
					role="search"
				>
					<input
						bind:this={mainSearchElement}
						type="search"
						bind:value={mainSearchInput}
						placeholder="이름, 닉네임, 내용 검색"
						class="h-10 min-w-0 flex-1 rounded-l-full border border-yt-border bg-yt-surface px-4 text-sm text-yt-text placeholder-yt-text-muted outline-none focus:border-blue-500"
						aria-label="이름, 닉네임, 내용 검색"
						onkeydown={(event) => {
							if (event.key === "Escape") closeMainSearch();
						}}
					/>
					<button
						type="submit"
						class="h-10 shrink-0 rounded-r-full border border-l-0 border-yt-border bg-yt-surface px-4 text-yt-text active:bg-yt-surface-hover"
						aria-label="검색"
					>
						<Search size={18} strokeWidth={1.8} />
					</button>
				</form>
			</div>
		{:else}
			<button
				type="button"
				onclick={handleLogoClick}
				class="flex items-center justify-center active:scale-95 transition-transform"
				aria-label="COMMUNITY_PROJECT 로고"
			>
				<img
					src="/images/logos/logo-text-mono.svg"
					alt="COMMUNITY_PROJECT"
					class="h-[18px] object-contain dark:invert"
					draggable="false"
				/>
			</button>
			<div class="ml-auto flex items-center gap-1">
				<button
					type="button"
					onclick={() => void openMainSearch()}
					class="rounded-full p-2 text-yt-text active:bg-yt-surface"
					aria-label="검색 열기"
				>
					<Search size={22} strokeWidth={1.8} />
				</button>
			</div>
		{/if}
	</header>
{:else if variant === "detail"}
	<header
		class="relative flex items-center bg-yt-bg px-3 py-2 sticky top-0 z-30 border-b border-yt-border shrink-0"
	>
		<button
			type="button"
			onclick={onBackClick}
			class="p-2 text-yt-text shrink-0 relative z-10"
			aria-label="뒤로가기"
		>
			<ArrowLeft size={22} strokeWidth={1.8} />
		</button>
		<div
			class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-12"
		>
			{#if title}
				<span class="text-[17px] font-medium text-yt-text truncate"
					>{title}</span
				>
			{/if}
			{#if subtitle}
				<span class="text-xs text-yt-text-muted">{subtitle}</span>
			{/if}
		</div>
	</header>
{:else if variant === "close"}
	<header
		class="flex items-center justify-end bg-yt-bg px-3 py-2 sticky top-0 z-30 shrink-0"
	>
		<button
			type="button"
			onclick={onCloseClick}
			class="p-2 text-yt-text"
			aria-label="닫기"
		>
			<X size={22} strokeWidth={1.8} />
		</button>
	</header>
{:else if variant === "save"}
	<header
		class="flex items-center justify-end bg-transparent px-3 py-2 sticky top-0 z-40 shrink-0"
	>
		<button
			type="button"
			onclick={onCloseClick}
			class="p-2 text-white"
			aria-label="닫기"
		>
			<X size={22} strokeWidth={1.8} />
		</button>
	</header>
{/if}
