import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ChevronLeft, Check, Navigation, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { authService, type User } from "../utils/auth";
import { preferencesService, UserPreferences } from "../utils/preferences";
import { Slider } from "../components/ui/slider";
import { Avatar, AvatarFallback } from "../components/ui/avatar";

const CUISINE_OPTIONS = [
  "Quán vỉa hè",
  "Cơm & Mì",
  "Hải sản",
  "Lẩu & Nướng",
  "Đồ ăn Nhật Bản",
  "Đồ ăn Hàn Quốc",
  "Đồ ăn Trung Hoa",
  "Đồ ăn Âu",
  "Cafe",
  "Trà sữa",
  "Bánh mì",
  "Gà rán",
  "Pizza",
  "Phở",
  "Bún",
  "Bánh xèo",
  "Bánh cuốn",
  "Bánh canh",
  "Bánh bèo",
  "Chay",
  "Khác",
];

function formatVnd(value: number): string {
  return value.toLocaleString("vi-VN");
}

export default function FiltersScreen() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(
    preferencesService.getPreferences()
  );
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    setUser(authService.getCurrentUser());

    // Try to load from API on mount
    if (authService.isAuthenticated()) {
      preferencesService.loadFromApi().then((apiPrefs) => {
        if (apiPrefs) setPreferences(apiPrefs);
        setInitialLoading(false);
      }).catch(() => setInitialLoading(false));
    } else {
      setInitialLoading(false);
    }
  }, []);

  const toggleCuisine = (cuisine: string) => {
    setPreferences((prev) => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter((c) => c !== cuisine)
        : [...prev.cuisines, cuisine],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await preferencesService.saveToApi(preferences);
    } catch { /* silent */ }
    setSaving(false);
    navigate("/");
  };

  const handleReset = () => {
    const defaultPrefs: UserPreferences = {
      cuisines: [],
      priceVndMin: 0,
      priceVndMax: 1000000,
      maxDistance: 5,
      minRating: 0,
    };
    setPreferences(defaultPrefs);
    preferencesService.savePreferences(defaultPrefs);
  };

  const priceSubtitle =
    preferences.priceVndMin <= 0 && preferences.priceVndMax >= 1000000
      ? "Tất cả mức giá"
      : `${formatVnd(preferences.priceVndMin)}₫ – ${formatVnd(preferences.priceVndMax)}₫`;

  if (initialLoading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 px-4 pb-20">
      {/* Header */}
      <div className="pt-10 pb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-gray-900 text-xl">Smart Filters</h1>
            <p className="text-gray-400 text-xs mt-0.5">Customize your preferences</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-sm text-orange-500 hover:text-orange-600 transition-colors"
        >
          Reset All
        </button>
      </div>

      {/* Filters Content */}
      <div className="flex-1 overflow-y-auto pb-28 space-y-6 scrollbar-hide">
        {/* Profile */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <Avatar className="size-12">
              <AvatarFallback className="bg-orange-50 text-orange-600 text-base">
                {(user?.name || user?.email || "G")
                  .trim()
                  .slice(0, 1)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-gray-400">Profile</div>
              <div className="text-gray-900 mt-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-500 shrink-0">Name</span>
                  <span className="text-sm text-gray-900 truncate">
                    {user?.name || "Guest"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 mt-1.5">
                  <span className="text-sm text-gray-500 shrink-0">Email</span>
                  <span className="text-sm text-gray-900 truncate">
                    {user?.email || "guest@tinner.app"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cuisines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm"
        >
          <h3 className="text-gray-900 mb-3">Loại quán</h3>
          <p className="text-gray-500 text-sm mb-4">
            {preferences.cuisines.length === 0
              ? "Tất cả"
              : `${preferences.cuisines.length} loại`}
          </p>
          <div className="flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map((cuisine) => {
              const isSelected = preferences.cuisines.includes(cuisine);
              return (
                <button
                  key={cuisine}
                  onClick={() => toggleCuisine(cuisine)}
                  className={`px-4 py-2 rounded-xl text-sm transition-all ${
                    isSelected
                      ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                  {cuisine}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Price Range */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm"
        >
          <h3 className="text-gray-900 mb-3">Khoảng giá</h3>
          <p className="text-gray-500 text-sm mb-4">{priceSubtitle}</p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              placeholder="0"
              className="flex-1 h-11 rounded-xl bg-gray-50 border border-gray-200 px-3 text-sm font-bold text-gray-900"
              value={preferences.priceVndMin > 0 ? preferences.priceVndMin : ""}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  priceVndMin: Number(e.target.value) || 0,
                }))
              }
            />
            <span className="text-gray-400 text-sm font-bold">₫</span>
            <span className="text-gray-300 text-lg font-bold">–</span>
            <input
              type="number"
              placeholder="1.000.000"
              className="flex-1 h-11 rounded-xl bg-gray-50 border border-gray-200 px-3 text-sm font-bold text-gray-900"
              value={preferences.priceVndMax < 1000000 ? preferences.priceVndMax : ""}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  priceVndMax: Number(e.target.value) || 0,
                }))
              }
            />
            <span className="text-gray-400 text-sm font-bold">₫</span>
          </div>
        </motion.div>

        {/* Distance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-900">Maximum Distance</h3>
              <p className="text-gray-500 text-sm mt-1">How far are you willing to go?</p>
            </div>
            <div className="flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-xl">
              <Navigation className="w-4 h-4 text-orange-500" />
              <span className="text-orange-600">{preferences.maxDistance} km</span>
            </div>
          </div>
          <Slider
            value={[preferences.maxDistance]}
            onValueChange={([value]) =>
              setPreferences((prev) => ({ ...prev, maxDistance: value }))
            }
            min={0.5}
            max={10}
            step={0.5}
            className="mt-2"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>0.5 km</span>
            <span>10 km</span>
          </div>
        </motion.div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-20 left-0 right-0 px-4 py-3 bg-gradient-to-t from-white to-transparent pointer-events-none" style={{ maxWidth: 420, margin: "0 auto" }}>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-4 rounded-2xl transition-colors shadow-lg shadow-orange-200 pointer-events-auto flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="w-5 h-5 animate-spin" />}
          {saving ? "Saving..." : "Save Preferences"}
        </motion.button>
      </div>
    </div>
  );
}
