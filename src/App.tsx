/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ServerList from "./pages/ServerList";
import CreateServer from "./pages/CreateServer";
import ServerView from "./pages/ServerView";
import Layout from "./components/Layout";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/servers" element={<ProtectedRoute><ServerList /></ProtectedRoute>} />
          <Route path="/servers/create" element={<ProtectedRoute><CreateServer /></ProtectedRoute>} />
          <Route path="/servers/:id/*" element={<ProtectedRoute><ServerView /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
