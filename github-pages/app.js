const settlements = [
	{ id: "84", title: "어?!!!!!!!!!!!", acquiredAt: "2026-02-22" },
	{ id: "83", title: "맛있다~", acquiredAt: "2026-02-22" },
	{ id: "82", title: "단바개발팀 가동!", acquiredAt: "2026-02-03" },
	{ id: "81", title: "노말 칼로스 쉽네~ @두밤밤", acquiredAt: "2026-02-01" },
	{ id: "80", title: "카링 딱대 @두밤밤", acquiredAt: "2026-02-01" },
	{ id: "79", title: "부캐 제@로 일단 275는 보냈는데...", acquiredAt: "2026-01-31" },
	{ id: "78", title: "길드 운영진들께 박수!", acquiredAt: "2025-12-22" },
	{ id: "77", title: "단풍바람 길드 시작!", acquiredAt: "2025-12-22" },
	{ id: "76", title: "2년동안 세렌 가고도 못 먹은 미트라... 이걸 일반화가 ㅋㅋ", acquiredAt: "2025-10-06" },
	{ id: "75", title: "칠흑 정상화 이후 첫 루컨마~", acquiredAt: "2025-10-05" },
	{ id: "74", title: "이지 칼로스도 이제서야 솔플하다니", acquiredAt: "2025-09-07" },
	{ id: "73", title: "노말 세렌을 이제서야 솔플하다니", acquiredAt: "2025-09-07" }
].map((item) => ({
	...item,
	imageUrl: `assets/settlements/${item.id}.webp`
}));

const icons = {
	menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" stroke-linecap="round"/></svg>',
	search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor"/><path d="m16.4 16.4 4.1 4.1" fill="none" stroke="currentColor" stroke-linecap="round"/></svg>',
	user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0" fill="none" stroke="currentColor" stroke-linecap="round"/></svg>',
	more: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></svg>',
	back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>',
	home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-8 9 8v10h-6v-6H9v6H3Z" fill="none" stroke="currentColor" stroke-linejoin="round"/></svg>',
	megaphone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 13 12-5v8L4 13Zm0 0v-3h4v6H5l2 5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>',
	message: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-9 8.5 9.6 9.6 0 0 1-4-.9L3 21l1.5-4.5A8.5 8.5 0 1 1 21 11.5Z" fill="none" stroke="currentColor" stroke-linejoin="round"/></svg>',
	like: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10v11H3V10h4Zm0 1 5-8c2 0 3 1.5 2.5 4L14 10h5.3c1.4 0 2.3 1.3 1.8 2.7l-2.2 6A3.5 3.5 0 0 1 15.6 21H7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>',
	download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 21h16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>',
	share: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3" fill="none" stroke="currentColor"/><circle cx="6" cy="12" r="3" fill="none" stroke="currentColor"/><circle cx="18" cy="19" r="3" fill="none" stroke="currentColor"/><path d="m8.7 10.7 6.6-4.3M8.7 13.3l6.6 4.3" fill="none" stroke="currentColor"/></svg>',
	up: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 15 7-7 7 7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>',
	down: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 9 7 7 7-7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>',
	close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5 19 19M19 5 5 19" fill="none" stroke="currentColor" stroke-linecap="round"/></svg>'
};

document.querySelectorAll("[data-icon]").forEach((element) => {
	element.innerHTML = icons[element.dataset.icon] ?? "";
});

const app = document.querySelector("#app");
const feed = document.querySelector("#feed");
const emptyState = document.querySelector("#empty-state");
const previousButton = document.querySelector("#previous");
const nextButton = document.querySelector("#next");
const desktopLike = document.querySelector('[data-current-action="like"]');
const desktopSave = document.querySelector('[data-current-action="save"]');
const desktopShare = document.querySelector('[data-current-action="share"]');
const toast = document.querySelector("#toast");
const profileDialog = document.querySelector("#profile-dialog");
const searchInput = document.querySelector("#search-input");
const mobileSearchInput = document.querySelector("#mobile-search-input");
const mobileSearch = document.querySelector("#mobile-search");

let visibleItems = [...settlements];
let currentIndex = 0;
let wheelLocked = false;
let toastTimer;
let likedIds = new Set(readJson("kangmin-shorts-liked", []));

function readJson(key, fallback) {
	try {
		return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
	} catch {
		return fallback;
	}
}

function formatDate(value) {
	const date = new Date(`${value}T00:00:00+09:00`);
	return new Intl.DateTimeFormat("ko-KR", {
		year: "numeric",
		month: "long",
		day: "numeric"
	}).format(date) + " 획득";
}

function renderSlides() {
	feed.innerHTML = visibleItems.map((item, index) => `
		<section class="short" id="settlement-${item.id}" data-id="${item.id}" aria-label="${item.title}">
			<img class="short__blur" src="${item.imageUrl}" alt="" aria-hidden="true" loading="${index < 3 ? "eager" : "lazy"}" />
			<img class="short__image" src="${item.imageUrl}" alt="${item.title}" loading="${index < 3 ? "eager" : "lazy"}" />
			<div class="short__shade"></div>
			<span class="short__count">${index + 1} / ${visibleItems.length}</span>
			<div class="short__channel">
				<button class="channel-avatar" type="button" data-open-profile aria-label="강민 프로필"><img src="assets/kangmin-avatar.webp" alt="" /></button>
				<span class="channel-handle">@마가다락방</span>
				<button class="subscribe" type="button" data-open-profile>프로필</button>
			</div>
			<div class="short__copy">
				<h2>${item.title}</h2>
				<time datetime="${item.acquiredAt}">${formatDate(item.acquiredAt)}</time>
			</div>
			<div class="mobile-actions">
				<button type="button" data-action="like" data-id="${item.id}" aria-label="좋아요" aria-pressed="${likedIds.has(item.id)}">${icons.like}<span>좋아요</span></button>
				<a href="${item.imageUrl}" download="강민-${item.id}.webp" aria-label="이미지 저장">${icons.download}<span>저장</span></a>
				<button type="button" data-action="share" data-id="${item.id}" aria-label="공유">${icons.share}<span>공유</span></button>
				<button class="mobile-avatar" type="button" data-open-profile aria-label="강민 프로필"><img src="assets/kangmin-avatar.webp" alt="" /></button>
			</div>
		</section>
	`).join("");

	emptyState.hidden = visibleItems.length !== 0;
	feed.hidden = visibleItems.length === 0;
	currentIndex = 0;
	feed.scrollTop = 0;
	updateCurrentUi();
}

function currentItem() {
	return visibleItems[currentIndex] ?? null;
}

function updateCurrentUi() {
	const item = currentItem();
	previousButton.disabled = currentIndex <= 0 || !item;
	nextButton.disabled = currentIndex >= visibleItems.length - 1 || !item;

	if (!item) {
		desktopSave.removeAttribute("href");
		return;
	}

	desktopLike.dataset.id = item.id;
	desktopLike.setAttribute("aria-pressed", String(likedIds.has(item.id)));
	desktopSave.href = item.imageUrl;
	desktopSave.download = `강민-${item.id}.webp`;
	desktopShare.dataset.id = item.id;
	document.title = `${item.title} · 강민의 메생결산 Shorts`;
}

function moveTo(index, behavior = "smooth") {
	if (!visibleItems.length) return;
	const nextIndex = Math.max(0, Math.min(index, visibleItems.length - 1));
	currentIndex = nextIndex;
	feed.scrollTo({ top: nextIndex * feed.clientHeight, behavior });
	updateCurrentUi();
}

function showToast(message) {
	window.clearTimeout(toastTimer);
	toast.textContent = message;
	toast.classList.add("is-visible");
	toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
}

function toggleLike(id) {
	if (!id) return;
	if (likedIds.has(id)) likedIds.delete(id);
	else likedIds.add(id);
	localStorage.setItem("kangmin-shorts-liked", JSON.stringify([...likedIds]));
	document.querySelectorAll(`[data-action="like"][data-id="${id}"]`).forEach((button) => {
		button.setAttribute("aria-pressed", String(likedIds.has(id)));
	});
	updateCurrentUi();
	showToast(likedIds.has(id) ? "좋아요에 저장했습니다." : "좋아요를 취소했습니다.");
}

async function shareItem(id) {
	const item = visibleItems.find((candidate) => candidate.id === id) ?? currentItem();
	if (!item) return;
	const url = new URL(window.location.href);
	url.hash = `settlement-${item.id}`;
	const shareData = { title: item.title, text: `강민 · ${item.title}`, url: url.toString() };

	try {
		if (navigator.share) {
			await navigator.share(shareData);
			return;
		}
		await navigator.clipboard.writeText(shareData.url);
		showToast("링크를 복사했습니다.");
	} catch (error) {
		if (error?.name !== "AbortError") showToast("링크를 복사하지 못했습니다.");
	}
}

function filterSlides(rawQuery) {
	const query = rawQuery.trim().toLocaleLowerCase("ko-KR");
	visibleItems = query
		? settlements.filter((item) => ["강민", "마가다락방", "에오스", "제로", item.title, item.acquiredAt]
			.join(" ")
			.toLocaleLowerCase("ko-KR")
			.includes(query))
		: [...settlements];
	renderSlides();
	if (query) showToast(`${visibleItems.length}개의 결산을 찾았습니다.`);
}

function submitSearch(input) {
	searchInput.value = input.value;
	mobileSearchInput.value = input.value;
	filterSlides(input.value);
	mobileSearch.hidden = true;
}

feed.addEventListener("scroll", () => {
	if (!feed.clientHeight) return;
	const nextIndex = Math.max(0, Math.min(Math.round(feed.scrollTop / feed.clientHeight), visibleItems.length - 1));
	if (nextIndex !== currentIndex) {
		currentIndex = nextIndex;
		updateCurrentUi();
	}
}, { passive: true });

feed.addEventListener("wheel", (event) => {
	if (Math.abs(event.deltaY) < 8 || wheelLocked) return;
	event.preventDefault();
	wheelLocked = true;
	moveTo(currentIndex + (event.deltaY > 0 ? 1 : -1));
	window.setTimeout(() => { wheelLocked = false; }, 480);
}, { passive: false });

feed.addEventListener("click", (event) => {
	const likeButton = event.target.closest('[data-action="like"]');
	if (likeButton) toggleLike(likeButton.dataset.id);
	const shareButton = event.target.closest('[data-action="share"]');
	if (shareButton) void shareItem(shareButton.dataset.id);
});

document.addEventListener("keydown", (event) => {
	if (event.target.matches("input")) return;
	if (event.key === "ArrowDown" || event.key === "PageDown") moveTo(currentIndex + 1);
	if (event.key === "ArrowUp" || event.key === "PageUp") moveTo(currentIndex - 1);
});

previousButton.addEventListener("click", () => moveTo(currentIndex - 1));
nextButton.addEventListener("click", () => moveTo(currentIndex + 1));
desktopLike.addEventListener("click", () => toggleLike(currentItem()?.id));
desktopShare.addEventListener("click", () => void shareItem(currentItem()?.id));

document.querySelector("#menu-toggle").addEventListener("click", () => {
	app.classList.toggle("sidebar-collapsed");
});

document.querySelectorAll("[data-demo-only]").forEach((button) => {
	button.addEventListener("click", () => showToast("이 페이지는 강민 Shorts만 제공하는 정적 버전입니다."));
});

document.querySelectorAll("[data-open-profile]").forEach((button) => {
	button.addEventListener("click", () => profileDialog.showModal());
});

document.querySelector("[data-close-profile]").addEventListener("click", () => profileDialog.close());
profileDialog.addEventListener("click", (event) => {
	if (event.target === profileDialog) profileDialog.close();
});

document.querySelectorAll("[data-theme]").forEach((button) => {
	button.addEventListener("click", () => {
		const preference = button.dataset.theme;
		document.documentElement.classList.toggle("theme-light", preference === "light");
		document.documentElement.classList.toggle("theme-dark", preference === "dark");
		document.querySelectorAll("[data-theme]").forEach((option) => {
			option.setAttribute("aria-pressed", String(option === button));
		});
		localStorage.setItem("kangmin-shorts-theme", preference);
	});
});

document.querySelector("#search-form").addEventListener("submit", (event) => {
	event.preventDefault();
	submitSearch(searchInput);
});

document.querySelector("#mobile-search-form").addEventListener("submit", (event) => {
	event.preventDefault();
	submitSearch(mobileSearchInput);
});

mobileSearchInput.addEventListener("keydown", (event) => {
	if (event.key !== "Enter") return;
	event.preventDefault();
	submitSearch(mobileSearchInput);
});

document.querySelector("#mobile-search-toggle").addEventListener("click", () => {
	mobileSearch.hidden = false;
	mobileSearchInput.focus();
});

document.querySelector("#mobile-search-close").addEventListener("click", () => {
	mobileSearch.hidden = true;
});

document.querySelector("#clear-search").addEventListener("click", () => {
	searchInput.value = "";
	mobileSearchInput.value = "";
	filterSlides("");
});

const storedTheme = localStorage.getItem("kangmin-shorts-theme") ?? "system";
document.querySelector(`[data-theme="${storedTheme}"]`)?.click();
renderSlides();

const initialId = window.location.hash.match(/^#settlement-(\d+)$/)?.[1];
if (initialId) {
	const initialIndex = visibleItems.findIndex((item) => item.id === initialId);
	if (initialIndex >= 0) window.requestAnimationFrame(() => moveTo(initialIndex, "auto"));
}
