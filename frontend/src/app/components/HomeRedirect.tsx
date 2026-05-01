import { Navigate } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import SwipeView from "../pages/SwipeView";

export function HomeRedirect() {
  // Check dynamically if onboarding has been completed
  const onboardingCompleted = localStorage.getItem("onboardingCompleted");

  if (!onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <ProtectedRoute>
      <SwipeView />
    </ProtectedRoute>
  );
}
