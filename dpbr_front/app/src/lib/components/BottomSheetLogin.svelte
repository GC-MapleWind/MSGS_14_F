<script lang="ts">
    import { onMount } from "svelte";
    import { env } from "$env/dynamic/public";
    import { MessageCircle, X, CircleCheck, Circle } from "lucide-svelte";
    import InputBox from "$lib/components/InputBox.svelte";
    import Button from "$lib/components/Button.svelte";
    import { toast } from "$lib/stores/toast";
    import { authStore, getSavedName } from "$lib/stores/auth";

    interface Props {
        onClose: () => void;
        onSuccess: () => void;
    }

    let { onClose, onSuccess }: Props = $props();

    let name = $state("");
    let studentId = $state("");
    let saveName = $state(false);
    let nameFocused = $state(false);
    let studentIdFocused = $state(false);
    let isLoading = $state(false);
    let studentIdInputRef: HTMLDivElement | undefined = $state();
    let dialogEl: HTMLDivElement | undefined = $state();
    let infoMessage = $state("");

    // 애니메이션을 위한 상태
    let isVisible = $state(false);

    onMount(() => {
        // 약간의 딜레이를 주어 슬라이드 업 애니메이션 트리거
        setTimeout(() => {
            isVisible = true;
        }, 10);

        const savedName = getSavedName();
        if (savedName) {
            name = savedName.slice(0, 3);
            saveName = true;
        }

        dialogEl?.focus();
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleClose();
            }
        };

        window.addEventListener("keydown", handleEscape);
        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    });

    function handleClose(e?: Event) {
        e?.stopPropagation();
        // 닫힐 때 슬라이드 다운 애니메이션 트리거
        isVisible = false;
        setTimeout(() => {
            onClose();
        }, 300); // transition duration과 맞춤
    }

    async function handleLogin() {
        if (!name.trim() || !studentId.trim()) {
            showInfoMessage("이름 또는 학번을 확인해 주세요.");
            return;
        }

        isLoading = true;

        try {
            await authStore.login(name.trim(), studentId.trim(), saveName);
            // 로그인 성공 시 콜백 호출
            showInfoMessage("로그인 되었습니다.");
            handleClose();
            setTimeout(() => {
                onSuccess();
            }, 300);
        } catch (error) {
            showInfoMessage("이름 또는 학번을 확인해 주세요.");
            studentId = "";
            studentIdFocused = true;
            setTimeout(() => {
                const input = studentIdInputRef?.querySelector("input");
                input?.focus();
            }, 0);
        } finally {
            isLoading = false;
        }
    }

    /*
    function handleKakaoLogin() {
        const kakaoClientId = env.PUBLIC_KAKAO_CLIENT_ID;
        const kakaoRedirectUri = env.PUBLIC_KAKAO_REDIRECT_URI;

        if (!kakaoClientId || !kakaoRedirectUri) {
            showToastMessage(
                "카카오 로그인 설정이 누락되었습니다. 관리자에게 문의해주세요.",
            );
            return;
        }

        const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoClientId}&redirect_uri=${kakaoRedirectUri}&response_type=code`;
        window.location.href = KAKAO_AUTH_URL;
    }
    */

    function showInfoMessage(message: string) {
        infoMessage = message;
        setTimeout(() => {
            infoMessage = "";
        }, 3000);
    }

    // Focus/Blur 핸들러들
    function handleNameFocus() {
        nameFocused = true;
        studentIdFocused = false;
    }
    function handleNameBlur() {
        nameFocused = false;
    }
    function handleStudentIdFocus() {
        studentIdFocused = true;
        nameFocused = false;
    }
    function handleStudentIdBlur() {
        studentIdFocused = false;
    }
    function handleStudentIdClear() {
        studentId = "";
    }

    function handleNameKeyDown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault();
            const input = studentIdInputRef?.querySelector("input");
            input?.focus();
        }
    }

    function handleStudentIdKeyDown(e: KeyboardEvent) {
        if (e.key === "Enter" && studentId.length === 9) {
            e.preventDefault();
            handleLogin();
        }
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    bind:this={dialogEl}
    class="absolute inset-0 z-50 flex flex-col justify-end bg-black/40 transition-opacity duration-300 {isVisible
        ? 'opacity-100'
        : 'opacity-0'}"
    onclick={handleClose}
    role="dialog"
    aria-modal="true"
    aria-label="로그인"
    tabindex="-1"
>
    <div
        class="w-full shrink-0 bg-yt-bg border-t border-yt-border rounded-t-3xl pt-4 pb-8 px-6 flex flex-col items-center shadow-lg transition-all duration-300 {isVisible
            ? 'h-[72vh] translate-y-0'
            : 'h-[72vh] translate-y-full'}"
        onclick={(e) => e.stopPropagation()}
    >
        <!-- 닫기 버튼 -->
        <div class="w-full flex justify-end">
            <button onclick={handleClose} class="text-yt-text p-2" aria-label="닫기">
                <X size={22} strokeWidth={1.8} />
            </button>
        </div>

        <!-- 모달 컨텐츠 -->
        <div class="w-full max-w-md flex flex-col items-center mt-2">
            <!-- 앱 타이틀 이미지 로고 -->
            <img
                src="/images/logos/logo-text-mono.svg"
                alt="COMMUNITY_PROJECT"
                class="h-9 object-contain mb-8 mt-1 dark:invert"
                draggable="false"
            />

            <!-- 입력 폼 -->
            <form
                class="w-full flex flex-col"
                onsubmit={(e) => {
                    e.preventDefault();
                    handleLogin();
                }}
            >
                <!-- 입력 필드 그룹 -->
                <div class="flex flex-col gap-1 mb-2">
                    <!-- 이름 입력 -->
                    <InputBox
                        type="text"
                        placeholder="이름"
                        value={name}
                        maxLength={3}
                        inputState={nameFocused ? "focused" : "default"}
                        showClearButton={false}
                        onInput={(value) => (name = value)}
                        onFocus={handleNameFocus}
                        onBlur={handleNameBlur}
                        onKeyDown={handleNameKeyDown}
                        class="rounded-lg"
                    />

                    <!-- 학번 입력 -->
                    <div bind:this={studentIdInputRef}>
                        <InputBox
                            type="tel"
                            placeholder="학번"
                            value={studentId}
                            maxLength={9}
                            inputState={studentIdFocused
                                ? "focused"
                                : "default"}
                            showClearButton={false}
                            onInput={(value) => (studentId = value)}
                            onFocus={handleStudentIdFocus}
                            onBlur={handleStudentIdBlur}
                            onClear={handleStudentIdClear}
                            onKeyDown={handleStudentIdKeyDown}
                            class="rounded-lg"
                        />
                    </div>
                </div>

                <!-- 로그인 버튼 -->
                <div class="relative w-full">
                    {#if infoMessage}
                        <div
                            class="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-[60] pointer-events-none"
                        >
                            <span
                                class="bg-black/60 text-white text-[15px] px-5 py-2.5 rounded-3xl shadow-md font-medium whitespace-nowrap pointer-events-auto"
                            >
                                {infoMessage}
                            </span>
                        </div>
                    {/if}
                    <Button
                        label="로그인하고 댓글 남기기"
                        variant="primary"
                        buttonState={isLoading ? "disabled" : "default"}
                        onClick={() => {}}
                        type="submit"
                        class="font-medium py-[14px] rounded-full w-full"
                    />
                </div>

                <!-- 이름 저장 체크박스 -->
                <label class="flex items-center gap-2 cursor-pointer mt-2 mb-2">
                    <input
                        type="checkbox"
                        bind:checked={saveName}
                        class="sr-only"
                        aria-label="이름 저장"
                    />
                    <div
                        class="relative flex items-center justify-center w-5 h-5 text-yt-text"
                    >
                        {#if saveName}
                            <CircleCheck size={20} />
                        {:else}
                            <Circle size={20} class="text-yt-text-muted" />
                        {/if}
                    </div>
                    <span class="text-yt-text text-sm font-light select-none"
                        >이름 저장</span
                    >
                </label>

                <!-- 구분선 -->
                <div class="w-full h-px bg-yt-border my-2"></div>

                <!-- 카카오 로그인 버튼 주석 처리
                <button
                    onclick={handleKakaoLogin}
                    class="w-full py-3 px-4 rounded-lg font-medium text-base transition-all bg-[#FEE500] text-black hover:bg-[#FDD835] border-none flex items-center justify-center gap-2"
                >
                    <MessageCircle size={18} fill="black" class="text-black" />
                    <span>카카오 로그인</span>
                </button>
                -->
            </form>

            <!-- 푸터 안내문구 -->
            <div class="mt-12 mb-4 flex justify-center">
                <p class="text-yt-text-muted text-sm font-light text-center">
                    COMMUNITY_PROJECT 회원이 이용 가능한 서비스입니다.
                </p>
            </div>
        </div>
    </div>
</div>
