import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * ProtectedRoute — Redirects unauthenticated users to /LoginXP.
 * Wraps any route that should only be accessible when logged in.
 */
export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  // Wait for auth state to be resolved before making a redirect decision
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9e4635]" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/LoginXP" replace />;
  }

  return children;
}
