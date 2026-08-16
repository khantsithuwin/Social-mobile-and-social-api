# Social Mobile — Full-Stack Social Media App

A cross-platform social media application built with React Native and Expo, backed by a TypeScript REST API. Users can create accounts, publish posts, like content, join conversations, manage their own contributions, and personalize the interface with a persistent light or dark theme.

This project demonstrates end-to-end mobile development, including file-based navigation, persistent authentication, server-state synchronization, protected API operations, and relational database design.

## Highlights

- Cross-platform mobile client powered by Expo and React Native
- Registration and login with persistent JWT sessions
- Public feed with relative timestamps and detailed post views
- Authenticated post, comment, and like interactions
- Ownership-based authorization for deleting posts and comments
- User profiles with bios and personal post history
- Persistent light and dark themes stored on the device
- Query caching and mutation synchronization with TanStack Query
- Relational SQLite data model managed through Prisma migrations
- Development seed data generated with Faker

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Mobile | React Native 0.81, React 19, Expo 54 |
| Navigation | Expo Router 6, React Navigation |
| State and caching | React Context, TanStack Query |
| Device storage | AsyncStorage |
| Backend | Node.js, Express 5, TypeScript |
| Authentication | JSON Web Tokens, bcrypt |
| Database | SQLite, Prisma ORM |
| Tooling | ESLint, tsx, Faker, date-fns |

## Architecture

```text
Social-mobile-and-social-api/
├── social-mobile/                 # Expo and React Native client
│   ├── app/                       # File-based routes and screens
│   │   ├── (home)/                # Feed, profile, and settings tabs
│   │   ├── view/[id].tsx          # Post details and comments
│   │   └── form.tsx               # Post creation modal
│   ├── components/                # App provider and reusable post UI
│   └── types/                     # Shared client-side TypeScript types
└── social-api/                    # Express REST API
    ├── middlewares/               # JWT authorization middleware
    ├── prisma/                    # Schema and database migrations
    ├── routes/                    # User, post, comment, and like routes
    ├── seed/                      # Development data generator
    └── index.ts                   # API entry point
```

## Getting Started

### Prerequisites

- Node.js 20.19 or newer
- npm
- Expo Go on a physical device, or an iOS/Android simulator

### 1. Configure and start the API

```bash
cd social-api
npm install
```

Create `social-api/.env`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-a-long-random-secret"
```

Generate the Prisma client, apply the migrations, and start the development server:

```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

The API runs at [http://localhost:8800](http://localhost:8800).

To reset the database and populate it with sample users, posts, comments, and likes:

```bash
npm run fresh
```

> `npm run fresh` deletes existing local data. Seeded accounts include `alice` and `bob`, both using `password` as the development password.

### 2. Configure the mobile client

The client currently calls `http://localhost:8800`. That address works when the app and API share the same host, such as the iOS simulator or web development environment.

For a physical phone or Android emulator, replace `localhost` in the client fetch URLs with an address that can reach your computer—for example, your computer's local network IP address.

### 3. Start the mobile client

In a second terminal:

```bash
cd social-mobile
npm install
npm start
```

Use the Expo terminal options to open the project in Expo Go, an iOS simulator, an Android emulator, or a web browser.

## Mobile Experience

| Screen | Functionality |
| --- | --- |
| Home | Browse the latest posts and open conversations |
| New Post | Publish authenticated content from a modal screen |
| Post Detail | View, add, and delete owned comments |
| Profile | Register, sign in, sign out, and view personal posts |
| Settings | Switch between persistent light and dark themes |

## API Overview

Protected routes require an `Authorization: Bearer <token>` header.

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `GET` | `/` | No | Check API status |
| `POST` | `/users` | No | Register and receive a JWT |
| `POST` | `/login` | No | Authenticate and receive a JWT |
| `GET` | `/verify` | Yes | Restore an authenticated session |
| `GET` | `/users/:id` | Optional | Retrieve a profile and its posts |
| `GET` | `/posts` | Optional | Retrieve the latest 20 posts |
| `POST` | `/posts` | Yes | Create a post |
| `GET` | `/posts/:id` | Optional | Retrieve a post and its comments |
| `DELETE` | `/posts/:id` | Yes | Delete an owned post |
| `POST` | `/comments` | Yes | Add a comment |
| `DELETE` | `/comments/:id` | Yes | Delete an owned comment |
| `GET` | `/likes/:postId` | No | List users who liked a post |
| `POST` | `/likes` | Yes | Toggle the current user's like |

## Available Scripts

### Mobile (`social-mobile`)

| Command | Purpose |
| --- | --- |
| `npm start` | Start the Expo development server |
| `npm run ios` | Build and run the native iOS project |
| `npm run android` | Build and run the native Android project |
| `npm run web` | Start the web version |
| `npm run lint` | Run the Expo ESLint configuration |

### API (`social-api`)

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API with automatic TypeScript reloads |
| `npm run fresh` | Reset, migrate, and seed the local database |

## Engineering Notes

- Expo Router provides typed, file-based navigation across tabs, modal screens, and dynamic post routes.
- AsyncStorage persists both the JWT and the selected color theme between app launches.
- TanStack Query refreshes feed and detail caches after posts, comments, or likes change.
- The API verifies JWTs and checks resource ownership before destructive operations.
- A compound database constraint prevents duplicate likes from the same user on a post.
- Passwords are stored as bcrypt hashes instead of plaintext values.

## Potential Next Steps

- Centralize the API base URL in environment configuration
- Add automated API and React Native component tests
- Add image uploads, profile editing, and push notifications
- Introduce feed pagination and pull-to-refresh
- Deploy the API and migrate from local SQLite to a hosted database
