import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import { HomeRedirect } from "./components/HomeRedirect";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import FiltersScreen from "./pages/FiltersScreen";
import MapView from "./pages/MapView";
import Collections from "./pages/Collections";
import Onboarding from "./pages/Onboarding";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: HomeRedirect,
      },
      {
        path: "onboarding",
        Component: Onboarding,
      },
      {
        path: "filters",
        element: (
          <ProtectedRoute>
            <FiltersScreen />
          </ProtectedRoute>
        ),
      },
      {
        path: "map",
        element: (
          <ProtectedRoute>
            <MapView />
          </ProtectedRoute>
        ),
      },
      {
        path: "collections",
        element: (
          <ProtectedRoute>
            <Collections />
          </ProtectedRoute>
        ),
      },
      {
        path: "login",
        Component: Login,
      },
      {
        path: "signup",
        Component: Signup,
      },
    ],
  },
]);
