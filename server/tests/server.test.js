const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../src/app');

let server;
let baseUrl;

test.before((t, done) => {
  server = http.createServer(app);
  server.listen(0, () => {
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
    done();
  });
});

test.after((t, done) => {
  server.close(done);
});

test('GET /api/health returns 200 with HEALTHY status and system info', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.status, 'HEALTHY');
  assert.equal(data.service, 'devops-backend-api');
  assert.ok(typeof data.uptimeSeconds === 'number');
  assert.ok(data.memory && data.memory.heapUsedMB > 0);
});

test('GET /api/info returns app name and build metadata', async () => {
  const res = await fetch(`${baseUrl}/api/info`);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.application, 'DevOps Cloud Dashboard & Microservice');
  assert.ok(data.version);
});

test('GET /api/metrics returns CPU, memory and container statuses', async () => {
  const res = await fetch(`${baseUrl}/api/metrics`);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.ok(data.cpu.cores >= 1);
  assert.ok(Array.isArray(data.containers));
  assert.ok(data.containers.length >= 2);
});

test('POST /api/deployments/trigger records a new deployment', async () => {
  const payload = {
    environment: 'Staging',
    branch: 'release/v1.1.0',
    triggeredBy: 'ci-bot-test'
  };

  const res = await fetch(`${baseUrl}/api/deployments/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.deployment.environment, 'Staging');
  assert.equal(data.deployment.branch, 'release/v1.1.0');
  assert.equal(data.deployment.status, 'SUCCESS');
});
