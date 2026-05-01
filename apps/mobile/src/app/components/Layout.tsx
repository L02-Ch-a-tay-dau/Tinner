import { Outlet, useNavigate, useLocation } from "react-router";
import { Home, SlidersHorizontal, Map, Heart } from "lucide-react";
import { motion } from "motion/react";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show nav on auth and onboarding pages
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/onboarding";

  const navItems = [
    { path: "/", icon: Home, label: "Swipe" },
    { path: "/map", icon: Map, label: "Map" },
    { path: "/collections", icon: Heart, label: "Saved" },
    { path: "/filters", icon: SlidersHorizontal, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start">
      <div className="w-full max-w-[420px] min-h-screen flex flex-col relative">
        <Outlet />

        {/* Bottom Navigation */}
        {!isAuthPage && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40" style={{ maxWidth: 420, margin: "0 auto" }}>
            <div className="flex items-center justify-around px-2 py-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="relative flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl transition-colors"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 bg-orange-50 rounded-xl"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon
                      className={`w-5 h-5 relative z-10 transition-colors ${
                        isActive ? "text-orange-500" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`text-xs relative z-10 transition-colors ${
                        isActive ? "text-orange-600" : "text-gray-500"
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
