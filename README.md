# DataBooks Student Platform (v2)

## Overview

**DataBooks Student** is an interactive, research-driven educational platform designed to study how users reason about data in collaborative environments.

The platform combines:
- **Real-world telemetry** from ESP devices
- **User interaction logs** from the web interface
- **Interactive visualizations**
- **Reflective journaling**

Version 2 focuses on **clean architecture**, **explicit data boundaries**, and **research-grade logging**.

---

## Application Architecture (High Level)

```
src/
├── pages/ # Route-level pages
├── components/ # Reusable UI components
├── game/ # Game-specific layout & panels
├── analytics/ # ESP telemetry aggregation & analysis
├── logging/ # User interaction logging (non-ESP)
├── config/ # Declarative configuration (plots, questions)
├── data/ # Example / mock datasets
├── hooks/ # Shared React hooks
├── types/ # Shared domain types
```


Each folder represents a **single responsibility domain**.

---

## Landing Page

**Purpose:**  
Entry point for the platform. Displays available games and routes users into a specific experience.

**Key characteristics:**
- Lists games declaratively (not hardcoded)
- Only *Alien Invasion* is currently enabled
- No data logic
- No logging logic

**Design principle:**  
> The landing page should only decide *where* a user can go, not *what happens next*.

---

## Game Flow

### Game Entry Page

**Purpose:**  
Allows the user to select a **player identity (codename)** for the chosen game.

**Responsibilities:**
- Display available codenames
- Lock identity for the session
- Route into the game experience

**Non-responsibilities:**
- Gameplay
- Data analysis
- Visualization logic

---

## Game Layout System

### `GameLayout`

**Purpose:**  
Controls how game content is displayed.

**Supports two modes:**
- **Single Screen:** one panel visible at a time (Journal or DataPlots)
- **Dual Screen:** Journal and DataPlots visible side-by-side

**Key design decision:**
- `GameLayout` does **not** handle user intent
- It only reacts to layout state passed as props

**Logging behavior:**
- Logs *derived layout changes* (screen mode, active panel)

---

## Journal System

**Purpose:**  
Collects qualitative, reflective responses from users after each game round.

### Journal Questions

- Stored declaratively in `config/journalQuestions.ts`
- Organized by round
- Completely decoupled from UI rendering

**Example responsibilities:**
- Render questions
- Capture text input
- Log writing activity (length, timing — not content)

**Design principle:**  
> Journal content is research data, not UI state.

---

## DataPlots System

**Purpose:**  
Allows users to explore aggregated telemetry data through visualizations.

### Plot Configuration

Defined in `config/plots.ts`:
- Variables (time, meetings, infected cadets, sectors, etc.)
- Plot types (line, scatter, histogram)
- Allowed variable roles per plot type

This allows:
- Adding new plots without rewriting UI logic
- Preventing invalid plot configurations

### Plot Rendering

- Implemented using **Nivo**
- Plot selection and variable selection are user-driven
- Current plots supported:
  - Line Plot
  - Scatter Plot
  - Histogram

**Design principle:**  
> Plot logic should be driven by configuration, not conditionals.

---

## ESP Telemetry Analysis (`analytics/`)

**Purpose:**  
Process raw ESP device data into meaningful, aggregated time-series metrics.

### Raw Data

- Comes from ESP chips via Firebase (future)
- Each reading includes:
  - device ID
  - timestamp
  - infection status
  - proximity mask

### Aggregation Pipeline

- `aggregateTelemetry.ts`
- Converts raw readings into:
  - Infected cadets over time
  - Healthy cadets over time
  - Infected sectors over time
  - Meetings held

This data feeds the DataPlots system only.

**Important boundary:**
> ESP analytics are strictly separated from UI interaction logging.

---

## User Interaction Logging (`logging/`)

**Purpose:**  
Capture **every meaningful user interaction** for research analysis.

### Logged Events Include:
- Screen mode changes (single ↔ dual)
- Active panel changes
- Plot type changes
- Plot variable changes
- Journal input activity

### Design Characteristics:
- Strongly typed event schema
- Centralized event registry
- Pluggable logger backends

### Current Logger:
- `ConsoleLogger` (development)

### Future Logger:
- `FirebaseLogger` (production)

---

## Data Separation Philosophy

Two fundamentally different data streams exist:

| Data Type | Source | Purpose |
|---------|------|--------|
| ESP Telemetry | Hardware | System-level infection modeling |
| User Interaction Logs | UI | Human reasoning & decision-making |

These are intentionally **separated** in code and will be separated in storage.

---

## Next Steps (TODO)

1. Initialize Firebase project
2. Add environment variables (`.env`)
3. Design database structure
4. Implement `FirebaseLogger`
5. Wire ESP ingestion → Firebase
6. Enable real-time session analysis



