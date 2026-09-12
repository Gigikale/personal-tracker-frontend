# Personal Tracker Frontend

The frontend for **Personal Tracker**, a personal finance and budget tracking app. Built with React, TypeScript, Vite, Tailwind CSS, Zustand, and React Router, talking to the [personal-tracker-backend](https://github.com/Gigikale/personal-tracker-backend) API.

## Features

- Email/password auth (JWT with silent refresh), Google/Apple sign-in shown as "coming soon"
- Expenses, categories, and budgets with a budget-vs-actual dashboard
- Recurring expenses, savings goals, and shared household budgets
- In-app notifications with a live "online" indicator over WebSocket
- CSV/PDF expense export, per-user currency preference (USD/NGN)
- Dark mode

## Project setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL to your backend URL
npm run dev
```

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check and build for production
- `npm run lint` — run oxlint
- `npm run preview` — preview the production build locally

## Deployment

Deploys to Vercel as a static SPA. `vercel.json` handles client-side route rewrites. Set `VITE_API_URL` in the Vercel project's environment variables to point at the deployed backend.
