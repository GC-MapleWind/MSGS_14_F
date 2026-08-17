import { writable } from 'svelte/store';

/** 데스크톱 가이드(좌측 패널) 접힘 상태 — 헤더 햄버거로 토글 */
export const guideCollapsed = writable(false);

/** 로그아웃 확인 팝업 열림 상태 — 헤더/내 페이지에서 제어 */
export const logoutConfirmOpen = writable(false);
