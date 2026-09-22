# 노바틱스랩 홈페이지

Claude 디자인에서 만든 노바틱스랩 웹페이지를 GitHub에서 관리하고, 시놀로지 NAS의 **Container Manager(Docker Compose)** 로 구동하기 위한 저장소입니다.

---

## 1. 구성 요약

| 항목 | 값 | 비고 |
|---|---|---|
| 웹 서버 | `nginx:alpine` | 정적 사이트 기준 |
| 웹페이지 소스 위치 | `site/` | 이 폴더 내용이 그대로 사이트 루트가 됩니다 |
| 컨테이너 포트 | `80` | 고정 |
| 호스트(시놀로지) 포트 | `8088` | DSM이 쓰지 않는 포트로 선택. `.env`의 `WEB_PORT`로 변경 가능 |
| 접속 주소 | `http://<NAS_IP>:8088` | |
| 재시작 정책 | `unless-stopped` | NAS 재부팅 시 자동 기동 |
| 헬스체크 | `GET /healthz` | Container Manager에서 상태 확인용 |

### 폴더 구조

```
.
├── Dockerfile            # nginx:alpine + site/ 복사
├── docker-compose.yml    # Container Manager가 읽는 파일
├── .env.example          # 포트 설정 예시 (.env로 복사해서 사용)
├── .dockerignore
├── nginx/
│   └── default.conf      # gzip, 캐시 헤더, 보안 헤더, /healthz
└── site/                 # ← 이 폴더 전체가 웹사이트입니다
    ├── index.html            메인
    ├── admin.html            관리자 · 로그인 · 회원가입
    ├── story.html            현장 스토리 게시판
    ├── hologram.html         3D 홀로그램 카탈로그
    ├── novatix-brochure.html 트라이폴드 LED 브로슈어
    ├── trifold-media-guide.html 해상도 가이드
    ├── support.js            Claude 디자인 런타임
    ├── doc-page.js / image-slot.js
    ├── favicon.png / apple-touch-icon.png / og-image.jpg
    ├── assets/               사진 24개
    └── vendor/               React 사본 (아래 7번 참고)
```

## 2. 웹페이지 수정하기

웹사이트 전체가 `site/` 폴더 안에 있습니다. 이 폴더의 파일을 고치면 그대로 사이트가 바뀝니다.

1. 글·가격·상품 정보는 대부분 `site/index.html` 위쪽의 `window.__NOVATIX_DATA` 블록에 모여 있습니다. 상품명, 설명, 가격 안내, 이벤트 문구, 연락처(이메일·인스타그램·카카오톡)를 여기서 고치면 됩니다.
2. 사진을 바꾸려면 `site/assets/` 의 파일을 같은 이름으로 덮어쓰면 됩니다.
3. Claude 디자인에서 다시 내보낸 경우, 받은 파일을 `site/` 에 덮어쓰되 **`<script src="./vendor/resources.js"></script>` 한 줄이 `support.js` 앞에 있는지 확인**하세요 (7번 참고).

### 아직 없는 파일

`site/trifold-example.png` 하나가 빠져 있습니다. `trifold-media-guide.html` 의 작업 예시 이미지로, 없으면 그 자리만 빈칸으로 보입니다. 파일을 `site/trifold-example.png` 로 올리면 바로 표시됩니다.

## 3. 시놀로지 Container Manager 배포 절차

### 방법 A — Git 연동 (권장, 어디서든 수정하려면 이 방법)

1. **DSM → 패키지 센터**에서 `Container Manager`와 `Git`(선택)을 설치합니다.
2. **File Station**에서 공유폴더 안에 프로젝트 폴더를 만듭니다. 예: `/docker/novatixlab`
3. DSM **제어판 → 터미널 및 SNMP → SSH 서비스 활성화** 후 SSH로 접속해 저장소를 내려받습니다.

   ```bash
   cd /volume1/docker
   git clone https://github.com/novatixlab/novatixlab.git novatixlab
   cd novatixlab
   cp .env.example .env     # 포트를 바꾸고 싶으면 .env 수정
   ```

4. **Container Manager → 프로젝트 → 생성**
   - 프로젝트 이름: `novatixlab`
   - 경로: 위에서 만든 `/volume1/docker/novatixlab` 선택
   - 소스: **기존 docker-compose.yml 사용**
   - 다음 → 빌드 시작

5. 빌드가 끝나면 `http://<NAS_IP>:8088` 로 접속합니다.

### 방법 B — 파일 업로드 (SSH 없이)

1. GitHub 저장소 페이지에서 **Code → Download ZIP**으로 받습니다.
2. File Station에서 `/docker/novatixlab` 폴더를 만들고 압축을 풀어 올립니다.
3. 위 4~5번과 동일하게 Container Manager에서 프로젝트를 생성합니다.

---

## 4. 수정 후 반영하기

어디서든(노트북, 다른 PC, GitHub 웹 에디터) `site/` 안의 파일을 고치고 커밋·푸시한 뒤, NAS에서 아래를 실행합니다.

### SSH를 쓰는 경우

```bash
cd /volume1/docker/novatixlab
git pull
sudo docker compose up -d --build
```

### Container Manager UI만 쓰는 경우

1. File Station으로 바뀐 파일을 덮어씁니다.
2. **Container Manager → 프로젝트 → novatixlab → 작업 → 빌드** 를 누릅니다.

> HTML은 캐시하지 않도록 설정돼 있어서 빌드만 끝나면 새로고침으로 바로 보입니다. 이미지·CSS는 30일 캐시라 파일명을 바꾸거나 브라우저 강력 새로고침(Ctrl+Shift+R)이 필요할 수 있습니다.

### 자동 반영(선택)

매번 수동 빌드가 번거로우면 DSM **제어판 → 작업 스케줄러**에 아래 스크립트를 등록하고 예약 실행(예: 10분마다)하면 푸시 후 자동 반영됩니다.

```bash
cd /volume1/docker/novatixlab
git fetch origin
if [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]; then
  git pull
  docker compose up -d --build
fi
```

---

## 5. 외부에서 접속하기 (도메인 · HTTPS)

1. **DSM → 제어판 → 로그인 포털 → 고급 → 역방향 프록시**에서 규칙을 추가합니다.
   - 소스: `HTTPS` / `novatixlab.co.kr` / 포트 `443`
   - 대상: `HTTP` / `localhost` / 포트 `8088`
2. **제어판 → 보안 → 인증서**에서 Let's Encrypt 인증서를 발급받아 위 규칙에 연결합니다.
3. 공유기에서 443 포트 포워딩, 도메인 A레코드를 NAS 공인 IP(또는 DDNS)로 지정합니다.

이렇게 하면 8088 포트는 외부에 열지 않고 `https://도메인`으로만 접속하게 됩니다.

---

## 6. 로컬에서 미리 보기

```bash
docker compose up --build
# http://localhost:8088
```

---

## 7. 알아두어야 할 동작 방식

### 인터넷 연결이 필요합니다

이 사이트는 화면을 그리는 데 React를 씁니다. 원래는 외부 CDN(unpkg.com)에서 내려받는 구조라, CDN이 막히면 **페이지 전체가 빈 화면**이 됩니다.

그래서 React 사본을 `site/vendor/` 에 함께 넣고, 런타임이 공식 지원하는 `window.__resources` 훅(`site/vendor/resources.js`)으로 서버 안의 사본을 쓰도록 해두었습니다. 이제 unpkg.com 이 죽어도 사이트는 정상 동작합니다.

나머지 외부 자원은 없어도 사이트가 뜨며, 아래 기능만 영향을 받습니다.

| 외부 자원 | 없을 때 |
|---|---|
| Pretendard · Archivo 폰트 (jsdelivr · 구글 폰트) | 시스템 기본 글꼴로 대체 |
| 다음 우편번호 서비스 | 예약 문의의 '주소 검색' 버튼만 동작 안 함 (직접 입력은 가능) |
| formsubmit.co | 예약 문의 메일 전송 실패 (카카오톡·전화 안내는 그대로) |

### 데이터가 저장되는 위치

관리자·회원·현장 스토리·문의 내역은 서버가 아니라 **접속한 브라우저의 localStorage**에 저장됩니다. 즉:

- 사무실 PC에서 올린 현장 스토리는 휴대폰에서 보이지 않습니다.
- 브라우저 데이터를 지우면 내용이 사라집니다.
- 방문자에게는 현장 스토리가 보이지 않습니다.

예약 문의 메일(`novatixlab@gmail.com`)은 formsubmit.co를 통해 정상 발송되므로 문의 접수 자체는 영향이 없습니다. 현장 스토리를 실제로 공개하려면 `story.html` 의 '검색용 페이지 내보내기'로 HTML을 뽑아 올리거나, 별도의 서버 저장소가 필요합니다.

### story.html의 AI 버튼

'AI 소개글 생성', 'AI 다듬기', '해시태그 자동 생성'은 Claude 디자인 미리보기 안에서만 동작하는 `window.claude` API를 사용합니다. 자체 서버에서는 "생성 실패 — 직접 입력해주세요" 알림이 뜹니다. 음성 입력(🎙)과 글 작성·수정·삭제는 정상 동작합니다.

### 빌드 도구를 쓰게 될 경우

지금은 순수 정적 파일 기준입니다. 나중에 React/Vite 등으로 바꾸면 `Dockerfile`을 멀티스테이지로 교체하세요.

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

## 8. 문제 해결

| 증상 | 확인할 것 |
|---|---|
| 접속이 안 됨 | Container Manager에서 컨테이너가 `running`인지, 포트 8088이 다른 앱과 겹치지 않는지 |
| 페이지는 뜨는데 이미지·CSS가 깨짐 | HTML 안 경로가 절대경로인지 확인 → 상대경로로 수정 |
| 수정했는데 그대로임 | 빌드를 다시 했는지, 브라우저 강력 새로고침(Ctrl+Shift+R) |
| 한글이 깨짐 | HTML `<head>`에 `<meta charset="utf-8">`가 있는지 |
| 포트 충돌 | `.env`의 `WEB_PORT`를 8089 등으로 변경 후 재빌드 |
| 화면이 완전히 빈 검은색 | `site/vendor/` 파일이 같이 올라갔는지, `vendor/resources.js` 줄이 `support.js` 앞에 있는지 확인 |
| 관리자 글이 다른 기기에서 안 보임 | 정상입니다 — 7번 "데이터가 저장되는 위치" 참고 |
