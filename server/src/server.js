require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 DevOps Backend Server running on port ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Metrics API:  http://localhost:${PORT}/api/metrics`);
  console.log(`🚀 Deployments:  http://localhost:${PORT}/api/deployments`);
  console.log(`===============================================`);
});
