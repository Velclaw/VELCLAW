const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8890;
const ROOT = path.join(__dirname, "public");

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split("?")[0]);
  if (url === "/") url = "/index.html";

  const file = path.normalize(path.join(ROOT, url));

  if (!file.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, {"Content-Type": "text/plain"});
      return res.end("404 Not Found");
    }

    res.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-cache"
    });

    res.end(data);
  });
}).listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("╔══════════════════════════════════╗");
  console.log("║          KIO.AI ONLINE           ║");
  console.log("╠══════════════════════════════════╣");
  console.log(`║ Local: http://127.0.0.1:${PORT}   ║`);
  console.log(`║ Port : ${PORT}                    ║`);
  console.log("╚══════════════════════════════════╝");
  console.log("");
});
