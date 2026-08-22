<script lang="ts">
    import { EllipsisVertical } from "lucide-svelte";
    import type { Character } from "$lib/types";
    import { handleImageError } from "$lib/utils/image";

    interface Props {
        character: Character;
    }

    let { character }: Props = $props();

</script>

<a href="/shorts/{character.id}" class="flex flex-col select-none">
    <!-- 16:9 썸네일: 백엔드가 해당 캐릭터의 결산 이미지 중 하나를 랜덤 선택 -->
    <div
        class="relative aspect-video overflow-hidden bg-yt-surface lg:rounded-xl"
    >
        <img
            src={character.previewImageUrl || character.avatarUrl}
            alt={`${character.name} 결산 미리보기`}
            onerror={handleImageError}
            class="absolute inset-0 w-full h-full object-cover"
            draggable="false"
        />

        <!-- 우하단 결산 개수 배지 (유튜브 영상시간 자리) -->
        <span
            class="absolute bottom-2 right-2 text-xs font-medium text-white bg-black/70 px-1.5 py-0.5 rounded"
        >
            결산 {character.settlementCount ?? 0}개
        </span>
    </div>

    <!-- 채널 정보 행 -->
    <div class="flex items-start gap-3 px-3 pt-3 pb-5 lg:px-0 lg:pb-0">
        <div
            class="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-yt-surface"
        >
            <img
                src={character.avatarUrl}
                alt=""
                aria-hidden="true"
                onerror={handleImageError}
                class="w-full h-full object-cover [image-rendering:pixelated]"
                draggable="false"
            />
        </div>
        <div class="flex flex-col grow min-w-0">
            <span
                class="text-[15px] font-medium text-yt-text leading-snug truncate"
                >{character.name}</span
            >
            <span class="text-[12px] text-yt-text-muted truncate"
                >{character.nickname} · {character.server} · {character.job}</span
            >
        </div>
        <span class="p-1 text-yt-text-muted shrink-0" aria-hidden="true">
            <EllipsisVertical size={16} />
        </span>
    </div>
</a>
