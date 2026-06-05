# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# AIAgentDevWorkFlowSample 공통 규칙

## 프로젝트 정보
- GitHub Owner: bird798
- GitHub Repo: AIAgentDevWorkFlowSample
- 모든 응답은 한국어로 작성

## 공통 원칙
- 모든 작업은 GitHub Issue 기반으로 진행한다
- Issue 상태 변경 시 Project 보드도 업데이트한다
- PR 생성 시 반드시 `Closes #이슈번호`를 본문에 포함한다
- GitHub MCP를 사용해서 Issue, PR, Project를 조작한다

---

## 프로젝트 아키텍처

가계부 앱으로, AI 에이전트 기반 자동화 개발 워크플로우를 실증하는 프로젝트다.

### 디렉토리 구조
```
agents/          # 각 AI 에이전트의 역할 정의 (CLAUDE.md)
  planner/       # 기획 분석, 요건 명확화 → 'planner-reviewed' 라벨 부착
  architect/     # 기획 Issue를 Sub-issue로 분해 → 'architect-done' 라벨 부착
  developer/     # Sub-issue 구현 후 PR 생성
backend/         # Express + TypeScript REST API
frontend/        # React + TypeScript SPA (빌드 도구 없음, Vitest 테스트)
.github/workflows/agent-trigger.yml  # 라벨 이벤트로 에이전트 자동 실행
```

### AI 에이전트 워크플로우
1. Issue에 `기획` 라벨 부착 → GitHub Actions가 **Architect Agent** 자동 실행
2. Architect가 Sub-issue 생성 + `Sub-issue` 라벨 부착 → **Developer Agent** 자동 실행
3. Developer가 `feature/issue-{번호}-{설명}` 브랜치에서 코드 작성 후 PR 생성

### 브랜치 네이밍
`feature/issue-{번호}-{짧은-설명}` (예: `feature/issue-23-transaction-form`)

### 커밋 메시지
`feat: {제목} (#이슈번호)`

---

## Frontend (`frontend/`)

- React 18 + TypeScript, 번들러 없음(순수 TS 컴파일)
- 상태는 `localStorage`에 직접 저장 (서버 미연동)
- 코드 스타일: 함수/변수명은 영문, 주석은 한국어

### 테스트 실행
```bash
cd frontend
npm test          # 단일 실행
npm run test:watch  # 감시 모드
```

- 테스트 프레임워크: **Vitest** + `@testing-library/react` (jsdom 환경)
- 설정 파일: `vitest.config.ts`, 셋업 파일: `src/test/setup.ts`
- 특정 파일만 실행: `npx vitest run src/components/budget/BudgetManager.test.tsx`

### 주요 컴포넌트 관계
- `TransactionForm` → 수입/지출 입력 폼, `src/utils/transactionValidation.ts`로 유효성 검사
- `TransactionList` → 내역 목록 표시
- `MonthlySummary` → 월별 합계, `src/utils/summary.ts`로 집계
- `BudgetManager` → `totalSpent`(props)를 받아 예산 대비 현황 표시, localStorage에 `budget:{YYYY-MM}` 키로 저장

### 타입 정의 주의
- `src/types/transaction.ts`와 `src/types/budget.ts`에 `TransactionType`, `Transaction`이 중복 정의되어 있다. 컴포넌트 작성 시 어느 쪽을 import하는지 확인할 것.

---

## Backend (`backend/`)

- Express 4 + TypeScript
- 진입점: `src/app.ts`, 라우트: `/api/auth`
- 빌드: `npm run build` (tsc), 개발 실행: `npm run dev` (ts-node)
- 테스트: `npm test` (Jest + supertest)
