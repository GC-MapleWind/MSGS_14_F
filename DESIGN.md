# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-08-17
- Primary product surfaces: 홈 피드, 멤버 쇼츠, 멤버 상세, 운영팀 한마디, 결산별 댓글, 자유 재생, 이미지 저장
- Evidence reviewed: `README.md`, `prompt/dpbr_front/plan.md`, `dpbr_front/app/src/routes/+layout.svelte`, `dpbr_front/app/src/routes/+page.svelte`, `dpbr_front/app/src/routes/member/[id]/save/+page.svelte`, `dpbr_front/app/src/lib/components/Header.svelte`, `BottomNav.svelte`, `GuideRail.svelte`, `VideoCard.svelte`, `app.css`, 백엔드 캐릭터 컨트롤러·서비스·저장소와 결산 API 스키마

## Brand
- Personality: 동아리 구성원의 게임 활동을 가볍고 친근하게 돌아보는 커뮤니티
- Trust signals: 실제 캐릭터 정보, 획득 일자, 운영팀 전용 콘텐츠의 명확한 구분
- Avoid: 같은 목적지의 중복 내비게이션, 핵심 콘텐츠를 가리는 장식, YouTube 명칭의 불필요한 직역

## Product goals
- Goals: 이름·닉네임·결산 내용 통합 검색, 멤버별 활동 결산 탐색, 운영팀 공지 확인, 임의의 결산으로 바로 진입하는 자유 재생, 각 결산에 귀속된 댓글 참여, 멤버의 14기 활동을 한 장의 캐릭터 카드로 저장·공유
- Non-goals: 범용 동영상 플랫폼, 전역 톡 또는 실시간 채팅 서비스 구현
- Success signals: 모바일·데스크톱 상단에서 이름·닉네임·쇼츠 제목/설명으로 멤버를 찾을 수 있고, 모바일 가운데 자유 재생 버튼으로 임의 결산을 열며 각 쇼츠에서 해당 결산의 댓글만 조회·작성·삭제할 수 있음

## Personas and jobs
- Primary personas: COMMUNITY_PROJECT 동아리원과 활동 기록을 둘러보는 방문자
- User jobs: 이름·닉네임·기억나는 결산 내용으로 구성원 기록 검색, 운영팀 메시지 확인, 아무 결산이나 빠르게 감상, 현재 결산에 댓글 작성·조회
- Key contexts of use: 세로형 모바일 화면과 데스크톱 브라우저

## Information architecture
- Primary navigation: 모바일 하단의 홈, 운영팀 한마디, 자유 재생, 내 페이지 4개 항목과 데스크톱 가이드 레일
- Core routes/screens: `/`, `/shorts/[id]`, `/member/[id]`, `/member/admin-team`, `/member/[id]/save`
- Content hierarchy: 홈 상단은 브랜드와 검색 진입 아이콘만 노출한다. 운영팀 한마디는 모바일 하단과 데스크톱 가이드 레일에서 진입한다. 전역 톡 화면은 두지 않고 현재 쇼츠의 우측 액션 레일에서 결산별 댓글 시트를 연다. 영상 썸네일에는 서버·레벨 대신 `결산 N개`만 표시한다.

## Design principles
- 한 기능은 한 위치에서 명확하게 찾을 수 있도록 중복 진입점을 줄인다.
- 운영팀 한마디는 모바일 하단과 데스크톱 가이드 레일에서 찾을 수 있게 하고, 모바일 상단에는 중복 진입점을 두지 않는다.
- 검색은 제출된 하나의 질의를 이름·닉네임·쇼츠 제목/설명에 동일하게 적용하며, URL의 `q` 파라미터로 공유·복원이 가능하게 한다.
- 모바일은 YouTube의 축약형 헤더 패턴처럼 기본 상태에 돋보기만 두고, 클릭할 때 `뒤로가기 + 검색 입력 + 검색 버튼`으로 전환한다.
- 영상 카드의 오버레이 정보는 콘텐츠 양처럼 탐색 결정에 직접 필요한 정보만 남긴다.
- 모바일 하단은 빈 슬롯 없는 균등한 4버튼 구조로 구성한다. 네 탭은 동일한 64px 높이, 24px 아이콘, 라벨 기준선을 사용하며 특정 탭만 원형 배경이나 돌출 형태로 강조하지 않는다. `자유 재생`은 생성 기능으로 오해되지 않도록 셔플 아이콘을 사용하며, 전체 결산 중 하나를 무작위로 골라 해당 쇼츠 딥링크를 연다.
- 댓글은 전역 대화방이 아니라 현재 Settlement에 귀속한다. 쇼츠를 벗어나지 않고 YouTube 댓글 문법의 하단 시트로 조회·작성·삭제한다.
- 캐릭터 저장 카드는 YouTube 채널의 `16:9 배너 + 원형 프로필 + 채널명/핸들 + 콘텐츠 통계` 문법을 9:16 공유 이미지 안에 재구성한다.
- 캐릭터 원본 이미지를 세로 배경으로 과도하게 확대·크롭하지 않고, 대표 결산은 16:9 프레임에 `object-fit: contain`으로 온전히 보여준다.
- Tradeoffs: 모바일 상단을 검색 중심으로 단순화하는 대신 운영팀 콘텐츠는 하단 내비게이션에서 지속적으로 접근할 수 있게 한다.

## Visual language
- Color: `app.css`의 `--yt-*` 시맨틱 토큰을 사용하며 라이트·다크 테마를 함께 지원한다. 저장 카드는 테마와 무관하게 YouTube 다크 표면(`#0f0f0f`, `#212121`)과 단풍바람 레드 포인트를 사용한다.
- Typography: GAME_API_PROVIDER Lv1 Gothic과 시스템 폰트 폴백
- Spacing/layout rhythm: 모바일 하단 내비게이션과 데스크톱 가이드 레일의 기존 간격 유지
- Shape/radius/elevation: 기존 원형 액션과 둥근 표면 토큰 재사용
- Motion: 기존 hover, active, snap 동작 유지; 불필요한 전환 추가 금지
- Imagery/iconography: Lucide 아이콘과 프로젝트 로고 자산 재사용

## Components
- Existing components to reuse: `Header`, `BottomNav`, `GuideRail`, `VideoCard`, `ShortsThumbnail`, `CommentItem`, `BottomSheetLogin`
- New/changed components: `BottomNav` 4버튼 구조와 셔플형 자유 재생 액션, `Header`의 검색 중심 모바일 상단, `GuideRail` 자유 재생 행, 쇼츠 우측 댓글 액션과 `SettlementCommentsSheet`, `VideoCard`의 결산 개수 배지, 9:16 `단풍바람 14기 캐릭터 카드`
- Variants and states: 모바일 검색 닫힘/열림, 활성 경로, 자유 재생 조회 중, 댓글 시트 닫힘/열림, 댓글 로딩·비어 있음·오류·작성 중, 검색 중 로딩, 검색 결과 없음, API 오류 토스트
- Token/component ownership: 색상은 `app.css`, 내비게이션 동작은 `src/lib/utils/nav.ts`

## Accessibility
- Target standard: 기존 의미론을 유지하며 WCAG 2.1 AA를 지향
- Keyboard/focus behavior: 검색 폼은 Enter 제출을 지원하고, 링크와 버튼의 네이티브 키보드 동작 및 명확한 `aria-label` 유지
- Contrast/readability: `--yt-text`, `--yt-text-muted`, `--yt-border` 토큰 사용
- Screen-reader semantics: 운영팀 한마디, 자유 재생, 현재 결산 댓글과 `이름, 닉네임, 내용 검색`의 목적을 한국어 접근성 이름으로 제공
- Reduced motion and sensory considerations: 새 자동 애니메이션을 추가하지 않음

## Responsive behavior
- Supported breakpoints/devices: 최소 320px 모바일부터 `lg` 이상 데스크톱
- Layout adaptations: 모바일은 축약형 상단 검색과 하단 내비게이션, 데스크톱은 항상 보이는 상단 검색과 접이식 좌측 가이드 레일. 캐릭터 카드는 화면에서는 최대 360px로 축소하되 저장 결과는 720×1280 PNG를 기준으로 한다.
- Touch/hover differences: 터치 영역은 기존 크기를 유지하고 데스크톱에만 hover 피드백 사용

## Interaction states
- Loading: 검색 질의가 바뀌면 목록 영역에서 기존 로딩 안내 제공
- Empty: 통합 검색 결과가 없으면 `검색 결과가 없습니다.`를 제공
- Error: 쇼츠 조회 실패 토스트 및 콘솔 진단 정보 유지
- Success: 자유 재생은 무작위 Settlement의 `/shorts/{characterId}?item={settlementId}`를 열고, 댓글 작성 즉시 현재 결산 댓글 목록 맨 위에 표시한다. 캐릭터 카드는 저장 완료 토스트와 함께 PNG를 내려받는다.
- Disabled: 자유 재생 조회·댓글 제출·이미지 생성 중 중복 실행을 차단하고 시각적 진행 상태를 제공한다.
- Offline/slow network, if applicable: 현재 화면을 유지하며 실패 토스트 표시

## Content voice
- Tone: 짧고 친근한 한국어
- Terminology: 사용자 노출 명칭은 `운영팀 한마디`, `자유 재생`, `댓글`, `결산 N개`로 통일하고 `톡`은 사용하지 않는다.
- Microcopy rules: 동작과 목적지가 한 번에 이해되는 명사형 라벨을 사용하고 검색 입력에는 `이름, 닉네임, 내용 검색`을 표시한다. 저장 결과의 명칭은 `단풍바람 14기 캐릭터 카드`, 동아리 설명은 `가천대 메이플스토리 동아리`로 통일한다.

## Implementation constraints
- Framework/styling system: SvelteKit 2, Svelte 5, TypeScript, Tailwind CSS 4
- Design-token constraints: 기존 `--yt-*` 토큰과 컴포넌트 유틸리티 클래스를 우선 사용
- Performance constraints: 카드별 결산 개수는 N+1 요청 없이 캐릭터 조회에 포함하며, 검색은 페이지네이션 쿼리에서 결산 콘텐츠 존재 조건으로 처리해 클라이언트 전체 로드를 피함
- Compatibility constraints: 정적 어댑터와 클라이언트 내비게이션 유지
- Test/screenshot expectations: `npm run check`, `npm run build`, 모바일·데스크톱 브라우저 스모크 확인

## Open questions
- 현재 없음
