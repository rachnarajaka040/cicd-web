const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// In-memory record of deployments for CI/CD tracking
const deploymentsHistory = [
  {
    id: 'dep-104',
    pipeline: 'GitHub Actions #42',
    commit: 'a9f1b2c',
    author: 'devops-bot',
    branch: 'main',
    environment: 'Production',
    status: 'SUCCESS',
    duration: '2m 14s',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'dep-103',
    pipeline: 'Jenkins Pipeline #18',
    commit: '7e2c90a',
    author: 'alex',
    branch: 'release/v1.0.0',
    environment: 'Staging',
    status: 'SUCCESS',
    duration: '3m 05s',
    timestamp: new Date(Date.now() - 14400000).toISOString()
  },
  {
    id: 'dep-102',
    pipeline: 'GitHub Actions #41',
    commit: '4d8a11f',
    author: 'sam',
    branch: 'feature/metrics-api',
    environment: 'Testing',
    status: 'SUCCESS',
    duration: '1m 45s',
    timestamp: new Date(Date.now() - 86400000).toISOString()
  }
];

// Health Check Endpoint (Vital for Kubernetes readiness/liveness probes & load balancers)
app.get('/api/health', (req, res) => {
  const memoryUsage = process.memoryUsage();
  res.status(200).json({
    status: 'HEALTHY',
    service: 'devops-backend-api',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    memory: {
      heapUsedMB: +(memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
      heapTotalMB: +(memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
      rssMB: +(memoryUsage.rss / 1024 / 1024).toFixed(2)
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// App & Build Info Endpoint (used by monitoring agents and CI/CD audit tools)
app.get('/api/info', (req, res) => {
  res.status(200).json({
    application: 'DevOps Cloud Dashboard & Microservice',
    version: process.env.APP_VERSION || '1.0.0',
    buildNumber: process.env.BUILD_NUMBER || 'dev-local',
    gitCommit: process.env.GIT_COMMIT || 'HEAD',
    deployedAt: process.env.DEPLOY_TIME || new Date().toISOString(),
    maintainer: 'DevOps Engineering Team'
  });
});

// Real-time server and DevOps metrics
app.get('/api/metrics', (req, res) => {
  const mem = process.memoryUsage();
  res.status(200).json({
    timestamp: new Date().toISOString(),
    cpu: {
      loadPercent: +(Math.random() * 8 + 12).toFixed(1), // Realistic simulated dynamic load
      cores: require('os').cpus().length
    },
    memory: {
      usedMB: +(mem.heapUsed / 1024 / 1024).toFixed(2),
      totalMB: +(mem.heapTotal / 1024 / 1024).toFixed(2),
      systemFreeMB: +(require('os').freemem() / 1024 / 1024).toFixed(2)
    },
    network: {
      latencyMs: +(Math.random() * 4 + 8).toFixed(1),
      status: 'OPTIMAL'
    },
    containers: [
      { name: 'cicd-client-frontend', status: 'Running', image: 'devops/react-client:latest', port: '80:80' },
      { name: 'cicd-server-api', status: 'Running', image: 'devops/node-server:latest', port: '5000:5000' },
      { name: 'cicd-db-redis', status: 'Running', image: 'redis:7-alpine', port: '6379:6379' }
    ]
  });
});

// Deployment pipeline history
app.get('/api/deployments', (req, res) => {
  res.status(200).json({
    count: deploymentsHistory.length,
    deployments: deploymentsHistory
  });
});

// Trigger a new simulated build & deployment
app.post('/api/deployments/trigger', (req, res) => {
  const { environment = 'Production', branch = 'main', triggeredBy = 'manual-dashboard' } = req.body || {};
  const newDeployment = {
    id: `dep-${100 + deploymentsHistory.length + 2}`,
    pipeline: `CI/CD Trigger #${deploymentsHistory.length + 1}`,
    commit: Math.random().toString(36).substring(2, 9),
    author: triggeredBy,
    branch,
    environment,
    status: 'SUCCESS',
    duration: `${Math.floor(Math.random() * 2) + 1}m ${Math.floor(Math.random() * 45) + 10}s`,
    timestamp: new Date().toISOString()
  };
  deploymentsHistory.unshift(newDeployment);
  res.status(201).json({
    message: 'CI/CD pipeline executed and deployed successfully',
    deployment: newDeployment
  });
});

module.exports = app;
