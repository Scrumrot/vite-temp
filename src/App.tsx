import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import StoreFront from './components/StoreFront'
import Execution from './pages/Execution'
import Planning from './pages/Planning'
import Task from './pages/Task'
import Analytics from './pages/Analytics'
import Forms from './pages/Forms'
import Login from './pages/Login'
import Colors from './pages/Colors'
import CACLogin from './pages/CACLogin'
import UI from './pages/UI'

function App() {
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
          path="/login"
          element={
            <ProtectedRoute>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/colors"
          element={
            <ProtectedRoute>
              <Colors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ui"
          element={
            <ProtectedRoute>
              <UI />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App
