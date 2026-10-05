import React, { useState, useEffect } from 'react';

export default function App() {
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('health');
  const [deploying, setDeploying] = useState(false);
  const [activeStage, setActiveStage] = useState(null);
  const [deployEnv, setDeployEnv] = useState('Production');

  // CI/CD stages definition
  const stages = [
    { id: 1, name: 'Code Checkout', cmd: 'git pull origin main', duration: '12s', icon: '📦' },
    { id: 2, name: 'Unit Testing', cmd: 'node --test tests/*.test.js', duration: '4.8s', icon: '🧪' },
    { id: 3, name: 'Security Audit', cmd: 'npm audit --audit-level=high', duration: '6.1s', icon: '🛡️' },
    { id: 4, name: 'Docker Build & Tag', cmd: 'docker build -t devops/api:latest .', duration: '28s', icon: '🐳' },
    { id: 5, name: 'Cloud Release', cmd: 'kubectl rollout restart deploy/api', duration: '14s', icon: '🚀' },
  ];

  // Fetch API data
  const fetchData = async () => {
    try {
      const [hRes, mRes, dRes] = await Promise.all([
        fetch('/api/health').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/metrics').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/deployments').then(r => r.ok ? r.json() : null).catch(() => null),
      ]);

      if (hRes) setHealth(hRes);
      if (mRes) setMetrics(mRes);
      if (dRes && dRes.deployments) setDeployments(dRes.deployments);
    } catch (err) {
      console.error('Error fetching devops data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Trigger CI/CD Pipeline
  const handleTriggerPipeline = async () => {
    if (deploying) return;
    setDeploying(true);

    // Animate through CI/CD stages
    for (let i = 1; i <= stages.length; i++) {
      setActiveStage(i);
      await new Promise(r => setTimeout(r, 650));
    }

    try {
      const res = await fetch('/api/deployments/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          environment: deployEnv,
          branch: 'main',
          triggeredBy: 'DevOps Web Dashboard'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDeployments(prev => [data.deployment, ...prev]);
      }
    } catch (err) {
      console.error('Failed to trigger deployment:', err);
    } finally {
      setActiveStage(null);
      setDeploying(false);
      fetchData();
    }
  };

  const heapUsed = health?.memory?.heapUsedMB || 24.5;
  const heapTotal = health?.memory?.heapTotalMB || 64.0;
  const heapPercent = Math.min(100, Math.round((heapUsed / heapTotal) * 100));
  const cpuLoad = metrics?.cpu?.loadPercent || 14.2;

  return (
    <div className="app-container">
      {/* Navbar */}
      <header className="navbar glass-panel">
        <div className="brand-section">
          <div className="brand-icon">⚡</div>
          <div className="brand-text">
            <h1>DevOps Control Center</h1>
            <p>Fullstack CI/CD Monitoring • React + Node.js + Docker</p>
          </div>
        </div>

        <div className="nav-actions">
          <div className={`status-pill ${deploying ? 'deploying' : 'healthy'}`}>
            <span className="pulse-dot"></span>
            <span>{deploying ? `Pipeline Stage ${activeStage || 1}/5` : 'Cluster Healthy'}</span>
          </div>

          <select
            value={deployEnv}
            onChange={(e) => setDeployEnv(e.target.value)}
            disabled={deploying}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              color: '#fff',
              border: '1px solid var(--border-color)',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.85rem'
            }}
          >
            <option value="Production">Production</option>
            <option value="Staging">Staging</option>
            <option value="Testing">Testing</option>
          </select>

          <button
            className="btn btn-primary"
            onClick={handleTriggerPipeline}
            disabled={deploying}
            id="trigger-pipeline-btn"
          >
            {deploying ? (
              <>
                <span className="spinner"></span>
                <span>Deploying...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Run Pipeline</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Real-Time Metrics Overview */}
      <section className="metrics-grid">
        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-title">API Microservice Uptime</span>
            <span className="metric-icon">⏱️</span>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">
              {health?.uptimeSeconds ? `${health.uptimeSeconds}s` : 'Active'}
            </span>
            <span className="metric-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              Node {health?.nodeVersion || 'v24'}
            </span>
          </div>
          <div className="metric-footer">
            Platform: {health?.platform || 'win32'} • Env: {health?.environment || 'dev'}
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-title">API Heap Memory</span>
            <span className="metric-icon">💾</span>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{heapUsed} MB</span>
            <span className="metric-badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8' }}>
              {heapPercent}%
            </span>
          </div>
          <div className="metric-bar-bg">
            <div
              className="metric-bar-fill"
              style={{
                width: `${heapPercent}%`,
                background: 'linear-gradient(90deg, #06b6d4, #3b82f6)'
              }}
            ></div>
          </div>
          <div className="metric-footer">Total Allocated: {heapTotal} MB</div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-title">Simulated CPU Load</span>
            <span className="metric-icon">⚡</span>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{cpuLoad}%</span>
            <span className="metric-badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
              {metrics?.cpu?.cores || 8} Cores
            </span>
          </div>
          <div className="metric-bar-bg">
            <div
              className="metric-bar-fill"
              style={{
                width: `${cpuLoad * 2}%`,
                background: 'linear-gradient(90deg, #8b5cf6, #ec4899)'
              }}
            ></div>
          </div>
          <div className="metric-footer">Load distribution optimal across workers</div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-title">CI/CD Success Rate</span>
            <span className="metric-icon">🎯</span>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">99.2%</span>
            <span className="metric-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              MTTR: 3.2m
            </span>
          </div>
          <div className="metric-footer">
            Total Releases Tracked: {deployments.length}
          </div>
        </div>
      </section>

      {/* CI/CD Pipeline Visualizer */}
      <section className="pipeline-section glass-panel">
        <div className="section-header">
          <div className="section-title">
            <span>🔄</span>
            <span>Automated CI/CD Pipeline Workflow</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            Jenkins & GitHub Actions Orchestrator
          </span>
        </div>

        <div className="pipeline-diagram">
          {stages.map((stage, idx) => {
            const isCurrent = activeStage === stage.id;
            const isPassed = activeStage ? activeStage > stage.id : true;

            return (
              <React.Fragment key={stage.id}>
                <div className={`stage-node ${isCurrent ? 'running' : isPassed ? 'passed' : ''}`}>
                  <div className="stage-top">
                    <span className="stage-index">STAGE 0{stage.id}</span>
                    <span>{stage.icon}</span>
                  </div>
                  <div className="stage-name">{stage.name}</div>
                  <div className="stage-cmd">{stage.cmd}</div>
                  <div className="stage-duration">
                    <span>Avg: {stage.duration}</span>
                    <span style={{ color: isCurrent ? 'var(--accent-cyan)' : isPassed ? 'var(--accent-emerald)' : 'var(--text-dim)', fontWeight: 600 }}>
                      {isCurrent ? '● Running' : isPassed ? '✓ Passed' : 'Pending'}
                    </span>
                  </div>
                </div>
                {idx < stages.length - 1 && (
                  <div className="stage-arrow">➔</div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </section>

      {/* Two Column Section: Recent Deployments & Containers / Inspector */}
      <div className="main-grid">
        {/* Recent Deployments Table */}
        <div className="deployments-card glass-panel">
          <div className="section-header">
            <div className="section-title">
              <span>📋</span>
              <span>Recent Deployments & Audits</span>
            </div>
            <button className="btn btn-secondary" onClick={fetchData} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              🔄 Refresh
            </button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Pipeline</th>
                  <th>Commit</th>
                  <th>Branch</th>
                  <th>Env</th>
                  <th>Status</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {deployments.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <strong>{d.pipeline}</strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        {new Date(d.timestamp).toLocaleTimeString()}
                      </div>
                    </td>
                    <td>
                      <span className="commit-badge">{d.commit}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#93c5fd' }}>
                      {d.branch}
                    </td>
                    <td>
                      <span className={`env-tag ${d.environment}`}>{d.environment}</span>
                    </td>
                    <td>
                      <span style={{ color: '#34d399', fontWeight: 600, fontSize: '0.8rem' }}>
                        ● {d.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      {d.duration}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DevOps Infrastructure Inspector */}
        <div className="containers-card glass-panel">
          <div className="section-header">
            <div className="section-title">
              <span>🐳</span>
              <span>Container Pods & System State</span>
            </div>
          </div>

          <div className="tabs-nav">
            <button
              className={`tab-btn ${activeTab === 'containers' ? 'active' : ''}`}
              onClick={() => setActiveTab('containers')}
            >
              Docker Containers
            </button>
            <button
              className={`tab-btn ${activeTab === 'health' ? 'active' : ''}`}
              onClick={() => setActiveTab('health')}
            >
              Health API JSON
            </button>
            <button
              className={`tab-btn ${activeTab === 'pipeline' ? 'active' : ''}`}
              onClick={() => setActiveTab('pipeline')}
            >
              CI/CD Pipeline
            </button>
          </div>

          {activeTab === 'containers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(metrics?.containers || [
                { name: 'cicd-client-frontend', status: 'Running', image: 'devops/react-client:latest', port: '3000:80' },
                { name: 'cicd-server-api', status: 'Running', image: 'devops/node-server:latest', port: '5000:5000' },
                { name: 'cicd-db-redis', status: 'Running', image: 'redis:7-alpine', port: '6379:6379' },
              ]).map((c, i) => (
                <div key={i} className="container-row">
                  <div className="container-info">
                    <div className="container-name">
                      <span style={{ color: '#34d399' }}>●</span>
                      <span>{c.name}</span>
                    </div>
                    <span className="container-image">{c.image}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="status-pill healthy" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                      {c.status}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                      {c.port}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'health' && (
            <pre className="code-box">
              {JSON.stringify(health || { message: 'Loading health data from /api/health...' }, null, 2)}
            </pre>
          )}

          {activeTab === 'pipeline' && (
            <pre className="code-box">
{`pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps { checkout scm }
        }
        stage('Test') {
            steps {
                dir('server') { sh 'npm test' }
            }
        }
        stage('Docker Build') {
            steps {
                sh 'docker compose build'
            }
        }
        stage('Deploy') {
            steps {
                sh 'docker compose up -d'
            }
        }
    }
}`}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
