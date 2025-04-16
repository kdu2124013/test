// http 모듈 불러오기
const http = require('http');

// 서버 생성
const server = http.createServer((req, res) => {
  res.statusCode = 200; // 상태 코드 200: 성공
  res.setHeader('Content-Type', 'text/plain'); // 응답 헤더 설정
  res.end('Hello World\n'); // 응답 본문 전송
});

// 서버가 3000번 포트에서 대기하도록 설정
server.listen(3000, () => {
  console.log('서버가 http://localhost:3000 에서 실행 중입니다.');
});
