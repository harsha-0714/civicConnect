import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import IssueFeed from "./pages/IssueFeed";
import Login from "./pages/Login";
import MyReports from "./pages/MyReports";
import Register from "./pages/Register";
import ReportIssue from "./pages/ReportIssue";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<IssueFeed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <ReportIssue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-reports"
          element={
            <ProtectedRoute>
              <MyReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3200,
          style: {
            borderRadius: "8px",
            color: "#0f172a",
          },
        }}
      />
    </BrowserRouter>
  );
}

export default AppRoutes;
