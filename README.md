# DataBooks Student Platform (v2)

## Overview

**DataBooks Student** is an interactive, research-driven educational platform designed to study how users reason about data in collaborative, sensor-augmented environments.

The platform integrates:

- **Real-world telemetry** from ESP devices  
- **User interaction logs** from the web interface  
- **Interactive, configurable data visualizations**  
- **Reflective journaling**

Version 2 emphasizes **clean architecture**, **explicit data boundaries**, **reproducible research logging**, and **session-aware persistence**.

---

## Application Architecture (High Level)

```
src/
├── pages/              # Route-level pages (Landing, Entry / Login)
│   └── games/          # Game-specific pages (e.g., Alien Invasion)
|
├── components/         # Reusable UI components
│   ├── game/           # Game layout, headers, panels
│   └── charts/         # Stateless Nivo chart renderers
|
├── analytics/          # ESP telemetry aggregation & derived metrics
|
├── logging/            # Typed user interaction logging (non-ESP)
|
├── config/             # Declarative configs (plots, journals, players)
|
├── hooks/              # Public React hooks (GameState, Logger)
|
├── state/              # GameState ownership (Context + mutations)
|
├── types/              # Shared domain & schema types
|
├── firebase/           # Firebase clients (Realtime DB + Firestore)
|
└── utils/              # Plot helpers, validation, builders
```



Each directory represents a **single-responsibility domain** with explicit boundaries.

---

## Core Design Principles

- **Telemetry ≠ Interaction Logging**  
  Hardware data and human behavior data are intentionally separated.

- **Declarative over conditional**  
  Plots, variables, and journal questions are defined in config, not JSX.

- **State has a single owner**  
  All game state lives in `GameStateContext`.

- **Charts are dumb**  
  All data shaping happens *before* rendering.

- **Research-first logging**  
  Every meaningful UI interaction is captured with typed events.

---

## Landing Page

**Purpose:**  
Entry point into the platform.

**Characteristics:**
- Declaratively lists available games
- Routes users into a selected experience
- No data logic
- No logging logic

> The landing page decides *where* a user can go — not *what happens next*.

---

## Game Entry Flow

### Game Entry Page

**Purpose:**  
Locks a **player identity (codename)** for the session.

**Responsibilities:**
- Display available player codenames
- Initialize session identity
- Route into the game

**Non-Responsibilities:**
- Gameplay
- Visualization logic
- Data persistence

---

## Game Layout System

### `GameLayout`

**Purpose:**  
Controls how content is displayed, not what is displayed.

**Supported Modes:**
- **Single Screen:** Journal *or* DataPlots
- **Dual Screen:** Journal and DataPlots side-by-side

**Key Decisions:**
- Layout state is passed *in*, never owned
- Layout changes are logged as derived UI events

---

## Game State (`state/`)

### `GameStateContext`

**Purpose:**  
Single source of truth for all in-game state.

**Owns:**
- Session ID
- Player identity
- Current round
- Journal answers (per round)

**Does NOT own:**
- ESP telemetry
- Logging
- Visualization logic

---

## Journal System

**Purpose:**  
Collect structured, reflective responses from users.

### Journal Questions

- Defined declaratively in `config/journal.ts`
- Organized by round
- Fully decoupled from UI rendering

### Journal Behavior

- Answers are stored **locally in GameState**
- Explicit **Save** persists answers to **Realtime Database**
- Answers are **hydrated on login**
- Editing previously saved answers is supported and safe

**Persistence Model:**
- **Realtime DB** → journal answers (stateful, editable)
- **Firestore** → interaction logs (append-only)

> Journal content is research data — not UI state.

---

## DataPlots System

**Purpose:**  
Enable exploratory analysis of ESP-derived telemetry.

### Supported Plot Types

- Line Plot  
- Scatter Plot  
- Histogram  
- Pie Chart

### Plot Configuration

Defined in `config/plots.ts`:
- Variables (time, infected cadets, sectors, meetings, etc.)
- Plot types and allowed variable roles
- Validation rules

This enables:
- Adding plots without rewriting UI
- Preventing invalid configurations
- Strong typing across UI and analytics

---

## ESP Telemetry Analytics (`analytics/`)

**Purpose:**  
Convert raw ESP readings into meaningful, plot-ready metrics.

### Raw Data Includes

- Device ID
- Timestamp
- Infection status
- Proximity mask

### Aggregated Outputs

- Total cadets / sectors
- Infected vs healthy counts
- Meetings held
- Time-indexed telemetry points

All aggregation happens **before** visualization.

> ESP analytics never touch UI logging.

---

## User Interaction Logging (`logging/`)

**Purpose:**  
Capture fine-grained user behavior for research.

### Logged Events Include

- Screen mode changes
- Active panel switches
- Plot type & variable changes
- Journal navigation
- Journal submissions

### Architecture

- Strongly typed event schema
- Logger interface (`Logger`)
- Pluggable backends

### Current Backend

- **FirebaseLogger**
  - Writes to Firestore
  - Append-only
  - Session-aware
  - Correctly resets on logout / re-login

> Logging is session-scoped and identity-correct.

---

## Data Separation Model

| Data Stream | Source | Storage | Purpose |
|------------|------|--------|--------|
| ESP Telemetry + Game Information| Hardware | Realtime DB | Infection modeling |
| Journal Answers | UI | Realtime DB + Firestore | Qualitative research |
| UI Interaction Logs | UI | Firestore | Behavioral analysis |

Each stream has **distinct lifecycle, semantics, and storage**.

---

## Current Status

- ✅ Core game loop implemented  
- ✅ Journal persistence & hydration  
- ✅ Real-time telemetry visualization  
- ✅ Typed, session-safe logging  
- ✅ Config-driven plot system  
- ✅ Clean separation of concerns  

---

## Next Steps

1. Teacher dashboard (read-only analytics & journals)  
2. Firebase security rules  
3. Session archival & export  
4. Research analytics pipelines  
5. Multi-game support  
