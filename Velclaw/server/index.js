const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');
const { agentReply, message, id: agentId } = require('./agent');
const { createBuild } = require('./build');
const { createRuntime } = require('./runtime');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const DATA = path.join(ROOT, 'data', 'db.json');
const PORT = Number(process.env.PORT || 8787);

function load() {
  try {
    return JSON.parse(fs.readFileSync(DATA, 'utf8'));
  } catch {
    return { projects: [], files: [], jobs: [], messages: [], tickets: [] };
  }
}

function save(db) {
  fs.writeFileSync(DATA, JSON.stringify(db, null, 2));
}

function id(prefix) {
  return `${prefix}_${crypto.randomBytes(5).toString('hex')}`;
}

function send(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(data));
}

function body(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => raw += chunk);
    req.on('end', () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function mime(file) {
  const ext = path.extname(file);
  return {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml'
  }[ext] || 'text/plain; charset=utf-8';
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const db = load();

  try {
    if (url.pathname === '/api/support/tickets' && req.method === 'GET') {
      return send(res, 200, db.tickets);
    }

    if (url.pathname === '/api/support/tickets' && req.method === 'POST') {
      const input = await body(req);

      const ticket = {
        id:id('ticket'),
        subject:String(input.subject || 'Support request'),
        message:String(input.message || ''),
        status:'open',
        priority:String(input.priority || 'normal'),
        createdAt:new Date().toISOString()
      };

      db.tickets.push(ticket);
      save(db);

      return send(res,201,ticket);
    }

    if (url.pathname === '/api/health') {
      return send(res, 200, {
        ok: true,
        name: 'Velclaw',
        version: '0.1.0',
        time: new Date().toISOString()
      });
    }

    if (url.pathname === '/api/projects' && req.method === 'GET') {
      return send(res, 200, db.projects);
    }

    if (url.pathname === '/api/projects' && req.method === 'POST') {
      const input = await body(req);
      const project = {
        id: id('proj'),
        name: String(input.name || 'Untitled Project'),
        description: String(input.description || ''),
        status: 'ready',
        createdAt: new Date().toISOString()
      };
      db.projects.push(project);
      save(db);
      return send(res, 201, project);
    }

    if (url.pathname === '/api/files' && req.method === 'GET') {
      return send(res, 200, db.files);
    }

    if (url.pathname === '/api/files' && req.method === 'POST') {
      const input = await body(req);
      const file = {
        id: id('file'),
        projectId: input.projectId || null,
        name: String(input.name || 'untitled.txt'),
        content: String(input.content || ''),
        updatedAt: new Date().toISOString()
      };
      db.files.push(file);
      save(db);
      return send(res, 201, file);
    }

    if (url.pathname === '/api/runtimes' && req.method === 'GET') {
      return send(res, 200, db.runtimes || []);
    }

    if (url.pathname === '/api/runtimes' && req.method === 'POST') {
      const input = await body(req);
      const runtime = createRuntime(input.projectId);

      db.runtimes ||= [];
      db.runtimes.push(runtime);
      save(db);

      return send(res, 201, runtime);
    }

    const runtimeAction = url.pathname.match(/^\/api\/runtimes\/([^/]+)\/(start|stop)$/);

    if (runtimeAction && req.method === 'POST') {
      db.runtimes ||= [];

      const runtime = db.runtimes.find(
        x => x.id === runtimeAction[1]
      );

      if (!runtime) {
        return send(res,404,{error:'Runtime not found'});
      }

      if (runtimeAction[2] === 'start') {
        runtime.status='running';
        runtime.port=3000 + Math.floor(Math.random()*500);
        runtime.logs.push('Runtime started');
      } else {
        runtime.status='stopped';
        runtime.logs.push('Runtime stopped');
      }

      save(db);
      return send(res,200,runtime);
    }

    if (url.pathname === '/api/builds' && req.method === 'GET') {
      return send(res, 200, db.jobs);
    }

    if (url.pathname === '/api/builds' && req.method === 'POST') {
      const input = await body(req);
      const job = createBuild(input.projectId);

      db.jobs.push(job);
      save(db);

      setTimeout(() => {
        const current = load();
        const found = current.jobs.find(x => x.id === job.id);
        if (!found) return;

        found.status = 'running';
        found.progress = 25;
        found.logs.push('Build started');
        save(current);

        setTimeout(() => {
          const latest = load();
          const item = latest.jobs.find(x => x.id === job.id);
          if (!item) return;

          item.progress = 70;
          item.logs.push('Source files prepared');
          save(latest);

          setTimeout(() => {
            const done = load();
            const result = done.jobs.find(x => x.id === job.id);
            if (!result) return;

            result.status = 'success';
            result.progress = 100;
            result.logs.push('Build completed');
            result.artifact = {
              name: 'project-build.zip',
              size: '0 B',
              createdAt: new Date().toISOString()
            };
            result.finishedAt = new Date().toISOString();
            save(done);
          }, 900);
        }, 900);
      }, 300);

      return send(res, 202, job);
    }

    if (url.pathname === '/api/agent/history' && req.method === 'GET') {
      return send(res, 200, db.messages);
    }

    if (url.pathname === '/api/agent/chat' && req.method === 'POST') {
      const input = await body(req);
      const userMessage = message(
        agentId(),
        'user',
        String(input.message || '')
      );

      const assistantMessage = message(
        agentId(),
        'assistant',
        agentReply(input.message)
      );

      db.messages.push(userMessage, assistantMessage);
      save(db);

      return send(res, 200, {
        user: userMessage,
        assistant: assistantMessage
      });
    }

    if (url.pathname === '/api/stats') {
      return send(res, 200, {
        projects: db.projects.length,
        files: db.files.length,
        jobs: db.jobs.length,
        tickets: db.tickets.length
      });
    }

    if (url.pathname.startsWith('/api/')) {
      return send(res, 404, { error: 'API endpoint not found' });
    }

    let file = url.pathname === '/' ? '/index.html' : url.pathname;
    file = path.normalize(path.join(PUBLIC, file));

    if (!file.startsWith(PUBLIC)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end('Not found');
      }
      res.writeHead(200, { 'Content-Type': mime(file) });
      res.end(data);
    });
  } catch (error) {
    send(res, 500, { error: error.message });
  }
});

const wss = new WebSocketServer({ server });

wss.on('connection', socket => {
  socket.send(JSON.stringify({
    type: 'system',
    message: 'Velclaw realtime connected'
  }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  VELCLAW');
  console.log('  ─────────────────────────');
  console.log(`  Web:  http://127.0.0.1:${PORT}`);
  console.log(`  API:  http://127.0.0.1:${PORT}/api/health`);
  console.log('  ─────────────────────────');
  console.log('');
});
