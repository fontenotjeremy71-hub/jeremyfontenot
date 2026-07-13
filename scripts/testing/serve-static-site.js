const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const HOST = "127.0.0.1";
const DEFAULT_PORT = 4174;
const REPOSITORY_ROOT = fs.realpathSync(path.resolve(__dirname, "..", ".."));
const DENIED_ROOT_SEGMENTS = new Set([".git", "node_modules"]);

const MIME_TYPES = new Map([
  [".html", "text/html; charset=utf-8"],
  [".htm", "text/html; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"],
  [".xsl", "text/xsl; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".md", "text/markdown; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".csv", "text/csv; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".gif", "image/gif"],
  [".webp", "image/webp"],
  [".avif", "image/avif"],
  [".ico", "image/x-icon"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".ttf", "font/ttf"],
  [".otf", "font/otf"],
  [".eot", "application/vnd.ms-fontobject"],
  [".pdf", "application/pdf"],
]);

function configuredPort() {
  const rawPort = process.env.STATIC_SITE_PORT || process.env.PORT || String(DEFAULT_PORT);
  const port = Number.parseInt(rawPort, 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535 || String(port) !== rawPort.trim()) {
    throw new Error("The static-site port must be an integer between 1 and 65535.");
  }
  return port;
}

function isInsideRepository(candidate) {
  const relative = path.relative(REPOSITORY_ROOT, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function sendText(response, statusCode, message, extraHeaders = {}) {
  const body = Buffer.from(`${message}\n`, "utf8");
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Length": body.length,
    "Cache-Control": "no-store",
    ...extraHeaders,
  });
  response.end(body);
}

async function resolveRequestPath(requestUrl) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(requestUrl.pathname);
  } catch {
    return { statusCode: 400, message: "Bad Request" };
  }

  if (decodedPath.includes("\0")) {
    return { statusCode: 400, message: "Bad Request" };
  }

  const normalizedUrlPath = decodedPath.replaceAll("\\", "/");
  const firstSegment = normalizedUrlPath.split("/").filter(Boolean)[0];
  if (firstSegment && DENIED_ROOT_SEGMENTS.has(firstSegment.toLowerCase())) {
    return { statusCode: 404, message: "Not Found" };
  }

  let candidate = path.resolve(REPOSITORY_ROOT, `.${normalizedUrlPath}`);
  if (!isInsideRepository(candidate)) {
    return { statusCode: 403, message: "Forbidden" };
  }

  let stats;
  try {
    stats = await fs.promises.stat(candidate);
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") {
      return { statusCode: 404, message: "Not Found" };
    }
    throw error;
  }

  if (stats.isDirectory()) {
    candidate = path.join(candidate, "index.html");
    try {
      stats = await fs.promises.stat(candidate);
    } catch (error) {
      if (error.code === "ENOENT" || error.code === "ENOTDIR") {
        return { statusCode: 404, message: "Not Found" };
      }
      throw error;
    }
  }

  if (!stats.isFile()) {
    return { statusCode: 404, message: "Not Found" };
  }

  const realPath = await fs.promises.realpath(candidate);
  if (!isInsideRepository(realPath)) {
    return { statusCode: 403, message: "Forbidden" };
  }

  return { realPath, stats };
}

function contentTypeFor(filePath) {
  return MIME_TYPES.get(path.extname(filePath).toLowerCase()) || "application/octet-stream";
}

const port = configuredPort();
const server = http.createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    sendText(response, 405, "Method Not Allowed", { Allow: "GET, HEAD" });
    return;
  }

  let requestUrl;
  try {
    requestUrl = new URL(request.url, `http://${HOST}:${port}`);
  } catch {
    sendText(response, 400, "Bad Request");
    return;
  }

  try {
    const resolved = await resolveRequestPath(requestUrl);
    if (!resolved.realPath) {
      sendText(response, resolved.statusCode, resolved.message);
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypeFor(resolved.realPath),
      "Content-Length": resolved.stats.size,
      "Cache-Control": "no-store",
    });

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    const stream = fs.createReadStream(resolved.realPath);
    stream.on("error", () => {
      if (!response.headersSent) {
        sendText(response, 500, "Internal Server Error");
      } else {
        response.destroy();
      }
    });
    stream.pipe(response);
  } catch {
    sendText(response, 500, "Internal Server Error");
  }
});

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  server.close((error) => {
    process.exitCode = error ? 1 : 0;
  });
  setTimeout(() => {
    process.exitCode = 1;
    process.exit();
  }, 5000).unref();
}

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Static site server could not bind to ${HOST}:${port}; the port is already in use.`);
  } else {
    console.error("Static site server failed to start.");
  }
  process.exitCode = 1;
});

server.listen(port, HOST, () => {
  console.log(`Static site server listening on http://${HOST}:${port}`);
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
