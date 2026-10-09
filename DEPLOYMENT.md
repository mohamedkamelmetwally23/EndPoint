# Frontend on Vercel

Deploy this frontend directory (`End-Point`), not `BackEnd`. If the Git repository contains both directories, set the Vercel Root Directory to `End-Point`; if it contains only the frontend files, leave Root Directory at the repository root.

- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Node.js: 22.x
- Environment variable: `VITE_API_URL=https://endpoint-back.vercel.app/api/v1`

`.env.production` already supplies this API URL for production builds. Vercel environment variables override it; remove any old localhost API value. Redeploy after changing a Vite environment variable because it is embedded at build time. Only public settings belong in `VITE_*` variables.

`vercel.json` includes the SPA fallback so opening or refreshing routes such as `/login`, `/register`, and `/people` loads the React application.

## Backend settings after the frontend domain is assigned

In the **backend** Vercel project, set:

```dotenv
FRONTEND_URL=https://YOUR-FRONTEND.vercel.app
NODE_ENV=production
COOKIE_SAME_SITE=none
```

Use the exact frontend origin without a trailing slash, then redeploy the backend. The backend checks this origin for CORS and write requests. The frontend already sends requests with `credentials: "include"`; cross-site login requires secure cookies with `SameSite=None`. Browser restrictions on third-party cookies can still prevent sessions; a same-site custom-domain setup is preferable if that occurs. Preview domains need their own matching backend configuration.

## Local development

Run the backend on port 4000 and `npm run dev` here. Development uses `/api/v1` through Vite's local proxy. `.env.production` applies only to production builds. Copy `.env.example` to `.env` only if you need local overrides.

## Verify

Run `npm run build` and `npm run lint`. After deployment, open a nested route directly, then check registration/login and an authenticated page. Backend health is available at `https://endpoint-back.vercel.app/api/v1/health`.
