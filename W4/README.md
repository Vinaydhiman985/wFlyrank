# W4 - Supabase Auth API

This project is a small Express.js application that demonstrates Supabase authentication flows using `@supabase/supabase-js`.

## Project Structure

```text
W4/
├── node_modules/
├── src/
│   ├── config/
│   │   └── supabase.js
│   ├── controllers/
│   │   └── auth.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── protected.routes.js
│   └── app.js
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

## Features

- Supabase client initialization
- Signup route
- Login route
- Logout route
- Protected routes guarded by JWT verification
- Express API setup

## Environment Variables

Create a `.env` file with the following variables:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SECRET_KEY=your_supabase_secret_key
SUPABASE_JWKS_URL=your_supabase_jwks_url
```

## Installation

```bash
npm install
```

## Run the app

```bash
npm run dev
```

## API Endpoints

### Public routes

- `POST /auth/signup`
- `POST /auth/login`

### Protected routes

- `POST /auth/logout`
- `GET /protected/profile`
- `GET /protected/dashboard`

## Notes

- `.env` is intentionally not committed.
- The Swagger screenshot can be added here during Stage 6.
