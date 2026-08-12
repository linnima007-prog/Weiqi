// 极简静态服务器：供 Kimi Work 预览使用
// 支持 CLI 参数：--port/-p、--host/-H（以及 --port=8080 形式）
const http = require('http');
const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
function argVal(names, dflt) {
  for (let i = 0; i < argv.length; i++) {
    for (const n of names) {
      if (argv[i] === n && argv[i + 1]) return argv[i + 1];
      if (argv[i].startsWith(n + '=')) return argv[i].split('=')[1];
    }
  }
  return dflt;
}
const PORT = Number(process.env.PORT || argVal(['--port', '-p'], 7100));
const HOST = process.env.HOST || argVal(['--host', '-H'], '127.0.0.1');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.json': 'application/json', '.md': 'text/markdown; charset=utf-8',
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const file = path.join(__dirname, path.normalize(urlPath));
  if (!file.startsWith(__dirname)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not Found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, HOST, () => console.log(`围棋学堂 → http://${HOST}:${PORT}/`));
