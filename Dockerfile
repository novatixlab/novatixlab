# 노바틱스랩 홈페이지 — 정적 사이트 이미지
# Synology Container Manager(Docker Compose)에서 구동하는 것을 전제로 합니다.
FROM nginx:alpine

# 커스텀 nginx 설정 (SPA 폴백, gzip, 캐시 헤더, /healthz)
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# 웹페이지 소스
COPY site/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1
