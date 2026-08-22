<script lang="ts">
	import { page } from "$app/stores";
	import {
		Home,
		Shuffle,
		Megaphone,
		CircleUserRound,
		Monitor,
		Sun,
		Moon,
	} from "lucide-svelte";
	import { authStore } from "$lib/stores/auth";
	import { guideCollapsed } from "$lib/stores/ui";
	import { theme, type ThemePreference } from "$lib/stores/theme";
	import { openMyPage, openRandomSettlement } from "$lib/utils/nav";

	const currentPath = $derived($page.url.pathname);

	const themeOptions: { value: ThemePreference; label: string }[] = [
		{ value: "system", label: "시스템" },
		{ value: "light", label: "라이트" },
		{ value: "dark", label: "다크" },
	];

	// 확장형 행 (아이콘 + 라벨)
	const rowClass = (active: boolean) =>
		`w-full flex items-center gap-6 h-10 px-3 rounded-lg text-sm hover:bg-yt-surface transition-colors ${
			active ? "bg-yt-surface font-medium" : ""
		} text-yt-text`;

	// 미니 레일 항목 (아이콘 위 라벨)
	const miniClass = (active: boolean) =>
		`w-full flex flex-col items-center gap-1.5 py-4 rounded-lg hover:bg-yt-surface transition-colors ${
			active ? "text-yt-text" : "text-yt-text-muted"
		}`;
</script>

{#if $guideCollapsed}
	<!-- 미니 가이드 (72px) -->
	<nav
		class="hidden lg:flex flex-col items-center w-[72px] shrink-0 px-1 pt-1 bg-yt-bg overflow-y-auto no-scrollbar"
	>
		<a href="/" class={miniClass(currentPath === "/")} aria-label="홈">
			<Home size={22} strokeWidth={currentPath === "/" ? 2.4 : 1.6} />
			<span class="text-[10px]">홈</span>
		</a>
		<a
			href="/member/admin-team"
			class={miniClass(currentPath.startsWith("/member/admin-team"))}
			aria-label="운영진 한마디"
		>
			<Megaphone
				size={22}
				strokeWidth={currentPath.startsWith("/member/admin-team")
					? 2.4
					: 1.6}
			/>
			<span class="text-[10px]">운영진</span>
		</a>
		<button
			type="button"
			onclick={() => void openRandomSettlement()}
			class={miniClass(false)}
			aria-label="자유 재생: 무작위 결산 보기"
		>
			<Shuffle size={22} strokeWidth={1.6} />
			<span class="text-[10px]">자유 재생</span>
		</button>
		<button
			type="button"
			onclick={openMyPage}
			class={miniClass(false)}
			aria-label="내 페이지"
		>
			<CircleUserRound size={22} strokeWidth={1.6} />
			<span class="text-[10px]">내 페이지</span>
		</button>
	</nav>
{:else}
	<!-- 확장 가이드 (240px, 유튜브 데스크톱 기본) -->
	<nav
		class="hidden lg:flex flex-col w-60 shrink-0 px-3 pt-2 pb-6 bg-yt-bg overflow-y-auto no-scrollbar"
	>
		<a href="/" class={rowClass(currentPath === "/")}>
			<Home size={20} strokeWidth={currentPath === "/" ? 2.2 : 1.6} />
			홈
		</a>
		<a
			href="/member/admin-team"
			class={rowClass(currentPath.startsWith("/member/admin-team"))}
		>
			<Megaphone
				size={20}
				strokeWidth={currentPath.startsWith("/member/admin-team")
					? 2.2
					: 1.6}
			/>
			운영진 한마디
		</a>
		<button
			type="button"
			onclick={() => void openRandomSettlement()}
			class={rowClass(false)}
		>
			<Shuffle size={20} strokeWidth={1.6} />
			자유 재생
		</button>
		<button type="button" onclick={openMyPage} class={rowClass(false)}>
			<CircleUserRound size={20} strokeWidth={1.6} />
			내 페이지
		</button>

		<hr class="border-yt-border my-3" />

		{#if !$authStore.isAuthenticated}
			<!-- 로그인 프로모 (유튜브 로그아웃 상태 박스) -->
			<div class="px-3 flex flex-col gap-3">
				<p class="text-sm text-yt-text leading-snug">
					로그인하면 결산에 댓글을 남기고<br />응원할 수 있습니다.
				</p>
				<a
					href="/login"
					class="self-start flex items-center gap-2 h-9 pl-2 pr-3 rounded-full border border-yt-border text-sm font-medium text-blue-600 dark:text-sky-400 hover:bg-blue-500/10"
				>
					<CircleUserRound size={20} strokeWidth={1.8} />
					로그인
				</a>
			</div>

			<hr class="border-yt-border my-3" />
		{/if}

		<!-- 디자인 (테마) -->
		<span class="px-3 pb-2 text-base font-medium text-yt-text">디자인</span>
		<div class="flex items-center gap-1.5 px-3">
			{#each themeOptions as option (option.value)}
				<button
					type="button"
					onclick={() => theme.set(option.value)}
					class={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
						$theme === option.value
							? "bg-yt-chip-active text-yt-chip-active-text"
							: "bg-yt-chip text-yt-text hover:bg-yt-surface-hover"
					}`}
					aria-pressed={$theme === option.value}
				>
					{#if option.value === "system"}
						<Monitor size={12} />
					{:else if option.value === "light"}
						<Sun size={12} />
					{:else}
						<Moon size={12} />
					{/if}
					{option.label}
				</button>
			{/each}
		</div>

		<p class="px-3 pt-6 text-xs text-yt-text-muted">
			'26년 2월 28일 ~ '26년 8월 16일의 기록
		</p>
	</nav>
{/if}
