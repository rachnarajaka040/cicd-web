# 🚀 Fullstack Project (React.js + Node.js) for DevOps Practice

Yeh ek complete fullstack application hai jo specially **DevOps practice (Docker, Jenkins, Kubernetes, CI/CD)** ke liye design ki gayi hai.

Is repository mein sirf **pure application code** hai taaki aap:
- ✅ Apni khud ki **Dockerfile** likh sakein (Frontend & Backend ke liye)
- ✅ Apni **docker-compose.yml** bana sakein
- ✅ Apni **Jenkinsfile** ya **GitHub Actions** pipeline create kar sakein

---

## 📁 Project Structure

```text
c:\cicd-web\
├── client/                     # ⚛️ React 19 Frontend (Vite)
│   ├── src/
│   │   ├── App.jsx             # DevOps Dashboard UI
│   │   ├── index.css           # Modern Dark UI Styling
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js          # Port 3000, API proxy: /api -> localhost:5000
│   └── package.json            # Scripts: dev, build, preview
│
├── server/                     # 🟢 Node.js + Express Backend
│   ├── src/
│   │   ├── app.js              # REST endpoints (/api/health, /api/metrics, etc.)
│   │   └── server.js           # Server listen on Port 5000
│   ├── tests/
│   │   └── server.test.js      # Unit tests (CI/CD verification ke liye)
│   └── package.json            # Scripts: dev, start, test
│
└── package.json                # Root orchestration scripts
```

---

## ⚡ How to Run Locally

### 1. Backend Server Run Karein:
```bash
cd server
npm install
npm run dev
```
- Server URL: **`http://localhost:5000`**
- Health Probe: **`http://localhost:5000/api/health`**
- Metrics API: **`http://localhost:5000/api/metrics`**

### 2. Frontend React Client Run Karein:
```bash
cd client
npm install
npm run dev
```
- React Dashboard: **`http://localhost:3000`**

### 3. Unit Tests Run Karein:
```bash
cd server
npm test
```

---

## 🧭 DevOps Guide: Aapko Kya-Kya Likhna Hai

Jab aap DevOps practice karengi, aapko step-by-step yeh cheezein likhni hongi:

### Step 1: Backend Dockerfile (`server/Dockerfile`)
Aapko Node.js backend ko containerize karna hoga:
- **Base image**: `node:20-alpine` (lightweight)
- **WORKDIR**: `/app`
- **Dependency install**: `package*.json` copy karke `npm install`
- **Code copy**: `src/` folder copy karein
- **Port**: `EXPOSE 5000`
- **Command**: `CMD ["node", "src/server.js"]`

### Step 2: Frontend Dockerfile (`client/Dockerfile`)
React Vite application ke liye best practice **Multi-Stage Build** hota hai:
- **Stage 1 (Build)**: `node:20-alpine` me `npm run build` run karein (`dist/` folder generate hoga).
- **Stage 2 (Production Server)**: `nginx:alpine` me Stage 1 ka `dist/` copy karein `/usr/share/nginx/html` me.
- **Port**: `EXPOSE 80`

### Step 3: Multi-Container Setup (`docker-compose.yml`)
Root folder me `docker-compose.yml` banayein jisme 2 services hongi:
1. `backend`: `server/Dockerfile` se build hoga, port `5000:5000`
2. `frontend`: `client/Dockerfile` se build hoga, port `3000:80`, `depends_on: [backend]`

### Step 4: Jenkinsfile Pipeline (`Jenkinsfile`)
Declarative pipeline me standard stages:
1. **Checkout**: Git repository fetch karna
2. **Test**: `cd server && npm test`
3. **Build**: `cd client && npm run build`
4. **Docker Build**: `docker build` commands execute karna
5. **Deploy**: `docker compose up -d`
