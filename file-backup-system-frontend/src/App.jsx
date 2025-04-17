import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/auth/AuthPage";
import HomePage from "./pages/Home/HomePage";
import ServerDetailPage from "./pages/ServerDetail/ServerDetailPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/server/:name/"
          element={
            <ProtectedRoute>
              <ServerDetailPage/>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
