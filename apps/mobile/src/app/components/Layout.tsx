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
    { path: "/map", icon: Map, label: "Map1r" },
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
            <div className="flex items-center justify-around px-2 py-3"> {/* Tăng padding dọc một chút */}
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="relative flex flex-col items-center justify-center gap-1.5 py-2 px-5 rounded-xl transition-all duration-300"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 bg-orange-100/50 rounded-2xl" // Làm nền nhạt và bo góc mượt hơn
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      />
                    )}
                    
                    {/* Bọc Icon vào motion.div để tạo hiệu ứng mượt */}
                    <motion.div
                      animate={{ scale: isActive ? 1.15 : 1 }} // Phóng to nhẹ khi active
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      className="relative z-10"
                    >
                      <Icon
                        strokeWidth={isActive ? 2.5 : 2} // Nét dày hơn khi active để trông "đậm đà"
                        className={`w-6 h-6 transition-colors duration-300 ${ // Tăng từ w-5 lên w-6
                          isActive ? "text-red-500" : "text-gray-400"
                        }`}
                      />
                    </motion.div>

                    <span
                      className={`text-[11px] font-medium relative z-10 transition-colors duration-300 ${
                        isActive ? "text-orange-600" : "text-gray-500"
                      }`}
                    >
                      {}
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
