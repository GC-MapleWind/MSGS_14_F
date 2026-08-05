const character = {
	id: "1",
	name: "강민",
	nickname: "마가다락방",
	server: "에오스",
	level: 285,
	job: "제로"
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

const currentScriptUrl = new URL(document.currentScript.src);
const appRootUrl = new URL("./", currentScriptUrl);
const basePath = appRootUrl.pathname.replace(/\/$/, "");
const assetUrl = (path) => new URL(`assets/${path}`, appRootUrl).href;
const routeUrl = (path) => `${basePath}${path}` || "/";

const assets = {
	avatar: assetUrl("kangmin-avatar.webp"),
	eos: assetUrl("eos.png"),
	logoMono: assetUrl("ui/logo-text-mono.svg"),
	logoWhite: assetUrl("ui/logo-text-white.svg"),
	menu: assetUrl("ui/menu-icon-white.svg"),
	back: assetUrl("ui/back-icon-black.svg"),
	closeBlack: assetUrl("ui/close-icon-black.svg"),
	closeWhite: assetUrl("ui/close-icon-white.svg"),
	park: assetUrl("ui/park-bg.png"),
	generation: assetUrl("ui/generation-13.svg")
};

const view = document.querySelector("#view");
const app = document.querySelector("#app");
const toast = document.querySelector("#toast");
const scrollMemory = { home: 0, member: 0 };
let toastTimer;
let sidebarOpener = null;

const restoredRoute = new URLSearchParams(location.search).get("route");
if (restoredRoute) {
	history.replaceState({ appRoute: true }, "", routeUrl(restoredRoute));
} else if (!history.state?.appRoute) {
	history.replaceState({ appRoute: true }, "", location.href);
}

history.scrollRestoration = "manual";

function escapeHtml(value) {
	return String(value)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}

function currentPath() {
	const pathname = location.pathname.startsWith(basePath)
		? location.pathname.slice(basePath.length)
		: location.pathname;
	return pathname.replace(/\/+$/, "") || "/";
}

function formatDate(value) {
	const [year, month, day] = value.split("-").map(Number);
	return `${year}년 ${month}월 ${day}일 획득`;
}

function settlementImage(item) {
	return assetUrl(`settlements/${item.id}.webp`);
}

function showToast(message) {
	window.clearTimeout(toastTimer);
	toast.textContent = message;
	toast.classList.add("is-visible");
	toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
}

function rememberScroll() {
	const scrollArea = view.querySelector("[data-scroll-area]");
	if (!scrollArea) return;
	if (currentPath() === "/") scrollMemory.home = scrollArea.scrollTop;
	if (currentPath() === "/member/1") scrollMemory.member = scrollArea.scrollTop;
}

function navigate(path, { replace = false } = {}) {
	if (currentPath() === path) return;
	rememberScroll();
	const method = replace ? "replaceState" : "pushState";
	history[method]({ appRoute: true }, "", routeUrl(path));
	renderRoute();
}

function mainHeader() {
	return `
		<header class="main-header">
			<button class="header-button" type="button" data-sidebar-open aria-label="메뉴 열기">
				<img src="${assets.menu}" alt="" />
			</button>
			<img class="main-header__logo" src="${assets.logoWhite}" alt="단풍바람" />
			<span class="header-spacer" aria-hidden="true"></span>
		</header>
	`;
}

function detailHeader(title, target, variant = "back") {
	const icon = variant === "close" ? assets.closeBlack : assets.back;
	const label = variant === "close" ? "닫기" : "뒤로가기";
	return `
		<header class="detail-header ${variant === "close" ? "detail-header--close" : ""}">
			<a class="header-button" href="${routeUrl(target)}" data-route="${target}" aria-label="${label}">
				<img src="${icon}" alt="" />
			</a>
			${variant === "close" ? "" : `<strong>${escapeHtml(title)}</strong>`}
		</header>
	`;
}

function footerLogo() {
	return `
		<footer class="app-footer">
			<img src="${assets.logoMono}" alt="단풍바람" />
		</footer>
	`;
}

function sidebarMarkup() {
	return `
		<aside class="sidebar" id="sidebar" aria-hidden="true" inert>
			<div>
				<section class="sidebar__title">
					<span>단풍바람 메생결산 정보</span>
					<strong>단풍바람 13기 메생결산</strong>
				</section>
				<div class="sidebar__group-label">메생결산핸즈+</div>
				<nav class="sidebar__nav">
					<a href="${routeUrl("/")}" data-route="/">메생결산 소식</a>
					<button type="button" data-team-message>운영팀 한마디</button>
				</nav>
			</div>
			<p class="sidebar__period">'25년 8월 25일 ~ '26년 2월 22일의 기록</p>
		</aside>
		<button class="sidebar-overlay" type="button" data-sidebar-close aria-label="사이드바 닫기"></button>
	`;
}

function renderHome() {
	document.title = "단풍바람 - 메생결산";
	app.classList.remove("app-frame--dark");
	view.innerHTML = `
		<section class="screen home-screen">
			${sidebarMarkup()}
			${mainHeader()}
			<div class="home-scroll" data-scroll-area>
				<div class="character-grid">
					<a class="character-card" href="${routeUrl("/member/1")}" data-route="/member/1" aria-label="에오스 강민 강민 마가다락방">
						<div class="world-badge"><img src="${assets.eos}" alt="에오스" /></div>
						<div class="character-card__avatar"><img src="${assets.avatar}" alt="강민" /></div>
						<div class="character-card__copy"><strong>강민</strong><span>마가다락방</span></div>
					</a>
				</div>
			</div>
		</section>
	`;
	requestAnimationFrame(() => {
		const scrollArea = view.querySelector("[data-scroll-area]");
		if (scrollArea) scrollArea.scrollTop = scrollMemory.home;
	});
}

function settlementRows() {
	return settlements.map((item) => `
		<a class="settlement-row" href="${routeUrl(`/msg/${item.id}`)}" data-route="/msg/${item.id}">
			<div class="settlement-row__thumb"><img src="${settlementImage(item)}" alt="${escapeHtml(item.title)}" /></div>
			<div class="settlement-row__copy">
				<strong>${escapeHtml(item.title)}</strong>
				<time datetime="${item.acquiredAt}">${formatDate(item.acquiredAt)}</time>
			</div>
		</a>
	`).join("");
}

function renderMember() {
	document.title = "강민 - 단풍바람";
	app.classList.remove("app-frame--dark");
	view.innerHTML = `
		<section class="screen member-screen">
			${detailHeader("메생결산 상세", "/")}
			<div class="member-scroll" data-scroll-area>
				<section class="profile-summary">
					<div class="profile-summary__avatar"><img src="${assets.avatar}" alt="강민" /></div>
					<div class="profile-summary__copy">
						<div><strong>${character.name}</strong><span>${character.nickname}</span></div>
						<p><span>Lv. ${character.level}</span><i></i><span>${character.server}</span><i></i><span>${character.job}</span></p>
					</div>
					<a class="save-link" href="${routeUrl("/member/1/save")}" data-route="/member/1/save">저장</a>
				</section>
				<section class="settlement-list">
					<h1>획득한 메생결산 목록</h1>
					<div>${settlementRows()}</div>
				</section>
			</div>
			${footerLogo()}
		</section>
	`;
	requestAnimationFrame(() => {
		const scrollArea = view.querySelector("[data-scroll-area]");
		if (scrollArea) scrollArea.scrollTop = scrollMemory.member;
	});
}

function renderSettlement(item) {
	document.title = `${item.title} - 단풍바람`;
	app.classList.remove("app-frame--dark");
	view.innerHTML = `
		<section class="screen settlement-screen">
			${detailHeader("", "/member/1", "close")}
			<div class="settlement-detail" data-scroll-area>
				<div class="settlement-detail__image">
					<img src="${settlementImage(item)}" alt="${escapeHtml(item.title)}" />
				</div>
				<dl class="detail-fields">
					<div><dt>획득 일자</dt><dd>${formatDate(item.acquiredAt)}</dd></div>
					<div><dt>상세 내용</dt><dd>${escapeHtml(item.title)}</dd></div>
				</dl>
			</div>
			${footerLogo()}
		</section>
	`;
}

function renderSave() {
	document.title = "카드 저장 - 강민";
	app.classList.add("app-frame--dark");
	view.innerHTML = `
		<section class="screen save-screen">
			<header class="save-header">
				<a class="header-button" href="${routeUrl("/member/1")}" data-route="/member/1" aria-label="닫기">
					<img src="${assets.closeWhite}" alt="" />
				</a>
			</header>
			<div class="save-content">
				<p>내 캐릭터 카드를 저장해 보세요!</p>
				<article class="save-card" id="save-card">
					<img class="save-card__logo" src="${assets.logoWhite}" alt="단풍바람" />
					<div class="save-card__scene">
						<img class="save-card__character" src="${assets.avatar}" alt="강민" />
						<div class="save-card__copy">
							<strong>강민</strong>
							<span>에오스 · 마가다락방 · 제로</span>
							<div><img src="${assets.generation}" alt="단풍바람 13기" /></div>
						</div>
					</div>
				</article>
				<button class="download-button" type="button" data-download-card>
					<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 21h16" /></svg>
					<span>저장하기</span>
				</button>
			</div>
		</section>
	`;
}

function renderNotFound() {
	document.title = "페이지를 찾을 수 없습니다 - 단풍바람";
	app.classList.remove("app-frame--dark");
	view.innerHTML = `
		<section class="screen not-found-screen">
			<img src="${assets.logoMono}" alt="단풍바람" />
			<h1>페이지를 찾을 수 없습니다.</h1>
			<a href="${routeUrl("/")}" data-route="/">첫 화면으로 돌아가기</a>
		</section>
	`;
}

function renderRoute() {
	const path = currentPath();
	if (path === "/") {
		renderHome();
		return;
	}
	if (path === "/member/1") {
		renderMember();
		return;
	}
	if (path === "/member/1/save") {
		renderSave();
		return;
	}
	const match = path.match(/^\/msg\/(\d+)$/);
	if (match) {
		const item = settlements.find((candidate) => candidate.id === match[1]);
		if (item) {
			renderSettlement(item);
			return;
		}
	}
	renderNotFound();
}

function setSidebar(open, { opener = null, restoreFocus = true } = {}) {
	const sidebar = document.querySelector("#sidebar");
	if (!sidebar) return;
	if (open && opener) sidebarOpener = opener;
	sidebar.classList.toggle("is-open", open);
	sidebar.setAttribute("aria-hidden", String(!open));
	sidebar.inert = !open;
	document.querySelector(".sidebar-overlay")?.classList.toggle("is-open", open);
	document.querySelector(".main-header")?.toggleAttribute("inert", open);
	document.querySelector(".home-scroll")?.toggleAttribute("inert", open);
	if (open) {
		requestAnimationFrame(() => sidebar.querySelector("a, button")?.focus());
	} else if (restoreFocus && sidebarOpener?.isConnected) {
	sidebarOpener.focus();
	}
}

function loadImage(src) {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = reject;
		image.src = src;
	});
}

function roundedRect(ctx, x, y, width, height, radius) {
	ctx.beginPath();
	if (typeof ctx.roundRect === "function") {
		ctx.roundRect(x, y, width, height, radius);
		return;
	}
	const safeRadius = Math.min(radius, width / 2, height / 2);
	ctx.moveTo(x + safeRadius, y);
	ctx.lineTo(x + width - safeRadius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
	ctx.lineTo(x + width, y + height - safeRadius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
	ctx.lineTo(x + safeRadius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
	ctx.lineTo(x, y + safeRadius);
	ctx.quadraticCurveTo(x, y, x + safeRadius, y);
	ctx.closePath();
}

async function downloadCard() {
	const button = document.querySelector("[data-download-card]");
	if (button) button.disabled = true;
	try {
		if (document.fonts?.ready) await document.fonts.ready;
		const [park, avatar, logo, generation] = await Promise.all([
			loadImage(assets.park),
			loadImage(assets.avatar),
			loadImage(assets.logoWhite),
			loadImage(assets.generation)
		]);
		const canvas = document.createElement("canvas");
		canvas.width = 650;
		canvas.height = 1030;
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("Canvas 2D context unavailable");
		const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
		gradient.addColorStop(0, "#fac486");
		gradient.addColorStop(1, "#f2a372");
		roundedRect(ctx, 0, 0, canvas.width, canvas.height, 38);
		ctx.fillStyle = gradient;
		ctx.fill();
		ctx.drawImage(logo, 205, 28, 240, 65);

		ctx.save();
		roundedRect(ctx, 20, 112, 610, 898, 24);
		ctx.clip();
		ctx.drawImage(park, 20, 112, 610, 898);
		const shade = ctx.createLinearGradient(0, 520, 0, 1010);
		shade.addColorStop(0, "rgba(24, 17, 12, 0)");
		shade.addColorStop(1, "rgba(24, 17, 12, 0.78)");
		ctx.fillStyle = shade;
		ctx.fillRect(20, 420, 610, 590);
		ctx.imageSmoothingEnabled = false;
		ctx.drawImage(avatar, 180, 330, 290, 290);
		ctx.restore();

		ctx.textAlign = "center";
		ctx.fillStyle = "#ffffff";
		ctx.font = "700 50px NexonLv1Gothic, sans-serif";
		ctx.fillText(character.name, 325, 785);
		ctx.font = "300 24px NexonLv1Gothic, sans-serif";
		ctx.fillText(`${character.server} · ${character.nickname} · ${character.job}`, 325, 838);
		ctx.fillStyle = "rgba(255,255,255,.2)";
		roundedRect(ctx, 205, 875, 240, 55, 28);
		ctx.fill();
		ctx.drawImage(generation, 245, 892, 160, 20);

		const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
		if (!blob) throw new Error("카드 이미지 생성 실패");
		const href = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = href;
		link.download = `${character.nickname}.png`;
		link.click();
		window.setTimeout(() => URL.revokeObjectURL(href), 1000);
		showToast("캐릭터 카드를 저장했습니다.");
	} catch (error) {
		console.error(error);
		showToast("카드를 저장하지 못했습니다.");
	} finally {
		if (button) button.disabled = false;
	}
}

view.addEventListener("click", (event) => {
	const routeLink = event.target.closest("[data-route]");
	if (routeLink) {
		event.preventDefault();
		if (routeLink.closest("#sidebar")) setSidebar(false, { restoreFocus: false });
		navigate(routeLink.dataset.route);
		return;
	}
	if (event.target.closest("[data-sidebar-open]")) {
		setSidebar(true, { opener: event.target.closest("[data-sidebar-open]") });
		return;
	}
	if (event.target.closest("[data-sidebar-close]")) {
		setSidebar(false);
		return;
	}
	if (event.target.closest("[data-team-message]")) {
		setSidebar(false);
		showToast("이 페이지는 강민의 메생결산만 제공합니다.");
		return;
	}
	if (event.target.closest("[data-download-card]")) {
		void downloadCard();
	}
});

window.addEventListener("popstate", renderRoute);
document.addEventListener("keydown", (event) => {
	if (event.key === "Escape" && document.querySelector("#sidebar.is-open")) {
		setSidebar(false);
	}
});
renderRoute();
