const character = {
	id: "1",
	name: "강민",
	nickname: "마가다락방",
	server: "에오스",
	job: "제로",
	club: "단풍바람 14기"
};

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
];
const homePreviewSettlement = settlements[Math.floor(Math.random() * settlements.length)] ?? null;

const teamMessage = {
	id: "1",
	name: "강민",
	nickname: "마가다락방",
	role: "비상대책위원장",
	title: "단풍바람 14기를 함께하며",
	content: "단풍바람 14기를 여러분과 함께해서 행복했습니다. 모두 화이팅!"
};

const currentScriptUrl = new URL(document.currentScript.src);
const appRootUrl = new URL("./", currentScriptUrl);
const basePath = appRootUrl.pathname.replace(/\/$/, "");
const assetUrl = (path) => new URL(`assets/${path}`, appRootUrl).href;
const routeUrl = (path = "/") => `${basePath}${path}` || "/";

const assets = {
	avatar: assetUrl("kangmin-avatar.webp")
};

function brandMark(modifier = "") {
	return `<span class="brand-mark ${modifier}"><strong>단풍바람</strong><b>14기</b></span>`;
}

const icons = {
	menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
	search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>',
	user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>',
	home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-8 9 8v10h-6v-6H9v6H3Z"/></svg>',
	megaphone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 13 12-5v8L4 13Zm0 0v-3h4v6H5l2 5"/></svg>',
	message: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-9 8.5 9.6 9.6 0 0 1-4-.9L3 21l1.5-4.5A8.5 8.5 0 1 1 21 11.5Z"/></svg>',
	like: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10v11H3V10h4Zm0 1 5-8c2 0 3 1.5 2.5 4L14 10h5.3c1.4 0 2.3 1.3 1.8 2.7l-2.2 6A3.5 3.5 0 0 1 15.6 21H7"/></svg>',
	download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 21h16"/></svg>',
	share: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.6-4.3M8.7 13.3l6.6 4.3"/></svg>',
	up: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 15 7-7 7 7"/></svg>',
	down: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 9 7 7 7-7"/></svg>',
	back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>',
	close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5 19 19M19 5 5 19"/></svg>',
	play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 9 6-9 6Z"/></svg>',
	more: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></svg>',
	moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 15.2A8 8 0 0 1 8.8 4 8 8 0 1 0 20 15.2Z"/></svg>',
	sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
};

const app = document.querySelector("#app");
const toast = document.querySelector("#toast");
let toastTimer;
let activeFeedCleanup = null;

const restoredRouteParam = new URLSearchParams(location.search).get("route");
const restoredRoute = normalizeAppRoute(restoredRouteParam, null);
if (restoredRouteParam !== null) {
	history.replaceState({ appRoute: true }, "", routeUrl(restoredRoute ?? "/"));
} else if (!history.state?.appRoute) {
	history.replaceState({ appRoute: true }, "", location.href);
}
history.scrollRestoration = "manual";

function readJson(key, fallback) {
	try {
		return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
	} catch {
		return fallback;
	}
}

function escapeHtml(value) {
	return String(value)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}

function normalizeAppRoute(value, fallback = "/") {
	if (typeof value !== "string") return fallback;
	const candidate = value.trim();
	if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\")) return fallback;

	try {
		const parsed = new URL(candidate, "https://maplewind-14.invalid");
		if (parsed.origin !== "https://maplewind-14.invalid") return fallback;
		const path = parsed.pathname.replace(/\/+$/, "") || "/";
		const allowed = path === "/"
			|| path === "/shorts/1"
			|| path === "/member/1"
			|| path === "/member/1/save"
			|| path === "/member/admin-team"
			|| path === "/team-message/1"
			|| path === "/talk"
			|| path === "/login"
			|| path === "/auth/signup"
			|| path === "/auth/callback"
			|| /^\/msg\/(?:7[3-9]|8[0-4])$/.test(path);
		return allowed ? `${path}${parsed.search}${parsed.hash}` : fallback;
	} catch {
		return fallback;
	}
}

function currentPath() {
	const pathname = location.pathname.startsWith(basePath)
		? location.pathname.slice(basePath.length)
		: location.pathname;
	return pathname.replace(/\/+$/, "") || "/";
}

function currentRoute() {
	return `${currentPath()}${location.search}${location.hash}`;
}

function formatDate(value, suffix = true) {
	const [year, month, day] = value.split("-").map(Number);
	return `${year}년 ${month}월 ${day}일${suffix ? " 획득" : ""}`;
}

function settlementImage(item) {
	return assetUrl(`settlements/${item.id}.webp`);
}

function showToast(message) {
	window.clearTimeout(toastTimer);
	toast.textContent = message;
	toast.classList.add("is-visible");
	toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1900);
}

function isLoggedIn() {
	return Boolean(readJson("msgs14-demo-user", null));
}

function demoUser() {
	return readJson("msgs14-demo-user", null);
}

function navigate(path, { replace = false } = {}) {
	const target = normalizeAppRoute(path, "/");
	if (currentRoute() === target) return;
	history[replace ? "replaceState" : "pushState"]({ appRoute: true }, "", routeUrl(target));
	renderRoute();
}

function topbar() {
	const user = demoUser();
	const query = new URLSearchParams(location.search).get("q") ?? "";
	return `
		<header class="topbar">
			<div class="topbar__brand">
				<button class="icon-button" type="button" data-toggle-guide aria-label="가이드 접기">${icons.menu}</button>
				<a class="brand-link" href="${routeUrl("/")}" data-route="/" aria-label="홈으로">
					${brandMark()}
				</a>
			</div>
			<div class="topbar__search">
				<form class="search" data-search-form role="search">
					<input type="search" name="q" value="${escapeHtml(query)}" placeholder="이름, 닉네임, 내용 검색" aria-label="이름, 닉네임, 내용 검색" />
					<button type="submit" aria-label="검색">${icons.search}</button>
				</form>
			</div>
			<div class="topbar__actions">
				<a class="login-pill" href="${routeUrl(user ? "/member/1" : "/login")}" data-route="${user ? "/member/1" : "/login"}">
					${icons.user}<span>${escapeHtml(user?.name ?? "로그인")}</span>
				</a>
			</div>
		</header>
	`;
}

function mobileHeader({ title = "", back = "", close = "", main = false } = {}) {
	if (main) {
		return `
			<header class="mobile-header mobile-header--main">
				<div class="mobile-search-row" data-mobile-search hidden>
					<button class="icon-button" type="button" data-close-search aria-label="검색 닫기">${icons.back}</button>
					<form class="search search--mobile" data-search-form role="search">
						<input type="search" name="q" value="${escapeHtml(new URLSearchParams(location.search).get("q") ?? "")}" placeholder="이름, 닉네임, 내용 검색" aria-label="이름, 닉네임, 내용 검색" />
						<button type="submit" aria-label="검색">${icons.search}</button>
					</form>
				</div>
				<div class="mobile-main-row" data-mobile-main>
					<a class="brand-link" href="${routeUrl("/")}" data-route="/" aria-label="단풍바람 14기 홈">${brandMark()}</a>
					<div class="mobile-header__actions">
						<button class="icon-button" type="button" data-open-search aria-label="검색 열기">${icons.search}</button>
						<a class="icon-button" href="${routeUrl("/member/admin-team")}" data-route="/member/admin-team" aria-label="운영진 한마디">${icons.megaphone}</a>
					</div>
				</div>
			</header>
		`;
	}
	const target = close || back || "/";
	return `
		<header class="mobile-header mobile-header--detail">
			<a class="icon-button" href="${routeUrl(target)}" data-route="${target}" aria-label="${close ? "닫기" : "뒤로가기"}">${close ? icons.close : icons.back}</a>
			${title ? `<strong>${escapeHtml(title)}</strong>` : ""}
			<span class="mobile-header__spacer"></span>
		</header>
	`;
}

function guide() {
	const path = currentPath();
	const active = (prefix) => path === prefix || (prefix !== "/" && path.startsWith(prefix));
	const user = demoUser();
	return `
		<aside class="guide" aria-label="주요 메뉴">
			<nav class="guide__nav">
				<a class="guide-row ${active("/") ? "is-active" : ""}" href="${routeUrl("/")}" data-route="/">${icons.home}<span>홈</span></a>
				<a class="guide-row ${active("/member/admin-team") || active("/team-message") ? "is-active" : ""}" href="${routeUrl("/member/admin-team")}" data-route="/member/admin-team">${icons.megaphone}<span>운영진 한마디</span></a>
				<a class="guide-row ${active("/talk") ? "is-active" : ""}" href="${routeUrl("/talk")}" data-route="/talk">${icons.message}<span>톡</span></a>
				<a class="guide-row" href="${routeUrl(user ? "/member/1" : "/login")}" data-route="${user ? "/member/1" : "/login"}">${icons.user}<span>내 페이지</span></a>
			</nav>
			${!user ? `
				<section class="guide__login">
					<p>로그인하면 톡을 남기고<br />결산을 응원할 수 있습니다.</p>
					<a class="login-pill" href="${routeUrl("/login")}" data-route="/login">${icons.user}<span>로그인</span></a>
				</section>
			` : ""}
			<section class="guide__section">
				<h2>디자인</h2>
				<div class="theme-options">
					<button type="button" data-theme="system">시스템</button>
					<button type="button" data-theme="light">${icons.sun}<span>라이트</span></button>
					<button type="button" data-theme="dark">${icons.moon}<span>다크</span></button>
				</div>
			</section>
			<p class="period">'25년 8월 25일 ~ '26년 2월 22일의 기록</p>
		</aside>
	`;
}

function bottomNav() {
	const path = currentPath();
	return `
		<nav class="bottom-nav" aria-label="모바일 메뉴">
			<a class="${path === "/" ? "is-active" : ""}" href="${routeUrl("/")}" data-route="/">${icons.home}<span>홈</span></a>
			<a class="${path.startsWith("/member/admin-team") ? "is-active" : ""}" href="${routeUrl("/member/admin-team")}" data-route="/member/admin-team">${icons.megaphone}<span>운영진</span></a>
			<a class="${path.startsWith("/talk") ? "is-active" : ""}" href="${routeUrl("/talk")}" data-route="/talk">${icons.message}<span>톡</span></a>
			<a class="${path.startsWith("/member/1") ? "is-active" : ""}" href="${routeUrl(isLoggedIn() ? "/member/1" : "/login")}" data-route="${isLoggedIn() ? "/member/1" : "/login"}">${icons.user}<span>내 페이지</span></a>
		</nav>
	`;
}

function shell(content, { mobileTitle = "", main = false, back = "", close = "", bottom = true, contentClass = "", mobileHeaderVisible = true } = {}) {
	return `
		${topbar()}
		${mobileHeaderVisible ? mobileHeader({ title: mobileTitle, main, back, close }) : ""}
		<div class="workspace">
			${guide()}
			<main class="content ${contentClass}">${content}</main>
		</div>
		${bottom ? bottomNav() : ""}
	`;
}

function renderHome() {
	document.title = "단풍바람 14기";
	const query = (new URLSearchParams(location.search).get("q") ?? "").trim();
	const normalized = query.toLocaleLowerCase("ko-KR");
	const matchingSettlements = normalized
		? settlements.filter((item) => `${character.name} ${character.nickname} ${character.server} ${item.title}`.toLocaleLowerCase("ko-KR").includes(normalized))
		: settlements;
	const characterMatches = !normalized || `${character.name} ${character.nickname} ${character.server} ${settlements.map((item) => item.title).join(" ")}`.toLocaleLowerCase("ko-KR").includes(normalized);
	const previewSettlement = normalized && matchingSettlements.length > 0
		? matchingSettlements[Math.floor(Math.random() * matchingSettlements.length)]
		: homePreviewSettlement;

	const card = characterMatches ? `
		<a class="channel-card" href="${routeUrl(`/shorts/1${previewSettlement ? `?item=${previewSettlement.id}` : ""}`)}" data-route="/shorts/1${previewSettlement ? `?item=${previewSettlement.id}` : ""}">
			<div class="channel-card__visual">
				${previewSettlement ? `<img class="channel-card__preview" src="${settlementImage(previewSettlement)}" alt="${escapeHtml(previewSettlement.title)}" />` : ""}
				<span class="channel-card__count">결산 ${settlements.length}개</span>
			</div>
			<div class="channel-card__meta">
				<img src="${assets.avatar}" alt="${escapeHtml(character.nickname)} 캐릭터" />
				<div><strong>${escapeHtml(character.nickname)}</strong><span>${escapeHtml(character.name)} · ${escapeHtml(character.server)} · ${escapeHtml(character.job)}</span></div>
				<span class="channel-card__more" aria-hidden="true">${icons.more}</span>
			</div>
		</a>
	` : `
		<div class="empty-state">
			<h2>검색 결과가 없습니다.</h2>
		</div>
	`;

	app.innerHTML = shell(`
		<section class="home-page scroll-page">
			<div class="channel-grid">${card}</div>
		</section>
	`, { main: true });
	bindShellEvents();
}

function renderShorts() {
	document.title = "강민의 단풍바람 14기 Shorts";
	const requestedId = new URLSearchParams(location.search).get("item");
	const initialIndex = Math.max(0, settlements.findIndex((item) => item.id === requestedId));
	const liked = new Set(readJson("msgs14-demo-likes", []));

	const slides = settlements.map((item, index) => `
		<section class="short" data-short-id="${item.id}" aria-label="${escapeHtml(item.title)}">
			<img class="short__blur" src="${settlementImage(item)}" alt="" aria-hidden="true" loading="${index < 3 ? "eager" : "lazy"}" />
			<img class="short__image" src="${settlementImage(item)}" alt="${escapeHtml(item.title)}" loading="${index < 3 ? "eager" : "lazy"}" />
			<div class="short__shade"></div>
			<div class="short__channel">
				<a class="channel-avatar" href="${routeUrl("/member/1")}" data-route="/member/1"><img src="${assets.avatar}" alt="강민 프로필" /></a>
				<a class="channel-handle" href="${routeUrl("/member/1")}" data-route="/member/1">@마가다락방</a>
				<a class="subscribe" href="${routeUrl("/member/1")}" data-route="/member/1">구독</a>
			</div>
			<div class="short__copy"><h1>${escapeHtml(item.title)}</h1><time datetime="${item.acquiredAt}">${formatDate(item.acquiredAt)}</time></div>
			<div class="mobile-actions">
				<button type="button" data-like="${item.id}" aria-pressed="${liked.has(item.id)}">${icons.like}<span>좋아요</span></button>
				<a href="${settlementImage(item)}" download="강민-${item.id}.webp">${icons.download}<span>저장</span></a>
				<button type="button" data-share="${item.id}">${icons.share}<span>공유</span></button>
				<a class="action-avatar" href="${routeUrl("/member/1")}" data-route="/member/1"><img src="${assets.avatar}" alt="프로필" /></a>
			</div>
		</section>
	`).join("");

	app.innerHTML = shell(`
		<section class="viewer-stage">
			<a class="shorts-back" href="${routeUrl("/")}" data-route="/" aria-label="쇼츠 닫기">${icons.back}</a>
			<div class="short-frame"><div class="feed" id="shorts-feed" tabindex="0">${slides}</div></div>
			<div class="desktop-actions">
				<button class="round-action" type="button" data-current-like>${icons.like}<span>좋아요</span></button>
				<a class="round-action" data-current-download>${icons.download}<span>저장</span></a>
				<button class="round-action" type="button" data-current-share>${icons.share}<span>공유</span></button>
				<a class="desktop-avatar" href="${routeUrl("/member/1")}" data-route="/member/1"><img src="${assets.avatar}" alt="강민 프로필" /></a>
			</div>
			<div class="feed-controls"><button type="button" data-prev aria-label="이전 쇼츠">${icons.up}</button><button type="button" data-next aria-label="다음 쇼츠">${icons.down}</button></div>
		</section>
	`, { main: true, bottom: false, contentClass: "content--shorts" });
	bindShellEvents();

	const feed = document.querySelector("#shorts-feed");
	const previous = document.querySelector("[data-prev]");
	const next = document.querySelector("[data-next]");
	const currentLike = document.querySelector("[data-current-like]");
	const currentDownload = document.querySelector("[data-current-download]");
	const currentShare = document.querySelector("[data-current-share]");
	let currentIndex = initialIndex;
	let wheelConsumed = false;
	let wheelIdleTimer = null;

	const syncCurrent = () => {
		const item = settlements[currentIndex];
		if (!item) return;
		previous.disabled = currentIndex === 0;
		next.disabled = currentIndex === settlements.length - 1;
		currentLike.dataset.like = item.id;
		currentLike.setAttribute("aria-pressed", String(liked.has(item.id)));
		currentDownload.href = settlementImage(item);
		currentDownload.download = `강민-${item.id}.webp`;
		currentShare.dataset.share = item.id;
		const url = new URL(location.href);
		url.searchParams.set("item", item.id);
		history.replaceState({ appRoute: true }, "", url);
		document.title = `${item.title} · 강민의 Shorts`;
	};
	const moveTo = (index, behavior = "smooth") => {
		currentIndex = Math.max(0, Math.min(index, settlements.length - 1));
		feed.scrollTo({ top: currentIndex * feed.clientHeight, behavior });
		syncCurrent();
	};
	const onScroll = () => {
		if (!feed.clientHeight) return;
		const nextIndex = Math.max(0, Math.min(Math.round(feed.scrollTop / feed.clientHeight), settlements.length - 1));
		if (nextIndex !== currentIndex) {
			currentIndex = nextIndex;
			syncCurrent();
		}
	};
	const onWheel = (event) => {
		event.preventDefault();
		window.clearTimeout(wheelIdleTimer);
		wheelIdleTimer = window.setTimeout(() => {
			wheelConsumed = false;
			wheelIdleTimer = null;
		}, 450);
		if (wheelConsumed || Math.abs(event.deltaY) < 20) return;
		wheelConsumed = true;
		moveTo(currentIndex + (event.deltaY > 0 ? 1 : -1));
	};
	const onKeydown = (event) => {
		if (event.target.matches("input, textarea")) return;
		if (["ArrowDown", "PageDown"].includes(event.key)) moveTo(currentIndex + 1);
		if (["ArrowUp", "PageUp"].includes(event.key)) moveTo(currentIndex - 1);
	};
	feed.addEventListener("scroll", onScroll, { passive: true });
	feed.addEventListener("wheel", onWheel, { passive: false });
	document.addEventListener("keydown", onKeydown);
	previous.addEventListener("click", () => moveTo(currentIndex - 1));
	next.addEventListener("click", () => moveTo(currentIndex + 1));
	document.querySelectorAll("[data-like]").forEach((button) => button.addEventListener("click", () => toggleLike(button.dataset.like, liked, syncCurrent)));
	document.querySelectorAll("[data-share]").forEach((button) => button.addEventListener("click", () => shareSettlement(button.dataset.share)));
	activeFeedCleanup = () => {
		document.removeEventListener("keydown", onKeydown);
		window.clearTimeout(wheelIdleTimer);
	};
	requestAnimationFrame(() => moveTo(initialIndex, "auto"));
}

function toggleLike(id, liked, sync) {
	if (liked.has(id)) liked.delete(id);
	else liked.add(id);
	localStorage.setItem("msgs14-demo-likes", JSON.stringify([...liked]));
	document.querySelectorAll(`[data-like="${id}"]`).forEach((button) => button.setAttribute("aria-pressed", String(liked.has(id))));
	sync?.();
	showToast(liked.has(id) ? "좋아요에 저장했습니다." : "좋아요를 취소했습니다.");
}

async function shareSettlement(id) {
	const item = settlements.find((candidate) => candidate.id === id);
	if (!item) return;
	const url = new URL(routeUrl(`/shorts/1?item=${id}`), location.origin);
	try {
		if (navigator.share) {
			await navigator.share({ title: item.title, text: `강민 · ${item.title}`, url: url.href });
			return;
		}
		await navigator.clipboard.writeText(url.href);
		showToast("쇼츠 링크를 복사했습니다.");
	} catch (error) {
		if (error?.name !== "AbortError") showToast("공유 링크를 복사하지 못했습니다.");
	}
}

function channelToolbar() {
	return `
		<header class="channel-toolbar">
			<a class="icon-button" href="${routeUrl("/")}" data-route="/" aria-label="뒤로가기">${icons.back}</a>
			<div aria-hidden="true"><span>${icons.search}</span><span class="channel-toolbar__more">${icons.more}</span></div>
		</header>
	`;
}

function renderMember() {
	document.title = "강민 - 단풍바람 14기";
	const order = new URLSearchParams(location.search).get("sort") === "oldest" ? "oldest" : "latest";
	const items = order === "oldest" ? [...settlements].reverse() : settlements;
	app.innerHTML = shell(`
		<section class="channel-view">
			${channelToolbar()}
			<div class="channel-scroll">
				<div class="channel-banner"><img src="${assets.avatar}" alt="" aria-hidden="true" /></div>
				<div class="channel-header">
					<img class="profile-avatar" src="${assets.avatar}" alt="강민" />
					<div class="channel-copy"><strong>강민</strong><span>@마가다락방</span><small>${character.server} · ${character.job}</small><small>결산 ${settlements.length}개</small></div>
				</div>
				<div class="channel-save-wrap"><a class="channel-save" href="${routeUrl("/member/1/save")}" data-route="/member/1/save">결산 이미지 저장</a></div>
				<div class="channel-tabs"><span>홈</span><strong>Shorts</strong></div>
				<div class="channel-sort"><a class="chip ${order === "latest" ? "chip--active" : ""}" href="${routeUrl("/member/1?sort=latest")}" data-route="/member/1?sort=latest">최신순</a><a class="chip ${order === "oldest" ? "chip--active" : ""}" href="${routeUrl("/member/1?sort=oldest")}" data-route="/member/1?sort=oldest">오래된순</a></div>
				<div class="channel-shorts-grid">
					${items.map((item) => `
						<a class="channel-short" href="${routeUrl(`/shorts/1?item=${item.id}`)}" data-route="/shorts/1?item=${item.id}">
							<img src="${settlementImage(item)}" alt="${escapeHtml(item.title)}" />
							<span class="channel-short__more" aria-hidden="true">${icons.more}</span>
							<span class="channel-short__copy"><strong>${escapeHtml(item.title)}</strong><time datetime="${item.acquiredAt}">${formatDate(item.acquiredAt, false)}</time></span>
						</a>
					`).join("")}
				</div>
			</div>
		</section>
	`, { bottom: true, mobileHeaderVisible: false });
	bindShellEvents();
}

function renderAdminTeam() {
	document.title = "운영진 한마디 - 단풍바람 14기";
	app.innerHTML = shell(`
		<section class="channel-view">
			${channelToolbar()}
			<div class="channel-scroll">
				<div class="channel-banner channel-banner--team"></div>
				<div class="channel-header">
					<div class="profile-avatar profile-avatar--team">${icons.megaphone}</div>
					<div class="channel-copy"><strong>단풍바람 14기 비대위</strong><span>@비대위</span><small>14기 · 가천대학교 · 비대위</small><small>한마디 1개</small></div>
				</div>
				<div class="channel-tabs"><span>홈</span><strong>한마디</strong></div>
				<div class="team-feed">
					<a class="team-row" href="${routeUrl("/team-message/1")}" data-route="/team-message/1">
						<div class="team-row__image">${icons.megaphone}</div>
						<div><strong>${teamMessage.title}</strong><span>@${teamMessage.nickname} · ${teamMessage.role}</span></div>
					</a>
				</div>
			</div>
		</section>
	`, { bottom: true, mobileHeaderVisible: false });
	bindShellEvents();
}

function renderTeamMessage() {
	document.title = `${teamMessage.name} - 운영진 한마디`;
	app.innerHTML = shell(`
		<section class="detail-view">
			<header class="detail-toolbar"><a class="icon-button" href="${routeUrl("/member/admin-team")}" data-route="/member/admin-team" aria-label="닫기">${icons.close}</a></header>
			<article class="detail-page scroll-page">
				<div class="detail-image"><img src="${assets.avatar}" alt="강민" /></div>
				<dl class="detail-fields">
					<div><dt>닉네임</dt><dd>@${teamMessage.nickname}</dd></div>
					<div><dt>직위</dt><dd>${teamMessage.role}</dd></div>
					<div><dt>상세 내용</dt><dd>${teamMessage.content}</dd></div>
				</dl>
				${brandMark("brand-mark--detail")}
			</article>
		</section>
	`, { bottom: false, mobileHeaderVisible: false });
	bindShellEvents();
}

function renderTalk() {
	document.title = "단풍바람 14기 톡";
	const comments = readJson("msgs14-demo-comments", []);
	const user = demoUser();
	app.innerHTML = shell(`
		<section class="talk-page">
			<header class="talk-title"><a class="icon-button" href="${routeUrl("/")}" data-route="/" aria-label="뒤로가기">${icons.back}</a><strong>단풍바람 14기 톡</strong>${user ? '<button type="button" data-logout>로그아웃</button>' : "<span></span>"}</header>
			<div class="talk-count"><strong>톡</strong><span>${comments.length}</span></div>
			<div class="comment-list">
				${comments.length ? comments.map((comment) => `
					<article class="comment"><div class="comment__avatar">${escapeHtml(comment.author.slice(0, 1))}</div><div><p><strong>${escapeHtml(comment.author)}</strong><time>${escapeHtml(comment.createdAt)}</time></p><span>${escapeHtml(comment.content)}</span></div></article>
				`).join("") : ""}
			</div>
			<div class="talk-composer">
				${user ? `<form data-comment-form><textarea name="comment" rows="1" maxlength="240" placeholder="톡을 남겨 보세요." aria-label="톡 내용"></textarea><button type="submit" aria-label="톡 보내기">${icons.share}</button></form>` : `<a class="talk-login" href="${routeUrl("/login?next=/talk")}" data-route="/login?next=/talk">이름/학번 입력하고 톡 등록하기 →</a>`}
			</div>
		</section>
	`, { bottom: true, contentClass: "content--talk", mobileHeaderVisible: false });
	bindShellEvents();
	document.querySelector("[data-comment-form]")?.addEventListener("submit", (event) => {
		event.preventDefault();
		const input = new FormData(event.currentTarget).get("comment")?.toString().trim();
		if (!input) return;
		comments.unshift({ author: user.name, content: input, createdAt: "방금 전" });
		localStorage.setItem("msgs14-demo-comments", JSON.stringify(comments));
		renderTalk();
		showToast("톡을 등록했습니다.");
	});
}

function renderLogin() {
	document.title = "로그인 - 단풍바람 14기";
	const next = normalizeAppRoute(new URLSearchParams(location.search).get("next"), "/");
	app.innerHTML = shell(`
		<main class="auth-page">
			<section class="auth-card">
				${brandMark("brand-mark--auth")}
				<form class="auth-form" data-login-form>
					<div class="auth-input-group">
						<input name="name" maxlength="3" autocomplete="name" placeholder="이름" aria-label="이름" />
						<input name="studentId" inputmode="numeric" maxlength="9" placeholder="학번" aria-label="학번" />
					</div>
					<button class="primary-button" type="submit">14기 페이지 입장</button>
					<label class="check-row"><input type="checkbox" name="remember" /><span>이름 저장</span></label>
				</form>
			</section>
			<p class="auth-footer">단풍바람 14기 회원이 이용 가능한 서비스입니다.</p>
		</main>
	`, { bottom: false, contentClass: "content--auth", mobileHeaderVisible: false });
	bindShellEvents();
	document.querySelector("[data-login-form]")?.addEventListener("submit", (event) => {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		const name = form.get("name")?.toString().trim();
		const studentId = form.get("studentId")?.toString().trim();
		if (!name || !/^\d{9}$/.test(studentId)) {
			showToast("이름과 9자리 학번을 확인해 주세요.");
			return;
		}
		localStorage.setItem("msgs14-demo-user", JSON.stringify({ name, studentId }));
		navigate(next);
		showToast(`${name}님, 체험 로그인이 완료되었습니다.`);
	});
}

function renderSignup() {
	document.title = "회원가입 - 단풍바람 14기";
	app.innerHTML = shell(`
		<main class="auth-page">
			<section class="auth-card">
				<h1>회원가입</h1>
				<p class="auth-intro">정적 체험판에서는 입력한 정보가 이 브라우저에만 저장됩니다.</p>
				<form class="auth-form" data-signup-form>
					<label><span>학번</span><input name="studentId" inputmode="numeric" maxlength="9" placeholder="학번 9자리" /></label>
					<label><span>닉네임</span><input name="nickname" maxlength="10" placeholder="닉네임" /></label>
					<button class="primary-button" type="submit">가입 완료</button>
				</form>
			</section>
		</main>
	`, { bottom: false, contentClass: "content--auth", mobileHeaderVisible: false });
	bindShellEvents();
	document.querySelector("[data-signup-form]")?.addEventListener("submit", (event) => {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		const studentId = form.get("studentId")?.toString().trim();
		const nickname = form.get("nickname")?.toString().trim();
		if (!/^\d{9}$/.test(studentId) || !/^[a-zA-Z0-9가-힣]{2,10}$/.test(nickname)) {
			showToast("학번 9자리와 닉네임 2~10자를 확인해 주세요.");
			return;
		}
		localStorage.setItem("msgs14-demo-user", JSON.stringify({ name: nickname, studentId }));
		navigate("/");
		showToast("체험 회원가입이 완료되었습니다.");
	});
}

function renderAuthCallback() {
	document.title = "로그인 확인 - 단풍바람 14기";
	app.innerHTML = shell(`
		<main class="auth-page">
			<section class="auth-card">
				${brandMark("brand-mark--auth")}
				<h1>로그인 확인</h1>
				<p class="auth-intro">실제 서비스에서는 이 화면에서 로그인 정보를 확인합니다.<br />체험판은 서버에 연결하지 않습니다.</p>
				<a class="primary-button" href="${routeUrl("/login")}" data-route="/login">체험 로그인으로 이동</a>
			</section>
		</main>
	`, { bottom: false, contentClass: "content--auth", mobileHeaderVisible: false });
	bindShellEvents();
}

function renderSave() {
	document.title = "캐릭터 카드 저장 - 강민";
	app.innerHTML = shell(`
		<main class="save-page">
			<a class="save-close icon-button" href="${routeUrl("/member/1")}" data-route="/member/1" aria-label="닫기">${icons.close}</a>
			<section class="save-content">
				<p>내 캐릭터 카드를 저장해 보세요!</p>
				<article class="save-card" id="save-card">
					${brandMark("brand-mark--inverse save-card__brand")}
					<div class="save-card__scene">
						<img class="save-card__character" src="${assets.avatar}" alt="강민" />
						<div class="save-card__copy"><strong>강민</strong><span>에오스 · 마가다락방 · 제로</span><span class="generation-badge">단풍바람 14기</span></div>
					</div>
				</article>
				<button class="save-button" type="button" data-save-card>${icons.download}<span>저장하기</span></button>
			</section>
		</main>
	`, { bottom: false, contentClass: "content--save", mobileHeaderVisible: false });
	bindShellEvents();
	document.querySelector("[data-save-card]")?.addEventListener("click", downloadCard);
}

async function downloadCard() {
	try {
		const image = new Image();
		image.src = assets.avatar;
		await image.decode();
		const canvas = document.createElement("canvas");
		canvas.width = 900;
		canvas.height = 1200;
		const context = canvas.getContext("2d");
		if (!context) throw new Error("Canvas 2D context is unavailable");
		const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
		gradient.addColorStop(0, "#fac486");
		gradient.addColorStop(1, "#f08958");
		context.fillStyle = gradient;
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.fillStyle = "rgba(255,255,255,.18)";
		context.beginPath();
		context.arc(700, 180, 140, 0, Math.PI * 2);
		context.fill();
		const size = 600;
		context.drawImage(image, (canvas.width - size) / 2, 200, size, size);
		context.textAlign = "center";
		context.fillStyle = "#fff";
		context.font = "700 72px sans-serif";
		context.fillText("강민", canvas.width / 2, 900);
		context.font = "36px sans-serif";
		context.fillText("에오스 · 마가다락방 · 제로", canvas.width / 2, 970);
		context.font = "28px sans-serif";
		context.fillText("단풍바람 14기 · 강민의 결산", canvas.width / 2, 1080);
		canvas.toBlob((blob) => {
			if (!blob) {
				showToast("카드를 저장하지 못했습니다.");
				return;
			}
			const link = document.createElement("a");
			const objectUrl = URL.createObjectURL(blob);
			link.href = objectUrl;
			link.download = "강민-단풍바람14기.png";
			link.click();
			window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
			showToast("캐릭터 카드를 저장했습니다.");
		}, "image/png");
	} catch {
		showToast("카드를 저장하지 못했습니다.");
	}
}

function renderNotFound() {
	document.title = "페이지를 찾을 수 없습니다";
	app.innerHTML = shell(`
		<section class="not-found"><h1>페이지를 찾을 수 없습니다.</h1><p>체험판의 첫 화면으로 돌아가 전체 흐름을 다시 시작해 보세요.</p><a class="primary-button" href="${routeUrl("/")}" data-route="/">첫 화면으로</a></section>
	`, { mobileTitle: "", back: "/", bottom: false });
	bindShellEvents();
}

function bindRouteLinks() {
	document.querySelectorAll("[data-route]").forEach((link) => {
		link.addEventListener("click", (event) => {
			if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
			event.preventDefault();
			navigate(link.dataset.route);
		});
	});
}

function bindShellEvents() {
	bindRouteLinks();
	document.querySelector("[data-toggle-guide]")?.addEventListener("click", () => {
		app.classList.toggle("guide-collapsed");
		localStorage.setItem("msgs14-guide-collapsed", String(app.classList.contains("guide-collapsed")));
	});
	if (localStorage.getItem("msgs14-guide-collapsed") === "true") app.classList.add("guide-collapsed");
	document.querySelectorAll("[data-search-form]").forEach((form) => form.addEventListener("submit", (event) => {
		event.preventDefault();
		const query = new FormData(form).get("q")?.toString().trim();
		navigate(query ? `/?q=${encodeURIComponent(query)}` : "/");
	}));
	document.querySelector("[data-open-search]")?.addEventListener("click", () => {
		document.querySelector("[data-mobile-main]").hidden = true;
		document.querySelector("[data-mobile-search]").hidden = false;
		document.querySelector("[data-mobile-search] input")?.focus();
	});
	document.querySelector("[data-close-search]")?.addEventListener("click", () => {
		document.querySelector("[data-mobile-search]").hidden = true;
		document.querySelector("[data-mobile-main]").hidden = false;
	});
	document.querySelectorAll("[data-theme]").forEach((button) => button.addEventListener("click", () => setTheme(button.dataset.theme)));
	markTheme();
	document.querySelector("[data-logout]")?.addEventListener("click", () => {
		localStorage.removeItem("msgs14-demo-user");
		renderRoute();
		showToast("로그아웃 되었습니다.");
	});
}

function setTheme(preference) {
	document.documentElement.classList.toggle("theme-light", preference === "light");
	document.documentElement.classList.toggle("theme-dark", preference === "dark");
	localStorage.setItem("msgs14-demo-theme", preference);
	markTheme();
}

function markTheme() {
	const stored = localStorage.getItem("msgs14-demo-theme") ?? "system";
	document.querySelectorAll("[data-theme]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.theme === stored)));
}

function renderRoute() {
	activeFeedCleanup?.();
	activeFeedCleanup = null;
	window.scrollTo(0, 0);
	const path = currentPath();
	if (path === "/") return renderHome();
	if (path === "/shorts/1") return renderShorts();
	if (path === "/member/1") return renderMember();
	if (path === "/member/1/save") return renderSave();
	if (path === "/member/admin-team") return renderAdminTeam();
	if (path === "/team-message/1") return renderTeamMessage();
	if (path === "/talk") return renderTalk();
	if (path === "/login") return renderLogin();
	if (path === "/auth/signup") return renderSignup();
	if (path === "/auth/callback") return renderAuthCallback();
	const legacyMatch = path.match(/^\/msg\/(\d+)$/);
	if (legacyMatch && settlements.some((item) => item.id === legacyMatch[1])) {
		navigate(`/shorts/1?item=${legacyMatch[1]}`, { replace: true });
		return;
	}
	renderNotFound();
}

window.addEventListener("popstate", renderRoute);
setTheme(localStorage.getItem("msgs14-demo-theme") ?? "system");
renderRoute();
