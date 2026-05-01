import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ChevronLeft, Check, Star, Navigation } from "lucide-react";
import { useNavigate } from "react-router";
import { authService, type User } from "../utils/auth";
import { preferencesService, UserPreferences } from "../utils/preferences";
import { Slider } from "../components/ui/slider";
import { Avatar, AvatarFallback } from "../components/ui/avatar";

export default function FiltersScreen() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(
    preferencesService.getPreferences()
  );

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, []);

  const cuisineOptions = [
    "American",
    "Japanese",
    "Italian",
    "Thai",
    "Mexican",
    "Indian",
    "Steakhouse",
    "Chinese",
    "French",
    "Mediterranean",
  ];

  const dietaryOptions = [
    "Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Halal",
    "Kosher",
    "Dairy-Free",
    "Nut-Free",
  ];

  const priceOptions = ["$", "$$", "$$$", "$$$$"];

  const toggleCuisine = (cuisine: string) => {
    setPreferences((prev) => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter((c) => c !== cuisine)
        : [...prev.cuisines, cuisine],
    }));
  };

  const toggleDietary = (restriction: string) => {
    setPreferences((prev) => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
        ? prev.dietaryRestrictions.filter((r) => r !== restriction)
        : [...prev.dietaryRestrictions, restriction],
    }));
  };

  const togglePrice = (price: string) => {
    setPreferences((prev) => ({
      ...prev,
      priceRange: prev.priceRange.includes(price)
        ? prev.priceRange.filter((p) => p !== price)
        : [...prev.priceRange, price],
    }));
  };

  const handleSave = () => {
    preferencesService.savePreferences(preferences);
    navigate("/");
  };

  const handleReset = () => {
    const defaultPrefs: UserPreferences = {
      cuisines: [],
      dietaryRestrictions: [],
      priceRange: ["$", "$$", "$$$", "$$$$"],
      maxDistance: 5,
      minRating: 0,
    };
    setPreferences(defaultPrefs);
    preferencesService.savePreferences(defaultPrefs);
  };

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
          <h3 className="text-gray-900 mb-3">Cuisines</h3>
          <p className="text-gray-500 text-sm mb-4">
            {preferences.cuisines.length === 0
              ? "All cuisines included"
              : `${preferences.cuisines.length} selected`}
          </p>
          <div className="flex flex-wrap gap-2">
            {cuisineOptions.map((cuisine) => {
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

        {/* Dietary Restrictions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm"
        >
          <h3 className="text-gray-900 mb-3">Dietary Preferences</h3>
          <p className="text-gray-500 text-sm mb-4">
            {preferences.dietaryRestrictions.length === 0
              ? "No restrictions"
              : `${preferences.dietaryRestrictions.length} selected`}
          </p>
          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map((dietary) => {
              const isSelected = preferences.dietaryRestrictions.includes(dietary);
              return (
                <button
                  key={dietary}
                  onClick={() => toggleDietary(dietary)}
                  className={`px-4 py-2 rounded-xl text-sm transition-all ${
                    isSelected
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                  {dietary}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Price Range */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm"
        >
          <h3 className="text-gray-900 mb-3">Price Range</h3>
          <p className="text-gray-500 text-sm mb-4">
            {preferences.priceRange.length === 4
              ? "All prices"
              : preferences.priceRange.join(", ")}
          </p>
          <div className="flex gap-3">
            {priceOptions.map((price) => {
              const isSelected = preferences.priceRange.includes(price);
              return (
                <button
                  key={price}
                  onClick={() => togglePrice(price)}
                  className={`flex-1 py-3 rounded-xl text-sm transition-all ${
                    isSelected
                      ? "bg-blue-500 text-white shadow-md shadow-blue-200"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {price}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Distance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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

        {/* Minimum Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-900">Minimum Rating</h3>
              <p className="text-gray-500 text-sm mt-1">Only show highly rated places</p>
            </div>
            <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-xl">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-amber-600">
                {preferences.minRating === 0 ? "Any" : preferences.minRating.toFixed(1)}
              </span>
            </div>
          </div>
          <Slider
            value={[preferences.minRating]}
            onValueChange={([value]) =>
              setPreferences((prev) => ({ ...prev, minRating: value }))
            }
            min={0}
            max={5}
            step={0.5}
            className="mt-2"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Any</span>
            <span>5.0</span>
          </div>
        </motion.div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-20 left-0 right-0 px-4 py-3 bg-gradient-to-t from-white to-transparent pointer-events-none" style={{ maxWidth: 420, margin: "0 auto" }}>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl transition-colors shadow-lg shadow-orange-200 pointer-events-auto"
        >
          Save Preferences
        </motion.button>
      </div>
    </div>
  );
}
