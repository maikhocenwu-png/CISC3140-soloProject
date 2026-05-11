# CISC3140-soloProject
solo project of cisc3140

A browser-based point-and-click escape room game inspired by the Rusty Lake and Forgotten Hill series. Solve puzzles, collect items, and escape two atmospheric rooms — built entirely with a custom game engine, React, and Node.js.

All visual assets in this game (room backgrounds, objects, UI elements) are **procedurally drawn using code** — shapes, colors, and SVG — with no external art assets used.

---

## About the Game

You wake up in a dimly lit study. The door is locked. Objects are scattered across the room, and something feels deliberately wrong about the way things are arranged. Your goal is simple: **escape**.

The game spans two rooms, each with its own atmosphere and set of puzzles. You will need to observe your surroundings carefully, collect items, and figure out how they connect. Some puzzles require items you have collected. Others only require attention.

### Room 1 — The Study Room

A dark Victorian study filled with a bookshelf, an old clock, a wooden desk with a locked drawer, and a candle. The door to Room 2 is locked. Find the key.

### Room 2 — The Chamber

A stone chamber with a large mirror, a mysterious pedestal bearing an ancient eye symbol, and a heavy final door with a strange coin slot. An unseen raven watches from the shadows.

---

## How to Play

**Movement:** There is no walking. Click on objects to interact with them.

**Collecting items:** When you see a labeled object on the ground or desk, click it to add it to your inventory.

**Using items:** Items are used automatically when you attempt the correct puzzle. If you are missing a required item, the game will tell you.

**Puzzles:** Click on interactive objects (bookshelf, clock, drawer, mirror, pedestal, doors) to open a puzzle modal. Type your answer and submit. Every puzzle has a hint and a "give me the answer" button if you are stuck.

**Inventory:** Your collected items appear in the bar at the bottom of the screen. Click any item to examine it — some items display clues when inspected.

**Saving:** Click the Save button in the top bar at any time. Your progress (inventory, solved puzzles, current room) is stored to the database and restored automatically when you log back in.

**Resetting:** The Reset button wipes your saved progress and restarts the game from Room 1.

### Puzzle Overview

| Puzzle | Location | Type | Requires |
|---|---|---|---|
| The Bookshelf | Room 1 | Observation | Nothing |
| The Clock | Room 1 | Observation | Nothing |
| The Locked Drawer | Room 1 | Item + code | Torn Paper |
| The Locked Door | Room 1 | Item | Brass Key |
| The Raven's Eye | Room 2 | Sliding puzzle | Nothing |
| The Mirror | Room 2 | Observation | Nothing |
| The Final Door | Room 2 | Item + word | Golden Coin |

### Easter Egg

There is a hidden object in Room 2. Click it repeatedly to discover a secret.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Phaser 4 |
| Game engine | Phaser 4 (canvas-based, custom scenes) |
| State management | Zustand 5 |
| HTTP client | Axios |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL (Neon), Prisma 6 ORM |
| Authentication | JWT (jsonwebtoken + bcryptjs) |
| Validation | express-validator (server), inline (client) |
| Testing | Jest 29, Supertest |
| Audio | HTML5 Audio API (custom AudioManager class) |
| Styling | Inline styles + Tailwind CSS v4 |
| Monorepo runner | Concurrently |

---

## Project Main Structure

```
escape-room-game/
├── package.json              ← root monorepo (npm run dev starts everything)
├── backend/
|   ├── package.json
│   ├── server.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── src/
│       ├── middleware/
│       │   ├── auth.js
│       │   ├── cors.js
│       │   └── errorHandler.js
│       ├── routes/
│       │   ├── auth.js
│       │   ├── gameStates.js
│       │   └── leaderboard.js
│       |─────── data/
│       |       └── puzzles.json
|       |─────── tests/
|       └──        └── auth.test.js       
|
└── frontend/
    ├── public/
    │   └── assets/
    |       ├──backgrounds/
    |       ├──objects/
    │       ├── audio/        ← mp3 files
    │       └── ui/
    │           └── candle.gif
    └── src/
        ├── api/client.js
        ├── components/
        │   ├── InventoryBar.jsx
        │   ├── PuzzleModal.jsx
        │   └── SlidingPuzzle.jsx
        ├── game/
        │   ├── AudioManager.js
        │   ├── GameConfig.js
        │   └── scenes/
        │       ├── Room1Scene.js
        │       └── Room2Scene.js
        ├── screens/
        │   ├── TitleScreen.jsx
        │   ├── GameScreen.jsx
        │   └── WinScreen.jsx
        └── store/
            └── gameStore.js
```

---

## Database Schema

```
User
  id          String    primary key (cuid)
  email       String    unique
  password    String    bcrypt hashed
  username    String
  createdAt   DateTime

GameSave
  id          String    primary key
  userId      String    foreign key → User (unique)
  inventory   String[]  collected item IDs
  solved      String[]  solved puzzle IDs
  currentRoom String    'room1' | 'room2'
  updatedAt   DateTime  auto-updated

Score
  id          String    primary key
  userId      String    foreign key → User
  timeSeconds Int       completion time in seconds
  hints       Int       number of hints used
  createdAt   DateTime
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/game/save` | Yes | Load saved progress |
| POST | `/api/game/save` | Yes | Save current progress |
| DELETE | `/api/game/save` | Yes | Reset/delete save |
| POST | `/api/game/puzzles/check` | Yes | Validate puzzle answer |
| POST | `/api/game/puzzles/reveal` | Yes | Reveal puzzle answer (costs a hint) |
| POST | `/api/scores` | Yes | Submit completion score |
| GET | `/api/scores/leaderboard` | No | Top 10 scores |
| GET | `/api/health` | No | Server health check |

---

## Local Setup

### Requirements

- **Node.js** v20 or higher — [nodejs.org](https://nodejs.org)
- **npm** v9 or higher (comes with Node.js)
- **Git** — [git-scm.com](https://git-scm.com)
- A free **PostgreSQL database** — recommended: [neon.tech](https://neon.tech) (free tier, no credit card)

### Step 1 — Clone the repository

```bash
git clone https://github.com/maikhocenwu-png/CISC3140-soloProject
cd CISC3140-soloProject
```

### Step 2 — Set up the backend environment

Create a file called `.env` inside the `backend/` folder:

```
DATABASE_URL=your-neon-or-postgres-connection-string
JWT_SECRET=any-long-random-string-you-choose
PORT=3000
FRONTEND_URL=http://localhost:5173
```

To get a free `DATABASE_URL`:
1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string from the dashboard
4. Paste it as the value of `DATABASE_URL`

### Step 3 — Install dependencies

From the project root:

```bash
cd backend
npm install
cd ../frontend
npm install
cd ..
npm install
```

### Step 4 — Set up the database

```bash
cd backend
npx prisma migrate dev --name init
```

You should see: `Your database is now in sync with your schema.`

Optionally, open the database browser:

```bash
npx prisma studio
```

### Step 5 — Set up the frontend environment

Create a file called `.env` inside the `frontend/` folder:

```
VITE_API_URL=http://localhost:3000
```

### Step 6 — Add/change audio files (optional)

The game works without audio files — they fail silently if missing. To add/change music and sound effects, place `.mp3` files in `frontend/public/assets/audio/` with these exact names:

| File | Description |
|---|---|
| `title_music.mp3` | Plays on the title screen (looping) |
| `ambient1.mp3` | Room 1 background ambience (looping) |
| `ambient2.mp3` | Room 2 background ambience (looping) |
| `winning_song.mp3` | Plays once on win screen |
| `fanf_yay.mp3` | Short jingle after winning song ends |
| `correct.mp3` | Correct puzzle answer sound |
| `wrong.mp3` | Wrong answer sound |
| `pickup.mp3` | Item pickup sound |
| `door_open.mp3` | Door unlock sound |

Free CC0 audio can be found at [freesound.org](https://freesound.org).

### Step 7 — Add/change candle cursor (optional)

Place a 32×32 animated GIF at `frontend/public/assets/ui/candle.gif`. This becomes your cursor after picking up the candle in Room 1. Any small animated flame GIF works. Free options at [loading.io](https://loading.io).

### Step 8 — Run the game

From the project root, one command starts both backend and frontend:

```bash
npm run dev
```

You will see:

```
[BACKEND]  Server running on http://localhost:3000
[FRONTEND] VITE ready on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

### Step 9 — Run the tests

```bash
cd backend
npm test
```

Expected output: 5 passing tests covering password hashing, puzzle validation, user registration, save state, and leaderboard.

---

## CRUD Requirements

| Operation | Where |
|---|---|
| **Create** | Register a new user account, create a game save, submit a score |
| **Read** | Load saved progress, fetch leaderboard, load puzzle data from JSON |
| **Update** | Upsert game save as player progresses through rooms |
| **Delete** | Delete save data via the Reset button |

---

## Architecture Decisions

**Why Phaser 4 for the game canvas?**
Raw HTML canvas requires manually re-implementing click detection, hitboxes, sprite layering, scene transitions, camera effects, and animation loops. Phaser handles all of this with a clean scene-based API, making it possible to build two fully interactive rooms with smooth transitions in a reasonable amount of time for a solo project.

**Why Zustand instead of Redux?**
The game state — inventory, solved puzzles, current screen, active modal — is simple but needs to be shared between React components and Phaser scenes. Zustand gives a global store in under 50 lines with no boilerplate, and critically it works outside React components via `useGameStore.getState()`, which is required for Phaser scene classes to read and update state.

**Why puzzle answers validated on the backend?**
Keeping answers in `puzzles.json` on the server means players cannot cheat by reading the browser's JavaScript source. Every answer submission goes through the API, which also allows the reveal endpoint to return answers without ever exposing the full puzzle data to the client.

**Why a custom AudioManager class instead of Phaser's audio system?**
Phaser's audio is tied to the game canvas lifecycle — it pauses or breaks when the canvas is destroyed or when switching between React screens. A plain HTML5 Audio singleton lives outside Phaser entirely, persists across screen changes, and can be controlled from both React and Phaser scenes without any coupling.

**Why inline styles over Tailwind for game UI?**
Game UI elements (inventory bar, modals, puzzle cards) need very precise control over `z-index`, `pointer-events`, and positioning to coexist with the Phaser canvas. Inline styles make these values explicit and predictable. Tailwind is still used for utility classes in auth forms and layout where precision is less critical.

**Why monorepo with Concurrently?**
Keeping frontend and backend in one repository makes it easier to track changes together, share environment setup, and submit as a single project. Concurrently allows one `npm run dev` from the root to start both servers with color-coded output.

---

## What I Would Do Next if I continue with this project after this class

- Add a third room with more complex multi-step puzzles
- Replace placeholder shapes with AI-generated art (Adobe Firefly)  or license free art for all room backgrounds and objects
- Add animated sprite objects using Phaser's texture atlas support
- Add a narrative layer — readable journal entries and notes that build a story
- Add mobile touch support for the Phaser canvas
- Move puzzle definitions from a static JSON file into a database table, with an admin panel to create and edit puzzles without touching code
- Add a hint counter displayed in the UI during gameplay
- Add social features — share your escape time, compare with friends
- Replace file-based save with proper session expiry and refresh tokens