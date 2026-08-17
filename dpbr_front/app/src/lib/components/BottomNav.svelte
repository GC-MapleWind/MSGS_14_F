<script lang="ts">
	import { page } from "$app/stores";
	import {
		Home,
		Megaphone,
		ListOrdered,
		CircleUserRound,
	} from "lucide-svelte";
	import {
		openChronologicalSettlements,
		openMyPage,
	} from "$lib/utils/nav";

	const currentPath = $derived($page.url.pathname);
	const itemClass =
		"flex h-full min-w-0 flex-col items-center justify-center gap-px py-0.5";
</script>

<nav
	class="lg:hidden h-14 shrink-0 grid grid-cols-4 items-stretch bg-yt-bg border-t border-yt-border px-1 z-30"
	aria-label="주요 메뉴"
>
	<a
		href="/"
		class={`${itemClass} ${currentPath === "/" ? "text-yt-text" : "text-yt-text-muted"}`}
	>
		<Home
			size={23}
			strokeWidth={currentPath === "/" ? 2.4 : 1.8}
			fill={currentPath === "/" ? "currentColor" : "none"}
		/>
		<span class="text-[9px] leading-3">홈</span>
	</a>

	<button
		type="button"
		onclick={() => void openChronologicalSettlements()}
		aria-label="날짜순 재생: 오래된 결산부터 보기"
		class={`${itemClass} text-yt-text-muted`}
	>
		<ListOrdered size={23} strokeWidth={1.8} />
		<span class="text-[9px] leading-3 whitespace-nowrap">날짜순 재생</span>
	</button>

	<a
		href="/member/admin-team"
		class={`${itemClass} ${currentPath.startsWith("/member/admin-team") ? "text-yt-text" : "text-yt-text-muted"}`}
		aria-label="운영팀 한마디"
	>
		<Megaphone
			size={23}
			strokeWidth={currentPath.startsWith("/member/admin-team") ? 2.4 : 1.8}
		/>
		<span class="text-[9px] leading-3 whitespace-nowrap">운영팀 한마디</span>
	</a>

	<button
		type="button"
		onclick={openMyPage}
		class={`${itemClass} text-yt-text-muted`}
	>
		<CircleUserRound size={23} strokeWidth={1.8} />
		<span class="text-[9px] leading-3">내 페이지</span>
	</button>
</nav>
