# AIAgentDevWorkFlowSample
AI 에이전트 개발 자동화 프로젝트

# 프로세스 흐름
내가 Issue 등록  →  Agent들이 알아서 개발  →  내가 PR 검토·Merge

# 전체 프로세스 흐름
<img width="600" height="581" alt="image" src="https://github.com/user-attachments/assets/b95264e5-aa53-4fed-90ad-fe1818ed4273" />

1.	Planner(나)가 GitHub에 기획 Issue 등록 + '기획' 라벨 추가
2.	GitHub Actions(자동화 도구)이 감지 → Architect Agent 자동 실행
3.	Architect Agent: 기획 분석 → Sub-issue(작은 작업 단위) 자동 생성
4.	Sub-issue에 라벨 붙으면 → Developer Agent 자동 실행
5.	Developer Agent: 브랜치 생성 → 코드 작성 → PR 자동 생성
6.	Developer(나)가 PR 검토 후 Merge

