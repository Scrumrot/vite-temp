import { AuthProvider } from "@/contexts/AuthContext.tsx";
import { Route, Routes } from "react-router-dom";
import CACLogin from "@/routes/login/CACLogin.tsx";
import ProtectedRoute from "@/components/ProtectedRoute.tsx";
import StoreFront from "@/routes/StoreFront.tsx";
import Execution from "@/routes/execution/Execution.tsx";
import Planning from "@/routes/planning/Planning.tsx";
import Task from "@/routes/tasks/Task.tsx";
import Analytics from "@/routes/analytics/Analytics.tsx";
import Forms from "@/pages/Forms.tsx";
import Colors from "@/pages/Colors.tsx";
import UI from "@/pages/UI.tsx";

import {
  NavBuilderPage,
} from "@/routes/dev/nav-builder/NavBuilderPage.tsx";
import { FormBuilderPage } from "@/routes/dev/form-builder/FormBuilderPage.tsx";

export function AppRouter() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public route - CAC Login */}
        <Route path="/cac-login" element={<CACLogin />} />
        {/* Protected routes - require authentication */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <StoreFront />
            </ProtectedRoute>
          }
        />
        <Route
          path="/execution"
          element={
            <ProtectedRoute>
              <Execution />
            </ProtectedRoute>
          }
        />
        <Route
          path="/planning"
          element={
            <ProtectedRoute>
              <Planning />
            </ProtectedRoute>
          }
        />
        <Route
          path="/task"
          element={
            <ProtectedRoute>
              <Task />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forms"
          element={
            <ProtectedRoute>
              <Forms />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dev/colors"
          element={
            <ProtectedRoute>
              <Colors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dev/ui"
          element={
            <ProtectedRoute>
              <UI />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dev/nav-builder"
          element={
            <ProtectedRoute>
              <NavBuilderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dev/form-builder"
          element={
            <ProtectedRoute>
              <FormBuilderPage />
            </ProtectedRoute>
          }
        />

      </Routes>
    </AuthProvider>
  )
}
