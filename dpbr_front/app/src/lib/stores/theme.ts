import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';

function getStoredPreference(): ThemePreference {
	if (!browser) return 'system';
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored === 'light' || stored === 'dark' || stored === 'system') {
			return stored;
		}
	} catch {
		// localStorage 접근 불가 환경은 시스템 설정을 따름
	}
	return 'system';
}

function systemPrefersDark(): boolean {
	if (!browser) return false;
	return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyPreference(preference: ThemePreference) {
	if (!browser) return;
	const isDark = preference === 'dark' || (preference === 'system' && systemPrefersDark());
	document.documentElement.classList.toggle('dark', isDark);
}

function createThemeStore() {
	let current = getStoredPreference();
	const { subscribe, set } = writable<ThemePreference>(current);

	if (browser) {
		applyPreference(current);

		window
			.matchMedia('(prefers-color-scheme: dark)')
			.addEventListener('change', () => {
				if (current === 'system') {
					applyPreference(current);
				}
			});
	}

	return {
		subscribe,
		set(preference: ThemePreference) {
			current = preference;
			if (browser) {
				try {
					localStorage.setItem(STORAGE_KEY, preference);
				} catch {
					// 저장 실패해도 이번 세션에는 적용
				}
				applyPreference(preference);
			}
			set(preference);
		},
	};
}

export const theme = createThemeStore();
