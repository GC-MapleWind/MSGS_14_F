<script lang="ts">
	import { page } from "$app/stores";
	import {
		Home,
		Megaphone,
		Shuffle,
		CircleUserRound,
	} from "lucide-svelte";
	import { openMyPage, openRandomSettlement } from "$lib/utils/nav";

	const currentPath = $derived($page.url.pathname);
	const itemClass =
		"flex h-full min-w-0 flex-col items-center justify-center gap-0.5 py-1";
</script>

<nav
	class="lg:hidden h-16 shrink-0 grid grid-cols-4 items-stretch bg-yt-bg border-t border-yt-border px-1 z-30"
>
	<a
		href="/"
		class={`${itemClass} ${currentPath === "/" ? "text-yt-text" : "text-yt-text-muted"}`}
	>
		<Home size={24} strokeWidth={currentPath === "/" ? 2.4 : 1.6} />
		<span class="text-[10px]">홈</span>
	</a>

	<a
		href="/member/admin-team"
		class={`${itemClass} ${currentPath.startsWith("/member/admin-team") ? "text-yt-text" : "text-yt-text-muted"}`}
		aria-label="운영팀 한마디"
	>
		<Megaphone
			size={24}
			strokeWidth={currentPath.startsWith("/member/admin-team") ? 2.4 : 1.6}
		/>
		<span class="text-[10px] whitespace-nowrap">운영팀 한마디</span>
	</a>

	<button
		type="button"
		onclick={() => void openRandomSettlement()}
		aria-label="자유 재생: 무작위 결산 보기"
		class={`${itemClass} text-yt-text-muted`}
	>
		<Shuffle size={24} strokeWidth={1.6} />
		<span class="text-[10px] whitespace-nowrap">자유 재생</span>
	</button>

	<button
		type="button"
		onclick={openMyPage}
		class={`${itemClass} text-yt-text-muted`}
	>
		<CircleUserRound size={24} strokeWidth={1.6} />
		<span class="text-[10px]">내 페이지</span>
	</button>
</nav>
