# Frontend on Vercel

Deploy this frontend directory (`End-Point`), not `BackEnd`. If the Git repository contains both directories, set the Vercel Root Directory to `End-Point`; if it contains only the frontend files, leave Root Directory at the repository root.

- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Node.js: 22.x
- Environment variable: `VITE_API_URL=/api/v1`

`.env.production` already supplies this relative API URL for production builds. Vercel environment variables override it; replace any existing absolute backend URL with `/api/v1`. Redeploy the frontend after changing this variable because Vite embeds it at build time. Only public settings belong in `VITE_*` variables.

The first rewrite in `vercel.json` proxies `/api/*` to `https://endpoint-back.vercel.app/api/*`. Keep it before the SPA fallback. The browser sends API requests and receives host-only session cookies on the frontend origin, avoiding third-party cookie restrictions. The backend remains a separate deployment. Do not set a backend cookie Domain attribute: its current host-only cookies work through this proxy.

`vercel.json` includes the SPA fallback so opening or refreshing routes such as `/login`, `/register`, and `/people` loads the React application.

## Backend settings after the frontend domain is assigned

In the **backend** Vercel project, set:

```dotenv
FRONTEND_URL=https://endpoint-sage-three.vercel.app
NODE_ENV=production
COOKIE_SAME_SITE=none
```

Use the exact frontend origin without a trailing slash, then redeploy the backend if these settings changed. The backend still checks the browser Origin on write requests through the proxy. The frontend already sends requests with `credentials: "include"`. Preview domains need their own matching backend configuration.

## Local development

Run the backend on port 4000 and `npm run dev` here. Development uses `/api/v1` through Vite's local proxy. `.env.production` applies only to production builds. Copy `.env.example` to `.env` only if you need local overrides.

## Verify

Run `npm run build` and `npm run lint`. After deployment, open `/api/v1/health` on the frontend domain: it must return JSON, not the React HTML page. Then log in and confirm that both `/api/v1/auth/login` and the following `/api/v1/auth/me` request use the frontend domain and succeed. Refresh an authenticated page to verify session persistence. Backend health is also available at `https://endpoint-back.vercel.app/api/v1/health`.
