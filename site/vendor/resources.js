/* NOVATIX LAB — CDN 대체 경로 설정
 *
 * support.js(Claude 디자인 런타임)는 React/ReactDOM을 기본적으로 unpkg.com에서
 * 내려받습니다. 외부 CDN이 막히거나 느리면 페이지 전체가 빈 화면이 되므로,
 * 런타임이 공식 지원하는 window.__resources 훅으로 같은 서버의 사본을 쓰게 합니다.
 *
 * 반드시 support.js 보다 먼저 로드되어야 합니다.
 * 이 파일이 없거나 vendor/ 파일이 없으면 자동으로 unpkg.com 으로 되돌아갑니다.
 */
window.__resources = Object.assign({}, window.__resources, {
  'https://unpkg.com/react@18.3.1/umd/react.production.min.js':
    './vendor/react-18.3.1.production.min.js',
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js':
    './vendor/react-dom-18.3.1.production.min.js',
});
