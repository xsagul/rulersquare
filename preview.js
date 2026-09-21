// Local-only preview. Production remains static and has no Node runtime.
const http = require("http");
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "dist");
const mime = { ".html":"text/html; charset=utf-8", ".css":"text/css", ".js":"text/javascript", ".svg":"image/svg+xml", ".png":"image/png", ".xml":"application/xml", ".txt":"text/plain" };
http.createServer((req, res) => {
  let route;
  try { route = decodeURIComponent(new URL(req.url, "http://localhost").pathname); }
  catch { res.writeHead(400).end(); return; }
  let file = path.resolve(root, "." + route);
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  const found = fs.existsSync(file) && fs.statSync(file).isFile();
  if (!found) file = path.join(root, "404.html");
  res.writeHead(found ? 200 : 404, {"Content-Type":mime[path.extname(file)] || "application/octet-stream", "Cache-Control":"no-store"});
  fs.createReadStream(file).pipe(res);
}).listen(8787, "127.0.0.1", () => console.log("Preview: http://127.0.0.1:8787"));
