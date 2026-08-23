<script lang="ts">
	import "../app.css";
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import type { Snippet } from "svelte";
	import { Menu, Search, CircleUserRound } from "lucide-svelte";
	import Toast from "$lib/components/Toast.svelte";
	import ConfirmPopup from "$lib/components/ConfirmPopup.svelte";
	import BottomNav from "$lib/components/BottomNav.svelte";
	import GuideRail from "$lib/components/GuideRail.svelte";
	import { authStore } from "$lib/stores/auth";
	import { guideCollapsed, logoutConfirmOpen } from "$lib/stores/ui";
	import { theme } from "$lib/stores/theme";
	import { toast } from "$lib/stores/toast";
	import type { AuthState } from "$lib/types";

	// 테마 스토어를 초기화해 시스템 테마 변경 구독을 활성화
	void theme;

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	let authState: AuthState = $state({
		isAuthenticated: false,
		user: null,
		isLoading: true,
		registerToken: null,
	});

	function normalizePath(pathname: string): string {
		if (pathname.length > 1 && pathname.endsWith("/")) {
			return pathname.slice(0, -1);
		}

		return pathname;
	}

	const currentPath = $derived(normalizePath($page.url.pathname));
	const isLoginRoute = $derived(currentPath.startsWith("/login"));
	const isSignupRoute = $derived(currentPath.startsWith("/auth/signup"));
	// 쇼츠 뷰어·로그인 등 풀스크린 화면에서는 하단 네비게이션 숨김
	const showBottomNav = $derived(
		!currentPath.startsWith("/shorts") &&
			!currentPath.startsWith("/login") &&
			!currentPath.startsWith("/auth"),
	);
	let hasCheckedAuth = $state(false);
	let navigationInFlight = false;
	let searchInput = $state("");

	// URL의 ?q=와 검색창 동기화
	$effect(() => {
		searchInput = $page.url.searchParams.get("q") ?? "";
	});

	function submitSearch(e: Event) {
		e.preventDefault();
		const q = searchInput.trim();
		void goto(q ? `/?q=${encodeURIComponent(q)}` : "/");
	}

	function navigateTo(path: string) {
		const target = normalizePath(path);

		if (navigationInFlight || currentPath === target) {
			return;
		}

		navigationInFlight = true;
		queueMicrotask(async () => {
			try {
				await goto(path);
			} finally {
				navigationInFlight = false;
			}
		});
	}

	onMount(() => {
		const unsubscribe = authStore.subscribe((state) => {
			authState = state;
		});

		void authStore.checkAuth().finally(() => {
			hasCheckedAuth = true;
		});

		return unsubscribe;
	});

	$effect(() => {
		if (!hasCheckedAuth || authState.isLoading) {
			return;
		}

		if (authState.isAuthenticated) {
			if (isLoginRoute || isSignupRoute) {
				navigateTo("/");
			}
			return;
		}

		if (isSignupRoute && !authState.registerToken) {
			navigateTo("/login");
			return;
		}

		if (isLoginRoute && authState.registerToken) {
			navigateTo("/auth/signup");
		}
	});
</script>

<div class="h-[100dvh] w-full bg-yt-bg flex flex-col overflow-hidden">
	<Toast />

	{#if $logoutConfirmOpen}
		<ConfirmPopup
			title={`${authState.user?.name ?? ""}님, 로그아웃 하시겠습니까?`}
			cancelText="취소"
			confirmText="로그아웃"
			onConfirm={async () => {
				logoutConfirmOpen.set(false);
				await authStore.logout();
				toast.show("로그아웃 되었습니다.");
			}}
			onCancel={() => logoutConfirmOpen.set(false)}
		/>
	{/if}

	<!-- 데스크톱(lg+) 전용 상단 헤더: 유튜브 데스크톱 스타일 (로고 / 중앙 검색바 / 우측 메뉴) -->
	<header
		class="hidden lg:flex items-center h-14 px-4 shrink-0 bg-yt-bg z-30"
	>
		<!-- 좌측: 햄버거(가이드 접기) + 로고 -->
		<div class="flex items-center gap-1 shrink-0">
			<button
				type="button"
				onclick={() => guideCollapsed.update((v) => !v)}
				class="p-2 text-yt-text rounded-full hover:bg-yt-surface"
				aria-label="가이드 접기/펼치기"
			>
				<Menu size={22} strokeWidth={1.8} />
			</button>
			<a href="/" class="flex items-center px-2" aria-label="홈으로">
				<img
					src="/images/logos/logo-text-mono.svg"
					alt="COMMUNITY_PROJECT"
					class="h-[18px] object-contain dark:invert"
					draggable="false"
				/>
			</a>
		</div>

		<!-- 중앙: 이름·닉네임·쇼츠 내용 통합 검색 -->
		<div class="flex-1 flex items-center justify-center min-w-0 px-8">
			<form
				onsubmit={submitSearch}
				class="flex items-center w-full max-w-[540px]"
				role="search"
			>
				<input
					type="search"
					bind:value={searchInput}
					placeholder="이름, 닉네임, 내용 검색"
					class="flex-1 min-w-0 h-10 px-4 rounded-l-full border border-yt-border bg-yt-bg text-yt-text placeholder-yt-text-muted outline-none focus:border-blue-500"
					aria-label="이름, 닉네임, 내용 검색"
				/>
				<button
					type="submit"
					class="h-10 px-5 rounded-r-full border border-l-0 border-yt-border bg-yt-surface text-yt-text hover:bg-yt-surface-hover"
					aria-label="검색"
				>
					<Search size={18} strokeWidth={1.8} />
				</button>
			</form>
		</div>

		<!-- 우측: 로그인/내 페이지 필 -->
		<div class="flex items-center gap-2 shrink-0 text-yt-text">
			{#if authState.isAuthenticated && authState.user}
				<button
					type="button"
					onclick={() => logoutConfirmOpen.set(true)}
					class="flex items-center gap-2 h-9 pl-2 pr-3 rounded-full border border-yt-border hover:bg-yt-surface text-sm font-medium"
				>
					<CircleUserRound size={20} strokeWidth={1.8} />
					{authState.user.name}
				</button>
			{:else}
				<a
					href="/login"
					class="flex items-center gap-2 h-9 pl-2 pr-3 rounded-full border border-yt-border text-sm font-medium text-blue-600 dark:text-sky-400 hover:bg-blue-500/10"
				>
					<CircleUserRound size={20} strokeWidth={1.8} />
					로그인
				</a>
			{/if}
		</div>
	</header>

	<div class="flex-1 flex min-h-0">
		<!-- 데스크톱(lg+) 전용 좌측 가이드 레일 -->
		<GuideRail />

		<main class="flex-1 min-w-0 min-h-0 flex flex-col relative">
			<div class="flex-1 flex flex-col min-h-0">
				{@render children()}
			</div>
			{#if showBottomNav}
				<BottomNav />
			{/if}
		</main>
	</div>
</div>
