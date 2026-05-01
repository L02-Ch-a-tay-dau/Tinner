import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, X, RotateCcw, Utensils, Sparkles, LogOut, User } from "lucide-react";
import { foods } from "../data/foods";
import { FoodSwipeCard } from "../components/FoodSwipeCard";
import { RestaurantPanel } from "../components/RestaurantPanel";
import { authService } from "../utils/auth";
import { preferencesService } from "../utils/preferences";
import { useNavigate } from "react-router";
import type { Food } from "../data/foods";

export default function SwipeView() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const preferences = preferencesService.getPreferences();

  // Filter foods based on user preferences
  const getFilteredFoods = () => {
    let filtered = [...foods];

    if (preferences.cuisines.length > 0) {
      filtered = filtered.filter((food) =>
        preferences.cuisines.includes(food.cuisine)
      );
    }

    // Filter by dietary restrictions (tags)
    if (preferences.dietaryRestrictions.length > 0) {
      filtered = filtered.filter((food) =>
        preferences.dietaryRestrictions.some((restriction) =>
          food.tags.some((tag) => tag.toLowerCase().includes(restriction.toLowerCase()))
        )
      );
    }

    // Filter restaurants by price and rating
    filtered = filtered.map((food) => ({
      ...food,
      restaurants: food.restaurants.filter(
        (r) =>
          preferences.priceRange.includes(r.price) &&
          r.rating >= preferences.minRating &&
          r.distanceNum <= preferences.maxDistance
      ),
    }));

    // Only include foods that have at least one matching restaurant
    filtered = filtered.filter((food) => food.restaurants.length > 0);

    return filtered;
  };

  const [deck, setDeck] = useState<Food[]>(getFilteredFoods());
  const [likedFood, setLikedFood] = useState<Food | null>(null);
  const [skippedCount, setSkippedCount] = useState(0);
  const [likedCount, setLikedCount] = useState(0);
  const [lastAction, setLastAction] = useState<"like" | "skip" | null>(null);
  const [showActionFeedback, setShowActionFeedback] = useState(false);

  const triggerFeedback = (action: "like" | "skip") => {
    setLastAction(action);
    setShowActionFeedback(true);
    setTimeout(() => setShowActionFeedback(false), 600);
  };

  const handleSwipeRight = useCallback(() => {
    if (deck.length === 0) return;
    const current = deck[deck.length - 1];
    setLikedFood(current);
    setLikedCount((c) => c + 1);
    triggerFeedback("like");

    // Save to liked foods
    preferencesService.addLikedFood({
      foodId: current.id,
      foodName: current.name,
      cuisine: current.cuisine,
      likedAt: new Date().toISOString(),
      image: current.image,
    });

    setDeck((prev) => prev.slice(0, -1));
  }, [deck]);

  const handleSwipeLeft = useCallback(() => {
    if (deck.length === 0) return;
    setSkippedCount((c) => c + 1);
    triggerFeedback("skip");
    setDeck((prev) => prev.slice(0, -1));
  }, [deck]);

  const handleReset = () => {
    setDeck(getFilteredFoods());
    setSkippedCount(0);
    setLikedCount(0);
    setLastAction(null);
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const topFood = deck[deck.length - 1];
  const secondFood = deck[deck.length - 2];
  const thirdFood = deck[deck.length - 3];

  return (
    <div className="flex flex-col flex-1 px-4 pb-20">
      {/* Header */}
      <div className="pt-10 pb-3 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
              <Utensils className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-gray-900 text-xl">Tinner</h1>
          </div>
          <p className="text-gray-400 text-xs mt-0.5 ml-10">Find your next craving</p>
        </div>

        {/* Stats & User */}
        <div className="flex items-center gap-3">
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="text-red-400 text-lg">{skippedCount}</span>
              <span className="text-gray-400 text-xs">skipped</span>
            </div>
            <div className="w-px bg-gray-200" />
            <div className="flex flex-col items-center">
              <span className="text-emerald-500 text-lg">{likedCount}</span>
              <span className="text-gray-400 text-xs">liked</span>
            </div>
          </div>
          <div className="relative group z-50">
            <button className="w-9 h-9 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </button>
            <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-2 hidden group-hover:block w-48 z-50">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-sm text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-1"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card Stack Area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Card Container */}
        <div className="relative w-full" style={{ height: 520 }}>
          <AnimatePresence>
            {deck.length === 0 ? (
              /* Empty state */
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-sm"
              >
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-gray-700 text-xl mb-1">You've seen it all!</h3>
                <p className="text-gray-400 text-sm text-center px-6 mb-6">
                  You liked {likedCount} dish{likedCount !== 1 ? "es" : ""}. Ready for another round?
                </p>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Start Over
                </button>
              </motion.div>
            ) : (
              <>
                {/* Back card (3rd) */}
                {thirdFood && (
                  <FoodSwipeCard
                    key={`third-${thirdFood.id}`}
                    food={thirdFood}
                    isTop={false}
                    stackIndex={2}
                    onSwipeLeft={() => {}}
                    onSwipeRight={() => {}}
                  />
                )}
                {/* Middle card (2nd) */}
                {secondFood && (
                  <FoodSwipeCard
                    key={`second-${secondFood.id}`}
                    food={secondFood}
                    isTop={false}
                    stackIndex={1}
                    onSwipeLeft={() => {}}
                    onSwipeRight={() => {}}
                  />
                )}
                {/* Top card */}
                {topFood && (
                  <FoodSwipeCard
                    key={`top-${topFood.id}`}
                    food={topFood}
                    isTop={true}
                    stackIndex={0}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                  />
                )}
              </>
            )}
          </AnimatePresence>

          {/* Action feedback burst */}
          <AnimatePresence>
            {showActionFeedback && (
              <motion.div
                key={`feedback-${lastAction}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
              >
                {lastAction === "like" ? (
                  <div className="text-6xl">❤️</div>
                ) : (
                  <div className="text-6xl">👋</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Remaining count */}
        {deck.length > 0 && (
          <div className="flex items-center gap-1.5 mt-4 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-gray-500 text-sm">
              {deck.length} dish{deck.length !== 1 ? "es" : ""} remaining
            </span>
          </div>
        )}

        {/* Action Buttons */}
        {deck.length > 0 && (
          <div className="flex items-center justify-center gap-8 mt-2 mb-8">
            {/* Skip button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={handleSwipeLeft}
              className="w-16 h-16 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center hover:border-red-200 hover:shadow-red-100 transition-all group"
            >
              <X className="w-7 h-7 text-red-400 group-hover:text-red-500 transition-colors" />
            </motion.button>

            {/* Reset button (smaller, center) */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={handleReset}
              className="w-10 h-10 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center hover:border-amber-200 transition-all group"
              title="Restart"
            >
              <RotateCcw className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
            </motion.button>

            {/* Like button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={handleSwipeRight}
              className="w-16 h-16 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center hover:border-emerald-200 hover:shadow-emerald-100 transition-all group"
            >
              <Heart className="w-7 h-7 text-emerald-400 group-hover:text-emerald-500 transition-colors" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Restaurant Panel */}
      <RestaurantPanel food={likedFood} onClose={() => setLikedFood(null)} />
    </div>
  );
}
