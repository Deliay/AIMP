import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from './hooks/use-auth';
import { LoginPage } from './pages/login';
import { RegisterPage } from './pages/register';
import { ChatListPage } from './pages/chat-list';
import { ChatDetailPage } from './pages/chat-detail';
import { AuthRequestsPage } from './pages/auth-requests';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/chats" replace />;
  }
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  {
    path: '/chats',
    element: (
      <ProtectedRoute>
        <ChatListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/chats/:topicId',
    element: (
      <ProtectedRoute>
        <ChatDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/auth-requests',
    element: (
      <ProtectedRoute>
        <AuthRequestsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: <Navigate to="/chats" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/chats" replace />,
  },
]);
