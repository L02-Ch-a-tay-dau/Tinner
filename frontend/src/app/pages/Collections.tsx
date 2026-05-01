import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Heart, Trash2, Calendar } from "lucide-react";
import { useNavigate } from "react-router";
import { preferencesService, LikedFood } from "../utils/preferences";
import { foods, Food } from "../data/foods";
import { RestaurantPanel } from "../components/RestaurantPanel";

export default function Collections() {
  const navigate = useNavigate();
  const [likedFoods, setLikedFoods] = useState<LikedFood[]>(
    preferencesService.getLikedFoods()
  );
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  const handleRemove = (foodId: number) => {
    preferencesService.removeLikedFood(foodId);
    setLikedFoods(preferencesService.getLikedFoods());
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all saved foods?")) {
      preferencesService.clearLikedFoods();
      setLikedFoods([]);
    }
  };

  const handleFoodClick = (foodId: number) => {
    const food = foods.find((f) => f.id === foodId);
    if (food) {
      setSelectedFood(food);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Group by cuisine
  const groupedByCuisine = likedFoods.reduce((acc, food) => {
    if (!acc[food.cuisine]) {
      acc[food.cuisine] = [];
    }
    acc[food.cuisine].push(food);
    return acc;
  }, {} as Record<string, LikedFood[]>);

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
            <h1 className="text-gray-900 text-xl">My Collection</h1>
            <p className="text-gray-400 text-xs mt-0.5">
              {likedFoods.length} saved dish{likedFoods.length !== 1 ? "es" : ""}
            </p>
          </div>
        </div>
        {likedFoods.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-red-500 hover:text-red-600 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-4">
        {likedFoods.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-gray-700 text-lg mb-2">No saved dishes yet</h3>
            <p className="text-gray-400 text-sm text-center px-8 mb-6">
              Start swiping and save your favorite dishes to find them here later!
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl transition-colors"
            >
              Start Swiping
            </button>
          </motion.div>
        ) : (
          /* Grouped list */
          <div className="space-y-6">
            {Object.entries(groupedByCuisine).map(([cuisine, foods], groupIndex) => (
              <motion.div
                key={cuisine}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
              >
                <h2 className="text-gray-900 text-lg mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-400 rounded-full" />
                  {cuisine}
                  <span className="text-gray-400 text-sm">({foods.length})</span>
                </h2>
                <div className="space-y-3">
                  {foods.map((food, index) => (
                    <motion.div
                      key={food.foodId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: groupIndex * 0.1 + index * 0.05 }}
                      onClick={() => handleFoodClick(food.foodId)}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex group cursor-pointer hover:shadow-md transition-shadow"
                    >
                      {/* Food Image */}
                      <div className="w-24 h-24 shrink-0 relative overflow-hidden">
                        <img
                          src={food.image}
                          alt={food.foodName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                        <div>
                          <h3 className="text-gray-900 truncate">{food.foodName}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full">
                              {food.cuisine}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Calendar className="w-3 h-3" />
                              {formatDate(food.likedAt)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Delete button */}
                      <div className="flex items-center pr-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(food.foodId);
                          }}
                          className="w-9 h-9 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Restaurant Panel */}
      <RestaurantPanel food={selectedFood} onClose={() => setSelectedFood(null)} />
    </div>
  );
}
