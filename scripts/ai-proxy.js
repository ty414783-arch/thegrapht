const http = require('http');

const COCOON_PORT = 10005;
const OLLAMA_PORT = 11434;

const MODEL_MAPPING = {
  "TheGraphT Chat Carbon": "qwen2.5:1.5b",
  "TheGraphT Chat Graphite": "qwen2.5:3b",
  "TheGraphT Chat Platinum": "gemma2:2b"
};

// Check if Cocoon is responding
function checkCocoon() {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${COCOON_PORT}/v1/models`, { timeout: 1000 }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 1. Models List
  if (req.url === '/v1/models' || req.url === '/models') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      object: "list",
      data: [
        { id: "TheGraphT Chat Carbon", object: "model", created: 1700000000, owned_by: "thegrapht" },
        { id: "TheGraphT Chat Graphite", object: "model", created: 1700000000, owned_by: "thegrapht" },
        { id: "TheGraphT Chat Platinum", object: "model", created: 1700000000, owned_by: "thegrapht" }
      ]
    }));
    return;
  }

  // 2. Chat Completions
  if (req.url === '/v1/chat/completions' || req.url === '/chat/completions') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        let payload = JSON.parse(body);
        const originalModel = payload.model;

        const isReady = await checkCocoon();
        let targetPort = OLLAMA_PORT;

        if (isReady) {
          targetPort = COCOON_PORT;
          payload.model = "deepseek-ai/DeepSeek-V3";
        } else {
          payload.model = MODEL_MAPPING[originalModel] || "qwen2.5:1.5b";
        }

        const modifiedBody = JSON.stringify(payload);
        const headers = { ...req.headers };
        delete headers['host'];
        headers['content-length'] = Buffer.byteLength(modifiedBody);

        const proxyReq = http.request({
          host: '127.0.0.1',
          port: targetPort,
          path: req.url,
          method: 'POST',
          headers: headers
        }, (proxyRes) => {
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(res);
        });

        proxyReq.on('error', (err) => {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end(`Proxy Error: ${err.message}`);
        });

        proxyReq.write(modifiedBody);
        proxyReq.end();
      } catch (e) {
        res.writeHead(400);
        res.end("Bad Request");
      }
    });
    return;
  }

  // 3. Fallback / Catch-all proxy
  const isReady = await checkCocoon();
  const targetPort = isReady ? COCOON_PORT : OLLAMA_PORT;

  const headers = { ...req.headers };
  delete headers['host'];

  const proxyReq = http.request({
    host: '127.0.0.1',
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: headers
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    res.writeHead(500);
    res.end();
  });

  req.pipe(proxyReq);
});

server.listen(10000, '0.0.0.0', () => {
  console.log('AI Proxy listening on port 10000');
});
