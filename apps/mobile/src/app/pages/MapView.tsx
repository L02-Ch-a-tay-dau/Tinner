import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ChevronLeft,
  MapPin,
  Star,
  Navigation,
  Search,
  ExternalLink,
  Filter,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router";
import { type SuggestionCard, fetchSuggestions } from "../utils/api";
import { authService } from "../utils/auth";
import { getDeck, setDeck as storeDeck } from "../utils/store";

export default function MapView() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<SuggestionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login");
      return;
    }

    const cached = getDeck();
    if (cached && cached.length > 0) {
      setCards(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchSuggestions()
      .then((data) => {
        setCards(data);
        storeDeck(data);
      })
      .catch(() => { /* noop */ })
      .finally(() => setLoading(false));
  }, [navigate]);

  // Collect all restaurants from all cards
  const allRestaurants = cards.flatMap((card) =>
    card.restaurants.map((r) => ({ ...r, foodName: card.name, cuisine: card.cuisine })),
  ).sort((a, b) => a.distanceNum - b.distanceNum);

  const query = searchQuery.trim().toLowerCase();
  const filtered = query
    ? allRestaurants.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.foodName.toLowerCase().includes(query) ||
          r.cuisine.toLowerCase().includes(query),
      )
    : allRestaurants;

  const openInGoogleMaps = (restaurant: { name: string; address: string }) => {
    const url = `https://www.google.com/maps/search/${encodeURIComponent(
      restaurant.name + " " + restaurant.address,
    )}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col flex-1 px-4 pb-20">
      {/* Header */}
      <div className="pt-10 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-gray-900 text-xl">Nearby Restaurants</h1>
            <p className="text-gray-400 text-xs mt-0.5">
              {loading ? "Loading..." : `${filtered.length} location${filtered.length !== 1 ? "s" : ""} found`}
            </p>
          </div>
          <button
            onClick={() => navigate("/filters")}
            className="w-9 h-9 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center hover:bg-orange-50 transition-colors group"
          >
            <Filter className="w-4 h-4 text-gray-600 group-hover:text-orange-500 transition-colors" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search restaurants or dishes..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Restaurant List */}
      <div className="flex-1 overflow-y-auto pb-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
            <p className="text-gray-500">Loading nearby places...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {cards.length === 0 ? "No restaurants found" : "No results match your search"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {cards.length === 0 ? "Try again from Swipe view to load data" : "Try a different search term"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((restaurant, index) => (
              <motion.div
                key={`${restaurant.id}-${restaurant.foodName}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
              >
                <div className="flex">
                  {/* Restaurant Photo */}
                  <div className="w-28 h-28 shrink-0 relative overflow-hidden">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
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
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-amber-500 text-xs">{restaurant.rating}</span>
                        <span className="text-gray-400 text-xs">
                          ({restaurant.reviews.toLocaleString()})
                        </span>
                        <span className="text-gray-300 text-xs mx-0.5">·</span>
                        <span className="text-gray-500 text-xs">{restaurant.price}</span>
                      </div>

                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full">
                          {restaurant.foodName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 mt-1.5">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="text-gray-500 text-xs truncate">
                          {restaurant.address}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 px-3 pb-3">
                  <button
                    onClick={() => openInGoogleMaps(restaurant)}
                    className="flex-1 flex items-center justify-center gap-1 bg-orange-50 hover:bg-orange-100 text-orange-600 px-3 py-2 rounded-xl text-xs transition-colors"
                  >
                    <Navigation className="w-3 h-3" />
                    {restaurant.distance} away
                  </button>
                  <button
                    onClick={() => openInGoogleMaps(restaurant)}
                    className="flex items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-xl text-xs transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
