import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RequireAuth } from './components/RequireAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import {
  QleteHomePage,
  QleteEditPage,
  QleteIntroPage,
  QleteMePage,
  QleteNewPage,
  QleteQuestionPage,
  QleteResultPage,
} from './pages/QletePages';
import { SignupPage } from './pages/SignupPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
          <Route path="/projects/qlete" element={<Navigate to="/qlete" replace />} />
          <Route path="/qlete" element={<QleteHomePage />} />
          <Route path="/qlete/q/:quizId" element={<QleteIntroPage />} />
          <Route path="/qlete/q/:quizId/:step" element={<QleteQuestionPage />} />
          <Route path="/qlete/q/:quizId/resultado" element={<QleteResultPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/qlete/me" element={<QleteMePage />} />
            <Route path="/qlete/new" element={<QleteNewPage />} />
            <Route path="/qlete/q/:quizId/edit" element={<QleteEditPage />} />
          </Route>
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
