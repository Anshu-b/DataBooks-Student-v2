# Game UI Components

This folder contains reusable UI components shared across game pages.

## Architectural Rules
- GameHeader handles navigation and mode toggles
- GameLayout controls spatial arrangement ONLY
- Panels (JournalPanel, DataPlotsPanel) are layout-agnostic
- Game state should NOT live in these components

Violating these rules will lead to UI coupling and
hard-to-maintain layout logic.
