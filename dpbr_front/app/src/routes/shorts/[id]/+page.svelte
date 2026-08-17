<script lang="ts">
	import { tick, untrack } from "svelte";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import {
		ArrowLeft,
		ThumbsUp,
		MessageCircle,
		Download,
		Share2,
		Search,
		EllipsisVertical,
		ChevronUp,
		ChevronDown,
		Volume2,
		VolumeX,
		RotateCcw,
		Home,
		Link2,
		UserRound,
	} from "lucide-svelte";
	import SettlementCommentsSheet from "$lib/components/SettlementCommentsSheet.svelte";
	import {
		getCharacterById,
		getRandomSettlement,
		getSettlementById,
		getSettlementsByCharacterIdPaginated,
	} from "$lib/api";
	import { handleImageError } from "$lib/utils/image";
	import { toast } from "$lib/stores/toast";
	import type { Character, SettlementItem } from "$lib/types";
	type FeedSettlement = SettlementItem & { feedKey: string };

	const characterId = $derived($page.params.id ?? "");
	const deepLinkItemId = $derived($page.url.searchParams.get("item"));
	const randomFeedRequested = $derived(
		$page.url.searchParams.get("mode") === "random",
	);

	let character = $state<Character | null>(null);
	let charactersById = $state<Record<string, Character>>({});
	let settlements = $state<FeedSettlement[]>([]);
	let total = $state(0);
	let hasMore = $state(true);
	let randomFeedActive = $state(false);
	let pageNum = $state(1);
	const limit = 10;
	let loading = $state(true);
	let loadingMore = $state(false);
	let error = $state<string | null>(null);

	let scrollContainer = $state<HTMLDivElement | null>(null);
	let currentIndex = $state(0);
	let loadedRequestKey = "";
	let dataLoadVersion = 0;
	let feedSequence = 0;
	let audioElement = $state<HTMLAudioElement | null>(null);
	let isAudioMuted = $state(false);
	let audioNeedsInteraction = $state(false);
	let audioSegmentEnded = $state(false);
	let audioError = $state(false);
	let audioProgress = $state(0);
	let audioLoadId = 0;
	let audioAnimationFrame: number | null = null;
	let isShortsSearchOpen = $state(false);
	let shortsSearchInput = $state("");
	let shortsSearchElement = $state<HTMLInputElement | null>(null);
	let isSettingsOpen = $state(false);
	let commentsSettlement = $state<SettlementItem | null>(null);

	// 데스크톱 외부 액션 레일이 참조하는 현재 슬라이드
	const currentItem = $derived(
		settlements[
			Math.min(currentIndex, Math.max(settlements.length - 1, 0))
		] ?? null,
	);
	const currentItemCharacter = $derived(
		currentItem
			? charactersById[currentItem.characterId] ??
				(currentItem.characterId === character?.id ? character : null)
			: character,
	);
	const feedProgress = $derived(
		Math.min(currentIndex + 1, settlements.length) /
			(randomFeedActive
				? settlements.length || 1
				: total || settlements.length || 1),
	);
	const visibleProgress = $derived(
		currentItem?.audioUrl ? audioProgress : feedProgress,
	);

	// 좋아요 (백엔드 API가 없어 로컬 저장)
	const LIKED_STORAGE_KEY = "liked_settlements";
	const AUDIO_MUTED_STORAGE_KEY = "shorts_audio_muted";
	let likedIds = $state<Set<string>>(new Set());
	let exportingSettlementId = $state<string | null>(null);

	function loadLikedIds() {
		try {
			const raw = localStorage.getItem(LIKED_STORAGE_KEY);
			if (raw) {
				likedIds = new Set(JSON.parse(raw) as string[]);
			}
		} catch {
			likedIds = new Set();
		}
	}

	function loadAudioPreference() {
		try {
			isAudioMuted =
				localStorage.getItem(AUDIO_MUTED_STORAGE_KEY) === "true";
		} catch {
			isAudioMuted = false;
		}
	}

	function getAudioStart(item: SettlementItem): number {
		return Math.max(0, item.audioStartSeconds || 0);
	}

	function seekAudioToConfiguredStart(
		element: HTMLAudioElement,
		item: SettlementItem,
	) {
		const configuredStart = getAudioStart(item);
		const latestPlayableStart = Number.isFinite(element.duration)
			? Math.max(element.duration - 0.05, 0)
			: configuredStart;
		element.currentTime = Math.min(configuredStart, latestPlayableStart);
	}

	function stopAudioAnimation() {
		if (audioAnimationFrame === null) return;
		cancelAnimationFrame(audioAnimationFrame);
		audioAnimationFrame = null;
	}

	function getPlayableAudioDuration(
		element: HTMLAudioElement,
		item: SettlementItem,
	): number {
		const start = getAudioStart(item);
		const availableDuration = Number.isFinite(element.duration)
			? Math.max(element.duration - start, 0)
			: null;
		const configuredDuration = item.audioDurationSeconds ?? null;

		if (configuredDuration === null) return availableDuration ?? 0;
		if (availableDuration === null) return configuredDuration;
		return Math.min(configuredDuration, availableDuration);
	}

	function updateAudioPlaybackState(
		element: HTMLAudioElement,
		item: SettlementItem,
		updateProgress = true,
	): boolean {
		const start = getAudioStart(item);
		const playableDuration = getPlayableAudioDuration(element, item);
		if (playableDuration <= 0) {
			element.volume = 1;
			return false;
		}

		const elapsed = Math.min(
			Math.max(element.currentTime - start, 0),
			playableDuration,
		);
		if (updateProgress) {
			audioProgress = elapsed / playableDuration;
		}

		const configuredFadeOut = Math.max(
			item.audioFadeOutSeconds ?? 0,
			0,
		);
		const fadeOutDuration = Math.min(
			configuredFadeOut,
			playableDuration,
		);
		const remaining = Math.max(playableDuration - elapsed, 0);
		const nextVolume =
			fadeOutDuration > 0 && remaining <= fadeOutDuration
				? Math.min(Math.max(remaining / fadeOutDuration, 0), 1)
				: 1;
		if (Math.abs(element.volume - nextVolume) >= 0.005) {
			element.volume = nextVolume;
		}

		if (elapsed < playableDuration - 0.05) return false;

		element.pause();
		element.volume = 0;
		audioProgress = 1;
		audioSegmentEnded = true;
		return true;
	}

	function startAudioAnimation(
		element: HTMLAudioElement,
		item: SettlementItem,
		loadId: number,
	) {
		stopAudioAnimation();

		const update = () => {
			audioAnimationFrame = null;
			if (
				element !== audioElement ||
				loadId !== audioLoadId ||
				element.paused
			) {
				return;
			}

			const segmentEnded = updateAudioPlaybackState(
				element,
				item,
				false,
			);
			if (!segmentEnded && !element.paused) {
				audioAnimationFrame = requestAnimationFrame(update);
			}
		};

		audioAnimationFrame = requestAnimationFrame(update);
	}

	async function tryPlayAudio(element: HTMLAudioElement, loadId: number) {
		try {
			await element.play();
			if (element === audioElement && loadId === audioLoadId) {
				audioNeedsInteraction = false;
				audioError = false;
				if (currentItem?.audioUrl) {
					startAudioAnimation(element, currentItem, loadId);
				}
			}
		} catch (playError) {
			if (element !== audioElement || loadId !== audioLoadId) return;

			if (
				playError instanceof DOMException &&
				playError.name !== "NotAllowedError"
			) {
				audioError = true;
				audioNeedsInteraction = false;
				return;
			}

			audioNeedsInteraction = true;
		}
	}

	function restartCurrentAudio() {
		const element = audioElement;
		const item = currentItem;
		if (!element || !item?.audioUrl) return;

		try {
			seekAudioToConfiguredStart(element, item);
		} catch {
			// metadata 로딩 전이면 loadedmetadata 핸들러가 시작 지점을 적용한다.
		}

		stopAudioAnimation();
		element.volume = 1;
		audioSegmentEnded = false;
		audioProgress = 0;
		void tryPlayAudio(element, audioLoadId);
	}

	function toggleAudioMute() {
		isAudioMuted = !isAudioMuted;
		if (audioElement) {
			audioElement.muted = isAudioMuted;
		}

		try {
			localStorage.setItem(
				AUDIO_MUTED_STORAGE_KEY,
				String(isAudioMuted),
			);
		} catch {
			// 저장 실패 시 이번 세션에만 유지
		}

		if (!isAudioMuted && audioElement?.paused && !audioSegmentEnded) {
			void tryPlayAudio(audioElement, audioLoadId);
		}
	}

	function handleAudioTimeUpdate() {
		const element = audioElement;
		const item = currentItem;
		if (!element || !item?.audioUrl) return;

		updateAudioPlaybackState(element, item);
	}

	function handleAudioEnded() {
		stopAudioAnimation();
		if (audioElement) audioElement.volume = 0;
		audioProgress = 1;
		audioSegmentEnded = true;
	}

	function handleAudioError() {
		if (!currentItem?.audioUrl) return;
		audioError = true;
		audioNeedsInteraction = false;
	}

	function handleVisibilityChange() {
		const element = audioElement;
		if (!element || !currentItem?.audioUrl) return;

		if (document.hidden) {
			element.pause();
			return;
		}

		if (!commentsSettlement && !audioSegmentEnded && !audioError) {
			void tryPlayAudio(element, audioLoadId);
		}
	}

	function handleAudioGesture(event: PointerEvent) {
		const target = event.target;
		if (
			target instanceof Element &&
			target.closest("button, a, input, textarea, select")
		) {
			return;
		}
		if (audioNeedsInteraction) restartCurrentAudio();
	}

	function toggleLike(id: string) {
		const next = new Set(likedIds);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		likedIds = next;
		try {
			localStorage.setItem(
				LIKED_STORAGE_KEY,
				JSON.stringify([...next]),
			);
		} catch {
			// 저장 실패 시 이번 세션에만 유지
		}
	}

	function formatDate(dateStr: string): string {
		const d = new Date(dateStr);
		return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 획득`;
	}

	async function openShortsSearch() {
		isSettingsOpen = false;
		isShortsSearchOpen = true;
		await tick();
		shortsSearchElement?.focus();
	}

	function closeShortsSearch() {
		isShortsSearchOpen = false;
		shortsSearchInput = "";
	}

	async function submitShortsSearch(event: SubmitEvent) {
		event.preventDefault();
		const query = shortsSearchInput.trim();
		if (!query) {
			shortsSearchElement?.focus();
			toast.show("검색어를 입력해 주세요.");
			return;
		}

		await goto(`/?q=${encodeURIComponent(query)}`);
	}

	function toggleSettings() {
		isShortsSearchOpen = false;
		isSettingsOpen = !isSettingsOpen;
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if (event.key !== "Escape") return;
		if (isSettingsOpen) {
			isSettingsOpen = false;
			return;
		}
		if (isShortsSearchOpen) closeShortsSearch();
	}

	async function copyCurrentSettlementLink() {
		const item = currentItem;
		if (!item) return;

		try {
			await navigator.clipboard.writeText(getSettlementShareUrl(item));
			toast.show("현재 결산 링크를 복사했습니다.");
		} catch {
			toast.show("링크 복사에 실패했습니다.");
		} finally {
			isSettingsOpen = false;
		}
	}

	function getSettlementElement(feedKey: string): HTMLElement | null {
		const elements =
			scrollContainer?.querySelectorAll<HTMLElement>(
				"[data-feed-key]",
			) ?? [];
		return (
			[...elements].find(
				(element) => element.dataset.feedKey === feedKey,
			) ?? null
		);
	}

	function getSettlementShareUrl(item: SettlementItem): string {
		const url = new URL(window.location.href);
		url.pathname = `/shorts/${item.characterId}`;
		url.search = "";
		url.hash = "";
		url.searchParams.set("item", item.id);
		return url.toString();
	}

	function getSettlementFilename(item: SettlementItem): string {
		const itemCharacter = getCharacterForItem(item);
		const nickname =
			itemCharacter?.nickname || itemCharacter?.name || "멤버";
		const date = item.acquiredAt.replaceAll("-", "");
		const rawName = `단풍바람14기-${nickname}-${date}-${item.title}`;
		const safeName = rawName
			.replace(/[^a-zA-Z0-9가-힣_-]+/g, "-")
			.replace(/-+/g, "-")
			.replace(/^-|-$/g, "")
			.slice(0, 100);
		return `${safeName || `settlement-${item.id}`}.png`;
	}

	async function waitForSettlementImages(element: HTMLElement) {
		const images = [...element.querySelectorAll("img")];
		await Promise.all(
			images.map(
				(image) =>
					new Promise<void>((resolve) => {
						if (image.complete) {
							resolve();
							return;
						}

						const finish = () => resolve();
						image.addEventListener("load", finish, { once: true });
						image.addEventListener("error", finish, { once: true });
						window.setTimeout(finish, 3000);
					}),
			),
		);
	}

	async function createSettlementFile(item: FeedSettlement): Promise<File> {
		const element = getSettlementElement(item.feedKey);
		if (!element) {
			throw new Error("Settlement export target was not found");
		}

		const focusedElement =
			document.activeElement instanceof HTMLElement &&
			element.contains(document.activeElement)
				? document.activeElement
				: null;
		const previousOutline = focusedElement?.style.outline ?? "";
		if (focusedElement) focusedElement.style.outline = "none";

		try {
			await waitForSettlementImages(element);
			const { captureElementAsPngBlob } = await import(
				"$lib/utils/capture"
			);
			const blob = await captureElementAsPngBlob(element, {
				backgroundColor: "#000000",
				scale: 2,
			});
			return new File([blob], getSettlementFilename(item), {
				type: "image/png",
			});
		} finally {
			if (focusedElement) focusedElement.style.outline = previousOutline;
		}
	}

	function createFeedSettlement(item: SettlementItem): FeedSettlement {
		feedSequence += 1;
		return { ...item, feedKey: `${item.id}-${feedSequence}` };
	}

	function getCharacterForItem(item: SettlementItem): Character | null {
		return (
			charactersById[item.characterId] ??
			(item.characterId === character?.id ? character : null)
		);
	}

	async function ensureItemCharacter(
		item: SettlementItem,
		requestVersion = dataLoadVersion,
	): Promise<Character | null> {
		const cached = charactersById[item.characterId];
		if (cached) return cached;

		const loadedCharacter = await getCharacterById(item.characterId);
		if (requestVersion !== dataLoadVersion || !loadedCharacter) return null;

		charactersById = {
			...charactersById,
			[item.characterId]: loadedCharacter,
		};
		return loadedCharacter;
	}

	async function loadMore(
		targetCharacterId = characterId,
		requestVersion = dataLoadVersion,
	): Promise<boolean> {
		if (
			requestVersion !== dataLoadVersion ||
			loadingMore ||
			!hasMore
		) {
			return false;
		}

		loadingMore = true;
		try {
			const result = await getSettlementsByCharacterIdPaginated(
				targetCharacterId,
				pageNum,
				limit,
			);
			if (requestVersion !== dataLoadVersion) return false;

			const existingIds = new Set(settlements.map((item) => item.id));
			const additions = result.items
				.filter((item) => !existingIds.has(item.id))
				.map(createFeedSettlement);
			settlements = [...settlements, ...additions];
			total = result.total;
			hasMore =
				settlements.length < result.total && result.items.length > 0;
			if (result.items.length > 0) {
				pageNum += 1;
			}
			return result.items.length > 0;
		} catch (e) {
			if (requestVersion !== dataLoadVersion) return false;
			console.error("Failed to load settlements:", e);
			if (settlements.length === 0) {
				hasMore = false;
			}
			return false;
		} finally {
			if (requestVersion === dataLoadVersion) {
				loadingMore = false;
			}
		}
	}

	async function loadRandomItems(
		count = 4,
		requestVersion = dataLoadVersion,
	): Promise<boolean> {
		if (requestVersion !== dataLoadVersion || loadingMore) return false;

		loadingMore = true;
		let added = 0;
		try {
			let previousId = settlements[settlements.length - 1]?.id ?? null;
			for (let index = 0; index < count; index += 1) {
				let fallback: SettlementItem | null = null;
				let nextItem: SettlementItem | null = null;

				// 바로 직전 결산만 반복되는 경우를 피하되, 데이터가 하나뿐이면
				// 같은 결산도 허용해 피드가 멈추지 않게 한다.
				for (let attempt = 0; attempt < 5; attempt += 1) {
					const candidate = await getRandomSettlement();
					if (requestVersion !== dataLoadVersion) return false;
					if (!candidate) break;
					fallback ??= candidate;
					if (candidate.id !== previousId) {
						nextItem = candidate;
						break;
					}
				}

				nextItem ??= fallback;
				if (!nextItem) break;

				await ensureItemCharacter(nextItem, requestVersion);
				if (requestVersion !== dataLoadVersion) return false;
				settlements = [
					...settlements,
					createFeedSettlement(nextItem),
				];
				previousId = nextItem.id;
				added += 1;
			}
			return added > 0;
		} catch (randomError) {
			if (requestVersion === dataLoadVersion) {
				console.error("Failed to extend random shorts feed:", randomError);
			}
			return false;
		} finally {
			if (requestVersion === dataLoadVersion) {
				loadingMore = false;
			}
		}
	}

	function scrollToIndex(index: number, smooth = false) {
		if (!scrollContainer) return;
		scrollContainer.scrollTo({
			top: index * scrollContainer.clientHeight,
			behavior: smooth ? "smooth" : "instant",
		});
	}

	async function loadData() {
		const requestCharacterId = characterId;
		const requestItemId = deepLinkItemId;
		const requestRandomFeed = randomFeedRequested;
		const requestVersion = ++dataLoadVersion;

		loading = true;
		loadingMore = false;
		error = null;
		settlements = [];
		charactersById = {};
		pageNum = 1;
		hasMore = true;
		randomFeedActive = requestRandomFeed;
		currentIndex = 0;
		feedSequence = 0;
		loadLikedIds();
		loadAudioPreference();

		try {
			if (requestRandomFeed) {
				const initialItem = requestItemId
					? await getSettlementById(requestItemId)
					: await getRandomSettlement();
				if (requestVersion !== dataLoadVersion) return;
				if (!initialItem) {
					error = "재생할 결산이 없습니다.";
					return;
				}

				const initialCharacter = await ensureItemCharacter(
					initialItem,
					requestVersion,
				);
				if (requestVersion !== dataLoadVersion) return;
				character = initialCharacter;
				settlements = [createFeedSettlement(initialItem)];
				total = 0;
				hasMore = false;
				loading = false;
				void loadRandomItems(4, requestVersion);
				return;
			}

			const loadedCharacter = await getCharacterById(
				requestCharacterId,
			);
			if (requestVersion !== dataLoadVersion) return;

			character = loadedCharacter;
			if (!loadedCharacter) {
				error = "캐릭터를 찾을 수 없습니다.";
				return;
			}
			charactersById = {
				[loadedCharacter.id]: loadedCharacter,
			};

			await loadMore(requestCharacterId, requestVersion);
			if (requestVersion !== dataLoadVersion) return;

			// ?item= 딥링크: 해당 결산이 로드될 때까지 페이지를 더 불러옴
			let targetIndex = -1;
			if (requestItemId) {
				targetIndex = settlements.findIndex(
					(s) => s.id === requestItemId,
				);
				while (targetIndex < 0 && hasMore) {
					const loadedAny = await loadMore(
						requestCharacterId,
						requestVersion,
					);
					if (requestVersion !== dataLoadVersion) return;
					if (!loadedAny) break;
					targetIndex = settlements.findIndex(
						(s) => s.id === requestItemId,
					);
				}
			}

			// 스크롤 컨테이너는 loading이 풀린 뒤에야 렌더링되므로,
			// 먼저 로딩을 해제하고 DOM이 그려진 다음 스크롤한다.
			loading = false;
			if (targetIndex > 0) {
				currentIndex = targetIndex;
				await tick();
				scrollToIndex(targetIndex);
			}
		} catch (e) {
			if (requestVersion !== dataLoadVersion) return;
			console.error("Failed to load shorts data:", e);
			error = "데이터를 불러오는데 실패했습니다.";
		} finally {
			if (requestVersion === dataLoadVersion) {
				loading = false;
			}
		}
	}

	$effect(() => {
		const requestKey = `${characterId}:${deepLinkItemId ?? ""}:${randomFeedRequested}`;
		if (!characterId || loadedRequestKey === requestKey) return;
		loadedRequestKey = requestKey;
		void loadData();
	});

	function handleScroll() {
		if (!scrollContainer || scrollContainer.clientHeight === 0) return;
		const index = Math.round(
			scrollContainer.scrollTop / scrollContainer.clientHeight,
		);
		if (index !== currentIndex) {
			currentIndex = index;
		}
	}

	// 데스크톱 휠: 유튜브 쇼츠처럼 한 제스처에 정확히 한 장씩만 이동.
	// 고정 쿨다운은 트랙패드 관성(1초 가까이 이어지는 이벤트 스트림)에 두 번
	// 발동하므로, 휠 이벤트가 충분히 멈춰 제스처가 끝났다고 판단될 때까지
	// 소비(consumed) 상태를 유지한다.
	const WHEEL_GESTURE_IDLE_MS = 450;
	let wheelConsumed = false;
	let wheelIdleTimer: ReturnType<typeof setTimeout> | null = null;
	let wheelTargetIndex: number | null = null;

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		if (audioNeedsInteraction) restartCurrentAudio();

		// 이벤트가 이어지는 동안 계속 타이머를 연장 → 멈추면 제스처 종료
		if (wheelIdleTimer) clearTimeout(wheelIdleTimer);
		wheelIdleTimer = setTimeout(() => {
			wheelConsumed = false;
			wheelTargetIndex = null;
		}, WHEEL_GESTURE_IDLE_MS);

		if (wheelConsumed || Math.abs(e.deltaY) < 20) return;

		// 애니메이션 중 새 제스처가 오면 이동 목표 기준으로 다음 장 계산
		const base = wheelTargetIndex ?? currentIndex;
		const direction = e.deltaY > 0 ? 1 : -1;
		if (direction > 0 && base >= settlements.length - 1) {
			wheelConsumed = true;
			void scrollToNext();
			return;
		}
		const maxIndex = settlements.length - 1 + (loadingMore ? 1 : 0);
		const nextIndex = Math.min(Math.max(base + direction, 0), maxIndex);
		if (nextIndex === base) return;

		wheelConsumed = true;
		wheelTargetIndex = nextIndex;
		scrollToIndex(nextIndex, true);
	}

	$effect(() => {
		const el = scrollContainer;
		if (!el) return;

		// preventDefault가 필요하므로 non-passive로 직접 등록
		el.addEventListener("wheel", handleWheel, { passive: false });
		return () => {
			el.removeEventListener("wheel", handleWheel);
			if (wheelIdleTimer) {
				clearTimeout(wheelIdleTimer);
				wheelIdleTimer = null;
			}
			wheelConsumed = false;
			wheelTargetIndex = null;
		};
	});

	// 한 개의 audio element만 사용해 현재 보이는 Shorts의 음원만 재생한다.
	$effect(() => {
		const element = audioElement;
		const item = currentItem;
		const audioUrl = item?.audioUrl ?? null;
		const configuredStart = item?.audioStartSeconds ?? 0;
		const configuredDuration = item?.audioDurationSeconds ?? null;
		const configuredFadeOut = item?.audioFadeOutSeconds ?? null;
		if (!element) return;

		const loadId = ++audioLoadId;
		stopAudioAnimation();
		element.pause();
		element.volume = 1;
		element.muted = untrack(() => isAudioMuted);
		audioNeedsInteraction = false;
		audioSegmentEnded = false;
		audioError = false;
		audioProgress = 0;

		if (!audioUrl || !item) {
			element.removeAttribute("src");
			element.load();
			return;
		}

		const handleMetadataLoaded = () => {
			if (loadId !== audioLoadId) return;
			seekAudioToConfiguredStart(element, item);
			void tryPlayAudio(element, loadId);
		};

		// 세 값도 effect 의존성에 포함해 관리자에서 구간만 바꾼 경우 재시작한다.
		void configuredStart;
		void configuredDuration;
		void configuredFadeOut;
		element.src = audioUrl;
		element.load();
		if (element.readyState >= HTMLMediaElement.HAVE_METADATA) {
			handleMetadataLoaded();
		} else {
			element.addEventListener("loadedmetadata", handleMetadataLoaded, {
				once: true,
			});
		}

		return () => {
			element.removeEventListener("loadedmetadata", handleMetadataLoaded);
			stopAudioAnimation();
			element.pause();
			element.volume = 1;
		};
	});

	$effect(() => {
		const element = audioElement;
		const muted = isAudioMuted;
		if (element) element.muted = muted;
	});

	$effect(() => {
		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => {
			document.removeEventListener(
				"visibilitychange",
				handleVisibilityChange,
			);
		};
	});

	// 현재 회원의 마지막 결산 뒤에는 전체 결산 랜덤 피드를 계속 이어 붙인다.
	$effect(() => {
		if (
			loading ||
			loadingMore ||
			settlements.length === 0 ||
			currentIndex < settlements.length - 3
		) return;

		if (randomFeedActive) {
			void loadRandomItems();
			return;
		}

		if (hasMore) {
			void loadMore();
			return;
		}

		randomFeedActive = true;
		void loadRandomItems();
	});

	async function scrollToNext() {
		const requestedIndex = currentIndex + 1;
		if (requestedIndex >= settlements.length && !loadingMore) {
			if (!randomFeedActive && hasMore) {
				await loadMore();
			}
			if (requestedIndex >= settlements.length) {
				randomFeedActive = true;
				await loadRandomItems(1);
			}
		}

		await tick();
		if (requestedIndex < settlements.length) {
			scrollToIndex(requestedIndex, true);
		}
	}

	async function saveSettlement(item: FeedSettlement) {
		if (exportingSettlementId) return;
		exportingSettlementId = item.id;
		try {
			const file = await createSettlementFile(item);
			const { downloadBlob } = await import("$lib/utils/capture");
			downloadBlob(file, file.name);
			toast.show("현재 게시글을 PNG로 저장했습니다.");
		} catch (captureError) {
			console.error("Settlement image save failed:", captureError);
			toast.show("게시글 이미지 저장에 실패했습니다.");
		} finally {
			exportingSettlementId = null;
		}
	}

	function isShareCancelled(shareError: unknown): boolean {
		return (
			shareError instanceof DOMException &&
			shareError.name === "AbortError"
		);
	}

	async function shareSettlement(item: FeedSettlement) {
		if (exportingSettlementId) return;
		exportingSettlementId = item.id;
		const shareUrl = getSettlementShareUrl(item);

		try {
			const file = await createSettlementFile(item);
			const itemCharacter = getCharacterForItem(item);
			const shareTitle = `${itemCharacter?.nickname ?? "단풍바람 14기"} · ${item.title}`;
			const shareText = `${item.title}\n${formatDate(item.acquiredAt)}`;
			const canShareFile =
				typeof navigator.canShare === "function" &&
				navigator.canShare({ files: [file] });

			if (navigator.share && canShareFile) {
				try {
					await navigator.share({
						files: [file],
						title: shareTitle,
						text: shareText,
						url: shareUrl,
					});
					return;
				} catch (shareError) {
					if (isShareCancelled(shareError)) return;
					console.warn("Image share failed; using fallback:", shareError);
				}
			}

			if (navigator.share) {
				try {
					await navigator.share({
						title: shareTitle,
						text: shareText,
						url: shareUrl,
					});
					toast.show(
						"이미지 첨부를 지원하지 않아 링크로 공유했습니다.",
					);
					return;
				} catch (shareError) {
					if (isShareCancelled(shareError)) return;
					console.warn("Link share failed; using fallback:", shareError);
				}
			}

			const { downloadBlob } = await import("$lib/utils/capture");
			downloadBlob(file, file.name);
			try {
				await navigator.clipboard.writeText(shareUrl);
				toast.show("공유 이미지를 저장하고 링크를 복사했습니다.");
			} catch {
				toast.show("공유 이미지를 저장했습니다.");
			}
		} catch (captureError) {
			console.error("Settlement share failed:", captureError);
			toast.show("게시글 공유 준비에 실패했습니다.");
		} finally {
			exportingSettlementId = null;
		}
	}

	function openComments(item: SettlementItem) {
		isSettingsOpen = false;
		isShortsSearchOpen = false;
		audioElement?.pause();
		commentsSettlement = item;
	}

	function closeComments() {
		commentsSettlement = null;
		if (
			audioElement &&
			currentItem?.audioUrl &&
			!audioSegmentEnded &&
			!audioError &&
			!document.hidden
		) {
			void tryPlayAudio(audioElement, audioLoadId);
		}
	}

	function goBack() {
		if (history.length > 1) {
			history.back();
		} else {
			void goto("/");
		}
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<svelte:head>
	<title>{currentItemCharacter?.nickname ?? "Shorts"} - 단풍바람 14기 Shorts</title>
</svelte:head>

<!-- 모바일: 항상 다크 풀스크린 (m.youtube.com/shorts 실측) / 데스크톱: 테마 배경 위 중앙 플레이어 -->
<div
	class="relative flex flex-col h-full bg-black text-white lg:bg-yt-bg lg:text-yt-text"
>
	<!-- 상단 바: 유튜브 모바일과 동일한 솔리드 블랙 50px (데스크톱은 셸 헤더 사용) -->
	<div
		class="lg:hidden relative shrink-0 h-[50px] flex items-center justify-between pl-1 pr-0 z-30 bg-black"
	>
		{#if isShortsSearchOpen}
			<div class="flex w-full items-center gap-1 pr-2">
				<button
					type="button"
					onclick={closeShortsSearch}
					class="w-12 h-12 shrink-0 flex items-center justify-center text-white rounded-full active:bg-white/10"
					aria-label="검색 닫기"
				>
					<ArrowLeft size={24} />
				</button>
				<form
					onsubmit={submitShortsSearch}
					class="flex min-w-0 flex-1"
					role="search"
				>
					<input
						bind:this={shortsSearchElement}
						bind:value={shortsSearchInput}
						type="search"
						placeholder="이름, 닉네임, 내용 검색"
						autocomplete="off"
						class="h-9 min-w-0 flex-1 rounded-l-full border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/55 outline-none focus:border-white/60"
						aria-label="이름, 닉네임, 내용 검색"
					/>
					<button
						type="submit"
						class="h-9 shrink-0 rounded-r-full border border-l-0 border-white/20 bg-white/10 px-4 text-white active:bg-white/20"
						aria-label="검색"
					>
						<Search size={19} strokeWidth={1.8} />
					</button>
				</form>
			</div>
		{:else}
			<div class="flex items-center min-w-0">
				<button
					type="button"
					onclick={goBack}
					class="w-12 h-12 flex items-center justify-center text-white rounded-full active:bg-white/10"
					aria-label="뒤로가기"
				>
					<ArrowLeft size={24} />
				</button>
				<a href="/" class="flex items-center" aria-label="홈으로">
					<img
						src="/images/logos/logo-text-mono.svg"
						alt="단풍바람"
						class="h-[16px] object-contain invert"
						draggable="false"
					/>
				</a>
			</div>
			<div class="flex items-center text-white">
				<button
					type="button"
					onclick={() => void openShortsSearch()}
					class="w-12 h-12 flex items-center justify-center rounded-full active:bg-white/10"
					aria-label="검색 열기"
				>
					<Search size={22} strokeWidth={1.8} />
				</button>
				<button
					type="button"
					onclick={toggleSettings}
					class="w-12 h-12 flex items-center justify-center rounded-full active:bg-white/10"
					aria-label={isSettingsOpen ? "설정 닫기" : "설정 열기"}
					aria-expanded={isSettingsOpen}
					aria-controls="shorts-settings-menu"
				>
					<EllipsisVertical size={22} />
				</button>
			</div>
		{/if}

		{#if isSettingsOpen}
			<button
				type="button"
				onclick={() => (isSettingsOpen = false)}
				class="fixed inset-0 z-30 cursor-default"
				aria-label="설정 메뉴 바깥 영역 닫기"
			></button>
			<div
				id="shorts-settings-menu"
				class="absolute top-[46px] right-2 z-40 w-56 overflow-hidden rounded-xl border border-white/15 bg-[#212121] py-2 text-white shadow-2xl"
				role="menu"
				aria-label="쇼츠 설정"
			>
				<button
					type="button"
					onclick={() => {
						toggleAudioMute();
						isSettingsOpen = false;
					}}
					class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm active:bg-white/10"
					role="menuitem"
				>
					{#if isAudioMuted}
						<Volume2 size={19} />
						소리 켜기
					{:else}
						<VolumeX size={19} />
						소리 끄기
					{/if}
				</button>
				<button
					type="button"
					onclick={() => void copyCurrentSettlementLink()}
					class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm active:bg-white/10"
					role="menuitem"
				>
					<Link2 size={19} />
					현재 결산 링크 복사
				</button>
				<a
					href="/member/{currentItem?.characterId ?? characterId}"
					class="flex w-full items-center gap-3 px-4 py-3 text-sm active:bg-white/10"
					role="menuitem"
				>
					<UserRound size={19} />
					프로필 보기
				</a>
				<a
					href="/"
					class="flex w-full items-center gap-3 px-4 py-3 text-sm active:bg-white/10"
					role="menuitem"
				>
					<Home size={19} />
					홈으로
				</a>
			</div>
		{/if}
	</div>

	{#if loading}
		<div class="flex-1 flex items-center justify-center">
			<p class="text-white/70 lg:text-yt-text-muted">로딩 중...</p>
		</div>
	{:else if error}
		<div class="flex-1 flex flex-col items-center justify-center gap-4">
			<p class="text-white/70 lg:text-yt-text-muted">{error}</p>
			<button
				type="button"
				onclick={goBack}
				class="px-4 py-2 rounded-full bg-white/10 lg:bg-yt-surface text-sm"
			>
				돌아가기
			</button>
		</div>
	{:else if settlements.length === 0}
		<!-- 결산이 없는 멤버 -->
		<div class="flex-1 flex flex-col items-center justify-center gap-4">
			{#if character}
				<div class="w-20 h-20 rounded-full overflow-hidden bg-white/10">
					<img
						src={character.avatarUrl}
						alt={character.name}
						onerror={handleImageError}
						class="w-full h-full object-cover [image-rendering:pixelated]"
					/>
				</div>
				<p class="text-white/70 lg:text-yt-text-muted">아직 등록된 결산이 없습니다.</p>
				<a
					href="/member/{characterId}"
					class="px-4 py-2 rounded-full bg-yt-chip-active text-yt-chip-active-text text-sm font-medium"
				>
					프로필 보기
				</a>
			{/if}
		</div>
	{:else}
		<!-- 세로 스와이프 페이징 (유튜브 쇼츠와 동일). 데스크톱은 중앙 플레이어 + 화살표 -->
		<div
			class="relative flex-1 min-h-0 lg:flex lg:items-center lg:justify-center lg:py-4 lg:gap-5"
		>
			<div
				class="relative w-full h-full lg:w-auto lg:aspect-[9/16] lg:rounded-2xl lg:overflow-hidden"
			>
				<div
					bind:this={scrollContainer}
					onscroll={handleScroll}
					onpointerdown={handleAudioGesture}
					role="presentation"
					class="h-full flex flex-col overflow-y-auto overflow-x-hidden snap-y snap-mandatory no-scrollbar"
				>
				{#each settlements as item, index (item.feedKey)}
					{@const itemCharacter = getCharacterForItem(item)}
					<section
						data-feed-key={item.feedKey}
						class="relative w-full h-full shrink-0 snap-center snap-always overflow-hidden bg-black text-white"
					>
						<!-- 데스크톱 배경: 전체 이미지 바깥 영역만 블러로 채움 -->
						<img
							src={item.imageUrl}
							alt=""
							aria-hidden="true"
							onerror={handleImageError}
							class="absolute inset-0 hidden lg:block w-full h-full object-cover scale-150 blur-2xl opacity-50"
							draggable="false"
							loading={Math.abs(index - currentIndex) <= 2
								? "eager"
								: "lazy"}
						/>
						<!-- 본 이미지: 가로 이미지도 크롭하지 않고 전체 표시 -->
						<img
							src={item.imageUrl}
							alt={item.title}
							onerror={handleImageError}
							class="absolute inset-0 w-full h-full object-contain"
							draggable="false"
							loading={Math.abs(index - currentIndex) <= 2
								? "eager"
								: "lazy"}
						/>
						<!-- 하단 그라데이션 -->
						<div
							class="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"
						></div>

						{#if item.audioUrl && index === currentIndex}
							<button
								type="button"
								onclick={toggleAudioMute}
								class="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/55 hover:bg-black/70 flex items-center justify-center backdrop-blur-sm"
								aria-label={isAudioMuted ? "소리 켜기" : "음소거"}
								aria-pressed={isAudioMuted}
							>
								{#if isAudioMuted}
									<VolumeX size={21} />
								{:else}
									<Volume2 size={21} />
								{/if}
							</button>

							{#if audioNeedsInteraction || audioSegmentEnded}
								<div
									class="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
								>
									<button
										type="button"
										onclick={restartCurrentAudio}
										class="pointer-events-auto h-11 px-5 rounded-full bg-black/70 hover:bg-black/85 text-sm font-medium flex items-center gap-2 backdrop-blur-sm"
									>
										{#if audioSegmentEnded}
											<RotateCcw size={18} />
											다시 듣기
										{:else}
											<Volume2 size={18} />
											탭해서 소리 재생
										{/if}
									</button>
								</div>
							{:else if audioError}
								<div
									class="absolute top-5 left-4 z-20 px-3 py-2 rounded-full bg-black/70 text-xs backdrop-blur-sm"
								>
									음원을 재생할 수 없습니다
								</div>
							{/if}
						{/if}

						<!-- 채널 행: 아바타 + @핸들 + 구독 필 (실측 bottom 85px) -->
						{#if itemCharacter}
							<div
								class="absolute left-4 right-[72px] bottom-[85px] z-10 flex items-center gap-2.5"
							>
								<a
									href="/member/{item.characterId}"
									class="flex items-center gap-2.5 min-w-0"
								>
									<div
										class="w-10 h-10 rounded-full overflow-hidden bg-white/10 shrink-0"
									>
										<img
											src={itemCharacter.avatarUrl}
											alt=""
											aria-hidden="true"
											onerror={handleImageError}
											class="w-full h-full object-cover [image-rendering:pixelated]"
										/>
									</div>
									<span
										class="text-[15px] font-medium drop-shadow truncate"
										>@{itemCharacter.nickname}</span
									>
								</a>
								<a
									href="/member/{item.characterId}"
									class="shrink-0 h-9 px-4 flex items-center rounded-full bg-white text-black text-[14px] font-medium"
								>
									구독
								</a>
							</div>
						{/if}

						<!-- 제목 + 획득일 (채널 행 아래) -->
						<div
							class="absolute left-4 right-[72px] bottom-[16px] z-10 flex flex-col gap-1"
						>
							<p
								class="text-[15px] leading-snug drop-shadow line-clamp-2"
							>
								{item.title}
							</p>
							<span class="text-[12px] text-white/70 drop-shadow"
								>{formatDate(item.acquiredAt)}</span
							>
						</div>

						<!-- 우측 액션 레일: 실측(아이콘 32px, right 16px, 피치 60px). 데스크톱은 외부 레일 사용 -->
						<div
							class="lg:hidden absolute right-4 bottom-[75px] z-10 flex flex-col items-center gap-2.5"
						>
							<button
								type="button"
								onclick={() => toggleLike(item.id)}
								class="flex flex-col items-center drop-shadow"
								aria-label="좋아요"
								aria-pressed={likedIds.has(item.id)}
							>
								<span
									class="w-8 h-8 flex items-center justify-center"
								>
									<ThumbsUp
										size={28}
										strokeWidth={1.8}
										fill={likedIds.has(item.id)
											? "currentColor"
											: "none"}
									/>
								</span>
								<span class="text-[12px] mt-1">좋아요</span>
							</button>
							<button
								type="button"
								onclick={() => openComments(item)}
								class="flex flex-col items-center drop-shadow"
								aria-label="현재 결산 댓글"
							>
								<span class="w-8 h-8 flex items-center justify-center">
									<MessageCircle size={28} strokeWidth={1.8} />
								</span>
								<span class="text-[12px] mt-1">댓글</span>
							</button>
							<button
								type="button"
								onclick={() => saveSettlement(item)}
								class="flex flex-col items-center drop-shadow"
								aria-label="현재 게시글 이미지 저장"
								aria-busy={exportingSettlementId === item.id}
							>
								<span
									class="w-8 h-8 flex items-center justify-center"
								>
									<Download size={28} strokeWidth={1.8} />
								</span>
								<span class="text-[12px] mt-1">저장</span>
							</button>
							<button
								type="button"
								onclick={() => shareSettlement(item)}
								class="flex flex-col items-center drop-shadow"
								aria-label="현재 게시글 공유"
								aria-busy={exportingSettlementId === item.id}
							>
								<span
									class="w-8 h-8 flex items-center justify-center"
								>
									<Share2 size={28} strokeWidth={1.8} />
								</span>
								<span class="text-[12px] mt-1">공유</span>
							</button>
						</div>

						<!-- 사운드 디스크 자리: 아바타 프로필 (실측 40px, right 12px, bottom 27px) -->
						{#if itemCharacter}
							<a
								href="/member/{item.characterId}"
								class="lg:hidden absolute right-3 bottom-[27px] z-10 w-10 h-10 rounded-lg overflow-hidden border-2 border-white/70 bg-white/10"
								aria-label="프로필"
							>
								<img
									src={itemCharacter.avatarUrl}
									alt=""
									aria-hidden="true"
									onerror={handleImageError}
									class="w-full h-full object-cover [image-rendering:pixelated]"
								/>
							</a>
						{/if}
					</section>
				{/each}

				{#if loadingMore}
					<section
						class="w-full h-full shrink-0 snap-center snap-always flex items-center justify-center"
					>
						<p class="text-white/70">불러오는 중...</p>
					</section>
				{/if}
			</div>

			<!-- 하단 빨간 진행바 (유튜브 재생바 자리 = 피드 위치 표시) -->
			{#if settlements.length > 0}
				<div
					class="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20 z-20 pointer-events-none"
				>
					<div
						class="h-full bg-yt-accent transition-[width] duration-200"
						style={`width: ${visibleProgress * 100}%`}
					></div>
				</div>
			{/if}
			</div>

			<!-- 데스크톱 외부 액션 레일: 플레이어 우측 회색 원형 버튼 (유튜브 데스크톱 쇼츠) -->
			{#if currentItem}
				<div
					class="hidden lg:flex flex-col items-center gap-4 self-end pb-1"
				>
					<div class="flex flex-col items-center gap-1">
						<button
							type="button"
							onclick={() => toggleLike(currentItem.id)}
							class="w-12 h-12 rounded-full bg-yt-surface hover:bg-yt-surface-hover text-yt-text flex items-center justify-center"
							aria-label="좋아요"
							aria-pressed={likedIds.has(currentItem.id)}
						>
							<ThumbsUp
								size={22}
								strokeWidth={1.8}
								fill={likedIds.has(currentItem.id)
									? "currentColor"
									: "none"}
							/>
						</button>
						<span class="text-xs text-yt-text">좋아요</span>
					</div>
					<div class="flex flex-col items-center gap-1">
						<button
							type="button"
							onclick={() => openComments(currentItem)}
							class="w-12 h-12 rounded-full bg-yt-surface hover:bg-yt-surface-hover text-yt-text flex items-center justify-center"
							aria-label="현재 결산 댓글"
						>
							<MessageCircle size={22} strokeWidth={1.8} />
						</button>
						<span class="text-xs text-yt-text">댓글</span>
					</div>
					<div class="flex flex-col items-center gap-1">
						<button
							type="button"
							onclick={() => saveSettlement(currentItem)}
							class="w-12 h-12 rounded-full bg-yt-surface hover:bg-yt-surface-hover text-yt-text flex items-center justify-center"
							aria-label="현재 게시글 이미지 저장"
							aria-busy={exportingSettlementId === currentItem.id}
						>
							<Download size={22} strokeWidth={1.8} />
						</button>
						<span class="text-xs text-yt-text">저장</span>
					</div>
					<div class="flex flex-col items-center gap-1">
						<button
							type="button"
							onclick={() => shareSettlement(currentItem)}
							class="w-12 h-12 rounded-full bg-yt-surface hover:bg-yt-surface-hover text-yt-text flex items-center justify-center"
							aria-label="현재 게시글 공유"
							aria-busy={exportingSettlementId === currentItem.id}
						>
							<Share2 size={22} strokeWidth={1.8} />
						</button>
						<span class="text-xs text-yt-text">공유</span>
					</div>
					{#if currentItemCharacter}
						<a
							href="/member/{currentItem.characterId}"
							class="w-10 h-10 mt-1 rounded-lg overflow-hidden border border-yt-border bg-yt-surface"
							aria-label="프로필"
						>
							<img
								src={currentItemCharacter.avatarUrl}
								alt=""
								aria-hidden="true"
								onerror={handleImageError}
								class="w-full h-full object-cover [image-rendering:pixelated]"
							/>
						</a>
					{/if}
				</div>
			{/if}

			<!-- 데스크톱 전용 위/아래 이동 화살표 (유튜브 데스크톱 쇼츠) -->
			<div
				class="hidden lg:flex flex-col gap-4 absolute right-8 top-1/2 -translate-y-1/2 z-20"
			>
				<button
					type="button"
					onclick={() =>
						scrollToIndex(Math.max(currentIndex - 1, 0), true)}
					disabled={currentIndex === 0}
					class="w-12 h-12 rounded-full bg-yt-surface hover:bg-yt-surface-hover text-yt-text disabled:opacity-40 flex items-center justify-center"
					aria-label="이전 결산"
				>
					<ChevronUp size={24} />
				</button>
				<button
					type="button"
					onclick={() => void scrollToNext()}
					disabled={loadingMore && currentIndex >= settlements.length - 1}
					class="w-12 h-12 rounded-full bg-yt-surface hover:bg-yt-surface-hover text-yt-text disabled:opacity-40 flex items-center justify-center"
					aria-label="다음 결산"
				>
					<ChevronDown size={24} />
				</button>
			</div>
		</div>
	{/if}

	{#if commentsSettlement}
		<SettlementCommentsSheet
			settlement={commentsSettlement}
			onClose={closeComments}
		/>
	{/if}

	<audio
		bind:this={audioElement}
		preload="auto"
		ontimeupdate={handleAudioTimeUpdate}
		onended={handleAudioEnded}
		onerror={handleAudioError}
		class="hidden"
		aria-hidden="true"
	></audio>
</div>
