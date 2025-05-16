# EventBond

EventBond is a full-stack event booking system that allows users to browse and book events, manage their bookings, and provides an integrated web-based admin panel for event, user, and booking management.

---

## Features

- **User Features:**
  - Browse and search for upcoming events
  - Book events and manage your bookings
  - View event details, images, and categories
  - Multi-language support (English & Arabic)

- **Admin Features:**
  - Manage events (create, edit, delete, upload images)
  - Manage users (view, edit roles, delete)
  - Manage all bookings (view, delete)
  - Admin dashboard and sidebar navigation

---

## Tech Stack

- **Frontend:** React (with TypeScript, Vite), Tailwind CSS, i18next (for translations)
- **Backend:** NestJS (TypeScript), TypeORM, JWT Auth, REST API
- **Database:** PostgreSQL

---

## Project Structure

```
eventbond-api/         # Backend (NestJS)
eventbond-client/      # Frontend (React + Vite)
```

---

## Prerequisites

- Node.js (v16+ recommended)
- npm (v8+ recommended)
- PostgreSQL (v12+ recommended)

---

## Getting Started

### 1. **Clone the Repository**

```bash
git clone https://github.com/your-username/EventBond.git
cd EventBond
```

---

### 2. **Database Setup**

- Create a PostgreSQL database (e.g., `eventbond_db`).
- Note your DB username, password, host, and port.

---

### 3. **Backend Setup (`eventbond-api`)**

```bash
cd eventbond-api
cp .env.example .env   # Create your .env file if needed
```

Edit your `.env` file to match your PostgreSQL credentials:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=eventbond_db
JWT_SECRET=your_jwt_secret
```

**Install dependencies:**
```bash
npm install
```

**Start the backend server:**
```bash
# For development (with hot reload)
npm run start:dev

# For production
npm run build
npm run start:prod
```

The backend will typically run on [http://localhost:3000](http://localhost:3000).

---

### 4. **Frontend Setup (`eventbond-client`)**

```bash
cd ../eventbond-client
```

**Install dependencies:**
```bash
npm install
```

**Configure API URL:**

Edit `.env` or `vite.config.ts` (or similar) to set the backend API URL, e.g.:
```
VITE_API_URL=http://localhost:3000/api
```

**Start the frontend:**
```bash
# For development
npm run dev

# For production build
npm run build
npm run preview
```

The frontend will typically run on [http://localhost:5173](http://localhost:5173) (or as specified by Vite).

---

### 5. **Access the App**

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3000/api](http://localhost:3000/api)

---

## Default Admin User

- You may need to create an admin user directly in the database or via a registration endpoint, then manually set their `role` to `admin` in the users table.

---

## Environment Variables

Both frontend and backend use environment variables for configuration. See `.env.example` files in each folder for details.

---

## Scripts

### Backend (`eventbond-api`)
- `npm run start:dev` — Start NestJS in development mode
- `npm run build` — Build the backend
- `npm run start:prod` — Start the backend in production
- `npm run test` — Run backend tests

### Frontend (`eventbond-client`)
- `npm run dev` — Start React app in development mode
- `npm run build` — Build the frontend
- `npm run preview` — Preview the production build
