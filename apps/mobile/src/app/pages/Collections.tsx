import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, Heart, Trash2, Calendar, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { authService } from "../utils/auth";
import { type SavedItem, fetchSaved, deleteSavedApi } from "../utils/api";

export default function Collections() {
  const navigate = useNavigate();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSaved = async () => {
    if (!authService.isAuthenticated()) {
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      const items = await fetchSaved();
      setSavedItems(items);
    } catch {
      setSavedItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSaved();
  }, [navigate]);

  const handleRemove = async (id: string) => {
    try {
      await deleteSavedApi(id);
      setSavedItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      // silent
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear all saved items?")) return;
    for (const item of savedItems) {
      try {
        await deleteSavedApi(item.id);
      } catch { /* silent */ }
    }
    setSavedItems([]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Group by cuisine
  const groupedByCuisine = savedItems.reduce((acc, item) => {
    const key = item.cuisine || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, SavedItem[]>);

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
              {loading ? "Loading..." : `${savedItems.length} saved item${savedItems.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
        {savedItems.length > 0 && (
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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
            <p className="text-gray-500">Loading saved items...</p>
          </div>
        ) : savedItems.length === 0 ? (
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
          <div className="space-y-6">
            {Object.entries(groupedByCuisine).map(([cuisine, items], groupIndex) => (
              <motion.div
                key={cuisine}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
              >
                <h2 className="text-gray-900 text-lg mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-400 rounded-full" />
                  {cuisine}
                  <span className="text-gray-400 text-sm">({items.length})</span>
                </h2>
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: groupIndex * 0.1 + index * 0.05 }}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex group"
                    >
                      {/* Image */}
                      <div className="w-24 h-24 shrink-0 relative overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                        <div>
                          <h3 className="text-gray-900 truncate">{item.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full">
                              {item.cuisine}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Calendar className="w-3 h-3" />
                              {formatDate(item.savedAt)}
                            </div>
                          </div>
                          <p className="text-gray-400 text-xs mt-1 truncate">{item.address}</p>
                        </div>
                      </div>

                      {/* Delete button */}
                      <div className="flex items-center pr-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(item.id);
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
    </div>
  );
}
