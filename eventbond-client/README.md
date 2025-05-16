# EventBond Frontend (eventbond-client)

This is the frontend for the **EventBond** event booking system, built with React, TypeScript, Vite, Tailwind CSS, and i18next for multi-language support.

## Features
- Browse and search for upcoming events
- Book events and manage your bookings
- View event details, images, and categories
- Multi-language support (English & Arabic)
- Admin panel for managing events, users, and bookings

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure API URL

Set the backend API URL in your `.env` file or `vite.config.ts`:

```
VITE_API_URL=http://localhost:3000/api
```

### 3. Run the app in development mode

```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) by default.

### 4. Build for production

```bash
npm run build
```

### 5. Preview the production build

```bash
npm run preview
```

## Scripts
- `npm run dev` — Start the app in development mode
- `npm run build` — Build the app for production
- `npm run preview` — Preview the production build
- `npm run lint` — Run ESLint on the codebase

## Environment Variables
- `VITE_API_URL` — The base URL for the backend API (e.g., `http://localhost:3000/api`)

## Notes
- For full-stack setup (backend, database, admin features), see the main project [README](../README.md).
- Make sure the backend API is running and accessible at the URL you set in `VITE_API_URL`.
