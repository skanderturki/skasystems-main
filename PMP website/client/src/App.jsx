import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ChapterList from './pages/ChapterList';
import TopicView from './pages/TopicView';
import PracticeList from './pages/PracticeList';
import PracticeTest from './pages/PracticeTest';
import PracticeResult from './pages/PracticeResult';
import ExamList from './pages/ExamList';
import ExamTake from './pages/ExamTake';
import ExamResult from './pages/ExamResult';
import Certificates from './pages/Certificates';
import VerifyCertificate from './pages/VerifyCertificate';
import VerifyEmail from './pages/VerifyEmail';
import Profile from './pages/Profile';
import Statistics from './pages/Statistics';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify/:token" element={<VerifyCertificate />} />
          <Route path="/verify-email" element={
            <ProtectedRoute>
              <VerifyEmail />
            </ProtectedRoute>
          } />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chapters" element={<ChapterList />} />
            <Route path="/chapters/:chapterId/topics/:slug" element={<TopicView />} />
            <Route path="/practice" element={<PracticeList />} />
            <Route path="/practice/take/:examId" element={<PracticeTest />} />
            <Route path="/practice/result/:attemptId" element={<PracticeResult />} />
            <Route path="/exams" element={<ExamList />} />
            <Route path="/exams/take/:examId" element={<ExamTake />} />
            <Route path="/exams/result/:attemptId" element={<ExamResult />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
