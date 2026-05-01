import { motion, AnimatePresence } from "motion/react";
import { X, MapPin, Star, Navigation, ExternalLink, ChevronRight } from "lucide-react";
import { Food, Restaurant } from "../data/foods";

interface RestaurantPanelProps {
  food: Food | null;
  onClose: () => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= Math.floor(rating)
              ? "fill-amber-400 text-amber-400"
              : star - 0.5 <= rating
              ? "fill-amber-400/50 text-amber-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

function RestaurantCard({ restaurant, index }: { restaurant: Restaurant; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35, ease: "easeOut" }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex gap-0"
    >
      {/* Restaurant Photo */}
      <div className="w-28 h-28 shrink-0 relative overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
      </div>

      {/* Info */}
      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-gray-900 truncate">{restaurant.name}</h3>
            <span
              className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                restaurant.isOpen
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-500"
              }`}
            >
              {restaurant.isOpen ? "Open" : "Closed"}
            </span>
          </div>

          <div className="flex items-center gap-1 mt-1">
            <StarRating rating={restaurant.rating} />
            <span className="text-amber-500 text-xs ml-0.5">{restaurant.rating}</span>
            <span className="text-gray-400 text-xs">({restaurant.reviews.toLocaleString()})</span>
            <span className="text-gray-300 text-xs mx-0.5">·</span>
            <span className="text-gray-500 text-xs">{restaurant.price}</span>
          </div>

          <div className="flex items-center gap-1 mt-1.5">
            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="text-gray-500 text-xs truncate">{restaurant.address}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg">
            <Navigation className="w-3 h-3 text-orange-500" />
            <span className="text-orange-600 text-xs">{restaurant.distance} away</span>
          </div>
          <a
            href={`https://www.google.com/maps/search/${encodeURIComponent(restaurant.name + " " + restaurant.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Maps
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export function RestaurantPanel({ food, onClose }: RestaurantPanelProps) {
  return (
    <AnimatePresence>
      {food && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-gray-50 rounded-t-3xl max-h-[85vh] flex flex-col"
            style={{ maxWidth: 480, margin: "0 auto" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 py-3 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-sm text-emerald-600">
                      {food.restaurants.length} restaurants nearby
                    </span>
                  </div>
                  <h2 className="text-gray-900 mt-0.5">
                    Places serving <span className="text-orange-500">{food.name}</span>
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Food preview strip */}
              <div className="flex items-center gap-3 mt-3 bg-white rounded-2xl p-3 border border-gray-100">
                <img
                  src={food.image}
                  alt={food.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 text-sm truncate">{food.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5 truncate">{food.description}</p>
                </div>
                <div className="flex gap-1">
                  {food.tags.slice(0, 1).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sort hint */}
              <div className="flex items-center gap-1.5 mt-2">
                <Navigation className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-400">Sorted by distance from you</span>
              </div>
            </div>

            {/* Restaurant List */}
            <div className="overflow-y-auto px-5 pb-6 flex flex-col gap-3 flex-1">
              {[...food.restaurants]
                .sort((a, b) => a.distanceNum - b.distanceNum)
                .map((restaurant, index) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    index={index}
                  />
                ))}

              {/* Google Maps CTA */}
              <motion.a
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: food.restaurants.length * 0.08 + 0.1 }}
                href={`https://www.google.com/maps/search/${encodeURIComponent(food.name + " restaurant near me")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl py-3.5 mt-1 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span className="text-sm">View all on Google Maps</span>
                <ChevronRight className="w-4 h-4" />
              </motion.a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}