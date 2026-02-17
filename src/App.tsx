/**
 * App
 * ---
 * Top-level application router.
 *
 * This file defines the high-level navigation structure of the app
 * and maps routes to pages.
 *
 * Design principles:
 *   - No business logic
 *   - No data fetching
 *   - No UI styling
 *
 * App.tsx should remain small and boring. Any complexity here
 * usually indicates architectural drift.
 */

import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import GameEntryPage from "./pages/GameEntryPage";
import AlienInvasionPage from "./pages/games/AlienInvasionPage";
import TeacherLoginPage from "./pages/teacher/TeacherLoginPage";
import TeacherHomePage from "./pages/teacher/TeacherHomePage";




function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/games/:gameId" element={<GameEntryPage />} />
      <Route path="/games/:gameId/play" element={<AlienInvasionPage />} />
      <Route path="/teacher/login" element={<TeacherLoginPage />} />
      <Route path="/teacher" element={<TeacherHomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;



