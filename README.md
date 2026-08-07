# 단풍바람 14기 Frontend

단풍바람 14기 활동 기록을 YouTube Shorts 형태로 탐색하는 SvelteKit 프론트엔드입니다.

## 주요 기능

- 세로형 Shorts 피드와 쇼츠별 음원 구간 재생
- 이름·닉네임·결산 내용 통합 검색
- 운영팀 한마디 목록과 상세 화면
- 모바일 하단 내비게이션과 데스크톱 가이드 레일
- 반응형 캐릭터 카드와 이미지 저장

## 로컬 실행

```bash
cd dpbr_front/app
cp .env.example .env
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

기본 개발 API 주소는 `http://localhost:8000/api/v1`입니다. 브라우저에서 `http://localhost:5173`을 엽니다.

## 검증

```bash
cd dpbr_front/app
npm run check
npm run build
```

백엔드는 별도 저장소인 `MSGS_14_B`에서 관리합니다.
